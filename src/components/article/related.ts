import type { ResearchMeta } from "@/lib/content/research";

/**
 * Up to `limit` other entries that share the topic (weighted 2) or tags
 * (1 each), strongest first; ties go to the newest.
 */
export function relatedResearch(current: ResearchMeta, all: ResearchMeta[], limit = 3): ResearchMeta[] {
  const tags = new Set(current.tags.map((tag) => tag.toLowerCase()));
  return all
    .filter((entry) => entry.slug !== current.slug)
    .map((entry) => ({
      entry,
      score: (entry.topic === current.topic ? 2 : 0) + entry.tags.filter((tag) => tags.has(tag.toLowerCase())).length,
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || b.entry.publishedAt.localeCompare(a.entry.publishedAt))
    .slice(0, limit)
    .map(({ entry }) => entry);
}

/** The chronological neighbours of `current`. `all` is newest first, as getAllResearch returns it. */
export function adjacentResearch(current: ResearchMeta, all: ResearchMeta[]) {
  const index = all.findIndex((entry) => entry.slug === current.slug);
  return {
    newer: index > 0 ? all[index - 1] : undefined,
    older: index >= 0 ? all[index + 1] : undefined,
  };
}
