"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import styles from "./Seam.module.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * The reverse of the hero's breach: between an ink section and the paper
 * section after it, paper territory advances across the band at the boundary
 * angle as the reader scrolls through it. With reduced motion the band is a
 * static diagonal split.
 */
export function Seam() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const seam = ref.current;
      if (!seam) return;
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          seam,
          { "--seam": 0 },
          {
            "--seam": 1,
            ease: "none",
            scrollTrigger: { trigger: seam, start: "top 85%", end: "bottom 25%", scrub: true },
          },
        );
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={styles.seam} data-tone="ink" data-tone-bottom="paper" aria-hidden="true">
      <div className={styles.paper} />
      <span className={styles.edge} />
    </div>
  );
}
