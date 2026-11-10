import type { YearGroup } from "./model";
import { ArchiveEntry } from "./ArchiveEntry";
import styles from "./ArchiveIndex.module.css";

type Props = {
  groups: YearGroup[];
  /** Rise into place with the shared reveal (first arrival only). */
  reveal: boolean;
};

/** The index: one section per year, newest first, each a list of rows. */
export function ArchiveIndex({ groups, reveal }: Props) {
  return (
    <div className={styles.index}>
      {groups.map(({ year, entries }) => (
        <section key={year} className={styles.group}>
          <div className={styles.head}>
            <h2 className={styles.year} data-reveal={reveal ? "lines" : undefined}>
              {year}
            </h2>
            <p className={styles.columns} aria-hidden="true">
              <span>Topic</span>
              <span>Technique</span>
              <span className={styles.timeColumn}>Read time</span>
            </p>
          </div>
          <ol role="list" className={styles.list} data-reveal-group>
            {entries.map((entry) => (
              <ArchiveEntry key={entry.slug} entry={entry} reveal={reveal} />
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
