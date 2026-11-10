import { z } from "zod";

/**
 * Controlled vocabulary for research topics: the publication's research areas.
 * Only topics that have published entries appear in the interface.
 */
export const TOPICS = {
  "client-side": "Client‑side",
  "web-applications": "Web applications",
  "security-boundaries": "Security boundaries",
  "prompt-injection": "Prompt injection",
  "sensitive-data-exposure": "Sensitive data exposure"
} as const;

export type TopicId = keyof typeof TOPICS;

export const KINDS = {
  research: "Research",
  "bug-bounty": "Bug bounty report",
} as const;

export type KindId = keyof typeof KINDS;

const topicId = z.enum(Object.keys(TOPICS) as [TopicId, ...TopicId[]]);
const kindId = z.enum(Object.keys(KINDS) as [KindId, ...KindId[]]);

/** A real artefact from the investigation, shown before and after the boundary. */
const specimenSide = z.object({
  label: z.string().min(1),
  code: z.string().min(1),
});

export const frontmatterSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().min(1).optional(),
  summary: z.string().min(1),
  publishedAt: z.iso.date(),
  updatedAt: z.iso.date().optional(),
  kind: kindId,
  topic: topicId,
  technique: z.string().min(1),
  tags: z.array(z.string().min(1)).default([]),
  disclosure: z
    .object({
      program: z.string().min(1),
      rewardUsd: z.number().int().positive().optional(),
    })
    .optional(),
  specimen: z
    .object({
      before: specimenSide,
      after: specimenSide,
    })
    .optional(),
  legacyPaths: z.array(z.string().startsWith("/")).default([]),
  draft: z.boolean().default(false),
});

export type Frontmatter = z.infer<typeof frontmatterSchema>;

export const editorialSchema = z.object({
  featured: z.object({
    slug: z.string().min(1),
    /** Art-directed hero line breaks; the last, longest line crosses the boundary. */
    lines: z.array(z.string().min(1)).min(1).max(4).optional(),
    /** A one-sentence hero summary; defaults to the article summary. */
    summary: z.string().min(1).max(140).optional(),
  }),
  selected: z.array(z.string().min(1)).min(1).max(6),
});

export type Editorial = z.infer<typeof editorialSchema>;
