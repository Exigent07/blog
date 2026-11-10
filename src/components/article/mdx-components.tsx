import type { MDXComponents } from "mdx/types";
import type { Route } from "next";
import Image from "next/image";
import { Link } from "@/components/navigation/Link";
import type { ComponentProps } from "react";
import { CodeBlock } from "./CodeBlock";
import { InPageLink } from "./InPageLink";
import { Mention } from "./Mention";
import styles from "./Prose.module.css";
import { Redaction } from "./Redaction";
import { VideoPlayer } from "./VideoPlayer";

const LANGUAGES: Record<string, string> = {
  bash: "Bash",
  css: "CSS",
  diff: "Diff",
  html: "HTML",
  http: "HTTP",
  javascript: "JavaScript",
  js: "JavaScript",
  json: "JSON",
  markdown: "Markdown",
  md: "Markdown",
  sh: "Shell",
  text: "Text",
  ts: "TypeScript",
  tsx: "TSX",
  typescript: "TypeScript",
};

const CALLOUTS = {
  note: "Note",
  tip: "Tip",
  important: "Important",
  warning: "Warning",
  caution: "Caution",
} as const;

type CalloutKind = keyof typeof CALLOUTS;

/** Internal paths use the router; fragments stay inside this article; everything else leaves without a referrer. */
function ProseLink({ href = "", ...props }: ComponentProps<"a">) {
  if (href.startsWith("#")) return <InPageLink href={href} {...props} />;
  if (href.startsWith("/")) return <Link href={href as Route} {...props} />;
  return <a href={href} rel="noreferrer" {...props} />;
}

/** Block code arrives with Shiki's `language-*` class; anything else is inline. */
function Code({ className, ...props }: ComponentProps<"code">) {
  if (className) return <code className={className} {...props} />;
  return <code className={styles.inlineCode} translate="no" {...props} />;
}

function Pre({
  className,
  children,
  "data-language": language = "text",
}: ComponentProps<"pre"> & { "data-language"?: string }) {
  return (
    <CodeBlock className={styles.wide} preClassName={className} language={LANGUAGES[language] ?? language}>
      {children}
    </CodeBlock>
  );
}

/** Tables scroll inside a focusable, labelled region instead of widening the page. */
function Table({ "data-label": label = "Table", ...props }: ComponentProps<"table"> & { "data-label"?: string }) {
  return (
    <div
      className={`${styles.tableRegion} ${styles.wide}`}
      role="region"
      aria-label={label}
      tabIndex={0}
      data-lenis-prevent-horizontal
    >
      <table className={styles.table} {...props} />
    </div>
  );
}

/** `> [!NOTE]` callouts arrive as <aside data-callout>; the kind becomes a visible label. */
function Aside({ "data-callout": kind, children, ...props }: ComponentProps<"aside"> & { "data-callout"?: string }) {
  if (!kind || !Object.hasOwn(CALLOUTS, kind)) return <aside {...props}>{children}</aside>;
  return (
    <aside className={styles.callout} data-callout={kind}>
      <p className={styles.calloutLabel}>{CALLOUTS[kind as CalloutKind]}</p>
      {children}
    </aside>
  );
}

/** Squares replace the bullets; role="list" keeps list semantics once list-style is gone (WebKit). */
function UnorderedList(props: ComponentProps<"ul">) {
  return <ul role="list" {...props} />;
}

function Figure(props: ComponentProps<"figure">) {
  return <figure className={`${styles.figure} ${styles.wide}`} {...props} />;
}

/** The pipeline gives every image its intrinsic size, so it never shifts the text. */
function ProseImage({ src, alt = "", title, width, height }: ComponentProps<"img">) {
  if (typeof src !== "string") return null;
  return (
    <Image
      className={styles.image}
      src={src}
      alt={alt}
      title={title}
      width={Number(width)}
      height={Number(height)}
      sizes="(min-width: 64rem) 52rem, 100vw"
      unoptimized={src.endsWith(".svg")}
    />
  );
}

export const mdxComponents: MDXComponents = {
  a: ProseLink,
  aside: Aside,
  code: Code,
  figure: Figure,
  img: ProseImage,
  // The publication's own syntax (src/lib/content/syntax.ts): `[@Name](url "bio")` and `||censored||`.
  mention: Mention,
  pre: Pre,
  redaction: Redaction,
  table: Table,
  ul: UnorderedList,
  video: VideoPlayer,
};
