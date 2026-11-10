"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { site } from "@/lib/site";
import styles from "./Footer.module.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * The resolution of the visual identity. The hero opened with one boundary
 * ("/"); the footer closes on the mark itself: two paper bars at the logo's
 * exact proportions ("//") crossing the full-width wordmark, whose letters
 * turn to ink inside the bars.
 *
 * As the footer is uncovered the bars slide into place and the wordmark
 * settles from 94% scale; a fine pointer can then push the bars a little,
 * and the letters follow the boundary.
 */
export function FooterMark() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mark = ref.current;
      if (!mark) return;
      const footer = mark.closest("footer");

      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const words = gsap.utils.selector(mark)("[data-wordmark]");

        gsap
          .timeline({
            scrollTrigger: {
              trigger: document.documentElement,
              start: () => ScrollTrigger.maxScroll(window) - (footer?.offsetHeight ?? window.innerHeight),
              end: () => ScrollTrigger.maxScroll(window),
              scrub: true,
              invalidateOnRefresh: true,
            },
          })
          .fromTo(mark, { "--bars-in": 1 }, { "--bars-in": 0, ease: "power3.out" }, 0)
          .fromTo(words, { scale: 0.94 }, { scale: 1, ease: "power2.out" }, 0);

        if (!window.matchMedia("(pointer: fine)").matches) return;
        const push = gsap.quickTo(mark, "--bars-push", { duration: 0.9, ease: "expo.out" });
        const onMove = (event: PointerEvent) => {
          const box = mark.getBoundingClientRect();
          push(((event.clientX - box.left) / box.width - 0.5) * 2);
        };
        const onLeave = () => push(0);
        mark.addEventListener("pointermove", onMove);
        mark.addEventListener("pointerleave", onLeave);
        return () => {
          mark.removeEventListener("pointermove", onMove);
          mark.removeEventListener("pointerleave", onLeave);
        };
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={styles.mark} aria-hidden="true">
      <div className={styles.bars} />
      <p className={styles.wordmark} translate="no">
        <span data-wordmark>{site.name}</span>
      </p>
      <p className={styles.wordmark} data-layer="ink" translate="no">
        <span data-wordmark>{site.name}</span>
      </p>
    </div>
  );
}
