import { Reveal } from "@/components/motion/Reveal";
import { BracketAction } from "@/components/ui/BracketAction";
import { MetaColumns } from "@/components/ui/MetaColumns";
import { formatUsd } from "@/lib/format";
import { site } from "@/lib/site";
import { RECORD_TOTALS } from "./facts";
import styles from "./AboutIntro.module.css";

/**
 * The first screen: the author's name to the full measure, a plain introduction, one
 * line in the author's own words, the record in figures and the one action (email).
 */
export function AboutIntro() {
  return (
    <section className={styles.intro} data-tone="paper" aria-labelledby="about-title">
      <Reveal trigger="load">
        <h1 id="about-title" className={styles.name} data-reveal="title">
          {site.author.name}
        </h1>

        <p className={styles.lead} data-reveal="block">
          Independent security researcher, known as <span translate="no">{site.author.handle}</span> (also{" "}
          <span translate="no">{site.author.alias}</span>). I&nbsp;play CTFs, hunt bugs and build for the&nbsp;web.
        </p>

        <figure className={styles.quote} data-reveal="block">
          <blockquote className={styles.quoteText}>
            <p>
              <span className={styles.quoteLine}>&ldquo;I hate to do security,</span>{" "}
              <span className={styles.quoteLine}>but I do it anyways&rdquo;</span>
            </p>
          </blockquote>
          <figcaption className={styles.caption}>{site.author.name}</figcaption>
        </figure>

        <div className={styles.meta} data-reveal="block">
          <MetaColumns
            items={[
              { label: "Accepted reports", value: String(RECORD_TOTALS.reports) },
              { label: "Programs", value: String(RECORD_TOTALS.programs) },
              { label: "Rewards", value: formatUsd(RECORD_TOTALS.rewards) },
            ]}
          />
        </div>

        <a className={styles.cta} href={`mailto:${site.author.email}`} data-reveal="block">
          <BracketAction>Email me</BracketAction>
        </a>
      </Reveal>
    </section>
  );
}
