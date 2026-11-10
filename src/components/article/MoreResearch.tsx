import type { Route } from "next";
import { Link } from "@/components/navigation/Link";
import { SlashMark } from "@/components/brand/SlashMark";
import { BracketAction } from "@/components/ui/BracketAction";
import type { ResearchMeta } from "@/lib/content/research";
import { TOPICS } from "@/lib/content/schema";
import { formatShortDate } from "@/lib/format";
import styles from "./MoreResearch.module.css";

type Props = {
  slug: string;
  related: ResearchMeta[];
  older?: ResearchMeta;
  newer?: ResearchMeta;
};

const href = (entry: ResearchMeta) => `/research/${entry.slug}` as Route;

/**
 * After the article: related research as an editorial list, the
 * chronological neighbours the list does not already show, and the route to
 * the archive. Titles are the links; the `//──` marker draws in beside a
 * title on hover and focus.
 */
export function MoreResearch({ slug, related, older, newer }: Props) {
  const listed = new Set(related.map((entry) => entry.slug));
  const adjacent = [
    { rel: "prev", label: "Older", entry: older },
    { rel: "next", label: "Newer", entry: newer },
  ].flatMap(({ entry, ...link }) => (entry && !listed.has(entry.slug) ? [{ ...link, entry }] : []));
  const headingId = `${slug}-related`;

  return (
    <div className={styles.more}>
      {related.length > 0 && (
        <section aria-labelledby={headingId}>
          <h2 id={headingId} className={styles.heading}>
            Related research
          </h2>
          <ol role="list" className={styles.list}>
            {related.map((entry) => (
              <li key={entry.slug} className={styles.entry}>
                <dl className={styles.facts}>
                  <div>
                    <dt className="visually-hidden">Published</dt>
                    <dd>
                      <time dateTime={entry.publishedAt}>{formatShortDate(entry.publishedAt)}</time>
                    </dd>
                  </div>
                  <div>
                    <dt className="visually-hidden">Topic</dt>
                    <dd>{TOPICS[entry.topic]}</dd>
                  </div>
                </dl>
                <div className={styles.main}>
                  <h3 className={styles.title}>
                    <Link href={href(entry)} className={styles.link}>
                      <span className={styles.marker} aria-hidden="true">
                        <SlashMark className={styles.slashes} />
                        <span className={styles.rule} />
                      </span>
                      {entry.title}
                    </Link>
                  </h3>
                  <p className={styles.summary}>{entry.summary}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {adjacent.length > 0 && (
        <nav aria-label="Research by date">
          <ul role="list" className={styles.pager}>
            {adjacent.map(({ rel, label, entry }) => (
              <li key={rel} data-rel={rel}>
                <Link href={href(entry)} rel={rel} className={styles.pagerLink}>
                  <span className={styles.pagerLabel}>{label}</span>
                  <span className={styles.pagerTitle}>{entry.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <Link href="/research" className={styles.archive}>
        <BracketAction>All research</BracketAction>
      </Link>
    </div>
  );
}
