"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { RefObject } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const MOTION_OK = "(prefers-reduced-motion: no-preference)";
/** Where the boundary starts before it forms: well off-screen to the right. */
const FORMING_OFFSET = -0.45;

/**
 * The hero's two movements, both expressed through `--breach`:
 *
 * 1. Entrance: the boundary forms (−0.45 → 0); the text entrance itself is
 *    CSS (Hero.module.css) so it never waits for hydration.
 * 2. The breach: the hero pins and, as the reader scrolls, the boundary
 *    advances (0 → 1) until the whole first screen is ink territory, handing
 *    over to the ink section below.
 *
 * The two are added together (entrance offset + scroll progress) so they never
 * fight if the reader scrolls during the entrance. `onBreach` receives every
 * new value so the canvas can redraw the dot band at the boundary.
 */
export function useHeroMotion(heroRef: RefObject<HTMLElement | null>, onBreach: (value: number) => void) {
  useGSAP(
    () => {
      const hero = heroRef.current;
      if (!hero) return;

      const markReady = () => hero.setAttribute("data-ready", "");
      const mm = gsap.matchMedia();

      mm.add(
        { motion: MOTION_OK, reduced: "(prefers-reduced-motion: reduce)" },
        (context) => {
          if (context.conditions?.reduced) {
            markReady();
            onBreach(0);
            return;
          }

          const state = { forming: window.scrollY < 8 ? FORMING_OFFSET : 0, scroll: 0 };
          const easeScroll = gsap.parseEase("power2.inOut");
          const apply = () => {
            const value = Math.min(1, state.forming + easeScroll(state.scroll));
            hero.style.setProperty("--breach", value.toFixed(4));
            onBreach(value);
          };

          apply();
          markReady();

          // The text entrance is CSS (it paints before hydration); the
          // boundary forms here so the dot field can follow it.
          if (state.forming < 0) {
            gsap.to(state, { forming: 0, duration: 1.35, ease: "power4.inOut", onUpdate: apply });
          }

          ScrollTrigger.create({
            trigger: hero,
            start: "top top",
            end: () => `+=${Math.round(window.innerHeight * 0.85)}`,
            pin: true,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              state.scroll = self.progress;
              apply();
            },
          });
        },
      );
    },
    { scope: heroRef },
  );
}
