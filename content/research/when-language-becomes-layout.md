---
title: When Language Becomes Layout
subtitle: Unicode Class Injection Through Tailwind-Merge
summary: How a syntax highlighter's language-{lang} class, Unicode whitespace, and Tailwind class merging combined to turn code-fence metadata into UI-redressing capabilities.
publishedAt: 2026-11-02
kind: research
topic: security-boundaries
technique: Class injection
specimen:
  before:
    label: One token
    code: '["language-js\u2029text-center"]'
  after:
    label: Two tokens after twMerge
    code: '["language-js", "text-center"]'
tags:
  - CSS Injection
  - Tailwind CSS
  - tailwind-merge
  - Markdown
  - Unicode
  - Web Security
legacyPaths:
  - "/posts/When Language Becomes Layout: Unicode Class Injection Through Tailwind-Merge"
---

I found the first piece of this bug in my second year of college, long before I knew how to turn it into a convincing exploit.

I was already building websites, so I was familiar with the way React and Next.js applications use helper functions to combine CSS classes. I also knew that Markdown renderers often send fenced code blocks through a syntax highlighter. I started looking at what happened when a code block's *language* wasn't just an ordinary language name.

Something odd happened when that value contained Unicode whitespace. I eventually traced the behavior to `tailwind-merge` (`twMerge`). But at the time, I couldn't come up with a meaningful impact, and neither could the seniors I discussed it with. I shelved the finding.

After spending more time on bug hunting, I came back to it. Tailwind CSS v4 had recently changed the way projects configure source detection, and that got me thinking again about what classes an application might already have in its compiled stylesheet.

I had been asking the wrong question: **how do I make the app generate a new class?**

The more useful question was: **what can I do with classes the app has already generated?**

That led me from a class-name parsing quirk to a working UI-redressing demonstration.

## The Three Pieces That Made This Work

This was not a case of simply putting `fixed` or `text-center` in a Markdown document and expecting Tailwind to apply it. There were three relevant layers:

1. **Markdown code-fence metadata:** The attacker-controlled input was the code block's language identifier, commonly called `lang`.
2. **Syntax highlighting:** The application's code-rendering path formed a CSS class in the shape `language-{lang}`.
3. **Class merging:** The resulting class string was passed through `twMerge`, which treated a Unicode separator as whitespace and reconstructed the class string using ordinary spaces.

The essential flow, as I reproduced it, was:

```text
Attacker-controlled Markdown
          |
          v
Markdown code-fence parser
          |
          v
Syntax-highlighter styling: language-{lang}
          |
          v
Application class utility / twMerge
          |
          v
Unicode separator becomes an ordinary space
          |
          v
DOM class attribute contains separate utility classes
          |
          v
Existing compiled Tailwind CSS can style the element
```

The syntax highlighter's `language-` prefix is central to this story. Without that detail, it looks like an ordinary arbitrary-class injection. It wasn't.

## Why the `language-` Prefix Matters

A syntax-highlighting integration may turn this Markdown:

~~~markdown
```javascript
console.log("hello");
```
~~~

into a code element whose class includes:

```html
<code class="language-javascript">...</code>
```

That is perfectly normal. Highlighters use `language-javascript`, `language-python`, and similar identifiers to select or describe a language.

Now suppose I want the Tailwind utility `text-center` to land on that same element. If I simply put `text-center` into the *language* field, the code renderer constructs:

```text
language-text-center
```

That is **one class name**, not the Tailwind utility `text-center`. The highlighter's `language-` prefix prevents the intended utility from standing alone.

An ordinary ASCII space may not solve the problem either, because a Markdown parser can treat it as the end of the language token or otherwise parse the fence information differently. The exact behavior depends on the parser and integration.

I needed a separator that could survive inside the value used for `lang`, **and only later** turn into a class separator.

That's where Unicode came in.

## The Unicode Difference

HTML's `class` attribute uses **ASCII whitespace** to separate class tokens. JavaScript's regular-expression shorthand `\s`, however, recognizes a broader collection of whitespace and line-terminator characters.

One example is **U+2029 (PARAGRAPH SEPARATOR)**.

That difference matters because a string can be treated as a *single HTML class token* before processing, yet be split into *multiple tokens* by JavaScript code that uses `/\s+/`.

A conceptual language value looks like this (the `\u2029` notation below represents one actual Unicode character):

```js
const lang = "js\u2029text-center";
```

The syntax highlighter's class-construction step produces:

```text
language-js[U+2029]text-center
```

At this point, the intended Tailwind utility still has not become an independent HTML class. The separator is not an ASCII space.

Then the application passes that string through the class-merging utility.

## Where `twMerge` Changes the Meaning

Versions of `tailwind-merge` use whitespace-based tokenization when examining classes. In published implementations, the relevant idea is equivalent to:

```js
const tokens = classString.trim().split(/\s+/);
const result = tokens.join(" ");
```

The real library also understands Tailwind class groups and removes conflicts; the example above shows only the normalization relevant to this finding.

For my input, the important transformation is:

```text
Before:
language-js[U+2029]text-center

After:
language-js text-center
```

**The injected utility is no longer attached to `language-`.** It is a separate class token, and the DOM can apply its corresponding CSS rule if that rule exists in the application stylesheet.

To make that distinction visible, here is a minimal test of the class-merging behavior:

```js
import { twMerge } from "tailwind-merge";

// Simulate a Markdown-to-syntax-highlighter integration.
const lang = "js\u2029text-center";
const highlighterClass = `language-${lang}`;

console.log(JSON.stringify(highlighterClass));
// "language-js\u2029text-center"

const mergedClass = twMerge(highlighterClass);
console.log(JSON.stringify(mergedClass));
// "language-js text-center"

// In a browser, compare DOM tokenization before and after merging.
const before = document.createElement("code");
before.className = highlighterClass;
console.log([...before.classList]);
// One token: ["language-js\u2029text-center"]

const after = document.createElement("code");
after.className = mergedClass;
console.log([...after.classList]);
// Two tokens: ["language-js", "text-center"]
```

This small example isolates the key behavioral difference. It deliberately uses a harmless alignment class rather than an overlay payload.

The security issue is **not** that `twMerge` magically executes CSS, nor that Unicode by itself bypasses browser security. The issue arises when an application treats an untrusted language identifier as harmless metadata, combines it into a styling string, and then passes it through a utility whose normalization changes the identifier into *additional classes*.

## Turning a Quirk Into UI Redressing

When I originally found this, I could influence how a class string was interpreted, but I didn't know what to do with it.

Later, I realized that I didn't necessarily need arbitrary style injection. If an application already had useful Tailwind utilities compiled into its CSS-positioning, sizing, stacking, backgrounds, and typography, then injecting a combination of those classes could change how a rendered element appeared.

That's what I tested. Using existing utility classes, I constructed a **phishing-style visual overlay** as an impact demonstration. In an affected rendering path, untrusted Markdown metadata could influence the appearance of content in ways the application did not intend.

The distinction is important:

- I did **not** need JavaScript execution for the visual redressing behavior.
- I did **not** need the application to compile arbitrary new CSS classes at runtime.
- I did need the vulnerable `lang` → `language-{lang}` → `twMerge` pipeline to be reachable.
- I also needed useful CSS utilities to **already exist** in the stylesheet and to affect an element in a way that produced a meaningful visual change.

I used the finding in a ||ChatGPT|| UI-redressing report. That is a case study for the technique, not proof that every Markdown renderer, Tailwind project, or Next.js application is affected.

A CSS overlay alone does not demonstrate arbitrary file access, database access, JavaScript execution, or automatic data exfiltration. Those would require additional, independently demonstrated capabilities. The impact I am discussing here is **unauthorized UI styling and the possibility of deceptive interface presentation**.

## Why Tailwind v4 Made Me Revisit the Finding

Tailwind v4 was part of what brought this old observation back to mind. It moved much of the configuration experience into CSS and introduced automatic source detection, with explicit `@source` directives for controlling what is scanned.

But there is a boundary worth being precise about: **Tailwind normally scans source files at build time; it does not automatically scan a production database or generate arbitrary CSS because a user changes Markdown content.** Rebooting a server, by itself, does not make every new class in database content available.

The exploit I demonstrated didn't need that assumption. It relied on **already-generated utility classes**.

In other words, the underlying class-tokenization issue is **not exclusive to Tailwind v4**. A project using another Tailwind version could encounter a similar problem if it has the same unsafe pipeline and the necessary CSS rules are present.

Tailwind v4 helped me rethink the impact, but the vulnerable trust-boundary transition happened in the application's handling of untrusted Markdown metadata.

## Is `tailwind-merge` Itself Vulnerable?

I wouldn't automatically call this a vulnerability in `tailwind-merge` as a standalone library.

A class-merging library is supposed to accept a class string, interpret whitespace-separated classes, and return a useful combined string. From that point of view, splitting JavaScript whitespace and joining with spaces can be expected behavior.

The security failure appears when separate components disagree about what the untrusted input *means*:

1. The Markdown/parser layer treats the language identifier as metadata.
2. The syntax-highlighting layer embeds that metadata in a `language-{lang}` CSS class.
3. The class-merging layer sees Unicode whitespace as a boundary between classes.
4. The browser receives the normalized result as separate, independently styled class tokens.

That is the core finding: **a difference in tokenization turns data supplied for one narrowly defined purpose choosing a code language into broader authority over an element's presentation.**

`Next.js`, `clsx`, Markdown renderers, syntax highlighters, Tailwind CSS, and `tailwind-merge` can all be used securely. The exploitable behavior depends on exactly how the application composes them.

## What an Affected Application Needs

For this technique to work in the form I investigated, several conditions have to line up:

- An attacker can influence the Markdown code-fence language value or equivalent syntax-highlighting metadata.
- The renderer allows the relevant Unicode character to reach class construction without first rejecting it or restricting the language to a trusted identifier.
- The highlighting integration produces a string in the form `language-{lang}`.
- That string passes through a class utility such as `twMerge` that converts the Unicode separator into ASCII-space-separated classes.
- The output is assigned to a DOM `class`/React `className` attribute.
- Useful utility CSS rules are present in the compiled stylesheet, and the affected element can be styled in a security-relevant way.

Break any one of those links and this particular chain may fail.

## How to Prevent It

The strongest defense is to treat a syntax-highlighting language as a **restricted identifier**, not as an arbitrary string that can be incorporated into CSS.

An allowlist is straightforward:

```ts
const supportedLanguages = new Set([
  "javascript",
  "typescript",
  "python",
  "json",
  "text",
]);

function safeLanguage(rawLanguage: string): string {
  return supportedLanguages.has(rawLanguage) ? rawLanguage : "text";
}

// Only a trusted identifier can reach `language-${...}`.
const codeClass = `language-${safeLanguage(untrustedLang)}`;
```

The exact policy should match the application, but the principle is the same: validate or map untrusted metadata **before** it becomes part of a CSS class name.

Other practical defenses include keeping external content out of styling-related properties, using fixed component classes wherever possible, reviewing class-merging call sites that handle untrusted strings, and testing how Unicode separators behave across parsing and rendering boundaries.

Escaping HTML alone is not necessarily a defense against this mechanism. The exploit doesn't depend on injecting literal `<script>` or breaking out of an HTML attribute; it depends on the application creating valid additional classes through its own string processing.

## References

- [MDN: HTML `class` attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/class) — class tokens are separated by ASCII whitespace.
- [MDN: JavaScript lexical grammar](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar) — JavaScript whitespace and line terminators, including U+2029.
- [tailwind-merge source (historical implementation)](https://app.unpkg.com/tailwind-merge@0.8.2/files/src/merge-classlist.ts) — whitespace splitting and class-string reconstruction; exact behavior should be verified for the version in a given application.
- [Tailwind CSS: Detecting classes in source files](https://tailwindcss.com/docs/detecting-classes-in-source-files) — build-time source scanning, dynamic classes, and `@source` configuration.

---
