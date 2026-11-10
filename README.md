# exigent07

Independent security research by Aravindh: browser, web and application
boundaries. This is the publication's site: a Next.js App Router project with
Markdown content, a hand-built design system and a scroll-driven homepage.

- **Design system:** [`docs/DESIGN.md`](docs/DESIGN.md) — the idea, tokens,
  geometry, motion and component rules.
- **Writing and publishing:** [`content/README.md`](content/README.md) — adding
  articles, choosing the featured research, migrating from the legacy blog.

## Running it

Requires Node.js 20.9 or newer (Node 24 LTS recommended).

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build (also type-checks)
npm run start        # serve the production build
npm run lint         # ESLint
npm run typecheck    # TypeScript, after `next typegen`
npm run test:e2e     # Playwright against a production build (uses installed Chrome)
```

Set `NEXT_PUBLIC_SITE_URL` (defaults to `https://exigent07.com`) so canonical
URLs, the sitemap, the feed and Open Graph images point at the right origin.

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16 App Router, React 19, TypeScript (strict) |
| Rendering | Cache Components: every route is prerendered; content loaders use `'use cache'` |
| Styling | CSS Modules on a token layer (`src/styles/tokens.css`); no CSS framework |
| Type | Host Grotesk and IBM Plex Mono via `next/font` (OFL, self-hosted) |
| Content | Markdown/MDX in `content/`, validated with zod, compiled with `@mdx-js/mdx` |
| Code highlighting | Shiki (JavaScript regex engine, custom monochrome theme), at build time |
| Motion | GSAP + ScrollTrigger + SplitText via `@gsap/react`; Lenis for wheel smoothing |
| Route transitions | React `<ViewTransition>` (boundary wipe), per the Next.js guide |

## Layout of the code

```
content/                 articles (.md/.mdx) and editorial.yml
scripts/                 explicit legacy content migration
src/app/                 routes, metadata, feed, sitemap, OG images
src/components/
  brand/                 the // mark and logo
  chrome/                header, footer, spine, scroll progress
  home/                  hero (breach), selected research, seam, method, index, author
  motion/                smooth scrolling, reveal primitive, scroll lock
  navigation/            Link (route transition) and PageTransition
  search/                global search dialog
  ui/                    BracketAction, MetaColumns
src/lib/                 content loaders, schema, markdown pipeline, search, formatting
src/proxy.ts             legacy /posts/<title> redirects, real 404s for unknown slugs
src/styles/              tokens, base, view transitions
```

## How the homepage moves

1. **Entrance** — the ink territory forms from the right while the featured
   headline rises line by line.
2. **The breach** — the hero pins for most of a screen; scrolling advances the
   46.4° boundary until the first screen is ink, every letter turning paper as
   it is crossed. The dot field travels with the boundary.
3. **Specimens** — each selected investigation shows its real before/after
   strings; ink sweeps across them as they pass through the viewport.
4. **The seam** — paper reclaims the page at the same angle.
5. **The footer** — the page slides away to uncover the mark: two paper bars
   at the logo's proportions crossing the wordmark.

Everything respects `prefers-reduced-motion`: no pinning, no scrubbing, final
compositions shown immediately. Lenis smooths wheel input only; touch,
keyboard and assistive scrolling stay native. With motion on, content waiting
for its reveal is faded, never hidden: it stays in the accessibility tree and
the Tab order, and keyboard focus finishes its reveal at once.
