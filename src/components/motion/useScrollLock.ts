"use client";

import { useLenis } from "lenis/react";
import { useEffect } from "react";

/**
 * Locks page scrolling while `locked` (for modal dialogs). `lenis.stop()` adds
 * `lenis-stopped` to <html>, which lenis.css turns into `overflow: clip`; the
 * dialog itself carries `data-lenis-prevent` so its content scrolls natively.
 */
export function useScrollLock(locked: boolean) {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis || !locked) return;
    lenis.stop();
    return () => lenis.start();
  }, [lenis, locked]);
}
