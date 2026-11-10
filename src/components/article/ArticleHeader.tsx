import { Link } from "@/components/navigation/Link";
import { Reveal } from "@/components/motion/Reveal";
import { MetaColumns, type MetaItem } from "@/components/ui/MetaColumns";
import type { ResearchMeta } from "@/lib/content/research";
import { KINDS, TOPICS } from "@/lib/content/schema";
import { formatReadingTime, formatShortDate, formatUsd } from "@/lib/format";
import styles from "./ArticleHeader.module.css";

function facts(research: ResearchMeta): MetaItem[] {
  return [
    { label: "Published", value: formatShortDate(research.publishedAt), dateTime: research.publishedAt },
    ...(research.updatedAt
      ? [{ label: "Updated", value: formatShortDate(research.updatedAt), dateTime: research.updatedAt }]
      : []),
    { label: "Read time", value: formatReadingTime(research.readingMinutes) },
    { label: "Topic", value: TOPICS[research.topic] },
    { label: "Technique", value: research.technique },
  ];
}

function disclosure({ disclosure }: ResearchMeta): MetaItem[] {
  if (!disclosure) return [];
  return [
    { label: "Program", value: disclosure.program },
    ...(disclosure.rewardUsd ? [{ label: "Reward", value: formatUsd(disclosure.rewardUsd) }] : []),
  ];
}

/**
 * The article's opening, in the hero's vocabulary: square-marked kind label,
 * display title, italic deck and labelled meta columns. The title is sized
 * from its own length (--chars, --longest) so long titles stay within three
 * lines without shrinking short ones.
 */
export function ArticleHeader({ research, titleId }: { research: ResearchMeta; titleId: string }) {
  const words = research.title.split(/\s+/);
  const outcome = disclosure(research);

  return (
    <Reveal trigger="load">
      <header
        className={styles.header}
        style={{ "--chars": research.title.length, "--longest": Math.max(...words.map((word) => word.length)) }}
      >
        <div className={styles.top} data-reveal="block">
          <span className={styles.square} aria-hidden="true" />
          <p className={styles.kind}>{KINDS[research.kind]}</p>
          <Link href="/research" className={styles.archive}>
            All research
          </Link>
        </div>

        <h1 id={titleId} className={styles.title} data-reveal="title">
          {research.title}
        </h1>

        {research.subtitle && (
          <p className={styles.deck} data-reveal="lines">
            {research.subtitle}
          </p>
        )}

        <div className={styles.meta} data-reveal="block">
          <MetaColumns items={facts(research)} />
          {outcome.length > 0 && <MetaColumns items={outcome} />}
        </div>
      </header>
    </Reveal>
  );
}
