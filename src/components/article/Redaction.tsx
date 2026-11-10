"use client";

import { useEffect, useRef } from "react";
import styles from "./Redaction.module.css";

const NOISE = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&*+=<>/";
/** Noise holds for this long, then the label settles left to right. */
const SCRAMBLE = 260;
const SETTLE = 380;
const FRAME = 45;

/** "//REDACTED//" fitted to the bar: the word centred, the slash mark either side. */
function label(chars: number) {
  if (chars < 8) return "/".repeat(chars);
  const side = (chars - 8) / 2;
  return `${"/".repeat(Math.floor(side))}REDACTED${"/".repeat(Math.ceil(side))}`;
}

type Props = {
  /** Width in characters (rounded at build time, src/lib/content/syntax.ts). */
  chars: number | string;
  /** "code" inside a highlighted code block. */
  context?: string;
};

/**
 * Censored text (`||text||`). The text itself was removed when the article
 * compiled; this is a bar of about its width. On hover the boundary crosses
 * the bar and scrambled glyphs settle into "REDACTED": a reveal that, by
 * construction, has nothing to reveal.
 */
export function Redaction({ chars: width, context }: Props) {
  const chars = Number(width);
  const barRef = useRef<HTMLSpanElement>(null);
  const glyphsRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    const glyphs = glyphsRef.current;
    if (!bar || !glyphs) return;
    const target = label(chars);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let start = 0;
    let drawn = 0;

    const draw = (now: number) => {
      start ||= now;
      if (now - drawn >= FRAME) {
        drawn = now;
        const settled = Math.floor(Math.min(1, Math.max(0, (now - start - SCRAMBLE) / SETTLE)) * chars);
        let text = target.slice(0, settled);
        for (let index = settled; index < chars; index += 1) text += NOISE[Math.floor(Math.random() * NOISE.length)];
        glyphs.textContent = text;
        if (settled === chars) return;
      }
      frame = requestAnimationFrame(draw);
    };

    const enter = () => {
      cancelAnimationFrame(frame);
      bar.dataset.state = "open";
      if (reduced.matches) {
        glyphs.textContent = target;
        return;
      }
      start = 0;
      drawn = 0;
      frame = requestAnimationFrame(draw);
    };

    const leave = () => {
      cancelAnimationFrame(frame);
      bar.dataset.state = "closed";
    };

    bar.addEventListener("pointerenter", enter);
    bar.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(frame);
      bar.removeEventListener("pointerenter", enter);
      bar.removeEventListener("pointerleave", leave);
    };
  }, [chars]);

  return (
    <span
      ref={barRef}
      className={styles.redaction}
      style={{ "--chars": chars }}
      data-redaction=""
      data-context={context}
    >
      <span ref={glyphsRef} className={styles.glyphs} aria-hidden="true" />
      <span className="visually-hidden">redacted</span>
    </span>
  );
}
