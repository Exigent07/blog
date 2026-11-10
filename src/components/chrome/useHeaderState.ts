"use client";

import { useEffect, useState } from "react";

export type HeaderState = "top" | "shown" | "hidden";

/**
 * `top` while the page is at (or near) its start, so the header can belong to
 * the page composition; afterwards it hides on downward scroll and returns on
 * upward scroll. Reads `scrollY` once per animation frame at most.
 */
export function useHeaderState(threshold = 24, tolerance = 6): HeaderState {
  const [state, setState] = useState<HeaderState>("top");

  useEffect(() => {
    let last = window.scrollY;
    let frame = 0;

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      if (y <= threshold) {
        setState("top");
      } else if (Math.abs(y - last) >= tolerance) {
        setState(y > last ? "hidden" : "shown");
      } else {
        return;
      }
      last = y;
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [threshold, tolerance]);

  return state;
}
