import { Link } from "@/components/navigation/Link";
import type { Route } from "next";
import { Spine } from "@/components/chrome/Spine";
import { Reveal } from "@/components/motion/Reveal";
import { BracketAction } from "@/components/ui/BracketAction";
import { MetaColumns, type MetaItem } from "@/components/ui/MetaColumns";
import type { ResearchMeta } from "@/lib/content/research";
import { KINDS, TOPICS } from "@/lib/content/schema";
import { formatShortDate, formatUsd } from "@/lib/format";
import { Specimen } from "./Specimen";
import styles from "./SelectedResearch.module.css";

function metaFor(entry: ResearchMeta): MetaItem[] {
  const outcome: MetaItem[] = entry.disclosure
    ? [
        { label: "Program", value: entry.disclosure.program },
        ...(entry.disclosure.rewardUsd ? [{ label: "Reward", value: formatUsd(entry.disclosure.rewardUsd) }] : []),
      ]
    : [
        { label: "Topic", value: TOPICS[entry.topic] },
        { label: "Technique", value: entry.technique },
      ];
  return [
    { label: "Kind", value: KINDS[entry.kind] },
    ...outcome,
    { label: "Published", value: formatShortDate(entry.publishedAt), dateTime: entry.publishedAt },
  ];
}

/** The curated investigations, each shown with its own before/after specimen. */
export function SelectedResearch({ entries }: { entries: ResearchMeta[] }) {
  return (
    <section className={styles.section} data-tone="ink" aria-labelledby="selected-title">
      <Spine label="Selected research" />
      <Reveal>
        <header className={styles.header}>
          <h2 id="selected-title" className={styles.heading} data-reveal="lines">
            Selected research
          </h2>
          <p className={styles.intro} data-reveal="block">
            Findings where content crossed a boundary the product assumed would hold, each shown with the string that
            crossed it.
          </p>
        </header>

        <ol role="list" className={styles.list}>
          {entries.map((entry, index) => {
            const titleId = `selected-${entry.slug}`;
            return (
              <li key={entry.slug} className={styles.entry} data-layout={["left", "right", "wide"][index % 3]} data-reveal-group>
                <article className={styles.article} aria-labelledby={titleId} data-action-host>
                  <div className={styles.text}>
                    <div data-reveal="block">
                      <MetaColumns items={metaFor(entry)} layout="grid" />
                    </div>
                    <h3 id={titleId} className={styles.title} data-reveal="block">
                      {entry.title}
                    </h3>
                    {entry.subtitle && (
                      <p className={styles.subtitle} data-reveal="block">
                        {entry.subtitle}
                      </p>
                    )}
                    <p className={styles.summary} data-reveal="block">
                      {entry.summary}
                    </p>
                    {/* One link per entry, stretched over the whole card; its name starts with the visible label. */}
                    <Link
                      href={`/research/${entry.slug}` as Route}
                      className={styles.link}
                      aria-label={`Read the investigation: ${entry.title}`}
                      data-reveal="block"
                    >
                      <BracketAction>Read the investigation</BracketAction>
                    </Link>
                  </div>
                  {entry.specimen && (
                    <div className={styles.specimen} data-reveal="block">
                      <Specimen before={entry.specimen.before} after={entry.specimen.after} />
                    </div>
                  )}
                </article>
              </li>
            );
          })}
        </ol>
      </Reveal>
    </section>
  );
}
