"use client";

import type { Route } from "next";
import { type KeyboardEvent, type Ref, useState } from "react";
import { SlashMark } from "@/components/brand/SlashMark";
import { Link } from "@/components/navigation/Link";
import { formatShortDate } from "@/lib/format";
import type { SearchEntry } from "@/lib/search";
import { focusResult } from "./focusResult";
import styles from "./SearchResults.module.css";

type Props = {
  entries: SearchEntry[];
  /** The query that produced `entries`; a new query returns the tab stop to the first result. */
  query: string;
  label: string;
  listRef: Ref<HTMLUListElement>;
  onNavigate: () => void;
  /** ArrowUp on the first result. */
  onExitStart: () => void;
};

/**
 * Results as plain links with a roving tab stop: Tab enters the list once,
 * the arrow keys and Home/End move between results, Enter follows the link.
 * Links (not listbox options) keep middle-click and ⌘/Ctrl-click working.
 */
export function SearchResults({ entries, query, label, listRef, onNavigate, onExitStart }: Props) {
  const [stop, setStop] = useState({ query, index: 0 });
  const tabStop = stop.query === query ? Math.min(stop.index, entries.length - 1) : 0;

  const onKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const links = Array.from(event.currentTarget.querySelectorAll<HTMLAnchorElement>(":scope > li > a"));
    const index = links.findIndex((link) => link === event.target);
    if (index === -1) return;

    let next: number;
    switch (event.key) {
      case "ArrowDown":
        next = Math.min(index + 1, links.length - 1);
        break;
      case "ArrowUp":
        if (index === 0) {
          event.preventDefault();
          onExitStart();
          return;
        }
        next = index - 1;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = links.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    focusResult(links[next]);
  };

  if (entries.length === 0) return null;

  return (
    <ul ref={listRef} role="list" className={styles.list} aria-label={label} onKeyDown={onKeyDown}>
      {entries.map((entry, index) => (
        <li key={entry.slug} className={styles.item}>
          <Link
            href={`/research/${entry.slug}` as Route}
            className={styles.row}
            tabIndex={index === tabStop ? 0 : -1}
            onFocus={() => setStop({ query, index })}
            onNavigate={onNavigate}
          >
            <span className={styles.marker} aria-hidden="true">
              <SlashMark className={styles.markerSlashes} />
              <span className={styles.markerLine} />
            </span>
            <span className={styles.title}>{entry.title}</span>
            <span className={styles.deck}>{entry.subtitle ?? entry.summary}</span>
            <span className={styles.meta}>
              <span className={styles.topic}>
                <span className="visually-hidden">Topic: </span>
                {entry.topic}
              </span>
              <span className={styles.technique}>
                <span className="visually-hidden">Technique: </span>
                {entry.technique}
              </span>
              <span className={styles.date}>
                <span className="visually-hidden">Published: </span>
                <time dateTime={entry.publishedAt}>{formatShortDate(entry.publishedAt)}</time>
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
