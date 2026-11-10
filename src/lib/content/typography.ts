const QUOTE_OPENS_AFTER = /[\s([{–—]/u;

/**
 * Straight quotes become curly ones, `...` an ellipsis and a spaced hyphen an
 * en dash. `before` is the character preceding `value` in the running text,
 * which decides whether a quote opens or closes across inline boundaries.
 * Applied to article prose when it compiles, and to titles, subtitles and
 * summaries when they load, so every surface shows the same characters.
 */
export function smartPunctuation(value: string, before = " ") {
  let result = "";
  let previous = before;
  for (const char of value) {
    const opens = QUOTE_OPENS_AFTER.test(previous);
    if (char === '"') result += opens ? "“" : "”";
    else if (char === "'") result += opens ? "‘" : "’";
    else result += char;
    previous = char;
  }
  return result.replace(/\.{3}/g, "…").replace(/(^|\s)--?(?=\s)/g, "$1–");
}
