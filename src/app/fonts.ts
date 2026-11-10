import { Host_Grotesk, IBM_Plex_Mono } from "next/font/google";

/**
 * Display, headings, body and the wordmark. Variable (wght 300–800) with
 * italics; omitting `weight` loads the variable files. Host Grotesk is
 * uniwidth: weight changes never alter advance widths, so emphasis and hover
 * states cannot reflow text.
 */
export const hostGrotesk = Host_Grotesk({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-host-grotesk",
  display: "swap",
  fallback: ["Helvetica Neue", "Arial", "sans-serif"],
});

/**
 * The instrument voice: navigation, metadata and code. Every glyph advances
 * exactly 0.6em, which the navigation marker relies on, so the fallback must
 * stay monospaced: next/font's automatic fallback would be a size-adjusted
 * Arial, hence `adjustFontFallback: false`.
 */
export const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
  adjustFontFallback: false,
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
});
