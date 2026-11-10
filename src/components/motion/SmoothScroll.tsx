"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { LenisOptions } from "lenis";
import { ReactLenis, useLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import { Suspense, useEffect } from "react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Lenis smooths wheel input only: touch stays native (`syncTouch: false`),
 * keyboard and assistive scrolling are native, and with reduced motion Lenis
 * itself disables smoothing (`respectReducedMotion`, on by default).
 *
 * `anchors` stays off: Cache Components keeps hidden routes in the DOM, so a
 * document-wide `#id` lookup can resolve inside a hidden page. In-page links
 * scroll within their own article instead (src/components/article/scroll.ts).
 *
 * Module-level object: ReactLenis re-creates its instance when the serialised
 * options change.
 */
const OPTIONS: LenisOptions = {
  autoRaf: false,
  lerp: 0.1,
  smoothWheel: true,
  syncTouch: false,
  anchors: false,
  stopInertiaOnNavigate: true,
};

/** The documented Lenis ↔ ScrollTrigger synchronisation: one clock (GSAP's ticker). */
function TickerSync() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;
    const unsubscribe = lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => {
      unsubscribe();
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
    };
  }, [lenis]);

  return null;
}

/** Layout-level triggers measure the previous route; re-measure after navigation. */
function RefreshOnNavigation() {
  const pathname = usePathname();
  useEffect(() => {
    ScrollTrigger.refresh(true);
  }, [pathname]);
  return null;
}

export function SmoothScroll() {
  return (
    <>
      <ReactLenis root options={OPTIONS} />
      <TickerSync />
      <Suspense fallback={null}>
        <RefreshOnNavigation />
      </Suspense>
    </>
  );
}
