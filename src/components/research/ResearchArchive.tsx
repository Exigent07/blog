import { Suspense } from "react";
import { Spine } from "@/components/chrome/Spine";
import { Reveal } from "@/components/motion/Reveal";
import { type MetaItem, MetaColumns } from "@/components/ui/MetaColumns";
import { formatShortDate, formatYearSpan } from "@/lib/format";
import type { SearchEntry } from "@/lib/search";
import { applyFilter, groupByYear, NO_FILTER, statusLine, topicsIn } from "./model";
import { Archive } from "./Archive";
import { ArchiveControls } from "./ArchiveControls";
import { ArchiveIndex } from "./ArchiveIndex";
import styles from "./ResearchArchive.module.css";

type Props = {
  /** Published research, newest first. */
  entries: SearchEntry[];
  description: string;
};

/** /research: the complete archive of investigations. */
export function ResearchArchive({ entries, description }: Props) {
  const latest = entries[0];
  const stats: MetaItem[] = [{ label: "Investigations", value: String(entries.length) }];
  if (latest) {
    stats.push(
      { label: "Published", value: formatYearSpan(entries.map((entry) => entry.publishedAt)) ?? "" },
      { label: "Latest", value: formatShortDate(latest.publishedAt), dateTime: latest.publishedAt },
    );
  }

  return (
    <div className={styles.page} data-tone="paper">
      <Spine label="Research archive" />
      <div className={styles.inner}>
        <Reveal>
          <header className={styles.intro}>
            <h1 className={`t-display ${styles.title}`} data-reveal="title">
              Research
            </h1>
            <p className={`t-lead ${styles.description}`} data-reveal="lines">
              {description}
            </p>
            <div className={styles.stats} data-reveal="block">
              <MetaColumns items={stats} />
            </div>
          </header>
        </Reveal>

        <Suspense fallback={<StaticArchive entries={entries} />}>
          <Archive entries={entries} />
        </Suspense>
      </div>
    </div>
  );
}

/**
 * The prerendered archive: every entry, with the controls inert until the
 * interactive archive (which reads the URL) replaces it. It carries the same
 * reveal markers, so nothing flashes before that hand-over.
 */
function StaticArchive({ entries }: { entries: SearchEntry[] }) {
  const { facets, queriedCount, shown } = applyFilter(entries, topicsIn(entries), NO_FILTER);
  return (
    <>
      <ArchiveControls
        facets={facets}
        total={queriedCount}
        topic={null}
        query=""
        status={statusLine(shown.length, entries.length, false)}
        reveal
      />
      <ArchiveIndex groups={groupByYear(shown)} reveal />
    </>
  );
}
