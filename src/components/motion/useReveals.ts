"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import type { RefObject } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

/**
 * The publication's two reveal primitives (docs/DESIGN.md §5):
 *
 * - Lines: text rises into place through a mask, line by line
 *   (`data-reveal="lines"`). Only for plain text: never split an element that
 *   contains links or controls.
 * - Blocks: a block rises 24px and fades in (`data-reveal="block"`).
 *
 * Targets are pre-hidden by CSS only when JavaScript runs and motion is
 * allowed (see base.css), so there is no flash of the server-painted text and
 * nothing is hidden without JavaScript. Reduced motion skips all of it.
 *
 * Hiding uses opacity only, never visibility: content waiting for its reveal
 * stays in the accessibility tree and in the Tab order, and keyboard focus
 * entering it finishes its reveal at once.
 */
const MOTION_OK = "(prefers-reduced-motion: no-preference)";

export type RevealTrigger = "load" | "scroll";

/** Pending reveal tweens by target, so focus can finish them early. */
type Registry = Map<HTMLElement, gsap.core.Tween>;

type LineOptions = {
  trigger?: RevealTrigger;
  /** Seconds before the reveal starts (load trigger). */
  delay?: number;
  start?: string;
  registry?: Registry;
};

/** Must run inside a gsap context (useGSAP / matchMedia). */
export function revealLines(
  element: HTMLElement,
  { trigger = "scroll", delay = 0, start = "top 86%", registry }: LineOptions = {},
) {
  SplitText.create(element, {
    type: "lines",
    mask: "lines",
    // aria-label is only valid on headings; elsewhere lines stay readable as-is.
    aria: /^H[1-6]$/.test(element.tagName) ? "auto" : "none",
    autoSplit: true,
    onSplit: (self) => {
      const tween = gsap.from(self.lines, {
        yPercent: 105,
        duration: 1.05,
        stagger: 0.075,
        ease: "expo.out",
        delay,
        scrollTrigger: trigger === "scroll" ? { trigger: element, start, once: true } : undefined,
        onComplete: () => self.revert(),
      });
      registry?.set(element, tween);
      return tween;
    },
  });
  gsap.set(element, { opacity: 1 });
}

/** Must run inside a gsap context. Blocks are revealed in DOM order, 70ms apart. */
export function revealBlocks(
  elements: HTMLElement[],
  { trigger = "scroll", delay = 0, start = "top 88%", registry }: LineOptions = {},
) {
  if (elements.length === 0) return;
  const tween = gsap.fromTo(
    elements,
    { opacity: 0, y: 24 },
    {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: "expo.out",
      stagger: 0.07,
      delay,
      clearProps: "transform",
      scrollTrigger: trigger === "scroll" ? { trigger: elements[0], start, once: true } : undefined,
    },
  );
  elements.forEach((element) => registry?.set(element, tween));
}

/** Jumps every pending reveal that contains `target` to its end state. */
function finishRevealsAround(target: EventTarget | null, root: HTMLElement, registry: Registry) {
  for (let node = target instanceof HTMLElement ? target : null; node; node = node.parentElement) {
    const tween = registry.get(node);
    if (tween && tween.progress() < 1) {
      tween.scrollTrigger?.kill();
      tween.progress(1);
    }
    if (node === root) break;
  }
}

/**
 * Reveals every `[data-reveal]` descendant of `scope` as it enters the
 * viewport: `lines` targets split into masked lines, `block` targets rise as
 * a group per section (`[data-reveal-group]`, or the scope itself).
 */
export function useReveals(scope: RefObject<HTMLElement | null>, options: { trigger?: RevealTrigger } = {}) {
  const { trigger = "scroll" } = options;

  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;
      gsap.matchMedia().add(MOTION_OK, () => {
        const registry: Registry = new Map();
        root.querySelectorAll<HTMLElement>('[data-reveal="lines"]').forEach((element) => {
          revealLines(element, { trigger, registry });
        });
        // Each block staggers with the others in its nearest group inside the scope.
        const groups = new Map<HTMLElement, HTMLElement[]>();
        root.querySelectorAll<HTMLElement>('[data-reveal="block"]').forEach((block) => {
          const nearest = block.closest<HTMLElement>("[data-reveal-group]");
          const group = nearest && root.contains(nearest) ? nearest : root;
          groups.set(group, [...(groups.get(group) ?? []), block]);
        });
        groups.forEach((blocks) => revealBlocks(blocks, { trigger, registry }));

        // Keyboard focus never lands on something still faded out.
        const onFocusIn = (event: FocusEvent) => finishRevealsAround(event.target, root, registry);
        root.addEventListener("focusin", onFocusIn);
        return () => {
          root.removeEventListener("focusin", onFocusIn);
          registry.clear();
        };
      });
    },
    { scope, dependencies: [trigger], revertOnUpdate: true },
  );
}
