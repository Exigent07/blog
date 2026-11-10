import type { Measure } from "./measure";
import { BOUNDARY_SLOPE } from "./palette";

/**
 * Geometry of the publication's Open Graph card: the hero's first screen
 * redrawn at 1200 × 630. Everything is computed here, before Satori draws
 * anything, because the boundary has to pass through the title's last word
 * (the line that crosses into the ink territory) while missing every other
 * element.
 */
export const CARD = { width: 1200, height: 630 } as const;

export const GRID = { left: 80, right: 72, header: 72, bottom: 56 } as const;

/** The two voices of the line above the title: a mono label, or a lead in Host Grotesk Medium. */
export const KICKER = {
  label: { size: 20, lineHeight: 20, tracking: 0.02, square: 14, gap: 14, space: 0.3 },
  lead: { size: 40, lineHeight: 46, tracking: -0.01, space: 0.22 },
} as const;

export const META = {
  labelSize: 15,
  valueSize: 20,
  rowGap: 10,
  padBefore: 26,
  padAfter: 30,
  rule: 1.5,
  labelTracking: 0.02,
  valueTracking: 0.01,
} as const;

/** The thin line runs this far outside the boundary, on the paper side (14u in the hero). */
const PARALLEL_OFFSET = 10;
/** Clear space between the boundary and anything it must not cut. */
const CLEARANCE = 28;
/** The header rule stops this far short of the boundary (40u in the hero). */
const RULE_GAP = 27;
/** Keeps the territory from swallowing more than about two thirds of the bottom edge. */
const MIN_X_TOP = 1040;
/** A layout whose last line misses the boundary must be this much larger to win. */
const NO_CROSSING_PENALTY = 0.85;

/* Host Grotesk per em: hhea ascent and descent, which Satori centres in the line box as CSS does. */
const ASCENT = 1.015;
const DESCENT = 0.315;
const CAP_HEIGHT = 0.7;
const X_HEIGHT = 0.496;
/** How far g, j, p, q and y reach below the baseline. */
const DESCENDER = 0.22;
/** Straight stems sit this far inside the origin; titles shift left by it so stems meet the margin. */
const SIDE_BEARING = 0.051;
const LEADING = 0.86;
/** Space from the last baseline to the metadata, as in the hero (94u under 177u type). */
const SPACE_BELOW = 0.53;
/** IBM Plex Mono advances every glyph by 0.6em. */
const MONO_ADVANCE = 0.6;

const META_HEIGHT = META.labelSize + META.rowGap + META.valueSize;
const META_TOP = CARD.height - GRID.bottom - META_HEIGHT;
const KICKER_MIN_TOP = GRID.header + 30;

export type MetaItem = { label: string; value: string };
export type KickerVoice = keyof typeof KICKER;

export type CardContent = {
  kicker?: { text: string; voice: KickerVoice };
  title: string;
  /** Letter spacing of the title, in em. */
  tracking: number;
  maxFontSize: number;
  maxLines: number;
  /** Where the boundary crosses the title's last word, as a fraction of the word's width. */
  crossing: number;
  meta: MetaItem[];
};

type Point = { x: number; y: number };
export type Segment = { from: Point; to: Point };

export type CardLayout = {
  kicker?: { text: string; voice: KickerVoice; top: number };
  title: {
    lines: { text: string; top: number }[];
    left: number;
    fontSize: number;
    lineHeight: number;
    letterSpacing: number;
  };
  meta: { items: MetaItem[]; top: number };
  boundary: {
    /** Where the boundary meets y = 0. It runs down and to the left at BOUNDARY_SLOPE. */
    xTop: number;
    /** Where the header rule ends, short of the boundary. */
    ruleEnd: number;
    /** The thin parallel line, broken around the title's last line. */
    parallel: Segment[];
  };
};

/** The fonts have no U+2010/U+2011 hyphens, and Satori would fetch a fallback font to draw them. */
const normalize = (text: string) => text.replace(/[‐‑]/g, "-");

const length = (text: string) => Array.from(text).length;

const monoWidth = (text: string, size: number, tracking: number) => length(text) * (MONO_ADVANCE + tracking) * size;

const metaWidth = (items: MetaItem[]) =>
  items.reduce(
    (sum, item) =>
      sum +
      Math.max(
        monoWidth(item.label, META.labelSize, META.labelTracking),
        monoWidth(item.value, META.valueSize, META.valueTracking),
      ),
    (items.length - 1) * (META.padBefore + META.rule + META.padAfter),
  );

/** Distance from a line box's top to its baseline. */
const baselineOffset = (fontSize: number, lineHeight: number) =>
  (lineHeight - (ASCENT + DESCENT) * fontSize) / 2 + ASCENT * fontSize;

/** Top of a Host Grotesk line box whose x-height is centred on `axis` (how the logo sits on the header). */
export const textTopForAxis = (axis: number, fontSize: number, lineHeight: number) =>
  axis + (X_HEIGHT / 2) * fontSize - baselineOffset(fontSize, lineHeight);

/** Every way to set `words` on at most `maxLines` lines, fewest lines first. */
function breakings(words: string[], maxLines: number): string[][] {
  const result: string[][] = [];
  const walk = (start: number, lines: string[]) => {
    if (start === words.length) {
      result.push(lines);
      return;
    }
    if (lines.length === maxLines) return;
    for (let end = start + 1; end <= words.length; end++) {
      walk(end, [...lines, words.slice(start, end).join(" ")]);
    }
  };
  walk(0, []);
  return result.sort((a, b) => a.length - b.length);
}

export function layoutCard(content: CardContent, measure: Measure): CardLayout {
  const kicker = content.kicker && { ...content.kicker, text: normalize(content.kicker.text) };
  const meta = content.meta.map((item) => ({ label: normalize(item.label), value: normalize(item.value) }));
  const words = normalize(content.title).split(/\s+/).filter(Boolean);
  const tracked = (text: string) => measure(text) + length(text) * content.tracking;

  const kickerStyle = kicker && KICKER[kicker.voice];
  const kickerWidth = !kicker
    ? 0
    : kicker.voice === "label"
      ? KICKER.label.square + KICKER.label.gap + monoWidth(kicker.text, KICKER.label.size, KICKER.label.tracking)
      : (measure(kicker.text) + length(kicker.text) * KICKER.lead.tracking) * KICKER.lead.size;
  const metaBox = { right: GRID.left + metaWidth(meta), bottom: META_TOP + META_HEIGHT };

  let best: { layout: CardLayout; score: number } | undefined;

  for (const lines of breakings(words, content.maxLines)) {
    const widths = lines.map(tracked);
    const fontSize = Math.min(
      content.maxFontSize,
      (CARD.width - GRID.right - GRID.left) / (Math.max(...widths) - SIDE_BEARING),
      (META_TOP - KICKER_MIN_TOP - (kickerStyle?.lineHeight ?? 0)) /
        (SPACE_BELOW + LEADING * (lines.length - 1) + CAP_HEIGHT + (kickerStyle?.space ?? 0)),
    );
    const lineHeight = LEADING * fontSize;
    const left = GRID.left - SIDE_BEARING * fontSize;
    const lastBaseline = META_TOP - SPACE_BELOW * fontSize;
    const baselines = lines.map((_, index) => lastBaseline - (lines.length - 1 - index) * lineHeight);
    const capTop = baselines[0] - CAP_HEIGHT * fontSize;
    const kickerTop = kickerStyle ? capTop - kickerStyle.space * fontSize - kickerStyle.lineHeight : capTop;

    // The boundary passes through the last word, at the middle of its x-height…
    const last = lines[lines.length - 1];
    const lastWordStart = last.lastIndexOf(" ") + 1;
    const wordLeft = left + tracked(last.slice(0, lastWordStart)) * fontSize;
    const wordWidth = tracked(last.slice(lastWordStart)) * fontSize;
    const middle = lastBaseline - (X_HEIGHT / 2) * fontSize;
    const anchored = wordLeft + content.crossing * wordWidth + BOUNDARY_SLOPE * middle;

    // …unless that would cut an earlier line, the kicker or the metadata.
    const protectedBoxes = [
      metaBox,
      ...lines.slice(0, -1).map((_, index) => ({
        right: left + widths[index] * fontSize,
        bottom: baselines[index] + DESCENDER * fontSize,
      })),
      ...(kickerStyle ? [{ right: GRID.left + kickerWidth, bottom: kickerTop + kickerStyle.lineHeight }] : []),
    ];
    const xTop = Math.max(
      anchored,
      MIN_X_TOP,
      ...protectedBoxes.map((box) => box.right + CLEARANCE + BOUNDARY_SLOPE * box.bottom),
    );

    const lineEnd = left + widths[widths.length - 1] * fontSize;
    const crosses = xTop - BOUNDARY_SLOPE * middle <= lineEnd - 0.35 * fontSize;
    const score = fontSize * (crosses ? 1 : NO_CROSSING_PENALTY);
    if (best && score <= best.score) continue;

    const parallelX = (y: number) => xTop - BOUNDARY_SLOPE * y - PARALLEL_OFFSET;
    const segment = (y0: number, y1: number): Segment => ({
      from: { x: parallelX(y0), y: y0 },
      to: { x: parallelX(y1), y: y1 },
    });
    const upperStart = GRID.header + 24;
    const upperEnd = lastBaseline - (CAP_HEIGHT + 0.2) * fontSize;

    best = {
      score,
      layout: {
        kicker: kicker && { ...kicker, top: kickerTop },
        title: {
          lines: lines.map((text, index) => ({ text, top: baselines[index] - baselineOffset(fontSize, lineHeight) })),
          left,
          fontSize,
          lineHeight,
          letterSpacing: content.tracking * fontSize,
        },
        meta: { items: meta, top: META_TOP },
        boundary: {
          xTop,
          ruleEnd: Math.min(CARD.width, xTop - BOUNDARY_SLOPE * GRID.header - RULE_GAP),
          parallel: [
            ...(upperEnd - upperStart > 24 ? [segment(upperStart, upperEnd)] : []),
            segment(lastBaseline + 0.24 * fontSize, CARD.height),
          ],
        },
      },
    };
  }

  if (!best) throw new Error("Card title is empty");
  return best.layout;
}
