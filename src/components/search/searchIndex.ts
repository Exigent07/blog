"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { SearchEntry } from "@/lib/search";

/**
 * The search index (/search.json), fetched at most once per page load and
 * kept in memory for every later search. A module-level store rather than
 * component state, so warming it from a trigger and opening the dialog share
 * one request.
 */
export type SearchIndex =
  | { status: "idle" | "loading" | "error" }
  | { status: "ready"; entries: SearchEntry[] };

const IDLE: SearchIndex = { status: "idle" };
let snapshot: SearchIndex = IDLE;
const listeners = new Set<() => void>();

function publish(next: SearchIndex) {
  snapshot = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const isEntry = (value: unknown): value is SearchEntry => {
  if (typeof value !== "object" || value === null) return false;
  const { slug, title, summary, publishedAt } = value as Record<string, unknown>;
  return [slug, title, summary, publishedAt].every((field) => typeof field === "string");
};

/** Starts loading unless the index is loading or loaded; a failed load is retried. */
export function loadSearchIndex() {
  if (snapshot.status === "loading" || snapshot.status === "ready") return;
  publish({ status: "loading" });
  fetch("/search.json")
    .then((response) => {
      if (!response.ok) throw new Error(`/search.json responded ${response.status}`);
      return response.json() as Promise<unknown>;
    })
    .then((data) => {
      if (!Array.isArray(data) || !data.every(isEntry)) throw new Error("/search.json is not a search index");
      publish({ status: "ready", entries: data });
    })
    .catch(() => publish({ status: "error" }));
}

export function useSearchIndex() {
  return useSyncExternalStore(subscribe, () => snapshot, () => IDLE);
}

/**
 * Search triggers advertise the shortcut (the header's magnifier carries
 * aria-keyshortcuts="/ Control+K Meta+K"). Pointing at or focusing one starts
 * the load, so the index is usually in memory before the dialog opens.
 */
const TRIGGER = '[aria-keyshortcuts~="Control+K"]';

export function useWarmSearchIndex() {
  useEffect(() => {
    function stop() {
      document.removeEventListener("pointerover", warm);
      document.removeEventListener("focusin", warm);
    }
    function warm(event: Event) {
      if (!(event.target instanceof Element) || !event.target.closest(TRIGGER)) return;
      loadSearchIndex();
      stop();
    }
    document.addEventListener("pointerover", warm, { passive: true });
    document.addEventListener("focusin", warm);
    return stop;
  }, []);
}
