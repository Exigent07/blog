import "server-only";

import { evaluate } from "@mdx-js/mdx";
import rehypeShikiFromHighlighter from "@shikijs/rehype/core";
import {
  transformerMetaHighlight,
  transformerNotationDiff,
  transformerNotationFocus,
  transformerNotationHighlight,
} from "@shikijs/transformers";
import type { Element, ElementContent, Root as HastRoot } from "hast";
import { headingRank } from "hast-util-heading-rank";
import { toString } from "hast-util-to-string";
import type { Root as MdastRoot } from "mdast";
import type { MDXContent } from "mdx/types";
import { open } from "node:fs/promises";
import nodePath from "node:path";
import * as runtime from "react/jsx-runtime";
import rehypeSlug from "rehype-slug";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import { createHighlighterCore, type HighlighterCore, type ShikiTransformer } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import { SKIP, visit } from "unist-util-visit";
import { VFile } from "vfile";
import type { ResearchFormat } from "./research";
import { inkTheme } from "./shiki-theme";
import { remarkCensor, remarkMentions, transformerCensor } from "./syntax";
import { smartPunctuation } from "./typography";

export type TocEntry = { depth: 2 | 3; id: string; text: string };

declare module "vfile" {
  interface DataMap {
    toc: TocEntry[];
  }
}

const CALLOUT = /^\[!(note|tip|important|warning|caution)\][ \t]*\n?/i;

/** GitHub-style alerts (`> [!NOTE]`) become <aside data-callout="note">. */
function remarkCallouts() {
  return (tree: MdastRoot) => {
    visit(tree, "blockquote", (node) => {
      const paragraph = node.children[0];
      const first = paragraph?.type === "paragraph" ? paragraph.children[0] : undefined;
      if (first?.type !== "text") return;
      const match = CALLOUT.exec(first.value);
      if (!match) return;

      first.value = first.value.slice(match[0].length);
      if (first.value === "" && paragraph.type === "paragraph") paragraph.children.shift();
      if (paragraph.type === "paragraph" && paragraph.children.length === 0) node.children.shift();
      node.data = { hName: "aside", hProperties: { dataCallout: match[1].toLowerCase() } };
    });
  };
}

/* ---------- Typography ---------- */

/** Applies smartPunctuation to prose; inline and fenced code keep their exact characters. */
function remarkSmartPunctuation() {
  return (tree: MdastRoot) => {
    let previous = " ";
    visit(tree, (node) => {
      if (node.type === "paragraph" || node.type === "heading" || node.type === "tableCell" || node.type === "break") {
        previous = " ";
      } else if (node.type === "text") {
        const original = node.value;
        node.value = smartPunctuation(original, previous);
        previous = original.at(-1) ?? previous;
      } else if (node.type === "inlineCode") {
        previous = node.value.at(-1) ?? previous;
      }
    });
  };
}

/* ---------- Media ---------- */

const PUBLIC_DIR = nodePath.join(process.cwd(), "public");
const VIDEO = /\.webm$/i;
/** Enough of a file to find its dimensions: JPEG metadata segments and WebM track headers come first. */
const HEAD_BYTES = 256 * 1024;

type Size = { width: number; height: number; audio?: boolean };

function jpegSize(head: Buffer): Size | undefined {
  let offset = 2;
  while (offset + 9 < head.length && head[offset] === 0xff) {
    const marker = head[offset + 1];
    if (marker === 0xff) {
      offset += 1;
    } else if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { height: head.readUInt16BE(offset + 5), width: head.readUInt16BE(offset + 7) };
    } else {
      offset += 2 + head.readUInt16BE(offset + 2);
    }
  }
}

function webpSize(head: Buffer): Size | undefined {
  switch (head.toString("latin1", 12, 16)) {
    case "VP8 ":
      return { width: head.readUInt16LE(26) & 0x3fff, height: head.readUInt16LE(28) & 0x3fff };
    case "VP8L": {
      const bits = head.readUInt32LE(21);
      return { width: (bits & 0x3fff) + 1, height: ((bits >>> 14) & 0x3fff) + 1 };
    }
    case "VP8X":
      return { width: head.readUIntLE(24, 3) + 1, height: head.readUIntLE(27, 3) + 1 };
  }
}

/** EBML variable-length integer; ids keep their length marker, sizes drop it. */
function readVint(head: Buffer, offset: number, keepMarker: boolean) {
  const first = head[offset];
  let length = 1;
  while (length <= 8 && !(first & (0x80 >> (length - 1)))) length += 1;
  if (length > 8 || offset + length > head.length) return undefined;
  let value = keepMarker ? first : first & (0xff >> length);
  for (let index = 1; index < length; index += 1) value = value * 256 + head[offset + index];
  return { value, length };
}

/** Segment › Tracks › TrackEntry › Video, which holds PixelWidth (0xB0) and PixelHeight (0xBA). */
const WEBM_PATH = new Set([0x18538067, 0x1654ae6b, 0xae, 0xe0]);
const WEBM_TRACKS = 0x1654ae6b;

/** A WebM's frame size, and whether any TrackEntry's TrackType (0x83) is audio (2). */
function webmSize(head: Buffer): Size | undefined {
  let width = 0;
  let height = 0;
  let audio = false;
  let done = false;
  const walk = (start: number, end: number) => {
    let offset = start;
    while (offset < end && !done) {
      const id = readVint(head, offset, true);
      const size = id && readVint(head, offset + id.length, false);
      if (!id || !size) return;
      const body = offset + id.length + size.length;
      if (WEBM_PATH.has(id.value)) {
        walk(body, Math.min(end, body + size.value));
        // Every track has been described once Tracks ends; media data follows.
        if (id.value === WEBM_TRACKS) done = true;
      } else if ((id.value === 0xb0 || id.value === 0xba) && size.value <= 6 && body + size.value <= head.length) {
        if (id.value === 0xb0) width = head.readUIntBE(body, size.value);
        else height = head.readUIntBE(body, size.value);
      } else if (id.value === 0x83 && size.value === 1 && head[body] === 2) {
        audio = true;
      }
      offset = body + size.value;
    }
  };
  walk(0, head.length);
  return width && height ? { width, height, audio } : undefined;
}

function svgSize(head: Buffer): Size | undefined {
  const root = /<svg\b[^>]*>/i.exec(head.toString("utf8"))?.[0];
  const box = root && /\bviewBox=["']\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)\s*["']/.exec(root);
  return box ? { width: Math.round(Number(box[1])), height: Math.round(Number(box[2])) } : undefined;
}

function sizeOf(head: Buffer): Size | undefined {
  if (head.toString("latin1", 1, 4) === "PNG") return { width: head.readUInt32BE(16), height: head.readUInt32BE(20) };
  if (head.toString("latin1", 0, 4) === "GIF8") return { width: head.readUInt16LE(6), height: head.readUInt16LE(8) };
  if (head[0] === 0xff && head[1] === 0xd8) return jpegSize(head);
  if (head.toString("latin1", 0, 4) === "RIFF" && head.toString("latin1", 8, 12) === "WEBP") return webpSize(head);
  if (head.readUInt32BE(0) === 0x1a45dfa3) return webmSize(head);
  return svgSize(head);
}

/**
 * Reads a local media file's intrinsic size so figures reserve their exact
 * space. Media must live under public/ (no third-party requests from an
 * article); anything unreadable fails the build with the file and the path.
 */
async function mediaSize(src: string, file: VFile): Promise<Size> {
  const fail = (reason: string) => new Error(`${file.path}: ${src}: ${reason}`);
  const absolute = nodePath.join(PUBLIC_DIR, decodeURI(src));
  if (!src.startsWith("/") || !absolute.startsWith(PUBLIC_DIR + nodePath.sep)) {
    throw fail("media must be stored under public/ and referenced by an absolute path");
  }
  const handle = await open(absolute).catch(() => {
    throw fail("file not found under public/");
  });
  try {
    const { buffer, bytesRead } = await handle.read({ buffer: Buffer.alloc(HEAD_BYTES), position: 0 });
    const size = bytesRead >= 30 ? sizeOf(buffer.subarray(0, bytesRead)) : undefined;
    if (!size?.width || !size.height) throw fail("unsupported format (use PNG, JPEG, GIF, WebP, SVG or WebM)");
    return size;
  } finally {
    await handle.close();
  }
}

const isWhitespace = (node: ElementContent) => node.type === "text" && node.value.trim() === "";

/**
 * A paragraph holding only an image becomes a <figure>. Its caption is the
 * image's title (`![alt](src "Caption")`) or, for a video, the alt text.
 * Every image and video gets its intrinsic width and height; `.webm` sources
 * become videos that never autoplay and preload only metadata (the article's
 * <VideoPlayer> draws their controls).
 */
function rehypeMedia() {
  return async (tree: HastRoot, file: VFile) => {
    visit(tree, "element", (node, index, parent) => {
      if (node.tagName !== "p" || !parent || index === undefined) return;
      const content = node.children.filter((child) => !isWhitespace(child));
      const media = content[0];
      if (content.length !== 1 || media.type !== "element" || media.tagName !== "img") return;

      const { alt, title, ...properties } = media.properties;
      const caption = VIDEO.test(String(media.properties.src)) ? alt : title;
      media.properties = { ...properties, alt };
      const figure: Element = { type: "element", tagName: "figure", properties: {}, children: [media] };
      if (caption) {
        figure.children.push({
          type: "element",
          tagName: "figcaption",
          properties: {},
          children: [{ type: "text", value: smartPunctuation(String(caption)) }],
        });
      }
      parent.children[index] = figure;
      return SKIP;
    });

    const pending: Promise<void>[] = [];
    visit(tree, "element", (node, _index, parent) => {
      if (node.tagName !== "img") return;
      const src = String(node.properties.src ?? "");
      pending.push(
        mediaSize(src, file).then(({ width, height, audio }) => {
          if (!VIDEO.test(src)) {
            node.properties = { ...node.properties, width, height };
            return;
          }
          // A captioned video is named by its figcaption; an inline one by its alt text.
          const inFigure = parent?.type === "element" && parent.tagName === "figure";
          node.tagName = "video";
          node.properties = {
            src,
            width,
            height,
            controls: true,
            preload: "metadata",
            playsInline: true,
            ariaLabel: inFigure ? undefined : String(node.properties.alt ?? "") || undefined,
            // The player offers a sound control only when there is sound.
            dataAudio: audio || undefined,
          };
        }),
      );
    });
    await Promise.all(pending);
  };
}

/* ---------- Tables ---------- */

/** Dates ("Nov 15, 2025", "Feb 2026", "2026-02-01") and amounts ("$5,000", "42%"). */
const DATA_CELL = /^(?:[$€£]?\d[\d,.]*%?|\d{4}-\d{2}-\d{2}|[A-Z][a-z]{2,8}\.? (?:\d{1,2}, )?\d{4})$/;

/**
 * Each table is labelled by its nearest preceding heading (its scroll region
 * needs a name), and cells holding a date or an amount are marked so they
 * set in tabular mono figures.
 */
function rehypeTables() {
  return (tree: HastRoot) => {
    let heading = "";
    visit(tree, "element", (node) => {
      if (headingRank(node)) heading = toString(node).trim();
      else if (node.tagName === "table") node.properties.dataLabel = heading || "Table";
      else if ((node.tagName === "td" || node.tagName === "th") && DATA_CELL.test(toString(node).trim())) {
        node.properties.dataNumeric = true;
      }
    });
  };
}

/** h2/h3 collected after rehype-slug, so ids are exactly the rendered ones. */
function rehypeCollectToc() {
  return (tree: HastRoot, file: VFile) => {
    const toc: TocEntry[] = [];
    visit(tree, "element", (node: Element) => {
      const rank = headingRank(node);
      const id = node.properties.id;
      if ((rank === 2 || rank === 3) && typeof id === "string" && id !== "footnote-label") {
        toc.push({ depth: rank, id, text: toString(node).trim() });
      }
    });
    file.data.toc = toc;
  };
}

/** Exposes the fence language to the code block component. */
const languageAttribute: ShikiTransformer = {
  name: "exigent:language",
  pre(node) {
    node.properties["data-language"] = this.options.lang;
  },
};

let highlighter: Promise<HighlighterCore> | undefined;

/**
 * Shiki with the JavaScript regex engine: no WASM, so builds work on every
 * Node version Next.js supports (the Oniguruma engine needs Response#bytes).
 */
function getHighlighter() {
  highlighter ??= createHighlighterCore({
    themes: [inkTheme],
    langs: [
      import("@shikijs/langs/html"),
      import("@shikijs/langs/javascript"),
      import("@shikijs/langs/typescript"),
      import("@shikijs/langs/tsx"),
      import("@shikijs/langs/json"),
      import("@shikijs/langs/markdown"),
      import("@shikijs/langs/css"),
      import("@shikijs/langs/bash"),
      import("@shikijs/langs/diff"),
      import("@shikijs/langs/http"),
    ],
    engine: createJavaScriptRegexEngine(),
  });
  return highlighter;
}

export type CompiledResearch = { Content: MDXContent; toc: TocEntry[] };

/**
 * Compiles an article body. The source still includes its frontmatter, which
 * remark-frontmatter consumes, so compile errors report real line numbers.
 */
export async function compileResearch(source: string, format: ResearchFormat, path: string): Promise<CompiledResearch> {
  const file = new VFile({ path, value: source });
  const { default: Content } = await evaluate(file, {
    ...runtime,
    format,
    remarkPlugins: [remarkFrontmatter, remarkGfm, remarkCallouts, remarkCensor, remarkMentions, remarkSmartPunctuation],
    rehypePlugins: [
      rehypeMedia,
      [
        rehypeShikiFromHighlighter,
        await getHighlighter(),
        {
          theme: "exigent-ink",
          defaultLanguage: "text",
          fallbackLanguage: "text",
          addLanguageClass: true,
          transformers: [
            transformerCensor,
            transformerNotationHighlight(),
            transformerNotationDiff(),
            transformerNotationFocus(),
            transformerMetaHighlight(),
            languageAttribute,
          ],
        },
      ],
      rehypeSlug,
      rehypeTables,
      rehypeCollectToc,
    ],
  });
  return { Content, toc: file.data.toc ?? [] };
}
