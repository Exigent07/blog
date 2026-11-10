"use client";

import { type Ref, useEffect, useState } from "react";
import { BracketAction } from "@/components/ui/BracketAction";
import { searchEntries } from "@/lib/search";
import { QuickQueries } from "./QuickQueries";
import { type SearchIndex, loadSearchIndex, useSearchIndex } from "./searchIndex";
import { LoadError, NoResults } from "./SearchNotice";
import { SearchResults } from "./SearchResults";
import styles from "./SearchDialog.module.css";

export type SearchPanelProps = {
  /** The field's value, as typed. */
  query: string;
  listRef: Ref<HTMLUListElement>;
  bodyRef: Ref<HTMLDivElement>;
  /** Replaces the query (suggestions, clearing) and returns focus to the field. */
  onPick: (query: string) => void;
  onNavigate: () => void;
  /** ArrowUp on the first result. */
  onExitStart: () => void;
};

/** Screen readers hear the count once typing pauses, not after every keystroke. */
const ANNOUNCE_DELAY_MS = 700;

function useSettledValue<T>(value: T, delay: number) {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setSettled(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);
  return settled;
}

const counted = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

function statusText(index: SearchIndex, query: string, found: number) {
  if (index.status === "error") return null;
  if (index.status !== "ready") return "Loading…";
  if (query === "") return `${counted(index.entries.length, "article", "articles")}, newest first`;
  return found === 0 ? "No results" : counted(found, "result", "results");
}

function announcement(index: SearchIndex, query: string) {
  if (index.status === "error") return "Search didn’t load.";
  if (index.status !== "ready") return "";
  if (query === "") return counted(index.entries.length, "article", "articles");
  const found = searchEntries(index.entries, query).length;
  return found === 0 ? `No results for ${query}` : `${counted(found, "result", "results")} for ${query}`;
}

/**
 * Everything below the field: the count, suggestions or a way to clear, and
 * the results. Loaded on demand (with the index) so the search code stays out
 * of every page's initial JavaScript. Rendered as direct rows of the dialog's
 * grid, hence the fragment.
 */
export function SearchPanel({ query, listRef, bodyRef, onPick, onNavigate, onExitStart }: SearchPanelProps) {
  const index = useSearchIndex();
  const settledQuery = useSettledValue(query.trim(), ANNOUNCE_DELAY_MS);
  const trimmed = query.trim();
  const ready = index.status === "ready";
  const results = ready ? searchEntries(index.entries, trimmed) : [];
  const noResults = ready && trimmed !== "" && results.length === 0;
  const status = statusText(index, trimmed, results.length);
  const clear = () => onPick("");

  return (
    <>
      <div className={styles.status}>
        {status && (
          <p className={`mono-label ${styles.count}`} aria-hidden="true">
            {status}
          </p>
        )}
        {ready && trimmed === "" && <QuickQueries entries={index.entries} onPick={onPick} />}
        {trimmed !== "" && !noResults && (
          <button type="button" className={styles.clear} onClick={clear}>
            <BracketAction tail={false}>
              Clear<span className="visually-hidden"> search</span>
            </BracketAction>
          </button>
        )}
      </div>
      <p className="visually-hidden" aria-live="polite" aria-atomic="true">
        {announcement(index, settledQuery)}
      </p>

      <div ref={bodyRef} className={styles.body}>
        {index.status === "error" ? (
          <LoadError onRetry={loadSearchIndex} onNavigate={onNavigate} />
        ) : noResults ? (
          <NoResults query={trimmed} onClear={clear} onNavigate={onNavigate} />
        ) : (
          <SearchResults
            entries={results}
            query={trimmed}
            label={trimmed === "" ? "All research" : "Results"}
            listRef={listRef}
            onNavigate={onNavigate}
            onExitStart={onExitStart}
          />
        )}
      </div>
    </>
  );
}
