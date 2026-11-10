import type { ResearchMeta } from "./content/research";
import { KINDS, TOPICS, type TopicId } from "./content/schema";

/**
 * Client-side search over research metadata, shared by the search dialog and
 * the archive filter. The collection is small, so a weighted substring match
 * over normalised text is fast and predictable; no index library needed.
 */
export type SearchEntry = {
  slug: string;
  title: string;
  subtitle?: string;
  summary: string;
  topicId: TopicId;
  topic: string;
  kind: string;
  technique: string;
  tags: string[];
  publishedAt: string;
  readingMinutes: number;
};

export function toSearchEntry(meta: ResearchMeta): SearchEntry {
  return {
    slug: meta.slug,
    title: meta.title,
    subtitle: meta.subtitle,
    summary: meta.summary,
    topicId: meta.topic,
    topic: TOPICS[meta.topic],
    kind: KINDS[meta.kind],
    technique: meta.technique,
    tags: meta.tags,
    publishedAt: meta.publishedAt,
    readingMinutes: meta.readingMinutes,
  };
}

/** Case-, accent- and hyphen-insensitive (so "client side" finds "Client‑side"). */
export const normalize = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    // Titles carry curly quotes; a query typed with straight ones still matches.
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[‐-―-]/g, " ")
    .toLowerCase();

const FIELDS: { weight: number; read: (entry: SearchEntry) => string }[] = [
  { weight: 6, read: (entry) => entry.title },
  { weight: 3, read: (entry) => entry.subtitle ?? "" },
  { weight: 3, read: (entry) => entry.technique },
  { weight: 2, read: (entry) => `${entry.topic} ${entry.kind}` },
  { weight: 2, read: (entry) => entry.tags.join(" ") },
  { weight: 1, read: (entry) => entry.summary },
];

/**
 * Entries matching every term of `query`, best first. A term scores its
 * field's weight, doubled when it starts a word. Ties keep newest first.
 */
export function searchEntries(entries: SearchEntry[], query: string): SearchEntry[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return entries;

  const scored: { entry: SearchEntry; score: number }[] = [];
  for (const entry of entries) {
    const fields = FIELDS.map((field) => ({ weight: field.weight, text: ` ${normalize(field.read(entry))}` }));
    let score = 0;
    let matchedAll = true;
    for (const term of terms) {
      let best = 0;
      for (const field of fields) {
        if (field.text.includes(` ${term}`)) best = Math.max(best, field.weight * 2);
        else if (field.text.includes(term)) best = Math.max(best, field.weight);
      }
      if (best === 0) {
        matchedAll = false;
        break;
      }
      score += best;
    }
    if (matchedAll) scored.push({ entry, score });
  }

  return scored
    .sort((a, b) => b.score - a.score || b.entry.publishedAt.localeCompare(a.entry.publishedAt))
    .map(({ entry }) => entry);
}
