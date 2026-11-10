"use client";

import { useLenis } from "lenis/react";
import { type MouseEvent, useEffect, useRef, useState } from "react";
import { SlashMark } from "@/components/brand/SlashMark";
import type { TocEntry } from "@/lib/content/markdown";
import { findInArticle, scrollToElement } from "./scroll";
import styles from "./TableOfContents.module.css";

/** A heading becomes the current section once its top rises above this share of the viewport. */
const READING_LINE = 0.3;

type Section = TocEntry & { children: TocEntry[] };

/** h3 entries nest under the h2 before them. */
function nest(entries: TocEntry[]) {
  const sections: Section[] = [];
  for (const entry of entries) {
    const parent = sections.at(-1);
    if (entry.depth === 3 && parent) parent.children.push(entry);
    else sections.push({ ...entry, children: [] });
  }
  return sections;
}

/**
 * The article's contents: a sticky column beside the prose on desktop, a
 * disclosure above it on smaller screens. The current section carries the
 * `//──` marker. Headings are found inside this article only (hidden routes
 * stay mounted), observed with one IntersectionObserver, and reached with a
 * scoped scroll instead of a document-wide fragment jump.
 */
export function TableOfContents({ entries, className }: { entries: TocEntry[]; className?: string }) {
  const rootRef = useRef<HTMLElement>(null);
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const lenis = useLenis();

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const headings = entries.flatMap(({ id }) => findInArticle(root, id) ?? []);

    // The root reaches far above the viewport and ends at the reading line, so
    // "intersecting" means "above the line": any crossing fires, including
    // jumps (End, Page Down, scrollbar drags) that skip past the line in one
    // step. The callback runs on crossings only, never per scroll frame.
    const observer = new IntersectionObserver(
      () => {
        const line = window.innerHeight * READING_LINE;
        let current: string | null = null;
        for (const heading of headings) {
          if (heading.getBoundingClientRect().top > line) break;
          current = heading.id;
        }
        setActiveId(current);
      },
      { rootMargin: `1000000px 0px -${(1 - READING_LINE) * 100}% 0px` },
    );
    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [entries]);

  // Keep the current entry visible when the desktop column is taller than the viewport.
  useEffect(() => {
    const panel = panelRef.current;
    const link = panel?.querySelector('[aria-current="true"]');
    if (!panel || !link || panel.scrollHeight <= panel.clientHeight) return;
    const panelBox = panel.getBoundingClientRect();
    const linkBox = link.getBoundingClientRect();
    if (linkBox.top < panelBox.top || linkBox.bottom > panelBox.bottom) {
      panel.scrollTop += linkBox.top - panelBox.top - panelBox.height / 3;
    }
  }, [activeId]);

  const navigate = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = findInArticle(event.currentTarget, id);
    if (!target) return;
    event.preventDefault();
    detailsRef.current?.removeAttribute("open");
    scrollToElement(target, lenis);
  };

  const link = (entry: TocEntry) => (
    <a
      href={`#${entry.id}`}
      className={styles.link}
      aria-current={entry.id === activeId ? "true" : undefined}
      onClick={(event) => navigate(event, entry.id)}
    >
      <span className={styles.marker} aria-hidden="true">
        <SlashMark className={styles.slashes} />
        <span className={styles.rule} />
      </span>
      <span className={styles.text}>{entry.text}</span>
    </a>
  );

  const list = (
    <ol role="list" className={styles.list}>
      {nest(entries).map((section) => (
        <li key={section.id}>
          {link(section)}
          {section.children.length > 0 && (
            <ol role="list" className={styles.sublist}>
              {section.children.map((entry) => (
                <li key={entry.id}>{link(entry)}</li>
              ))}
            </ol>
          )}
        </li>
      ))}
    </ol>
  );

  return (
    <nav ref={rootRef} className={[styles.toc, className].filter(Boolean).join(" ")} aria-label="Contents">
      <details ref={detailsRef} className={styles.compact}>
        <summary className={styles.summary}>
          Contents
          <span className={styles.toggle} aria-hidden="true" />
        </summary>
        {list}
      </details>
      <div ref={panelRef} className={styles.panel} data-lenis-prevent>
        <p className={styles.label}>Contents</p>
        {list}
      </div>
    </nav>
  );
}
