"use client";

import { useEffect, useRef, useState } from "react";
import { BracketAction } from "@/components/ui/BracketAction";
import styles from "./CopyHandle.module.css";

type Status = "idle" | "copied" | "selected";

const MESSAGES: Record<Status, string> = {
  idle: "",
  copied: "Copied to the clipboard",
  selected: "Selected: press ⌘C or Ctrl+C to copy",
};

/**
 * A handle with a copy button. The status line is a polite live region, so
 * the result is announced as well as shown. Where the Clipboard API is
 * unavailable or refused, the handle is selected for a manual copy instead.
 */
export function CopyHandle({ handle, service }: { handle: string; service: string }) {
  const handleRef = useRef<HTMLSpanElement>(null);
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    if (status === "idle") return;
    const timer = window.setTimeout(() => setStatus("idle"), 4000);
    return () => window.clearTimeout(timer);
  }, [status]);

  const selectHandle = () => {
    const node = handleRef.current;
    const selection = window.getSelection();
    if (!node || !selection) return;
    const range = document.createRange();
    range.selectNodeContents(node);
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(handle);
      setStatus("copied");
    } catch {
      selectHandle();
      setStatus("selected");
    }
  };

  return (
    <div className={styles.copy}>
      <span ref={handleRef} className={styles.handle} translate="no">
        {handle}
      </span>
      <button type="button" className={styles.button} onClick={() => void copy()}>
        <BracketAction tail={false}>
          Copy<span className="visually-hidden"> {service} handle</span>
        </BracketAction>
      </button>
      <p className={styles.status} role="status">
        {MESSAGES[status]}
      </p>
    </div>
  );
}
