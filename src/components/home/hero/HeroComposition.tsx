import { Link } from "@/components/navigation/Link";
import { Fragment } from "react";
import type { Route } from "next";
import { BracketAction } from "@/components/ui/BracketAction";
import { MetaColumns } from "@/components/ui/MetaColumns";
import styles from "./Hero.module.css";

export type HeroContent = {
  href: Route;
  lines: string[];
  label: string;
  sublabel: string;
  summary: string;
  meta: { label: string; value: string; dateTime?: string }[];
};

type Props = HeroContent & {
  /** The ink copy is decorative: no ids, no landmarks, nothing focusable. */
  decorative?: boolean;
};

/**
 * Everything on the hero's first screen. Rendered twice by <Hero>: once on
 * paper (the accessible original) and once inside the ink territory, where the
 * boundary clips it. Identical markup guarantees the copies align exactly.
 */
export function HeroComposition({ href, lines, label, sublabel, summary, meta, decorative = false }: Props) {
  // The ink copy repeats the headline visually; it must not be a second h1.
  const Title = decorative ? "p" : "h1";

  return (
    <div className={styles.composition}>
      <div className={styles.spine} aria-hidden="true" data-enter="0" style={{ "--enter-index": 0 }}>
        <span className={styles.spineRule} data-segment="header" />
        <span className={styles.spineRule} data-segment="upper" />
        <span className={styles.spineText}>Security research</span>
        <span className={styles.spineSquare} />
        <span className={styles.spineRule} data-segment="lower" />
        <svg className={styles.spineHatch} viewBox="0 0 16 50" focusable="false">
          <path
            d="M0 12 16 0M0 19 16 7M0 26 16 14M0 33 16 21M0 40 16 28M0 47 16 35M0 54 16 42"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
          />
        </svg>
        <span className={styles.spineRule} data-segment="foot" />
      </div>

      <p className={styles.label} data-enter="1" style={{ "--enter-index": 1 }}>
        <span className={styles.labelSquare} aria-hidden="true" />
        <span className={styles.labelText}>{label}</span>
        <span className={styles.labelSub}>{sublabel}</span>
        <svg className={styles.connector} viewBox="0 0 139 35" aria-hidden="true" focusable="false" data-enter-rule style={{ "--enter-index": 0 }}>
          <path d="M0 7.5H126M132.5 13.5V33H126" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <rect x="126.5" y="1.5" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </p>

      <Title className={styles.title} id={decorative ? undefined : "hero-title"}>
        {lines.map((line, index) => (
          // The space keeps the text content readable ("When Language…") across block lines.
          <Fragment key={line}>
            {index > 0 && " "}
            <span className={styles.titleLine} data-title-line={index} style={{ "--line-index": index }}>
              {line.split(" ").map((word, wordIndex) => (
                <Fragment key={`${word}-${wordIndex}`}>
                  {wordIndex > 0 && " "}
                  <span className={styles.word} data-word>
                    {word}
                  </span>
                </Fragment>
              ))}
            </span>
          </Fragment>
        ))}
      </Title>

      <div className={styles.summary} data-enter="2" style={{ "--enter-index": 2 }}>
        <p className={styles.summaryText}>{summary}</p>
      </div>

      <div className={styles.meta} data-enter="3" style={{ "--enter-index": 3 }}>
        <MetaColumns items={meta} />
      </div>

      {decorative ? (
        <span className={styles.cta} data-enter="4" style={{ "--enter-index": 4 }}>
          <BracketAction>Read research</BracketAction>
        </span>
      ) : (
        <Link className={styles.cta} href={href} aria-describedby="hero-title" data-enter="4" style={{ "--enter-index": 4 }}>
          <BracketAction>Read research</BracketAction>
        </Link>
      )}
    </div>
  );
}
