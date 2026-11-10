import type { Route } from "next";
import { TOPICS, type TopicId } from "@/lib/content/schema";
import { formatYear } from "@/lib/format";
import { type SearchEntry, searchEntries } from "@/lib/search";

/** The archive's filter state, mirrored in the URL as `?topic=…&q=…`. */
export type ArchiveFilter = { topic: TopicId | null; query: string };

export type TopicFacet = { id: TopicId; label: string; count: number };

export type YearGroup = { year: string; entries: SearchEntry[] };

export const NO_FILTER: ArchiveFilter = { topic: null, query: "" };

const plural = (count: number) => (count === 1 ? "investigation" : "investigations");

/** Topics with at least one entry, in the vocabulary's own order. */
export function topicsIn(entries: readonly SearchEntry[]): TopicId[] {
  const present = new Set(entries.map((entry) => entry.topicId));
  return (Object.keys(TOPICS) as TopicId[]).filter((id) => present.has(id));
}

/** Unknown or empty topics read as "all", so a stale link still shows the archive. */
export function readFilter(params: { get(name: string): string | null }, topics: readonly TopicId[]): ArchiveFilter {
  const topic = params.get("topic");
  return { topic: topics.find((id) => id === topic) ?? null, query: params.get("q") ?? "" };
}

/**
 * The query is written exactly as typed (never trimmed): the input is
 * restored from the URL, so normalising it here would eat the space a reader
 * is about to follow with a second word.
 */
export function filterSearch({ topic, query }: ArchiveFilter): string {
  const params = new URLSearchParams();
  if (topic) params.set("topic", topic);
  if (query) params.set("q", query);
  return params.toString();
}

export function archiveHref(filter: ArchiveFilter): Route {
  const search = filterSearch(filter);
  return search ? `/research?${search}` : "/research";
}

export const isFiltered = (filter: ArchiveFilter) => filter.topic !== null || filter.query.trim() !== "";

/**
 * Entries matching the query, still newest first: the archive keeps its
 * chronology and search only narrows it. Facet counts follow the query, so
 * each topic shows what selecting it would leave.
 */
export function applyFilter(entries: readonly SearchEntry[], topics: readonly TopicId[], filter: ArchiveFilter) {
  const matched = new Set(searchEntries([...entries], filter.query).map((entry) => entry.slug));
  const queried = entries.filter((entry) => matched.has(entry.slug));
  const facets: TopicFacet[] = topics.map((id) => ({
    id,
    label: TOPICS[id],
    count: queried.filter((entry) => entry.topicId === id).length,
  }));
  const shown = filter.topic ? queried.filter((entry) => entry.topicId === filter.topic) : queried;
  return { facets, queriedCount: queried.length, shown };
}

/** Entries arrive newest first, so each year's entries are contiguous. */
export function groupByYear(entries: readonly SearchEntry[]): YearGroup[] {
  const groups: YearGroup[] = [];
  for (const entry of entries) {
    const year = formatYear(entry.publishedAt);
    const current = groups.at(-1);
    if (current?.year === year) current.entries.push(entry);
    else groups.push({ year, entries: [entry] });
  }
  return groups;
}

export function countLabel(count: number) {
  return `${count} ${plural(count)}`;
}

/** The live status line under the filters. */
export function statusLine(shown: number, total: number, filtered: boolean) {
  return filtered ? `${shown} of ${countLabel(total)}` : `${countLabel(total)}, newest first`;
}

export const readingLabel = (minutes: number) => `${minutes} min`;
