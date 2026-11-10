"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { BracketAction } from "@/components/ui/BracketAction";
import styles from "./CodeBlock.module.css";

type Status = "idle" | "copied" | "failed";

const ACTION: Record<Status, string> = { idle: "Copy", copied: "Copied", failed: "Failed" };
const ANNOUNCEMENT: Record<Status, string> = { idle: "", copied: "Copied", failed: "Copy failed" };

type Props = {
  /** Display name of the fence language. */
  language: string;
  /** Placement from the prose grid. */
  className?: string;
  /** Shiki's classes on <pre> (has-highlighted, has-diff, has-focused). */
  preClassName?: string;
  children: ReactNode;
};

/**
 * An ink slab for highlighted code: the language, a copy action and a
 * horizontally scrolling <pre>. The <pre> joins the tab order only while it
 * overflows, so keyboard users can scroll long lines without stopping at
 * every short block.
 */
export function CodeBlock({ language, className, preClassName, children }: Props) {
  const preRef = useRef<HTMLPreElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [overflows, setOverflows] = useState(true);

  useEffect(() => {
    const pre = preRef.current;
    if (!pre) return;
    const observer = new ResizeObserver(() => setOverflows(pre.scrollWidth > pre.clientWidth));
    observer.observe(pre);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (status === "idle") return;
    const timeout = window.setTimeout(() => setStatus("idle"), 2000);
    return () => window.clearTimeout(timeout);
  }, [status]);

  const copy = async () => {
    // Censored spans copy as a marker, never as their screen-reader label.
    const clone = preRef.current?.cloneNode(true) as HTMLElement | undefined;
    clone?.querySelectorAll("[data-redaction]").forEach((redaction) => redaction.replaceWith("[REDACTED]"));
    try {
      await navigator.clipboard.writeText(clone?.textContent ?? "");
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
  };

  return (
    <div className={[styles.block, className].filter(Boolean).join(" ")} data-tone="ink">
      <div className={styles.bar}>
        <span className={styles.language}>{language}</span>
        <button type="button" className={styles.copy} onClick={copy}>
          <BracketAction tail={false}>{ACTION[status]}</BracketAction>
          <span className="visually-hidden"> {language} code</span>
        </button>
        <span className="visually-hidden" role="status">
          {ANNOUNCEMENT[status]}
        </span>
      </div>
      <pre
        ref={preRef}
        className={[styles.pre, preClassName].filter(Boolean).join(" ")}
        tabIndex={overflows ? 0 : undefined}
        translate="no"
        data-lenis-prevent-horizontal
      >
        {children}
      </pre>
    </div>
  );
}
