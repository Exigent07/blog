"use client";

import { useLenis } from "lenis/react";
import { useEffect, useRef } from "react";
import { STAGE_QUERY } from "@/lib/media";

/**
 * The footer element. On the desktop stage the footer is sticky beneath
 * <main> and is uncovered by scrolling to the end of the page; the keyboard
 * can reach its links before that, so focus entering it while it is still
 * covered scrolls straight to the end.
 */
export function FooterFrame({ className, children }: { className: string; children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const lenis = useLenis();

  useEffect(() => {
    const footer = ref.current;
    if (!footer) return;
    const stage = window.matchMedia(STAGE_QUERY);

    const uncover = () => {
      if (!stage.matches) return;
      const end = document.documentElement.scrollHeight - window.innerHeight;
      if (window.scrollY >= end - 1) return;
      if (lenis) lenis.scrollTo(lenis.limit, { immediate: true, force: true });
      else window.scrollTo({ top: end, behavior: "instant" });
    };

    footer.addEventListener("focusin", uncover);
    return () => footer.removeEventListener("focusin", uncover);
  }, [lenis]);

  return (
    <footer ref={ref} className={className} data-tone="ink">
      {children}
    </footer>
  );
}
