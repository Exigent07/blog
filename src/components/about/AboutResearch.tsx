import type { Route } from "next";
import { SlashMark } from "@/components/brand/SlashMark";
import { Reveal } from "@/components/motion/Reveal";
import { Link } from "@/components/navigation/Link";
import { BracketAction } from "@/components/ui/BracketAction";
import type { ResearchMeta } from "@/lib/content/research";
import { KINDS } from "@/lib/content/schema";
import { formatShortDate } from "@/lib/format";
import { RESEARCH_AREAS } from "./facts";
import styles from "./AboutResearch.module.css";

/** What the author writes about, then every investigation published here. */
export function AboutResearch({ research }: { research: ResearchMeta[] }) {
  return (
    <section className={styles.section} data-tone="paper" aria-labelledby="about-research-title">
      <Reveal>
        <div className={styles.lede}>
          <h2 id="about-research-title" className={styles.heading} data-reveal="lines">
            Research
          </h2>
          <p className={styles.statement} data-reveal="lines">
            I write about the places where <mark>untrusted content meets privileged rendering</mark>.
          </p>
          <ul role="list" className={styles.areas} aria-label="Research areas" data-reveal="block">
            {RESEARCH_AREAS.map((area) => (
              <li key={area}>{area}</li>
            ))}
          </ul>
        </div>

        <div className={styles.index} data-reveal-group>
          <h3 className="visually-hidden">Investigations</h3>
          <ul role="list" className={styles.entries}>
            {research.map((entry) => (
              <li key={entry.slug} className={styles.entry} data-reveal="block">
                <span className={styles.marker} aria-hidden="true">
                  <SlashMark className={styles.slashes} />
                  <span className={styles.markerLine} />
                </span>
                <div className={styles.body}>
                  <Link className={styles.title} href={`/research/${entry.slug}` as Route}>
                    {entry.title}
                  </Link>
                  <dl className={styles.meta}>
                    <div>
                      <dt className="visually-hidden">Kind</dt>
                      <dd>{KINDS[entry.kind]}</dd>
                    </div>
                    <div>
                      <dt className="visually-hidden">Published</dt>
                      <dd>
                        <time dateTime={entry.publishedAt}>{formatShortDate(entry.publishedAt)}</time>
                      </dd>
                    </div>
                  </dl>
                </div>
              </li>
            ))}
          </ul>
          <Link className={styles.archive} href="/research" data-reveal="block">
            <BracketAction>Open the archive</BracketAction>
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
