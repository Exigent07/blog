"use client";

import { useSearch } from "@/components/search/SearchProvider";

export function NotFoundSearch({ className }: { className?: string }) {
  const { open } = useSearch();
  return (
    <button type="button" className={className} onClick={open}>
      Search the research
    </button>
  );
}
