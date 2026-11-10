# exigent07 — The Uncontained

Design system and art direction. Every page, component and animation in this
repository follows this document. When code and this document disagree, fix
one of them in the same change.

## 1. Idea

exigent07 is an independent security research publication. Its three
investigations share one cause, stated by the author in *When Language Becomes
Layout*:

> Sometimes the attack isn't in one library. It's in the assumptions made
> between libraries.

**On this site, the boundary between what one layer trusted and what the next
layer did becomes a diagonal that typography is allowed to cross.** The
interface looks architecturally fixed: ivory ground, black territory, hairline
rules, aligned type. Then the boundary moves, and type that was ink becomes
paper as it crosses.

The single device is **the boundary**: a straight edge at the hero angle
(46.4° from horizontal) dividing *paper* territory from *ink* territory. It
appears four times, each with a purpose:

| Where | What the boundary does |
| --- | --- |
| Hero | Divides the first screen; the final headline line crosses it. |
| The breach (hero → research) | Advances across the hero until the page is ink; the headline turns to paper letter by letter. |
| Research specimens | Sweeps across each finding's real input, revealing what the browser actually rendered. |
| Footer | Resolves into the mark itself: two parallel boundaries, `//`, crossed by the wordmark. |

Everything else is quiet: precise type, real content, no decoration.

**The live thing:** *Two parsers, one string* (homepage method section). The
visitor types a class string, picks a separator, and their own browser's
`DOMTokenList` and `String.prototype.split(/\s+/)` disagree about how many
classes it contains. It is the mechanism of the featured research, run live.

## 2. Colour

Monochrome. The black field *is* the accent.

| Token | Value | Use |
| --- | --- | --- |
| `--paper` | `#F8F2F0` | Ground. Sampled from the reference. |
| `--ink` | `#070706` | Text on paper; the black territory. |
| `--graphite` | `#66666B` | Secondary text and labels on paper (≥ 4.9:1). |
| `--rule` | `#BDBBBA` | Hairlines on paper. Only structural lines. |
| `--paper-dim` | `#A3A09D` | Secondary text on ink (≥ 7:1). |
| `--rule-ink` | `#34322F` | Hairlines on ink. |
| `--dot` | `#FFFFFF` | Dot field points on ink. |

Rules: running text is always full `--ink` (or full `--paper` on ink).
No gradients as surfaces, no shadows at rest, no glows, no tints. A section
changes tone by swapping the whole field, never by fading.

## 3. Type

Two families, both SIL Open Font License, self-hosted via `next/font/google`.

- **Host Grotesk** (variable 300–800, italic): display, headings, body, the
  wordmark. Display at weight 700, tracking −0.045em, leading 0.77–0.9.
- **IBM Plex Mono** (400/500/600): the instrument voice. Used only for data:
  navigation labels, metadata (topic, technique, dates, read time), the CTA,
  progress numerals, and real code. Never for prose.

Steps (fluid, `clamp`):

| Token | Range | Role |
| --- | --- | --- |
| `--step-label` | 13→14px | Mono metadata labels, uppercase, +0.02em |
| `--step-data` | 14→17px | Mono values, nav |
| `--step-body` | 17→19px | Article body, leading 1.62, measure ≤ 68ch |
| `--step-lead` | 20→26px | Lead paragraphs, hero summary (italic 500) |
| `--step-head` | 40→96px | Section headings, ≤ 2 lines |
| `--step-display` | stage-sized | Hero and monumental type only |

Details: curly quotes, `…`, `text-wrap: balance` on headings,
`text-wrap: pretty` on paragraphs, `font-variant-numeric: tabular-nums` for
dates and counts, `translate="no"` on the wordmark and code tokens. Dates are
formatted with `Intl.DateTimeFormat`.

## 4. Geometry

### Stage unit (desktop hero and header)

The hero is drawn in the reference's own coordinate system (1670 × 942) and
scaled uniformly:

```
--u: min(100vw / 1670, 100svh / 942)
```

All hero coordinates below are in `u`. On viewports wider than 16:9 the stage
is centred horizontally (`--stage-x`); paper extends left, ink extends right.

### The boundary

`x(y) = 1722.85u − 0.953·y` — 46.4° from horizontal, entering the frame at the
right edge 55u below the top. The thin parallel line runs 14u outside the
edge on the paper side and breaks around the headline's last line.

### Frame

- Spine: vertical hairline at 48u (desktop). Each section draws its own
  segment, so the line is continuous; a vertical mono label stays sticky
  inside its section.
- Header rule: y = 98u.
- Content left edge: 148u. Right margin: 90u.
- Tablet and phone recompose; they do not shrink the desktop stage.

## 5. Motion

Motion means *crossing*. Things are revealed through masks or by a boundary
passing, not faded in from nowhere.

| Token | Value | Use |
| --- | --- | --- |
| `--dur-micro` | 160ms | Colour/opacity feedback |
| `--dur-short` | 320ms | Marker travel, CTA line extension |
| `--dur-medium` | 640ms | Masked line reveals |
| `--dur-long` | 1100ms | Entrance sequence, route wipe |
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Reveals, travel |
| `--ease-in-out` | `cubic-bezier(0.76, 0, 0.24, 1)` | Boundary wipes |

GSAP equivalents: `expo.out`, `power4.inOut`. Stagger 70ms for lines.

Principles:

1. One loud moment per page. On the homepage it is the breach.
2. Scrubbed animation only where the scroll *is* the story (breach,
   specimens, footer). Everything else plays once.
3. Never animate layout. Transform, opacity and clip-path only.
4. Every animation has a `prefers-reduced-motion` state that shows the final
   composition with no travel. No pinning under reduced motion.
5. Scroll is never slowed. Lenis smooths wheel input only (native touch,
   native keyboard; in-page anchors scroll within their own article).
6. Route changes use React `<ViewTransition>`: forward navigation reveals the
   new page through a diagonal wipe at the boundary angle; the header stays
   anchored. The old page holds still beneath the wipe, so every page is one
   opaque surface (`<PageTransition>` provides it), and transition names live
   in global CSS, never in a CSS Module, which would rename them.
7. Motion never hides content from the keyboard or assistive technology.
   Reveals fade with opacity only (never `visibility`), so waiting content
   stays focusable and in the accessibility tree, and focus entering it
   finishes its reveal at once. Line reveals split plain text only, never an
   element that contains a link or control.

### Motion inventory (as built)

| Moment | Device | Where |
| --- | --- | --- |
| Hero entrance | Headline lines rise through clip masks and details follow by index, in CSS so they paint before hydration; the territory forms (`--breach` −0.45 → 0) in JS so the dot field follows it | `home/hero/Hero.module.css`, `useHeroMotion.ts` |
| The breach | Hero pins for 0.85 screen; `--breach` 0 → 1 with scroll; the dot band and parallel line ride the edge | `home/hero/useHeroMotion.ts`, `field.ts` |
| Specimens | Ink sweeps each before/after panel (`--sweep`), scrubbed | `home/selected/Specimen.tsx` |
| Seam | Paper reclaims the page at 46.4° (`--seam`), scrubbed | `home/Seam.tsx` |
| Section entrances | Masked lines for headings, rising blocks for the rest, once; page titles (`data-reveal="title"`) rise in pure CSS because they are the largest paint | `motion/Reveal.tsx`, `styles/base.css` |
| Index rows | Ink copy of the row sweeps in on hover/focus (CSS) | `home/index/ResearchIndex.module.css` |
| Footer | Bars slide into the `//`; wordmark settles from 94%; fine pointer nudges the bars | `chrome/FooterMark.tsx` |
| Route change | New page revealed by a diagonal wipe; header anchored | `navigation/*`, `styles/view-transitions.css` |
| Navigation marker | `//────` travels between labels (CSS transition, no layout reads) | `chrome/Header.tsx` |
| Progress slider in/out | A mask at the boundary angle wipes it in (620ms) or out (420ms). Route change: the page wipe covers its old snapshot as it passes (its own transition layer, between the old page and the new); it wipes back in, in the new page's tone, once the wipe ends. Page end: out above 99%, back below 97% | `chrome/ScrollProgress.*`, `styles/view-transitions.css` |

## 6. Components (shared vocabulary)

- **Slash mark** `//`: two parallelogram bars at 60°. Logo, nav marker,
  progress marker. Never redrawn ad hoc; one component.
- **Marker** `//────`: active navigation and hover state of research entries.
- **Bracketed action** `[ READ RESEARCH ]  □────→`: the only button shape.
  Hover: the line extends and the arrow advances; focus shows the same plus
  a 2px outline.
- **Meta columns**: label (graphite, 13–14px mono caps) over value (ink,
  semibold mono caps), separated by full-height hairlines. One row where
  there is room; a two-column grid (`layout="grid"`) in narrow containers,
  so a wrapped row never starts with a hairline.
- **Boundary**: two stacked layers (paper/ink) clipped by complementary
  polygons driven by CSS custom properties. Used by the hero, specimens and
  footer. Duplicated layers are `aria-hidden` and `inert`.
- **Mention card** (`[@Name](url "bio")`): an ink card revealed by a wipe at
  the boundary angle; a monogram the boundary crosses, the name, the handle
  in mono, the bio, then each profile (mono platform label + handle). Opens
  on hover intent or keyboard focus, stays while hovered, Escape closes.
- **Redaction** (`||text||`): a solid bar in the surface's foreground, about
  as wide as the censored text, which never ships. Hover: the boundary
  crosses the bar and scrambled glyphs settle on `//REDACTED//`.
- **Video player**: an ink slab like a code block. Bracketed Play/Pause and
  Full screen, mono time, and a scrubber whose thumb is the slash mark with
  the track breaking around it, as on the page's progress indicator.
- **Progress slider** `0 ──//── 100`: where the reader is, and a way to go
  anywhere. Click the track to jump, drag the slash mark to scrub, 0 and 100
  for the top and the bottom; a native range underneath serves the keyboard
  and screen readers. On phones it is a hairline that never takes a tap:
  only the mark can be grabbed, and only sideways. Its tone follows the
  surface beneath it, checked on every scroll frame and while a route
  settles.
- **Scrollbars**: the page has none (the progress slider replaces it).
  Every scroll container gets one style from base.css, in its own tone: a
  hairline track and a square 3px thumb that thickens to 5px under the
  pointer. Components never set `scrollbar-*` themselves.

## 7. Content rules

- Only verified facts. Sources: the articles themselves and the author's own
  published profile data.
- Labels carry data, never decoration. No invented identifiers or numbering.
- Section headings are sentence case, two lines at most at every width.
- No middle-dot meta strings; metadata uses labelled columns.
