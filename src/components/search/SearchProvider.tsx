"use client";

import { createContext, use, useEffect, useState } from "react";

type SearchContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const SearchContext = createContext<SearchContextValue | null>(null);

const isEditable = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || target.closest("input, textarea, select") !== null);

/**
 * Owns the search dialog's open state so any control (header, footer,
 * keyboard shortcut) can open it. Shortcuts: "/" outside text fields, and
 * ⌘K / Ctrl+K anywhere.
 */
export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.isComposing) return;
      const commandK = event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey);
      const slash = event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey && !isEditable(event.target);
      if (commandK || slash) {
        event.preventDefault();
        setIsOpen(true);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <SearchContext value={{ isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) }}>
      {children}
    </SearchContext>
  );
}

export function useSearch() {
  const context = use(SearchContext);
  if (!context) throw new Error("useSearch must be used inside <SearchProvider>");
  return context;
}
