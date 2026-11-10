import "server-only";

import { readdirSync, statSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { cacheLife } from "next/cache";
import { parse as parseYaml } from "yaml";
import { z } from "zod";
import { type Editorial, type Frontmatter, editorialSchema, frontmatterSchema } from "./schema";
import { smartPunctuation } from "./typography";

const CONTENT_DIR = path.join(process.cwd(), "content");
const RESEARCH_DIR = path.join(CONTENT_DIR, "research");
const WORDS_PER_MINUTE = 200;

export type ResearchFormat = "md" | "mdx";

export type ResearchMeta = Frontmatter & {
  slug: string;
  format: ResearchFormat;
  readingMinutes: number;
};

/** `source` is the complete file, frontmatter included, for accurate compile errors. */
export type Research = ResearchMeta & { source: string };

function splitFrontmatter(source: string, file: string) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(source);
  if (!match) throw new Error(`${file}: missing YAML frontmatter`);
  return { data: parseYaml(match[1]) as unknown, body: source.slice(match[0].length) };
}

/** Prose words plus code tokens, at a technical-reading pace. */
function readingMinutes(body: string) {
  const words = body
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .split(/\s+/)
    .filter((token) => /[\p{Letter}\p{Number}]/u.test(token)).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

async function loadFile(file: string): Promise<Research> {
  const source = await readFile(path.join(RESEARCH_DIR, file), "utf8");
  const { data, body } = splitFrontmatter(source, file);
  const parsed = frontmatterSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(`content/research/${file}: invalid frontmatter\n${z.prettifyError(parsed.error)}`);
  }
  const extension = path.extname(file);
  const { title, subtitle, summary } = parsed.data;
  return {
    ...parsed.data,
    // Display text gets the prose's typography once, here, for every surface that shows it.
    title: smartPunctuation(title),
    subtitle: subtitle && smartPunctuation(subtitle),
    summary: smartPunctuation(summary),
    slug: path.basename(file, extension),
    format: extension === ".mdx" ? "mdx" : "md",
    readingMinutes: readingMinutes(body),
    source,
  };
}

/**
 * The newest modification time across the content files. Cached loaders take
 * it as an argument so editing an article or editorial.yml invalidates their
 * cache entries (content files are not modules, so HMR never would). Reading
 * it synchronously keeps prerendering static.
 */
function contentVersion() {
  const files = [
    path.join(CONTENT_DIR, "editorial.yml"),
    ...readdirSync(RESEARCH_DIR).map((file) => path.join(RESEARCH_DIR, file)),
  ];
  return Math.max(...files.map((file) => statSync(file).mtimeMs));
}

async function loadAll(): Promise<Research[]> {
  const files = (await readdir(RESEARCH_DIR)).filter((file) => /\.mdx?$/.test(file));
  const entries = await Promise.all(files.map(loadFile));
  return entries
    .filter((entry) => !entry.draft)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.title.localeCompare(b.title));
}

async function allResearch(_version: number): Promise<ResearchMeta[]> {
  "use cache";
  cacheLife("max");
  return (await loadAll()).map(({ source, ...meta }) => meta);
}

async function researchBySlug(slug: string, _version: number): Promise<Research | undefined> {
  "use cache";
  cacheLife("max");
  return (await loadAll()).find((entry) => entry.slug === slug);
}

/** All published research, newest first, without bodies. */
export const getAllResearch = () => allResearch(contentVersion());

export const getResearch = (slug: string) => researchBySlug(slug, contentVersion());

export type ResolvedEditorial = {
  featured: ResearchMeta & { lines: string[]; heroSummary: string; isLatest: boolean };
  selected: ResearchMeta[];
};

/** The editorial configuration in content/editorial.yml, resolved and checked. */
export const getEditorial = () => editorial(contentVersion());

async function editorial(version: number): Promise<ResolvedEditorial> {
  "use cache";
  cacheLife("max");

  const raw = parseYaml(await readFile(path.join(CONTENT_DIR, "editorial.yml"), "utf8")) as unknown;
  const parsed = editorialSchema.safeParse(raw);
  if (!parsed.success) throw new Error(`content/editorial.yml: invalid\n${z.prettifyError(parsed.error)}`);
  const config: Editorial = parsed.data;

  const all = await allResearch(version);
  const find = (slug: string) => {
    const entry = all.find((item) => item.slug === slug);
    if (!entry) throw new Error(`content/editorial.yml: no published research with slug "${slug}"`);
    return entry;
  };

  const featured = find(config.featured.slug);
  return {
    featured: {
      ...featured,
      lines: config.featured.lines?.map((line) => smartPunctuation(line)) ?? [featured.title],
      heroSummary: config.featured.summary ? smartPunctuation(config.featured.summary) : featured.summary,
      isLatest: all[0]?.slug === featured.slug,
    },
    selected: config.selected.map(find),
  };
}
