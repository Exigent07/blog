"use client";

import { Link } from "@/components/navigation/Link";
import { BracketAction } from "@/components/ui/BracketAction";
import styles from "./SearchNotice.module.css";

type NoResultsProps = {
  query: string;
  onClear: () => void;
  onNavigate: () => void;
};

export function NoResults({ query, onClear, onNavigate }: NoResultsProps) {
  return (
    <div className={styles.notice}>
      <p className={styles.lead}>No research matches “{query}”.</p>
      <p className={styles.text}>
        Try fewer or broader words, clear the search to browse everything, or carry the query over to the archive.
      </p>
      <div className={styles.actions}>
        <button type="button" className={styles.action} onClick={onClear}>
          <BracketAction tail={false}>Clear search</BracketAction>
        </button>
        <Link className={styles.action} href={{ pathname: "/research", query: { q: query } }} onNavigate={onNavigate}>
          <BracketAction>See it in the archive</BracketAction>
        </Link>
      </div>
    </div>
  );
}

type LoadErrorProps = {
  /** Offered when loading again can help (the index request failed, not the page's code). */
  onRetry?: () => void;
  onNavigate: () => void;
};

export function LoadError({ onRetry, onNavigate }: LoadErrorProps) {
  return (
    <div className={styles.notice}>
      <p className={styles.lead}>Search didn’t load.</p>
      <p className={styles.text}>
        {onRetry
          ? "Check your connection and try again, or browse every article in the research archive."
          : "Reload the page to try again, or browse every article in the research archive."}
      </p>
      <div className={styles.actions}>
        {onRetry && (
          <button type="button" className={styles.action} onClick={onRetry}>
            <BracketAction tail={false}>Try again</BracketAction>
          </button>
        )}
        <Link className={styles.action} href="/research" onNavigate={onNavigate}>
          <BracketAction>Research archive</BracketAction>
        </Link>
      </div>
    </div>
  );
}
