"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { type FormEvent, type KeyboardEvent, useEffect, useId, useRef, useState } from "react";
import { Spine } from "@/components/chrome/Spine";
import { useScrollLock } from "@/components/motion/useScrollLock";
import { BracketAction } from "@/components/ui/BracketAction";
import { focusResult } from "./focusResult";
import { loadSearchIndex, useSearchIndex, useWarmSearchIndex } from "./searchIndex";
import { LoadError } from "./SearchNotice";
import type { SearchPanelProps } from "./SearchPanel";
import { useSearch } from "./SearchProvider";
import styles from "./SearchDialog.module.css";

/** The route transition type every forward navigation carries (see components/navigation/Link). */
const ROUTE_TRANSITION = ["boundary"];

function PanelLoading() {
  return (
    <div className={styles.status}>
      <p className={`mono-label ${styles.count}`}>Loading…</p>
    </div>
  );
}

/** If the panel's code cannot load, say so in place instead of failing the page. */
function PanelUnavailable({ onNavigate }: SearchPanelProps) {
  return (
    <div className={styles.body}>
      <LoadError onNavigate={onNavigate} />
    </div>
  );
}

const SearchPanel = dynamic<SearchPanelProps>(
  () => import("./SearchPanel").then((module) => module.SearchPanel, () => PanelUnavailable),
  { ssr: false, loading: PanelLoading },
);

/**
 * Global search: a native modal dialog (focus containment, Escape, inert
 * page, focus returned to the trigger on close) that turns the viewport into
 * ink territory. The panel under the field loads with the index, on the
 * first sign of intent. Enter in the field opens the archive filtered by the
 * query.
 */
export function SearchDialog() {
  const { isOpen, close } = useSearch();
  const router = useRouter();
  const index = useSearchIndex();
  const [query, setQuery] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const labelId = useId();
  const inputId = useId();
  useScrollLock(isOpen);
  useWarmSearchIndex();

  useEffect(() => {
    const dialog = dialogRef.current;
    const input = inputRef.current;
    if (!dialog || !input) return;
    if (isOpen && !dialog.open) {
      loadSearchIndex();
      delete dialog.dataset.exit;
      dialog.showModal();
      // The previous query stays, selected, so typing replaces it.
      input.focus();
      input.select();
    }
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  const trimmed = query.trim();

  /**
   * Leaving for another page: the dialog closes at once and the route's own
   * boundary wipe carries the change. Animating both would let the old page's
   * transition snapshot paint over the retreating dialog.
   */
  const leave = () => {
    const dialog = dialogRef.current;
    if (dialog) dialog.dataset.exit = "instant";
    close();
  };

  const changeQuery = (value: string) => {
    setQuery(value);
    bodyRef.current?.scrollTo({ top: 0 });
  };

  const pick = (value: string) => {
    changeQuery(value);
    inputRef.current?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Escape") {
      // Handled here so Escape closes from the search field too, where the
      // browser's default would only clear the text.
      event.preventDefault();
      close();
      return;
    }
    const input = inputRef.current;
    const slash = event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey;
    const commandK = event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey);
    if (input && event.target !== input && (slash || commandK)) {
      event.preventDefault();
      input.focus();
      input.select();
    }
  };

  const onInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "ArrowDown" || event.nativeEvent.isComposing) return;
    const first = listRef.current?.querySelector<HTMLAnchorElement>(":scope > li > a");
    if (!first) return;
    event.preventDefault();
    focusResult(first);
  };

  /** A GET form to the archive without JavaScript; with it, a client navigation with the route wipe. */
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (trimmed === "") return;
    leave();
    router.push(`/research?q=${encodeURIComponent(trimmed)}`, { transitionTypes: ROUTE_TRANSITION });
  };

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      data-tone="ink"
      data-lenis-prevent
      aria-labelledby={labelId}
      onClose={close}
      onKeyDown={onKeyDown}
    >
      <div className={styles.panel}>
        <Spine label="Search" />

        <div className={styles.bar}>
          <label id={labelId} htmlFor={inputId} className={styles.label}>
            <span className={styles.square} aria-hidden="true" />
            Search research
          </label>
          <button type="button" className={styles.close} onClick={close} aria-keyshortcuts="Escape">
            <BracketAction tail={false}>
              <span className={styles.keyLabel}>
                Esc<span className="visually-hidden">, close search</span>
              </span>
              <span className={styles.touchLabel}>
                Close<span className="visually-hidden"> search</span>
              </span>
            </BracketAction>
          </button>
        </div>

        <form action="/research" role="search" className={styles.form} onSubmit={submit}>
          <div className={styles.field}>
            <input
              ref={inputRef}
              id={inputId}
              className={styles.input}
              type="search"
              name="q"
              value={query}
              onChange={(event) => changeQuery(event.target.value)}
              onKeyDown={onInputKeyDown}
              placeholder="Type to search…"
              autoComplete="off"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="search"
            />
          </div>
        </form>

        {/* The panel's code is fetched together with the index, never before. */}
        {index.status !== "idle" && (
          <SearchPanel
            query={query}
            listRef={listRef}
            bodyRef={bodyRef}
            onPick={pick}
            onNavigate={leave}
            onExitStart={() => inputRef.current?.focus()}
          />
        )}
      </div>
    </dialog>
  );
}
