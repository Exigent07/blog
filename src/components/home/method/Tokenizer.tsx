"use client";

import { Fragment, useId, useState } from "react";
import styles from "./Tokenizer.module.css";

const SEPARATORS = [
  { char: " ", code: "U+2029", name: "Paragraph separator" },
  { char: " ", code: "U+00A0", name: "No-break space" },
  { char: "　", code: "U+3000", name: "Ideographic space" },
  { char: "​", code: "U+200B", name: "Zero-width space" },
  { char: " ", code: "U+0020", name: "Space" },
] as const;

type Separator = (typeof SEPARATORS)[number];

/**
 * The browser's own class parser: DOMTokenList splits on ASCII whitespace
 * only and keeps each class once. On the server (first render) the same rule
 * is applied by hand, so hydration matches; after that every result comes
 * from the real API.
 */
function classListTokens(value: string): string[] {
  if (typeof document === "undefined") return [...new Set(value.split(/[\t\n\f\r ]+/).filter(Boolean))];
  const element = document.createElement("code");
  element.className = value;
  return [...element.classList];
}

/** What a class-merging utility that tokenises with /\s+/ sees. */
const whitespaceTokens = (value: string) => value.trim().split(/\s+/).filter(Boolean);

const SPECIAL = new RegExp(`(${SEPARATORS.map(({ char }) => char).join("|")})`);

/** Shows invisible characters as their code points. */
function Visible({ text }: { text: string }) {
  return text.split(SPECIAL).map((part, index) => {
    const separator = SEPARATORS.find(({ char }) => char === part);
    return separator ? (
      <abbr key={index} className={styles.char} title={separator.name}>
        {separator.code}
      </abbr>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    );
  });
}

const classes = (count: number) => `${count} ${count === 1 ? "class" : "classes"}`;

/** Quoted class names: “a”, “b”. */
const quoted = (names: readonly string[]) => names.map((name) => `\u201c${name}\u201d`).join(", ");

/**
 * Compares the *sets* of classes the two parsers produce: classList keeps
 * each class once, so a repeated name or an ASCII space after the separator
 * is not a disagreement.
 */
function verdict(separator: Separator, suffix: string, browser: string[], split: string[], injected: string[]) {
  // trim() would swallow a trailing separator, so an empty suffix proves nothing.
  if (suffix.trim() === "") return "Add text after the separator to see where each parser draws the boundary.";
  const seen = new Set(browser);
  const unique = new Set(split);
  const agree = unique.size === seen.size && [...unique].every((token) => seen.has(token));
  if (agree) {
    return separator.char === " "
      ? "They agree: both split on an ASCII space. A Markdown parser may also end the language name there, which is why the finding needed a different character."
      : `They agree: neither treats ${separator.code} as a class boundary${seen.size === 1 ? ", so the class stays whole" : ""}.`;
  }
  if (injected.length === 0) {
    return "They end the language name in different places, but nothing after it becomes a new class: your browser already reads every class the split adds.";
  }
  const one = injected.length === 1;
  return `They disagree. Your browser reads ${classes(seen.size)}; split on \\s the same string gives ${classes(unique.size)}, and ${quoted(injected)} ${one ? "reaches" : "reach"} the element as ${one ? "a class of its own" : "classes of their own"}.`;
}

/**
 * The live part of the homepage: the mechanism of the featured research, run
 * in the visitor's own browser.
 */
export function Tokenizer() {
  const id = useId();
  const [separator, setSeparator] = useState<Separator>(SEPARATORS[0]);
  const [suffix, setSuffix] = useState("text-center");

  const value = `language-js${separator.char}${suffix}`;
  const browser = classListTokens(value);
  const split = whitespaceTokens(value);
  // The classes the author never wrote: what the split makes of the text after the language name that the browser would not.
  const injected = [...new Set(split.slice(1))].filter((token) => !browser.includes(token));

  return (
    // data-ui: a working interface fragment, which keeps its own controls and outlines.
    <section className={styles.instrument} data-tone="ink" data-ui aria-labelledby={`${id}-title`}>
      <div className={styles.copy}>
        <h3 id={`${id}-title`} className={styles.title}>
          Two parsers, one string
        </h3>
        <p className={styles.lede}>
          A code fence names its language and a syntax highlighter turns the name into a class. Choose the character
          between the two words: your browser and a <code translate="no">/\s+/</code> split count the classes.
        </p>

        <fieldset className={styles.separators}>
          <legend className={styles.legend}>Separator</legend>
          {SEPARATORS.map((option) => (
            <label key={option.code} className={styles.option}>
              <input
                type="radio"
                name={`${id}-separator`}
                value={option.code}
                checked={option.code === separator.code}
                onChange={() => setSeparator(option)}
              />
              <span className={styles.optionCode} translate="no">
                {option.code}
              </span>
              <span className={styles.optionName}>{option.name}</span>
            </label>
          ))}
        </fieldset>

        <label className={styles.field}>
          <span className={styles.legend}>Text after the separator</span>
          <input
            className={styles.input}
            type="text"
            name="suffix"
            value={suffix}
            maxLength={40}
            autoComplete="off"
            spellCheck={false}
            translate="no"
            onChange={(event) => setSuffix(event.target.value)}
          />
        </label>
      </div>

      <div className={styles.output}>
        <div className={styles.row}>
          <span className={styles.rowLabel}>Class attribute</span>
          <code className={styles.attribute} translate="no">
            class=&quot;
            <Visible text={value} />
            &quot;
          </code>
        </div>

        {[
          { label: "Your browser’s classList", tokens: browser },
          { label: "JavaScript /\\s+/ split", tokens: split },
        ].map((parser) => (
          <div key={parser.label} className={styles.row}>
            <span className={styles.rowLabel}>
              {parser.label}
              <span className={styles.count}>
                {parser.tokens.length} {parser.tokens.length === 1 ? "class" : "classes"}
              </span>
            </span>
            <ul role="list" className={styles.tokens} translate="no">
              {parser.tokens.map((token, index) => (
                <li key={`${token}-${index}`} className={styles.token} data-crossed={(parser.tokens === split && injected.includes(token)) || undefined}>
                  <Visible text={token} />
                </li>
              ))}
            </ul>
          </div>
        ))}

        <p className={styles.verdict} aria-live="polite">
          {verdict(separator, suffix, browser, split, injected)}
        </p>
      </div>
    </section>
  );
}
