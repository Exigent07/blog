import { Link } from "@/components/navigation/Link";
import { useId } from "react";
import { site } from "@/lib/site";
import { SLASH_MARK_RATIO, SlashMark } from "./SlashMark";
import styles from "./Logo.module.css";

/**
 * The aura: fine dots placed on the mark's own construction lines (the bars'
 * outer edges and centre lines), masked by an elliptical falloff so it is
 * densest at the slashes and dissolves into the ground. A sparse dot grid
 * fills between the lines. Vector and pattern-based: crisp at any density.
 */
const VERTICALS = [0, 18, 43];
const HORIZONTALS = [0, 15.5, 31];

function Aura() {
  const id = useId();
  const fine = `${id}-fine`;
  const fade = `${id}-fade`;
  const mask = `${id}-mask`;

  return (
    <svg className={styles.aura} viewBox="-26 -20 96 71" aria-hidden="true" focusable="false">
      <defs>
        <pattern id={fine} width="4" height="4" patternUnits="userSpaceOnUse" x="-0.45" y="-0.45">
          <rect width="0.9" height="0.9" fill="currentColor" opacity="0.45" />
        </pattern>
        <radialGradient id={fade} cx="22" cy="15.5" r="44" gradientUnits="userSpaceOnUse" gradientTransform="translate(22 15.5) scale(1 0.78) translate(-22 -15.5)">
          <stop offset="0" stopColor="#fff" stopOpacity="1" />
          <stop offset="0.4" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <mask id={mask} maskUnits="userSpaceOnUse" x="-26" y="-20" width="96" height="71">
          <rect x="-26" y="-20" width="96" height="71" fill={`url(#${fade})`} />
        </mask>
      </defs>
      <g mask={`url(#${mask})`} shapeRendering="crispEdges">
        <rect x="-26" y="-20" width="96" height="71" fill={`url(#${fine})`} />
        <g fill="none" stroke="currentColor" strokeWidth="1.1" strokeDasharray="1.1 1.6">
          {VERTICALS.map((x) => (
            <path key={`v${x}`} d={`M${x} -20V51`} />
          ))}
          {HORIZONTALS.map((y) => (
            <path key={`h${y}`} d={`M-26 ${y}H70`} />
          ))}
        </g>
      </g>
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={[styles.logo, className].filter(Boolean).join(" ")}>
      <span className={styles.markBox} style={{ aspectRatio: SLASH_MARK_RATIO }}>
        <Aura />
        <SlashMark className={styles.mark} />
      </span>
      <span className={styles.line} aria-hidden="true" />
      <span className={styles.wordmark} translate="no">
        {site.name}
      </span>
    </Link>
  );
}
