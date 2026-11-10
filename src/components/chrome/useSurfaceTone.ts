"use client";

import { useEffect, useState } from "react";
import { viewTransitionActive } from "@/components/navigation/viewTransition";

export type Tone = "paper" | "ink";

const TONE_ATTRIBUTES = ["data-tone", "data-tone-top", "data-tone-bottom"];

/** A route change settles over its transition (the wipe is 1.1s) and its streaming: look every frame meanwhile. */
const SETTLE_MS = 1600;

/**
 * Reports the tone of the surface visible under a point of fixed chrome
 * (the header's line near the top, the progress indicator near the bottom),
 * so the chrome can match what it overlays.
 *
 * Surfaces declare `data-tone="paper|ink"` and may override the tone seen at
 * the top or bottom of the viewport with `data-tone-top` / `data-tone-bottom`
 * (the hero is paper top-left, ink bottom-right, and flips its top tone as
 * the breach advances).
 *
 * `depth` decides which surface counts where they nest. The header spans the
 * page and reads the outermost section, so ink code blocks or hover overlays
 * inside a paper section never flip it. The small progress indicator sits on
 * whatever is directly beneath it, so it reads the innermost surface (an ink
 * instrument or code slab inside a paper section).
 *
 * One `elementsFromPoint` call resolves it, respecting stacking order,
 * clipping and inertness (the footer sits beneath <main>) and skipping fixed
 * chrome (`data-chrome`). It runs at most once a frame, whenever something
 * can have moved a surface under the point: scrolling, a change in the page's
 * size (content streaming in), a change to a tone attribute, and a route
 * change while it settles (but not during the wipe itself, when the page
 * cannot be hit-tested). Watching surfaces for intersections is not enough:
 * a new page brings surfaces that were never observed, and the sticky footer
 * intersects the bottom line at all times, so it never reports a change.
 */
export function useSurfaceTone(
  line: "top" | "bottom",
  offsetPx: number,
  pathname: string,
  depth: "outermost" | "innermost" = "outermost",
): Tone {
  const [tone, setTone] = useState<Tone>("paper");

  useEffect(() => {
    const attribute = line === "top" ? "data-tone-top" : "data-tone-bottom";
    let frame = 0;

    const read = (surface: Element): Tone =>
      (surface.getAttribute(attribute) ?? surface.getAttribute("data-tone")) === "ink" ? "ink" : "paper";

    const surfaceOf = (element: Element) => {
      let surface = element.closest("[data-tone]");
      if (depth === "innermost") return surface;
      let parent = surface?.parentElement?.closest("[data-tone]");
      while (surface && parent) {
        surface = parent;
        parent = surface.parentElement?.closest("[data-tone]");
      }
      return surface;
    };

    const resolve = () => {
      frame = 0;
      // Mid-wipe the page is lifted into the transition and cannot be hit: keep the tone, look again after.
      if (viewTransitionActive()) return;
      const y = line === "top" ? offsetPx : window.innerHeight - offsetPx;
      // The header spans the width; the indicator sits at the right edge.
      const x = line === "top" ? window.innerWidth / 2 : window.innerWidth - 96;
      for (const element of document.elementsFromPoint(x, y)) {
        if (element.closest("[data-chrome]")) continue;
        // <main> paints paper behind every page, in front of the footer beneath it.
        if (element.tagName === "MAIN") {
          setTone("paper");
          return;
        }
        const surface = surfaceOf(element);
        if (surface) {
          setTone(read(surface));
          return;
        }
      }
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(resolve);
    };

    // Every frame until a new route has settled (this effect re-runs on each pathname).
    const settleUntil = performance.now() + SETTLE_MS;
    let settling = 0;
    const settle = () => {
      resolve();
      if (performance.now() < settleUntil) settling = requestAnimationFrame(settle);
    };
    settling = requestAnimationFrame(settle);
    const resizeObserver = new ResizeObserver(schedule);
    resizeObserver.observe(document.documentElement);
    const mutations = new MutationObserver(schedule);
    mutations.observe(document.body, { attributes: true, attributeFilter: TONE_ATTRIBUTES, subtree: true });
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    resolve();

    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(settling);
      resizeObserver.disconnect();
      mutations.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [line, offsetPx, pathname, depth]);

  return tone;
}
