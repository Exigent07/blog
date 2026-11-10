"use client";

import { useLenis } from "lenis/react";
import { SlashMark } from "@/components/brand/SlashMark";
import styles from "./Footer.module.css";

export function BackToTop() {
  const lenis = useLenis();

  const toTop = () => {
    if (lenis) lenis.scrollTo(0, { duration: 1.4 });
    else window.scrollTo({ top: 0 });
    // Return keyboard focus to the start of the page, as a skip link would.
    document.getElementById("main")?.focus({ preventScroll: true });
  };

  return (
    <button type="button" className={styles.backToTop} onClick={toTop}>
      <SlashMark className={styles.backMark} />
      Back to top
    </button>
  );
}
