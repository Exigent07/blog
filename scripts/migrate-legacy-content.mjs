#!/usr/bin/env node
/**
 * Explicit, content-only migration from the legacy blog.
 *
 *   npm run content:migrate -- [--source ../blog] [--dry-run] [--overwrite]
 *
 * What it does
 *   - Reads `<source>/src/posts/*.md` and referenced media under
 *     `<source>/public/blog-resources/`. The source is never written to.
 *   - Writes Markdown to `content/research/<slug>.md` and media to
 *     `public/research/<slug>/`, converting legacy frontmatter to the schema in
 *     `src/lib/content/schema.ts` and two legacy-only syntaxes to standard
 *     Markdown (see `transformBody`).
 *   - Skips any target that already exists unless `--overwrite` is passed, so
 *     editorial fields added after migration are never clobbered.
 *
 * It copies no code, components, styles or configuration.
 */
import { copyFile, mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";

const ROOT = path.resolve(import.meta.dirname, "..");

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const option = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? fallback : args[index + 1];
};

const SOURCE = path.resolve(ROOT, option("source", "../blog"));
const DRY_RUN = flag("dry-run");
const OVERWRITE = flag("overwrite");

/**
 * Stable slugs for the posts that existed at migration time. Unknown posts fall
 * back to a slug derived from their title and are reported so the mapping can
 * be made explicit here.
 */
const SLUGS = new Map([
  ["Credential Leak in Gemini: $13,337 Bug Bounty", "credential-leak-in-gemini"],
  ["The Bug That Cost Google Gemini $15,000", "the-bug-that-cost-google-gemini"],
  [
    "When Language Becomes Layout: Unicode Class Injection Through Tailwind-Merge",
    "when-language-becomes-layout",
  ],
]);

const KINDS = new Map([
  ["Bug Bounty", "bug-bounty"],
  ["Security Research", "research"],
]);

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/** "Nov 20, 2025" → "2025-11-20", without passing through a timezone. */
function toIsoDate(value) {
  const match = /^([A-Za-z]{3})[a-z]*\.?\s+(\d{1,2}),\s*(\d{4})$/.exec(String(value).trim());
  if (!match) throw new Error(`Unrecognised legacy date: ${value}`);
  const month = MONTHS.indexOf(match[1].toLowerCase()) + 1;
  if (month === 0) throw new Error(`Unrecognised month in date: ${value}`);
  return `${match[3]}-${String(month).padStart(2, "0")}-${match[2].padStart(2, "0")}`;
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function splitFrontmatter(source) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(source);
  if (!match) throw new Error("Missing frontmatter block");
  return { data: parseYaml(match[1]) ?? {}, body: source.slice(match[0].length) };
}

/**
 * The legacy title often carries a deck after a colon. The new schema stores
 * them separately; joining `title: subtitle` reproduces the original exactly.
 */
function splitTitle(title) {
  const index = title.indexOf(": ");
  if (index === -1) return { title };
  return { title: title.slice(0, index), subtitle: title.slice(index + 2) };
}

/** Splits a Markdown body into fenced-code and prose segments. */
function segments(body) {
  const parts = [];
  const fence = /^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1[ \t]*$/gm;
  let last = 0;
  for (const match of body.matchAll(fence)) {
    if (match.index > last) parts.push({ code: false, text: body.slice(last, match.index) });
    parts.push({ code: true, text: match[0] });
    last = match.index + match[0].length;
  }
  if (last < body.length) parts.push({ code: false, text: body.slice(last) });
  return parts;
}

/**
 * Converts the two legacy-only syntaxes, outside code, to standard Markdown:
 *   - `@name:x:github:bluesky:{description}` → a mention,
 *     `[@name](first profile "description | other profiles")`, which the
 *     renderer turns into a name with a hover card (src/lib/content/syntax.ts).
 *   - `![video:{caption}](/blog-resources/<post>/<file>)` → an image node with
 *     the caption as alt text, pointing at the migrated media path. The
 *     renderer turns image nodes with video extensions into <video> figures.
 * Returns the new body and the legacy media files it references.
 */
function transformBody(body, slug) {
  const media = new Set();

  const rewriteMediaPath = (url) => {
    const decoded = decodeURI(url);
    if (!decoded.startsWith("/blog-resources/")) return url;
    const file = path.posix.basename(decoded);
    media.add(decoded);
    return `/research/${slug}/${encodeURIComponent(file)}`;
  };

  const out = segments(body).map(({ code, text }) => {
    if (code) return text;
    return text
      .replace(/!\[video:\{([^}]*)\}\]\(([^)\s]+)\)/g, (_, caption, url) => `![${caption}](${rewriteMediaPath(url)})`)
      .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, alt, url) => `![${alt}](${rewriteMediaPath(url)})`)
      .replace(
        /@([^:@\s]+)(?::([^:@\n]*))?(?::([^:@\n]*))?(?::([^:@\n]*))?(?::\{([^}]*)\})?/g,
        (raw, name, x = "", github = "", bluesky = "", description = "") => {
          // Only rewrite the extended mention form; plain "@word" text stays.
          if (!raw.includes(":")) return raw;
          const profiles = [
            x.trim() && `https://x.com/${x.trim()}`,
            github.trim() && `https://github.com/${github.trim()}`,
            bluesky.trim() && `https://bsky.app/profile/${bluesky.trim()}`,
          ].filter(Boolean);
          if (profiles.length === 0) return name;
          const [href, ...others] = profiles;
          const parts = [description.trim().replaceAll('"', "'"), ...others].filter(Boolean);
          const title = parts.length > 0 ? ` "${parts.join(" | ")}"` : "";
          return `[@${name}](${href}${title})`;
        },
      );
  });

  return { body: out.join(""), media: [...media] };
}

async function exists(file) {
  try {
    await stat(file);
    return true;
  } catch {
    return false;
  }
}

async function write(file, contents) {
  if ((await exists(file)) && !OVERWRITE) return "skipped (exists)";
  if (DRY_RUN) return "would write";
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, contents, "utf8");
  return "written";
}

async function copy(from, to) {
  if ((await exists(to)) && !OVERWRITE) return "skipped (exists)";
  if (DRY_RUN) return "would copy";
  await mkdir(path.dirname(to), { recursive: true });
  await copyFile(from, to);
  return "copied";
}

async function main() {
  const postsDir = path.join(SOURCE, "src/posts");
  const files = (await readdir(postsDir)).filter((name) => name.endsWith(".md")).sort();
  if (files.length === 0) throw new Error(`No posts found in ${postsDir}`);

  console.log(`Legacy source: ${postsDir} (read-only)${DRY_RUN ? " — dry run" : ""}\n`);

  for (const file of files) {
    const legacyName = file.slice(0, -".md".length);
    const raw = await readFile(path.join(postsDir, file), "utf8");
    const { data, body } = splitFrontmatter(raw);

    const slug = SLUGS.get(legacyName) ?? slugify(String(data.title ?? legacyName));
    if (!SLUGS.has(legacyName)) console.warn(`  ! no explicit slug for "${legacyName}", using "${slug}"`);

    const kind = KINDS.get(String(data.category));
    if (!kind) throw new Error(`Unmapped legacy category "${data.category}" in ${file}`);

    const { body: nextBody, media } = transformBody(body.replace(/^\s*\n/, ""), slug);

    const frontmatter = {
      ...splitTitle(String(data.title)),
      summary: String(data.excerpt ?? "").trim(),
      publishedAt: toIsoDate(data.date),
      kind,
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      legacyPaths: [`/posts/${legacyName}`],
    };

    const target = path.join(ROOT, "content/research", `${slug}.md`);
    const document = `---\n${stringifyYaml(frontmatter, { lineWidth: 0 })}---\n\n${nextBody.trimEnd()}\n`;
    console.log(`${legacyName}\n  → content/research/${slug}.md: ${await write(target, document)}`);

    for (const legacyMedia of media) {
      const from = path.join(SOURCE, "public", legacyMedia);
      const to = path.join(ROOT, "public/research", slug, path.posix.basename(legacyMedia));
      console.log(`  → public/research/${slug}/${path.basename(to)}: ${await copy(from, to)}`);
    }
  }

  console.log("\nAdd editorial fields (topic, technique, disclosure, specimen) in the new files; see content/README.md.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
