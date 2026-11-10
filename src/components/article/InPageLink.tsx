"use client";

import { useLenis } from "lenis/react";
import type { ComponentProps } from "react";
import { findInArticle, scrollToElement } from "./scroll";

/** A `#fragment` link in the prose (footnotes, cross-references), resolved inside its own article. */
export function InPageLink({ href, ...props }: ComponentProps<"a"> & { href: string }) {
  const lenis = useLenis();

  return (
    <a
      href={href}
      {...props}
      onClick={(event) => {
        const target = findInArticle(event.currentTarget, decodeURIComponent(href.slice(1)));
        if (!target) return;
        event.preventDefault();
        scrollToElement(target, lenis);
      }}
    />
  );
}
