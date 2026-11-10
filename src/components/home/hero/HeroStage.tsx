"use client";

import { type CSSProperties, type ReactNode, useEffect, useRef } from "react";
import { REDUCED_MOTION_QUERY, STAGE_QUERY } from "@/lib/media";
import { drawField, type FieldGeometry } from "./field";
import { useHeroMotion } from "./useHeroMotion";
import styles from "./Hero.module.css";

type Props = {
  style: CSSProperties;
  /** The accessible composition, ink on paper. */
  paper: ReactNode;
  /** The decorative paper-on-ink copy shown inside the territory. */
  ink: ReactNode;
};

/**
 * Client shell of the hero: the dot field, the motion (entrance and breach)
 * and, on phones and tablets, the boundary anchor. Geometry stays in CSS; two
 * hidden probes report what the canvas needs (stage unit, grid origin, where
 * the boundary meets y = 0 at rest), so nothing is computed twice. The one
 * formula shared with CSS is how --breach moves the boundary:
 * x_top = x_top0 − breach · (x_top0 + 2px).
 */
export function HeroStage({ style, paper, ink }: Props) {
  const heroRef = useRef<HTMLElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridProbeRef = useRef<HTMLSpanElement>(null);
  const lineProbeRef = useRef<HTMLSpanElement>(null);
  const fieldRef = useRef<{ setBreach: (value: number) => void } | null>(null);

  useEffect(() => {
    const hero = heroRef.current;
    const paperLayer = paperRef.current;
    const canvas = canvasRef.current;
    const gridProbe = gridProbeRef.current;
    const lineProbe = lineProbeRef.current;
    const context = canvas?.getContext("2d");
    if (!hero || !paperLayer || !canvas || !gridProbe || !lineProbe || !context) return;

    const stage = window.matchMedia(STAGE_QUERY);
    const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY);
    let geometry: (Omit<FieldGeometry, "xTop"> & { xTop0: number }) | undefined;
    // The motion hook may already have set the boundary (it runs in a layout effect).
    let breach = Number.parseFloat(hero.style.getPropertyValue("--breach")) || 0;
    let pointer: { x: number; y: number } | null = null;
    let frame = 0;

    /**
     * Phones/tablets: run the boundary through the headline's last word, 62%
     * along its glyphs and halfway down its line. The horizontal extent comes
     * from a Range over the text (a word's box is a full-width block here);
     * the vertical position from layout offsets, which ignore the entrance's
     * in-flight translate, so the anchor is where the word comes to rest.
     */
    const anchorToLastWord = () => {
      if (stage.matches) {
        hero.style.removeProperty("--anchor-x");
        hero.style.removeProperty("--anchor-y");
        return;
      }
      const words = paperLayer.querySelectorAll<HTMLElement>("[data-word]");
      const last = words[words.length - 1];
      if (!last) return;
      const range = document.createRange();
      range.selectNodeContents(last);
      const glyphs = range.getBoundingClientRect();
      let top = 0;
      for (let node: HTMLElement | null = last; node && node !== hero; node = node.offsetParent as HTMLElement | null) {
        top += node.offsetTop;
      }
      const left = glyphs.left - hero.getBoundingClientRect().left;
      hero.style.setProperty("--anchor-x", `${left + glyphs.width * 0.62}px`);
      hero.style.setProperty("--anchor-y", `${top + last.offsetHeight * 0.5}px`);
    };

    const measure = () => {
      anchorToLastWord();
      const width = hero.clientWidth;
      const height = hero.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      geometry = {
        width,
        height,
        dpr,
        unit: gridProbe.offsetWidth / 1000,
        originX: gridProbe.offsetLeft,
        originY: gridProbe.offsetTop,
        xTop0: lineProbe.offsetLeft,
        color: getComputedStyle(canvas).getPropertyValue("--dot").trim() || "#fff",
      };
    };

    const render = () => {
      frame = 0;
      if (!geometry) return;
      const { xTop0, ...rest } = geometry;
      drawField(context, { ...rest, xTop: xTop0 - breach * (xTop0 + 2) }, reducedMotion.matches ? null : pointer);
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(render);
    };

    fieldRef.current = {
      setBreach: (value) => {
        breach = value;
        schedule();
      },
    };

    const onResize = () => {
      measure();
      schedule();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const box = hero.getBoundingClientRect();
      pointer = { x: event.clientX - box.left, y: event.clientY - box.top };
      schedule();
    };

    const onPointerLeave = () => {
      pointer = null;
      schedule();
    };

    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(hero);
    hero.addEventListener("pointermove", onPointerMove, { passive: true });
    hero.addEventListener("pointerleave", onPointerLeave);
    stage.addEventListener("change", onResize);
    document.fonts.ready.then(onResize);

    return () => {
      fieldRef.current = null;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      hero.removeEventListener("pointermove", onPointerMove);
      hero.removeEventListener("pointerleave", onPointerLeave);
      stage.removeEventListener("change", onResize);
    };
  }, []);

  useHeroMotion(heroRef, (value) => {
    fieldRef.current?.setBreach(value);
    // Once the boundary has passed the header's line, the hero reads as ink there.
    const top = value > 0.6 ? "ink" : "paper";
    if (heroRef.current?.dataset.toneTop !== top) heroRef.current?.setAttribute("data-tone-top", top);
  });

  // The wrapper is React's stable child: ScrollTrigger's pin moves the section
  // into a pin-spacer it creates, which must happen inside a node React owns.
  return (
    <div className={styles.pinWrap}>
      <section
        ref={heroRef}
        className={styles.hero}
        style={style}
        aria-labelledby="hero-title"
        data-tone="paper"
        data-tone-top="paper"
        data-tone-bottom="ink"
      >
        <div ref={paperRef} className={styles.layer}>
          {paper}
        </div>
        <span
          className={styles.boundaryLine}
          data-segment="upper"
          data-enter-rule
          style={{ "--enter-index": 1 }}
          aria-hidden="true"
        />
        <span
          className={styles.boundaryLine}
          data-segment="lower"
          data-enter-rule
          style={{ "--enter-index": 2 }}
          aria-hidden="true"
        />
        <div className={styles.territory} aria-hidden="true">
          <canvas ref={canvasRef} className={styles.field} />
          <div className={styles.layer} data-tone="ink" inert>
            {ink}
          </div>
        </div>
        <span ref={gridProbeRef} className={styles.gridProbe} aria-hidden="true" />
        <span ref={lineProbeRef} className={styles.lineProbe} aria-hidden="true" />
      </section>
    </div>
  );
}
