"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { TopicId } from "@/lib/content/schema";
import { type ArchiveFilter, archiveHref, filterSearch, readFilter } from "./model";

type Draft = { filter: ArchiveFilter; requested: string[] };

/**
 * The archive filter, stored in the URL. `router.replace` commits a moment
 * after the keystroke, so the latest local change is held as a draft (and
 * drives the input and the results) until the URL catches up. A URL we did
 * not request — a link to /research, a page restored from history — replaces
 * the draft; an earlier request of ours landing late does not.
 */
export function useArchiveFilter(topics: readonly TopicId[]) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [seenSearch, setSeenSearch] = useState(search);

  if (search !== seenSearch) {
    setSeenSearch(search);
    const landed = draft ? draft.requested.indexOf(search) : -1;
    if (draft && landed !== -1 && landed < draft.requested.length - 1) {
      setDraft({ filter: draft.filter, requested: draft.requested.slice(landed + 1) });
    } else {
      setDraft(null);
    }
  }

  const filter = draft?.filter ?? readFilter(searchParams, topics);

  const setFilter = (next: ArchiveFilter) => {
    const nextSearch = filterSearch(next);
    setDraft((current) => ({ filter: next, requested: [...(current?.requested ?? []), nextSearch] }));
    router.replace(archiveHref(next), { scroll: false });
  };

  return [filter, setFilter] as const;
}
