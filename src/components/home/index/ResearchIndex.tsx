import { Link } from "@/components/navigation/Link";
import type { Route } from "next";
import { SlashMark } from "@/components/brand/SlashMark";
import { Spine } from "@/components/chrome/Spine";
import { Reveal } from "@/components/motion/Reveal";
import { BracketAction } from "@/components/ui/BracketAction";
import type { ResearchMeta } from "@/lib/content/research";
import { KINDS, TOPICS, type TopicId } from "@/lib/content/schema";
import { formatShortDate, formatYear } from "@/lib/format";
import styles from "./ResearchIndex.module.css";

function byYear(research: ResearchMeta[]) {
  const years = new Map<string, ResearchMeta[]>();
  for (const entry of research) {
    const year = formatYear(entry.publishedAt);
    years.set(year, [...(years.get(year) ?? []), entry]);
  }
  return [...years];
}

function topicCounts(research: ResearchMeta[]) {
  const counts = new Map<TopicId, number>();
  for (const entry of research) counts.set(entry.topic, (counts.get(entry.topic) ?? 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1] || TOPICS[a[0]].localeCompare(TOPICS[b[0]]));
}

/** A systematic gateway to the archive: every entry, by year, with topic routes. */
export function ResearchIndex({ research }: { research: ResearchMeta[] }) {
  const years = byYear(research);
  const first = years.at(-1)?.[0];

  return (
    <section className={styles.section} data-tone="paper" aria-labelledby="index-title">
      <Spine label="Index" />
      <Reveal>
        <div className={styles.layout}>
          <div className={styles.aside}>
            <h2 id="index-title" className={styles.heading} data-reveal="lines">
              Index
            </h2>
            <p className={styles.note} data-reveal="block">
              Everything published, newest first: {research.length}{" "}
              {research.length === 1 ? "investigation" : "investigations"}
              {first && ` since ${first}`}.
            </p>
            <nav aria-labelledby="index-topics" data-reveal="block">
              <h3 id="index-topics" className={styles.label}>
                By topic
              </h3>
              <ul role="list" className={styles.topics}>
                {topicCounts(research).map(([topic, count]) => (
                  <li key={topic}>
                    <Link className={styles.topic} href={{ pathname: "/research", query: { topic } }}>
                      <span>{TOPICS[topic]}</span>
                      <span className={styles.count}>{count}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className={styles.years}>
            {years.map(([year, entries]) => (
              <section key={year} className={styles.year} aria-label={`Published in ${year}`} data-reveal-group>
                <p className={styles.yearLabel} aria-hidden="true" data-reveal="block">
                  {year}
                </p>
                <ol role="list" className={styles.rows}>
                  {entries.map((entry) => (
                    <li key={entry.slug} className={styles.row} data-reveal="block">
                      <Link className={styles.rowLink} href={`/research/${entry.slug}` as Route}>
                        <time className={styles.date} dateTime={entry.publishedAt}>
                          {formatShortDate(entry.publishedAt)}
                        </time>
                        <span className={styles.title}>{entry.title}</span>
                        <span className={styles.meta}>{TOPICS[entry.topic]}</span>
                        <span className={styles.meta}>{entry.readingMinutes} min</span>

                        {/* The same row in ink, swept in at the boundary angle; it adds the technique. */}
                        <span className={styles.ink} aria-hidden="true">
                          <span className={styles.date}>
                            <SlashMark className={styles.marker} />
                          </span>
                          <span className={styles.title}>{entry.title}</span>
                          <span className={styles.meta}>{entry.technique}</span>
                          <span className={styles.meta}>{KINDS[entry.kind]}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </section>
            ))}
            <Link className={styles.archive} href="/research" data-reveal="block">
              <BracketAction>Open the archive</BracketAction>
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
