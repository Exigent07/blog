"use client";

import { type FocusEvent, type PointerEvent, useEffect, useId, useMemo, useRef, useState } from "react";
import type { MentionProfile } from "@/lib/content/syntax";
import styles from "./Mention.module.css";

/** Hover intent: a pointer passing over the name does not open the card. */
const OPEN_DELAY = 260;
/** Long enough to cross the gap from the name to the card. */
const CLOSE_DELAY = 180;
const CLOSE_ANIMATION = 140;

type Props = {
  name: string;
  bio?: string;
  /** JSON of MentionProfile[], the first being the main profile (src/lib/content/syntax.ts). */
  profiles: string;
};

/** "ValentinoMassaro" → "VM", "Jane Doe" → "JD", "exigent07" → "EX". */
function initials(name: string) {
  const words = name.match(/[A-Z][a-z]*|[a-z]+|\d+/g) ?? [name];
  const letters = words.length > 1 ? words[0][0] + words[1][0] : name.slice(0, 2);
  return letters.toUpperCase();
}

/**
 * A mentioned person: their name in the text, linked to their main profile,
 * and a card with their bio and every profile. The card opens on hover (after
 * a short intent delay) or keyboard focus, stays open while the pointer is on
 * it, and closes on Escape or when focus leaves. It lives in the
 * top layer (Popover API), so no container clips it, and follows its name
 * when the page scrolls. Touch follows the link.
 */
export function Mention({ name, bio, profiles: serialized }: Props) {
  const id = useId();
  const profiles = useMemo(() => JSON.parse(serialized) as MentionProfile[], [serialized]);
  const [primary] = profiles;
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<HTMLAnchorElement>(null);
  const cardRef = useRef<HTMLSpanElement>(null);
  const timer = useRef(0);
  const [state, setState] = useState<"closed" | "open" | "closing">("closed");

  const place = () => {
    const trigger = triggerRef.current;
    const card = cardRef.current;
    if (!trigger || !card) return;
    const margin = 16;
    const gap = 10;
    const anchor = trigger.getClientRects()[0] ?? trigger.getBoundingClientRect();
    const { width, height } = card.getBoundingClientRect();
    const left = Math.min(Math.max(margin, anchor.left), window.innerWidth - width - margin);
    const below = anchor.bottom + gap;
    const fitsBelow = below + height <= window.innerHeight - margin;
    card.style.left = `${Math.round(left)}px`;
    card.style.top = `${Math.round(fitsBelow ? below : Math.max(margin, anchor.top - gap - height))}px`;
  };

  const open = () => {
    window.clearTimeout(timer.current);
    const card = cardRef.current;
    if (!card) return;
    if (!card.matches(":popover-open")) card.showPopover();
    // Measured and placed in the same frame it appears, so it never paints in the wrong place.
    place();
    setState("open");
  };

  const close = (immediately = false) => {
    window.clearTimeout(timer.current);
    const card = cardRef.current;
    if (!card?.matches(":popover-open")) return;
    const hide = () => {
      if (card.matches(":popover-open")) card.hidePopover();
      setState("closed");
    };
    if (immediately || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return hide();
    setState("closing");
    timer.current = window.setTimeout(hide, CLOSE_ANIMATION);
  };

  const later = (action: () => void, delay: number) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(action, delay);
  };

  // While open: Escape closes and returns focus to the name. Scrolling (the
  // browser's own, when focus arrives by Tab, included) carries the card with
  // its name, and closes it once the name has left the screen.
  useEffect(() => {
    if (state !== "open") return;
    let frame = 0;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      const hadFocus = wrapperRef.current?.contains(document.activeElement);
      close(true);
      if (hadFocus) triggerRef.current?.focus();
    };
    const follow = () => {
      frame = 0;
      const anchor = triggerRef.current?.getBoundingClientRect();
      if (!anchor || anchor.bottom < 0 || anchor.top > window.innerHeight) close(true);
      else place();
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(follow);
    };
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll);
    };
  });

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onPointerEnter = (event: PointerEvent) => {
    if (event.pointerType === "touch") return;
    if (state === "closed") later(open, OPEN_DELAY);
    else open();
  };

  const onPointerLeave = (event: PointerEvent) => {
    if (event.pointerType === "touch") return;
    later(() => close(), CLOSE_DELAY);
  };

  const onFocus = (event: FocusEvent<HTMLElement>) => {
    if (event.target === triggerRef.current && !event.target.matches(":focus-visible")) return;
    open();
  };

  const onBlur = (event: FocusEvent<HTMLElement>) => {
    if (!wrapperRef.current?.contains(event.relatedTarget)) close();
  };

  return (
    <span ref={wrapperRef} className={styles.mention} onFocus={onFocus} onBlur={onBlur}>
      <a
        ref={triggerRef}
        className={styles.trigger}
        href={primary.href}
        rel="noreferrer"
        aria-describedby={bio ? `${id}-bio` : undefined}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
      >
        <span className={styles.at}>@</span>
        {name}
      </a>
      <span
        ref={cardRef}
        id={id}
        className={styles.card}
        popover="manual"
        data-tone="ink"
        data-state={state}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
      >
        <span className={styles.head}>
          <span className={styles.monogram} aria-hidden="true">
            <span>{initials(name)}</span>
            <span className={styles.monogramInk}>{initials(name)}</span>
          </span>
          <span className={styles.identity}>
            <span className={styles.name}>{name}</span>
            <span className={styles.handle} translate="no">
              {primary.handle}
            </span>
          </span>
        </span>
        {bio && (
          <span id={`${id}-bio`} className={styles.bio}>
            {bio}
          </span>
        )}
        <span className={styles.profiles}>
          {profiles.map((profile) => (
            <a key={profile.href} className={styles.profile} href={profile.href} rel="noreferrer">
              <span className={styles.platform}>{profile.platform}</span>
              <span className={styles.profileHandle} translate="no">
                {profile.handle}
              </span>
            </a>
          ))}
        </span>
      </span>
    </span>
  );
}
