import { ViewTransition } from "react";
import styles from "./PageTransition.module.css";

/**
 * Wraps a page's content so navigations tagged "boundary" (see Link) reveal
 * the new page through a diagonal wipe at the boundary angle while the old
 * page holds still beneath it (src/styles/view-transitions.css). Untyped
 * navigations (browser back/forward, refresh) do not animate. Per the Next.js
 * guide it belongs in each page, not a layout: layouts never enter or exit.
 *
 * React names the boundary's host children for the transition, so the page
 * is given exactly one, and it is opaque: the entering snapshot has to cover
 * the old page beneath it, or both pages' text shows through each other.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition
      enter={{ boundary: "boundary-enter", default: "none" }}
      exit={{ boundary: "boundary-exit", default: "none" }}
      default="none"
    >
      <div className={styles.page}>{children}</div>
    </ViewTransition>
  );
}
