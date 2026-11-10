import styles from "./BracketAction.module.css";

type Props = {
  children: React.ReactNode;
  /** Leave out the node-line-arrow tail, for compact contexts. */
  tail?: boolean;
  className?: string;
};

/**
 * `[ LABEL ]  □────→` — the publication's one action shape. It is purely
 * presentational: the parent <a>/<button> owns semantics, focus and hover,
 * and this component responds to them.
 */
export function BracketAction({ children, tail = true, className }: Props) {
  return (
    <span className={[styles.action, className].filter(Boolean).join(" ")}>
      <span className={styles.bracketed}>
        <span className={styles.bracket} data-side="start" aria-hidden="true" />
        <span className={styles.label}>{children}</span>
        <span className={styles.bracket} data-side="end" aria-hidden="true" />
      </span>
      {tail && (
        <span className={styles.tail} aria-hidden="true">
          <span className={styles.node} />
          <span className={styles.line} />
          <svg className={styles.head} viewBox="0 0 14 27" focusable="false">
            <path d="M1 1 13 13.5 1 26" fill="none" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </span>
      )}
    </span>
  );
}
