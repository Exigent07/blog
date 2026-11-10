"use client";

import { normalize, type SearchEntry } from "@/lib/search";
import styles from "./QuickQueries.module.css";

const MAX_TOPICS = 3;
const MAX_QUERIES = 6;

/**
 * Searches that are guaranteed to find something: the most-used topics, then
 * the newest techniques (entries arrive newest first), without duplicates.
 */
function quickQueries(entries: SearchEntry[]) {
  const topicCounts = new Map<string, number>();
  for (const entry of entries) topicCounts.set(entry.topic, (topicCounts.get(entry.topic) ?? 0) + 1);
  const topics = [...topicCounts]
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_TOPICS)
    .map(([topic]) => topic);

  const queries = new Map<string, string>();
  for (const value of [...topics, ...entries.map((entry) => entry.technique)]) {
    const key = normalize(value);
    if (!queries.has(key)) queries.set(key, value);
  }
  return [...queries.values()].slice(0, MAX_QUERIES);
}

export function QuickQueries({ entries, onPick }: { entries: SearchEntry[]; onPick: (query: string) => void }) {
  const queries = quickQueries(entries);
  if (queries.length === 0) return null;

  return (
    <div className={styles.quick}>
      <span className={styles.label} aria-hidden="true">
        Try
      </span>
      <ul role="list" className={styles.list} aria-label="Suggested searches">
        {queries.map((query) => (
          <li key={query}>
            <button type="button" className={styles.query} onClick={() => onPick(query)}>
              {query}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
