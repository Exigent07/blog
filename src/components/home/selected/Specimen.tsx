"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Fragment, useRef } from "react";
import styles from "./Specimen.module.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type Side = { label: string; code: string };

/** ` `-style escapes are the invisible characters the findings depend on: make them visible. */
function withVisibleEscapes(code: string) {
  return code.split(/(\\u[0-9a-fA-F]{4})/).map((part, index) =>
    /^\\u[0-9a-fA-F]{4}$/.test(part) ? (
      <mark key={index} className={styles.escape}>
        {part}
      </mark>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    ),
  );
}

/**
 * A finding's real before/after strings. With motion, the two states share
 * one panel and the ink territory sweeps across it at the boundary angle as
 * the reader scrolls (what the parser accepted → what the browser rendered).
 * Without JavaScript, or with reduced motion, they stack and stay static.
 */
export function Specimen({ before, after }: { before: Side; after: Side }) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const figure = ref.current;
      if (!figure) return;

      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const resizeObserver = new ResizeObserver(([entry]) => {
          figure.style.setProperty("--panel-h", `${entry.borderBoxSize[0].blockSize}px`);
        });
        resizeObserver.observe(figure);
        figure.setAttribute("data-mode", "sweep");

        gsap.fromTo(
          figure,
          { "--sweep": 0 },
          {
            "--sweep": 1,
            ease: "power1.inOut",
            scrollTrigger: { trigger: figure, start: "top 72%", end: "bottom 38%", scrub: true },
          },
        );

        return () => {
          resizeObserver.disconnect();
          figure.removeAttribute("data-mode");
        };
      });
    },
    { scope: ref },
  );

  return (
    <figure ref={ref} className={styles.specimen}>
      <figcaption className="visually-hidden">Specimen from the investigation, before and after</figcaption>
      <div className={styles.side} data-side="before" data-tone="paper">
        <p className={styles.label}>
          <span className={styles.state}>Before</span> {before.label}
        </p>
        <pre className={styles.code}>
          <code translate="no">{withVisibleEscapes(before.code)}</code>
        </pre>
      </div>
      <div className={styles.side} data-side="after" data-tone="ink">
        <p className={styles.label}>
          <span className={styles.state}>After</span> {after.label}
        </p>
        <pre className={styles.code}>
          <code translate="no">{withVisibleEscapes(after.code)}</code>
        </pre>
      </div>
      <span className={styles.edge} aria-hidden="true" />
    </figure>
  );
}
