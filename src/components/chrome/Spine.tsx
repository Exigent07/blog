import styles from "./Spine.module.css";

/**
 * The left-margin spine from the hero (a hairline at 48u with a vertical mono
 * label), for any section or page. Place it inside a `position: relative`
 * container; it spans the container's height and its label stays in view
 * while the container scrolls past. Desktop stage only.
 */
export function Spine({ label }: { label: string }) {
  return (
    <div className={styles.spine} aria-hidden="true">
      <span className={styles.label}>
        <span className={styles.text}>{label}</span>
        <span className={styles.square} />
      </span>
    </div>
  );
}
