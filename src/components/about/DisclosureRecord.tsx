import { Spine } from "@/components/chrome/Spine";
import { Reveal } from "@/components/motion/Reveal";
import { formatUsd } from "@/lib/format";
import { site } from "@/lib/site";
import { DISCLOSURE_RECORD, RECORD_TOTALS, programRewards } from "./facts";
import styles from "./DisclosureRecord.module.css";

/**
 * The record as a ledger on the ink field: one line per accepted report, the
 * program's total beside it, the grand total at the foot.
 */
export function DisclosureRecord() {
  return (
    <section className={styles.section} data-tone="ink" aria-labelledby="about-record-title">
      <Spine label="About" />
      <Reveal>
        <div className={styles.top}>
          <h2 id="about-record-title" className={styles.heading} data-reveal="lines">
            Disclosure record
          </h2>
          <figure className={styles.quote} data-reveal="block">
            <blockquote className={styles.quoteText}>
              <p>
                &ldquo;I hate to play CTF but I do anyways. I do bug bounty &mdash; money equals happiness. My only
                achievement is that I am still alive.&rdquo;
              </p>
            </blockquote>
            <figcaption className={styles.caption}>{site.author.name}</figcaption>
          </figure>
        </div>

        {/* Scrolls on its own at narrow widths (and 400% zoom), never the page. */}
        <div
          className={styles.tableRegion}
          role="region"
          aria-label="Disclosure record by program"
          tabIndex={0}
          data-lenis-prevent-horizontal
          data-reveal="block"
        >
          <table className={styles.table}>
            <caption className={styles.summary}>
              {RECORD_TOTALS.reports}&nbsp;accepted reports across {RECORD_TOTALS.programs}&nbsp;programs,{" "}
              {formatUsd(RECORD_TOTALS.rewards)} in&nbsp;rewards.
            </caption>
            <thead>
              <tr>
                <th scope="col">Program</th>
                <th scope="col" className={styles.numeric}>
                  Reports
                </th>
                <th scope="col" className={styles.numeric}>
                  Rewards
                </th>
                <th scope="col" className={styles.numeric}>
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {DISCLOSURE_RECORD.map((entry) => (
                <tr key={entry.program}>
                  <th scope="row" className={styles.program} translate="no">
                    {entry.program}
                  </th>
                  <td className={styles.numeric}>{entry.rewards.length}</td>
                  <td className={styles.numeric}>
                    <ul role="list" className={styles.rewards}>
                      {entry.rewards.map((reward, index) => (
                        <li key={index}>{reward === null ? "Informative" : formatUsd(reward)}</li>
                      ))}
                    </ul>
                  </td>
                  <td className={styles.numeric}>{formatUsd(programRewards(entry))}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row" className={styles.program}>
                  All programs
                </th>
                <td className={styles.numeric}>{RECORD_TOTALS.reports}</td>
                <td />
                <td className={`${styles.numeric} ${styles.total}`}>{formatUsd(RECORD_TOTALS.rewards)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Reveal>
    </section>
  );
}
