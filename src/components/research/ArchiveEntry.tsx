import type { Route } from "next";
import { Link } from "@/components/navigation/Link";
import { SlashMark } from "@/components/brand/SlashMark";
import { formatShortDate } from "@/lib/format";
import type { SearchEntry } from "@/lib/search";
import { readingLabel } from "./model";
import styles from "./ArchiveEntry.module.css";

type Props = {
  entry: SearchEntry;
  /** Rise into place with the shared reveal (first arrival only). */
  reveal: boolean;
};

/**
 * One investigation in the index. The whole row is a single link (the title's
 * link stretches over it). The row is drawn twice, like the hero: the
 * accessible copy on paper and a decorative copy on ink that the boundary
 * sweeps in on hover or keyboard focus.
 */
export function ArchiveEntry({ entry, reveal }: Props) {
  return (
    <li className={styles.row} data-reveal={reveal ? "block" : undefined}>
      <EntryContent entry={entry} />
      <div className={styles.ink} data-tone="ink" aria-hidden="true" inert>
        <EntryContent entry={entry} decorative />
      </div>
    </li>
  );
}

/** Identical markup in both copies keeps them aligned to the pixel. */
function EntryContent({ entry, decorative = false }: { entry: SearchEntry; decorative?: boolean }) {
  return (
    <article className={styles.entry}>
      <p className={styles.date}>
        <span className="visually-hidden">Published </span>
        <time dateTime={entry.publishedAt}>{formatShortDate(entry.publishedAt)}</time>
        {decorative && (
          <span className={styles.marker}>
            <SlashMark className={styles.markerSlashes} />
            <span className={styles.markerLine} />
          </span>
        )}
      </p>

      <div className={styles.main}>
        <h3 className={styles.title}>
          {decorative ? (
            entry.title
          ) : (
            <Link className={styles.link} href={`/research/${entry.slug}` as Route}>
              {entry.title}
            </Link>
          )}
        </h3>
        {entry.subtitle && <p className={styles.subtitle}>{entry.subtitle}</p>}
      </div>

      <div className={styles.side}>
        <dl className={styles.facts}>
          <div className={styles.fact}>
            <dt className={styles.factLabel}>Topic</dt>
            <dd className={styles.factValue}>{entry.topic}</dd>
          </div>
          <div className={styles.fact}>
            <dt className={styles.factLabel}>Technique</dt>
            <dd className={styles.factValue}>{entry.technique}</dd>
          </div>
        </dl>
        <p className={styles.time}>
          <span className="visually-hidden">Read time </span>
          {readingLabel(entry.readingMinutes)}
        </p>
        <p className={styles.summary}>{entry.summary}</p>
      </div>
    </article>
  );
}
