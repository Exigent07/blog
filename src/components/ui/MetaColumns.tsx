import styles from "./MetaColumns.module.css";

export type MetaItem = { label: string; value: string; dateTime?: string };

type Props = {
  items: MetaItem[];
  /**
   * "row" (default): one row of columns from 40rem up. "grid": two columns at
   * every width, for narrow containers where a row would wrap and leave a
   * hairline at the start of the second line.
   */
  layout?: "row" | "grid";
  className?: string;
};

/** Labelled metadata columns separated by full-height hairlines. */
export function MetaColumns({ items, layout = "row", className }: Props) {
  return (
    <dl className={[styles.meta, className].filter(Boolean).join(" ")} data-layout={layout}>
      {items.map((item) => (
        <div className={styles.item} key={item.label}>
          <dt className={styles.label}>{item.label}</dt>
          <dd className={styles.value}>
            {item.dateTime ? <time dateTime={item.dateTime}>{item.value}</time> : item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
