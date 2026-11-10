import "server-only";

import { ImageResponse } from "next/og";
import { SLASH_MARK_RATIO, SlashMark } from "@/components/brand/SlashMark";
import { fonts, MONO_FAMILY, measureText, TEXT_FAMILY } from "./fonts";
import { CARD, type CardContent, type CardLayout, GRID, KICKER, layoutCard, META, textTopForAxis } from "./layout";
import { site } from "@/lib/site";
import { BOUNDARY_SLOPE, palette } from "./palette";

type Tone = { fore: string; muted: string; line: string };

const ON_PAPER: Tone = { fore: palette.ink, muted: palette.graphite, line: palette.rule };
const ON_INK: Tone = { fore: palette.paper, muted: palette.paperDim, line: palette.ruleInk };

/** The header logo at card scale: the site header's proportions (mark 31u, line 59u, wordmark 35u). */
const LOGO = { axis: GRID.header / 2, mark: 24, line: 46, stroke: 2, gapA: 16, gapB: 18, word: 27 } as const;

/** IBM Plex Mono's cap top sits this far (in em) below the top of a line box as tall as the type. */
const MONO_CAP_OFFSET = (1 - (1.025 + 0.275)) / 2 + 1.025 - 0.698;

const fill = { position: "absolute", left: 0, top: 0, width: CARD.width, height: CARD.height, display: "flex" } as const;

function Logo({ tone, wordmark }: { tone: Tone; wordmark: boolean }) {
  const markWidth = LOGO.mark * SLASH_MARK_RATIO;
  const lineLeft = GRID.left + markWidth + LOGO.gapA;
  return (
    <>
      <div style={{ position: "absolute", left: GRID.left, top: LOGO.axis - LOGO.mark / 2, display: "flex", color: tone.fore }}>
        <SlashMark width={markWidth} height={LOGO.mark} />
      </div>
      <div
        style={{
          position: "absolute",
          left: lineLeft,
          top: LOGO.axis - LOGO.stroke / 2,
          width: LOGO.line,
          height: LOGO.stroke,
          backgroundColor: tone.fore,
        }}
      />
      {wordmark && (
        <div
          style={{
            position: "absolute",
            left: lineLeft + LOGO.line + LOGO.gapB,
            top: textTopForAxis(LOGO.axis, LOGO.word, LOGO.word),
            display: "flex",
            fontFamily: TEXT_FAMILY,
            fontWeight: 700,
            fontSize: LOGO.word,
            lineHeight: `${LOGO.word}px`,
            letterSpacing: -0.05 * LOGO.word,
          }}
        >
          {site.name}
        </div>
      )}
    </>
  );
}

function Meta({ layout, tone }: { layout: CardLayout; tone: Tone }) {
  return (
    <div style={{ position: "absolute", left: GRID.left, top: layout.meta.top, display: "flex" }}>
      {layout.meta.items.map((item, index) => (
        <div
          key={item.label}
          style={{
            display: "flex",
            flexDirection: "column",
            paddingRight: META.padBefore,
            ...(index > 0 && { paddingLeft: META.padAfter, borderLeft: `${META.rule}px solid ${tone.line}` }),
          }}
        >
          <div
            style={{
              display: "flex",
              fontFamily: MONO_FAMILY,
              fontWeight: 400,
              fontSize: META.labelSize,
              lineHeight: `${META.labelSize}px`,
              letterSpacing: META.labelTracking * META.labelSize,
              textTransform: "uppercase",
              color: tone.muted,
            }}
          >
            {item.label}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: META.rowGap,
              fontFamily: MONO_FAMILY,
              fontWeight: 600,
              fontSize: META.valueSize,
              lineHeight: `${META.valueSize}px`,
              letterSpacing: META.valueTracking * META.valueSize,
              textTransform: "uppercase",
            }}
          >
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
}

function Kicker({ kicker, tone }: { kicker: NonNullable<CardLayout["kicker"]>; tone: Tone }) {
  if (kicker.voice === "lead") {
    const { size, lineHeight, tracking } = KICKER.lead;
    return (
      <div
        style={{
          position: "absolute",
          left: GRID.left,
          top: kicker.top,
          display: "flex",
          whiteSpace: "nowrap",
          fontFamily: TEXT_FAMILY,
          fontWeight: 500,
          fontSize: size,
          lineHeight: `${lineHeight}px`,
          letterSpacing: tracking * size,
        }}
      >
        {kicker.text}
      </div>
    );
  }

  const { size, lineHeight, tracking, square, gap } = KICKER.label;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: GRID.left,
          top: kicker.top + MONO_CAP_OFFSET * size,
          width: square,
          height: square,
          backgroundColor: tone.fore,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: GRID.left + square + gap,
          top: kicker.top,
          display: "flex",
          fontFamily: MONO_FAMILY,
          fontWeight: 600,
          fontSize: size,
          lineHeight: `${lineHeight}px`,
          letterSpacing: tracking * size,
          textTransform: "uppercase",
        }}
      >
        {kicker.text}
      </div>
    </>
  );
}

/** Everything typographic. Drawn on paper, then again on ink inside the territory. */
function Composition({ layout, tone, wordmark }: { layout: CardLayout; tone: Tone; wordmark: boolean }) {
  const { title, kicker } = layout;
  return (
    <div style={{ ...fill, color: tone.fore }}>
      <Logo tone={tone} wordmark={wordmark} />
      {kicker && <Kicker kicker={kicker} tone={tone} />}

      {title.lines.map((line) => (
        <div
          key={line.text}
          style={{
            position: "absolute",
            left: title.left,
            top: line.top,
            display: "flex",
            whiteSpace: "nowrap",
            fontFamily: TEXT_FAMILY,
            fontWeight: 700,
            fontSize: title.fontSize,
            lineHeight: `${title.lineHeight}px`,
            letterSpacing: title.letterSpacing,
          }}
        >
          {line.text}
        </div>
      ))}

      <Meta layout={layout} tone={tone} />
    </div>
  );
}

const point = (x: number, y: number) => `${x.toFixed(2)}px ${y.toFixed(2)}px`;

function Card({ layout, wordmark }: { layout: CardLayout; wordmark: boolean }) {
  const { xTop, ruleEnd, parallel } = layout.boundary;
  const right = Math.max(CARD.width, xTop);
  // Satori splits polygon points on bare commas, so no spaces after them.
  const territory = `polygon(${[
    point(xTop, 0),
    point(right, 0),
    point(right, CARD.height),
    point(xTop - BOUNDARY_SLOPE * CARD.height, CARD.height),
  ].join(",")})`;

  return (
    <div style={{ ...fill, position: "relative", backgroundColor: palette.paper }}>
      <Composition layout={layout} tone={ON_PAPER} wordmark={wordmark} />

      <div
        style={{ position: "absolute", left: 0, top: GRID.header, width: ruleEnd, height: 1.5, backgroundColor: palette.rule }}
      />
      <svg
        width={CARD.width}
        height={CARD.height}
        viewBox={`0 0 ${CARD.width} ${CARD.height}`}
        style={{ position: "absolute", left: 0, top: 0 }}
      >
        {parallel.map((segment) => (
          <path
            key={segment.from.y}
            d={`M${segment.from.x} ${segment.from.y}L${segment.to.x} ${segment.to.y}`}
            stroke={palette.ink}
            strokeWidth={1.6}
          />
        ))}
      </svg>

      {/*
       * Satori gives a clip-path that has no clipped ancestor a definition
       * that references itself, and rasterisers then skip it for children.
       * Inside an overflow-hidden parent the definition nests correctly, but
       * the clipped element's own background escapes, so the ink field is a
       * child too.
       */}
      <div style={{ ...fill, overflow: "hidden" }}>
        <div style={{ ...fill, clipPath: territory }}>
          <div style={{ ...fill, backgroundColor: palette.ink }} />
          <Composition layout={layout} tone={ON_INK} wordmark={wordmark} />
        </div>
      </div>
    </div>
  );
}

export const cardSize = { width: CARD.width, height: CARD.height };

/** A 1200 × 630 PNG of `content` on the publication's boundary card. */
export function renderCard(content: CardContent, { wordmark }: { wordmark: boolean }) {
  const layout = layoutCard(content, measureText);
  return new ImageResponse(<Card layout={layout} wordmark={wordmark} />, { ...cardSize, fonts });
}
