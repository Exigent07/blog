"use client";

import { useRef } from "react";
import { type RevealTrigger, useReveals } from "./useReveals";

/**
 * Scope for reveal animations. Server-rendered descendants opt in with
 * `data-reveal="lines"` (headings, statements) or `data-reveal="block"`
 * (anything else), optionally grouped with `data-reveal-group`.
 * Renders no box of its own.
 */
export function Reveal({ children, trigger = "scroll" }: { children: React.ReactNode; trigger?: RevealTrigger }) {
  const ref = useRef<HTMLDivElement>(null);
  useReveals(ref, { trigger });
  return (
    <div ref={ref} style={{ display: "contents" }}>
      {children}
    </div>
  );
}
