"use client";

import { useRef, useState } from "react";
import { Reveal } from "@/components/motion/Reveal";
import type { SearchEntry } from "@/lib/search";
import {
  applyFilter,
  filterSearch,
  groupByYear,
  isFiltered,
  NO_FILTER,
  statusLine,
  topicsIn,
} from "./model";
import { ArchiveControls } from "./ArchiveControls";
import { ArchiveEmpty } from "./ArchiveEmpty";
import { ArchiveIndex } from "./ArchiveIndex";
import { useArchiveFilter } from "./useArchiveFilter";

/**
 * The interactive archive: filters read from and written to the URL, results
 * computed here, instantly. Must render inside <Suspense> (useSearchParams).
 */
export function Archive({ entries }: { entries: SearchEntry[] }) {
  const topics = topicsIn(entries);
  const [filter, setFilter] = useArchiveFilter(topics);
  const inputRef = useRef<HTMLInputElement>(null);
  const { facets, queriedCount, shown } = applyFilter(entries, topics, filter);

  /*
   * Rows rise into place once, on arrival. The reveal scope only registers
   * the rows present when it mounts, so after the first change of filter it
   * is dropped (its cleanup restores every row) and results then appear
   * immediately, as an instrument's readings would.
   */
  const [arrivalSearch] = useState(() => filterSearch(filter));
  const [revealing, setRevealing] = useState(true);
  if (revealing && filterSearch(filter) !== arrivalSearch) setRevealing(false);

  const clear = () => {
    setFilter(NO_FILTER);
    inputRef.current?.focus();
  };

  const results =
    shown.length > 0 ? (
      <ArchiveIndex groups={groupByYear(shown)} reveal={revealing} />
    ) : (
      <ArchiveEmpty
        query={filter.query}
        topicLabel={facets.find((facet) => facet.id === filter.topic)?.label}
        onClear={clear}
      />
    );

  return (
    <>
      <Reveal>
        <ArchiveControls
          facets={facets}
          total={queriedCount}
          topic={filter.topic}
          query={filter.query}
          status={statusLine(shown.length, entries.length, isFiltered(filter))}
          reveal
          onTopicChange={(topic) => setFilter({ ...filter, topic })}
          onQueryChange={(query) => setFilter({ ...filter, query })}
          inputRef={inputRef}
        />
      </Reveal>
      {revealing ? <Reveal>{results}</Reveal> : results}
    </>
  );
}
