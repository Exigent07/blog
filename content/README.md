# Content

Everything the site publishes lives in this folder. Files are validated at
build time; a mistake fails `npm run build` with the file name and the field.

```
content/
  editorial.yml          homepage choices: featured research and the selection
  research/<slug>.md     one article per file (.md, or .mdx to use components)
public/research/<slug>/  images, videos and other media for that article
```

## Adding an article

Create `content/research/<slug>.md`. The file name is the URL:
`/research/<slug>`. Use lowercase words joined by hyphens.

```yaml
---
title: When Language Becomes Layout          # the headline
subtitle: Unicode Class Injection Through Tailwind-Merge   # optional deck
summary: One or two sentences for listings, search and link previews.
publishedAt: 2026-11-02                      # YYYY-MM-DD
updatedAt: 2026-11-20                        # optional
kind: research                               # research | bug-bounty
topic: client-side                           # see TOPICS in src/lib/content/schema.ts
technique: Class injection                   # short, shown in metadata
tags: [Unicode, Tailwind CSS]
disclosure:                                  # optional, only what is public
  program: Google VRP
  rewardUsd: 15000
specimen:                                    # optional: a real before/after from the work
  before:
    label: One token
    code: '["language-js text-center"]'
  after:
    label: Two tokens after twMerge
    code: '["language-js", "text-center"]'
draft: false                                 # true hides it everywhere
---
```

The body is GitHub-flavoured Markdown: headings (`##` and `###` build the
table of contents), tables, fenced code with a language
(` ```ts `), images and links. Also supported:

- **Callouts:** `> [!NOTE]`, `> [!TIP]`, `> [!IMPORTANT]`, `> [!WARNING]`,
  `> [!CAUTION]` as the first line of a blockquote.
- **Video:** `![Caption](/research/<slug>/clip.webm)`; image syntax with a
  video file renders the publication's player (play, a scrubber, the time,
  full screen) with the alt text as caption. A sound control appears only
  when the file has an audio track. Nothing autoplays.
- **Code highlighting:** `// [!code highlight]`, `// [!code ++]`,
  `// [!code --]` and `// [!code focus]` at the end of a line, or
  ` ```ts {1,3-4} ` to highlight lines.

Reading time is computed from the text.

### Mentions

Link a person with an `@` before their name. The link goes to their main
profile; hovering or focusing it opens a card with their bio and profiles.

```md
[@ValentinoMassaro](https://x.com/valent1nee "Ethical hacker and AI/security researcher. | https://github.com/valent1nee")
```

- The URL is the main profile (X, GitHub, Bluesky, LinkedIn, HackerOne and
  Bugcrowd show their platform and handle; any other site shows its host).
- The title is a one-line bio. Further profile URLs follow it, each after
  ` | `. Both are optional: `[@Name](https://github.com/name)` works.
- A mention whose URLs are not web addresses fails the build with its line.

### Censoring

Wrap text in double pipes to censor it: `the internal host is ||staging.corp.example||`.

The text is removed when the article is built. It never reaches the page,
the search index or the feed: only a bar of roughly its width does (the
length is rounded up to a multiple of four, so not even the exact length is
published). Hovering the bar plays a short animation that settles on
`//REDACTED//`; there is nothing behind it to reveal.

- **In code blocks,** opt in with `redact` after the language, since `||`
  is ordinary syntax in most languages. The copy button copies censored
  spans as `[REDACTED]`.

  ````md
  ```http redact
  Authorization: Bearer ||eyJhbGciOiJIUzI1NiJ9...||
  ```
  ````

- **In table cells,** escape the pipes: `\|\|text\|\|`.
- Censoring works on one line of plain text at a time, and the text may not
  contain a `|`. Inline code (`` `...` ``) is never censored.

## Featuring research on the homepage

`editorial.yml` chooses the hero and the selection:

```yaml
featured:
  slug: when-language-becomes-layout
  lines: [When, Language, Becomes Layout]   # hero line breaks; put the longest last
  summary: One sentence for the hero.       # optional; defaults to the article summary
selected: [the-bug-that-cost-google-gemini, when-language-becomes-layout]
```

The hero's last line is the one that crosses the black boundary, so make it
the longest. On phones every word gets its own line automatically.

## Migrating from the legacy blog

`npm run content:migrate` copies posts from `../blog/src/posts` once (it
never overwrites, and never writes to the legacy folder). See
`scripts/migrate-legacy-content.mjs`. Old `/posts/<title>` URLs redirect
permanently to the new slugs through each article's `legacyPaths`, however the
title was encoded (`src/proxy.ts`). The table is read when the app is built or
the dev server starts, so restart `npm run dev` after changing `legacyPaths`.
