import { BracketAction } from "@/components/ui/BracketAction";
import styles from "./ArchiveEmpty.module.css";

type Props = {
  query: string;
  /** The selected topic's label, when one is selected. */
  topicLabel?: string;
  onClear: () => void;
};

/** Shown in place of the index when the filters leave nothing. */
export function ArchiveEmpty({ query, topicLabel, onClear }: Props) {
  const scope = topicLabel ? ` in ${topicLabel}` : "";
  const term = query.trim();

  return (
    <div className={styles.empty}>
      <p className={styles.statement}>
        {term ? (
          <>
            No investigations{scope} match <q className={styles.term}>{term}</q>.
          </>
        ) : (
          `No investigations${scope} yet.`
        )}
      </p>
      <p className={styles.hint}>Search covers titles, subtitles, techniques, topics, tags and summaries.</p>
      <button type="button" className={styles.action} onClick={onClear}>
        <BracketAction>Clear filters</BracketAction>
      </button>
    </div>
  );
}
