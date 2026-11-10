import type { SVGProps } from "react";

/** Magnifier drawn on the reference's 34 × 33 icon box with a 2-unit stroke. */
export function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 34 34" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" focusable="false" {...props}>
      <circle cx="14" cy="14" r="11.5" />
      <path d="M22.4 22.4 32 32" strokeLinecap="square" />
    </svg>
  );
}
