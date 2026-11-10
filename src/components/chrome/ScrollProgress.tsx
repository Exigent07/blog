"use client";

import { useLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import { type PointerEvent, useEffect, useLayoutEffect, useRef } from "react";
import { SlashMark } from "@/components/brand/SlashMark";
import { viewTransitionActive } from "@/components/navigation/viewTransition";
import { useSurfaceTone } from "./useSurfaceTone";
import styles from "./ScrollProgress.module.css";

/** While the reader drives the slider, the page's position must not overwrite what they set. */
const DRIVE_HOLD = 450;

/** Near the end the footer is the last word and the indicator steps aside; two thresholds, so it never flickers. */
const HIDE_ABOVE = 0.99;
const SHOW_BELOW = 0.97;

const maxScroll = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
const clamp = (value: number) => Math.min(1, Math.max(0, value));

/**
 * Shows or hides the indicator. Unless `instant` (or motion is reduced), the
 * boundary wipes it in or out (ScrollProgress.module.css, data-moving).
 */
function present(root: HTMLElement, next: "shown" | "hidden", instant = false) {
  if (root.dataset.presence === next) return;
  root.dataset.presence = next;
  if (instant || window.matchMedia("(prefers-reduced-motion: reduce)").matches) root.removeAttribute("data-moving");
  else root.setAttribute("data-moving", "");
}

/**
 * `0 ──//── 100`: where the reader is in the page, and a slider to go
 * anywhere in it. Click the track to jump to that point, drag the // mark to
 * scrub, click 0 or 100 for the top or the bottom; from the keyboard it is a
 * native range (arrows, Page Up/Down, Home/End). Lenis glides the page there.
 *
 * Off the desktop stage it is a hairline along the bottom edge that never
 * takes a tap meant for the content: only the // mark can be grabbed, and a
 * finger only drags it sideways, so scrolling over it stays native.
 *
 * It comes and goes through the boundary: on a route change the page wipe
 * covers it as it passes (it is its own layer in the transition, between the
 * old page and the new), and once the new page is in place it wipes back in
 * at the boundary angle, in the new page's tone. Near the end of a page it
 * wipes out the same way, never while it is being dragged or has focus.
 *
 * Position is written imperatively through a CSS variable (no React render
 * per frame). Its tone follows the innermost surface beneath it.
 */
export function ScrollProgress() {
  const pathname = usePathname();
  const tone = useSurfaceTone("bottom", 72, pathname, "innermost");
  const rootRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLSpanElement>(null);
  const markerRef = useRef<HTMLSpanElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const valueRef = useRef<HTMLSpanElement>(null);
  const drivenAt = useRef(0);
  const navigating = useRef(false);
  const shownPath = useRef(pathname);
  const scheduleUpdate = useRef<() => void>(undefined);
  const lenis = useLenis();

  // A route change: hidden at once in the new state (the transition's snapshot of the old
  // indicator is what the wipe covers), back in through the boundary once the new page is in place.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || shownPath.current === pathname) return;
    shownPath.current = pathname;
    navigating.current = true;
    present(root, "hidden", true);
    let frame = 0;
    let settled = 0;
    const wait = () => {
      // A few frames after the wipe, so the tone of the new page has been read.
      settled = viewTransitionActive() ? 0 : settled + 1;
      if (settled < 3) {
        frame = requestAnimationFrame(wait);
        return;
      }
      navigating.current = false;
      present(root, "shown");
    };
    frame = requestAnimationFrame(wait);
    return () => {
      cancelAnimationFrame(frame);
      navigating.current = false;
    };
  }, [pathname]);

  // Page → indicator.
  useEffect(() => {
    const root = rootRef.current;
    const input = inputRef.current;
    const value = valueRef.current;
    if (!root || !input || !value) return;
    let frame = 0;

    const update = () => {
      frame = 0;
      const max = maxScroll();
      const progress = max > 0 ? clamp(window.scrollY / max) : 0;
      const percent = Math.round(progress * 100);
      root.style.setProperty("--progress", progress.toFixed(4));
      value.textContent = String(percent);
      const driving = root.hasAttribute("data-dragging") || performance.now() - drivenAt.current < DRIVE_HOLD;
      if (!driving) input.value = String(progress * 100);
      input.setAttribute("aria-valuetext", `${percent}%`);
      if (navigating.current) return;
      const inUse = root.hasAttribute("data-dragging") || root.contains(document.activeElement);
      if (progress > HIDE_ABOVE && !inUse) present(root, "hidden");
      else if (progress < SHOW_BELOW || inUse) present(root, "shown");
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    // The wipe has finished when its own animation ends.
    const onAnimationEnd = (event: AnimationEvent) => {
      if (event.target === root) root.removeAttribute("data-moving");
    };

    scheduleUpdate.current = schedule;
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    // Focus brings it back (and keeps it); leaving it lets the end of the page hide it again.
    root.addEventListener("focusin", schedule);
    root.addEventListener("focusout", schedule);
    root.addEventListener("animationend", onAnimationEnd);
    const resizeObserver = new ResizeObserver(schedule);
    resizeObserver.observe(document.documentElement);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      root.removeEventListener("focusin", schedule);
      root.removeEventListener("focusout", schedule);
      root.removeEventListener("animationend", onAnimationEnd);
      resizeObserver.disconnect();
    };
  }, [pathname]);

  // Dragging ends wherever the pointer is released; at the very end the indicator may then step aside.
  useEffect(() => {
    const end = () => {
      const root = rootRef.current;
      if (!root?.hasAttribute("data-dragging")) return;
      root.removeAttribute("data-dragging");
      scheduleUpdate.current?.();
    };
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    return () => {
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
  }, []);

  // Indicator → page.
  const goTo = (fraction: number) => {
    drivenAt.current = performance.now();
    const top = Math.round(clamp(fraction) * maxScroll());
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (lenis) lenis.scrollTo(top, reduced ? { immediate: true } : { lerp: 0.18 });
    else window.scrollTo({ top, behavior: reduced ? "instant" : "smooth" });
  };

  const startDrag = () => rootRef.current?.setAttribute("data-dragging", "");

  /** The // mark under a finger, mapped as the range maps its thumb (the mark stays inside the rail). */
  const fractionAt = (clientX: number) => {
    const rail = railRef.current?.getBoundingClientRect();
    const mark = markerRef.current?.getBoundingClientRect().width ?? 0;
    if (!rail || rail.width <= mark) return 0;
    return (clientX - rail.left - mark / 2) / (rail.width - mark);
  };

  const onGripDown = (event: PointerEvent<HTMLSpanElement>) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    startDrag();
  };

  const onGripMove = (event: PointerEvent<HTMLSpanElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) goTo(fractionAt(event.clientX));
  };

  return (
    <div ref={rootRef} className={styles.progress} data-chrome data-progress data-presence="shown" data-tone={tone}>
      <span className={styles.start} aria-hidden="true" onClick={() => goTo(0)}>
        0
      </span>
      <span ref={railRef} className={styles.rail}>
        <span className={styles.track} aria-hidden="true">
          <span ref={markerRef} className={styles.marker}>
            <SlashMark className={styles.slashes} />
            <span className={styles.readout}>
              <span ref={valueRef}>0</span>%
            </span>
            <span className={styles.grip} onPointerDown={onGripDown} onPointerMove={onGripMove} />
          </span>
        </span>
        <input
          ref={inputRef}
          className={styles.input}
          type="range"
          min={0}
          max={100}
          step="any"
          defaultValue={0}
          aria-label="Page position"
          aria-valuetext="0%"
          onPointerDown={startDrag}
          onInput={(event) => goTo(Number(event.currentTarget.value) / 100)}
        />
      </span>
      <span className={styles.end} aria-hidden="true" onClick={() => goTo(1)}>
        100
      </span>
    </div>
  );
}
