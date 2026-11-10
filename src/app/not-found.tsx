import type { Metadata } from "next";
import { Link } from "@/components/navigation/Link";
import { NotFoundSearch } from "@/components/chrome/NotFoundSearch";
import { BracketAction } from "@/components/ui/BracketAction";
import styles from "./not-found.module.css";

// Next.js marks not-found responses noindex itself.
export const metadata: Metadata = {
  title: "Out of bounds",
};

/**
 * A path outside the publication: the boundary, a plain explanation, the ways
 * back. The ink territory never covers the copy: on the desktop stage it is the
 * hero's diagonal to the right of it, elsewhere a corner in the room below it.
 */
export default function NotFound() {
  return (
    <section className={styles.page} data-tone="paper" data-tone-bottom="ink" aria-labelledby="not-found-title">
      {/* First in the DOM so the copy paints over it where they meet (desktop stage). */}
      <div className={styles.room} aria-hidden="true">
        <div className={styles.territory} />
      </div>
      <div className={styles.content}>
        <p className={styles.code}>
          <span className={styles.square} aria-hidden="true" />
          Error 404
        </p>
        <h1 id="not-found-title" className={styles.title}>
          Out of bounds
        </h1>
        <p className={styles.text}>
          This address points outside the publication. Every investigation is still in the archive.
        </p>
        <ul role="list" className={styles.actions}>
          <li>
            <Link href="/research" className={styles.primary}>
              <BracketAction>Browse the research</BracketAction>
            </Link>
          </li>
          <li>
            <Link href="/" className={styles.link}>
              Return home
            </Link>
          </li>
          <li>
            <NotFoundSearch className={styles.link} />
          </li>
        </ul>
      </div>
    </section>
  );
}
