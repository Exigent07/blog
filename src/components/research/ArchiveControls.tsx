import { type RefObject, useId } from "react";
import { SlashMark } from "@/components/brand/SlashMark";
import { BracketAction } from "@/components/ui/BracketAction";
import type { TopicId } from "@/lib/content/schema";
import type { TopicFacet } from "./model";
import styles from "./ArchiveControls.module.css";

type Props = {
  facets: TopicFacet[];
  /** Entries matching the query in every topic: the count shown on "All". */
  total: number;
  topic: TopicId | null;
  query: string;
  status: string;
  reveal: boolean;
  /** Without handlers (the static fallback) the controls render disabled. */
  onTopicChange?: (topic: TopicId | null) => void;
  onQueryChange?: (query: string) => void;
  inputRef?: RefObject<HTMLInputElement | null>;
};

/** Topic toggles, the search field and the live result count. */
export function ArchiveControls({
  facets,
  total,
  topic,
  query,
  status,
  reveal,
  onTopicChange,
  onQueryChange,
  inputRef,
}: Props) {
  const topicLabelId = useId();
  const toggle = onTopicChange && ((id: TopicId | null) => onTopicChange(id === topic ? null : id));

  return (
    <div className={styles.controls} data-reveal={reveal ? "block" : undefined}>
      <div className={styles.bar} role="search" aria-label="Filter the archive">
        <div className={styles.topics} role="group" aria-labelledby={topicLabelId}>
          <span className={styles.label} id={topicLabelId}>
            Topic
          </span>
          <div className={styles.scroller}>
            <ul role="list" className={styles.topicList}>
              <li>
                <TopicButton
                  label="All"
                  count={total}
                  pressed={topic === null}
                  onPress={toggle && (() => toggle(null))}
                />
              </li>
              {facets.map((facet) => (
                <li key={facet.id}>
                  <TopicButton
                    label={facet.label}
                    count={facet.count}
                    pressed={topic === facet.id}
                    onPress={toggle && (() => toggle(facet.id))}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.search}>
          <label className={styles.field}>
            <span className={styles.label}>Search</span>
            <input
              ref={inputRef}
              className={styles.input}
              type="search"
              name="q"
              value={query}
              placeholder="Title, technique or tag…"
              autoComplete="off"
              spellCheck={false}
              enterKeyHint="search"
              disabled={!onQueryChange}
              onChange={onQueryChange && ((event) => onQueryChange(event.target.value))}
              onKeyDown={
                onQueryChange &&
                ((event) => {
                  if (event.key === "Escape" && query !== "") {
                    event.preventDefault();
                    onQueryChange("");
                  }
                })
              }
            />
          </label>
          <button
            type="button"
            className={styles.clear}
            data-visible={query !== ""}
            disabled={!onQueryChange}
            onClick={
              onQueryChange &&
              (() => {
                onQueryChange("");
                inputRef?.current?.focus();
              })
            }
          >
            <BracketAction tail={false}>
              Clear<span className="visually-hidden"> search</span>
            </BracketAction>
          </button>
          <span className={styles.underline} aria-hidden="true" />
        </div>
      </div>

      <p className={styles.status} aria-live="polite" aria-atomic="true">
        {status}
      </p>
    </div>
  );
}

type TopicButtonProps = {
  label: string;
  count: number;
  pressed: boolean;
  onPress?: () => void;
};

function TopicButton({ label, count, pressed, onPress }: TopicButtonProps) {
  return (
    <button type="button" className={styles.topic} aria-pressed={pressed} disabled={!onPress} onClick={onPress}>
      <span>{label}</span>
      <span className={styles.count}>
        <span className="visually-hidden">, </span>
        {count}
        <span className="visually-hidden"> {count === 1 ? "investigation" : "investigations"}</span>
      </span>
      <span className={styles.marker} aria-hidden="true">
        <SlashMark className={styles.markerSlashes} />
        <span className={styles.markerLine} />
      </span>
    </button>
  );
}
