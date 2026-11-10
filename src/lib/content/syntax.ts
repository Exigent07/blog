import type { ElementContent, Root as HastRoot } from "hast";
import type { Link, PhrasingContent, Root as MdastRoot } from "mdast";
import type { ShikiTransformer } from "shiki/core";
import { visit } from "unist-util-visit";
import type { VFile } from "vfile";
import { smartPunctuation } from "./typography";

/*
 * The publication's two custom Markdown syntaxes. Both work in .md and .mdx
 * and are documented in content/README.md.
 *
 *   [@Name](https://x.com/handle "Bio. | https://github.com/handle")
 *       A mention: a link with a hover card.
 *
 *   ||text||
 *       Censored text. Removed when the article compiles: only a bar of
 *       roughly the same width reaches the page, never the text itself.
 */

/* ---------- Mentions ---------- */

export type MentionProfile = { platform: string; handle: string; href: string };

const PLATFORMS: { host: RegExp; platform: string; handle: (path: string[]) => string | undefined }[] = [
  { host: /^(?:www\.)?(?:x|twitter)\.com$/, platform: "X", handle: ([user]) => user && `@${user}` },
  { host: /^(?:www\.)?github\.com$/, platform: "GitHub", handle: ([user]) => user },
  { host: /^bsky\.app$/, platform: "Bluesky", handle: ([kind, user]) => (kind === "profile" && user ? `@${user}` : undefined) },
  { host: /^(?:www\.)?linkedin\.com$/, platform: "LinkedIn", handle: ([kind, user]) => (kind === "in" ? user : undefined) },
  { host: /^(?:www\.)?hackerone\.com$/, platform: "HackerOne", handle: ([user]) => user },
  { host: /^(?:www\.)?bugcrowd\.com$/, platform: "Bugcrowd", handle: (path) => path.at(-1) },
];

const isUrl = (value: string) => /^https?:\/\//i.test(value);

/** The platform and handle a profile URL names; any other site is shown by its host. */
export function profileFor(href: string): MentionProfile | undefined {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return undefined;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return undefined;
  const path = url.pathname.split("/").filter(Boolean);
  for (const { host, platform, handle } of PLATFORMS) {
    const name = host.test(url.hostname) ? handle(path) : undefined;
    if (name) return { platform, handle: name, href: url.href };
  }
  return { platform: url.hostname.replace(/^www\./, ""), handle: path.join("/") || url.hostname, href: url.href };
}

/**
 * A link whose text starts with "@" is a mention. Its URL is the person's
 * main profile; its title is a one-line bio, optionally followed by further
 * profile URLs, each after " | ". Anything malformed fails the build with the
 * line, so a broken mention can never ship as a broken card.
 */
export function remarkMentions() {
  return (tree: MdastRoot, file: VFile) => {
    visit(tree, "link", (node: Link) => {
      const [first] = node.children;
      if (node.children.length !== 1 || first.type !== "text" || !first.value.startsWith("@")) return;

      const name = first.value.slice(1).trim();
      const parts = (node.title ?? "")
        .split(/\s+\|\s+/)
        .map((part) => part.trim())
        .filter(Boolean);
      const bio = parts.filter((part) => !isUrl(part)).join(" ");
      const profiles = [node.url, ...parts.filter(isUrl)].map((href) => ({ href, profile: profileFor(href) }));
      const invalid = profiles.find(({ profile }) => !profile);
      if (!name) file.fail("A mention needs a name after the @", node);
      if (invalid) file.fail(`Mention @${name}: "${invalid.href}" is not a profile URL`, node);

      node.title = null;
      node.data = {
        hName: "mention",
        hProperties: {
          name,
          bio: bio ? smartPunctuation(bio) : undefined,
          profiles: JSON.stringify(profiles.map(({ profile }) => profile)),
        },
      };
    });
  };
}

/* ---------- Censoring ---------- */

/** `||text||` on one line; the text may not contain a pipe. */
const CENSORED = /\|\|([^|\n]+?)\|\|/g;

/**
 * The bar's width in characters. The length rounds up to a multiple of four
 * (4 to 48), so not even the exact length of what was censored is published.
 */
export const censoredWidth = (length: number) => Math.min(48, Math.max(4, Math.ceil(length / 4) * 4));

/**
 * `||text||` in prose becomes a <redaction> element carrying only its width.
 * Code (inline or fenced) is left alone here; fences opt in separately.
 * Inside a GFM table cell, escape the pipes: `\|\|text\|\|`.
 */
export function remarkCensor() {
  return (tree: MdastRoot) => {
    visit(tree, "text", (node, index, parent) => {
      if (!parent || index === undefined || !node.value.includes("||")) return;
      const replacement: PhrasingContent[] = [];
      let last = 0;
      for (const match of node.value.matchAll(CENSORED)) {
        if (match.index > last) replacement.push({ type: "text", value: node.value.slice(last, match.index) });
        replacement.push({
          type: "redaction",
          data: { hName: "redaction", hProperties: { chars: censoredWidth(match[1].trim().length) }, hChildren: [] },
        } as unknown as PhrasingContent);
        last = match.index + match[0].length;
      }
      if (last === 0) return;
      if (last < node.value.length) replacement.push({ type: "text", value: node.value.slice(last) });
      parent.children.splice(index, 1, ...replacement);
      return index + replacement.length;
    });
  };
}

/** Stands in for censored characters between Shiki's preprocessing and its output tree. */
const PLACEHOLDER = "";
const PLACEHOLDER_RUN = /+/g;

/**
 * Fenced code opts in with `redact` in its meta (```http redact), because
 * `||` is ordinary syntax in most languages. The censored text is swapped for
 * placeholders before highlighting, and the placeholders for <redaction>
 * elements after, so the text never reaches the highlighter's output.
 */
export const transformerCensor: ShikiTransformer = {
  name: "exigent:censor",
  preprocess(code, options) {
    if (!/(?:^|\s)redact(?:\s|$)/.test(String(options.meta?.__raw ?? ""))) return;
    return code.replace(CENSORED, (_, text: string) => PLACEHOLDER.repeat(censoredWidth(text.length)));
  },
  root(root: HastRoot) {
    visit(root, "text", (node, index, parent) => {
      if (!parent || index === undefined || !node.value.includes(PLACEHOLDER)) return;
      const replacement: ElementContent[] = [];
      let last = 0;
      for (const match of node.value.matchAll(PLACEHOLDER_RUN)) {
        if (match.index > last) replacement.push({ type: "text", value: node.value.slice(last, match.index) });
        replacement.push({
          type: "element",
          tagName: "redaction",
          properties: { chars: match[0].length, context: "code" },
          children: [],
        });
        last = match.index + match[0].length;
      }
      if (last < node.value.length) replacement.push({ type: "text", value: node.value.slice(last) });
      parent.children.splice(index, 1, ...replacement);
      return index + replacement.length;
    });
  },
};
