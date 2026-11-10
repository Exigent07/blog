import type { ThemeRegistration } from "shiki/core";

/**
 * Code is set like a technical book: monochrome on the ink field, with weight
 * and tone instead of colour. Every foreground passes 4.5:1 on #070706.
 */
const tone = {
  text: "#ede6e2",
  strong: "#ffffff",
  soft: "#cbbfb8",
  muted: "#8f8c88",
};

export const inkTheme: ThemeRegistration = {
  name: "exigent-ink",
  type: "dark",
  fg: tone.text,
  bg: "#070706",
  settings: [
    { settings: { foreground: tone.text, background: "#070706" } },
    {
      scope: ["comment", "punctuation.definition.comment", "string.comment"],
      settings: { foreground: tone.muted },
    },
    {
      scope: [
        "keyword",
        "storage",
        "storage.type",
        "entity.name.tag",
        "support.type.property-name",
        "markup.heading",
        "markup.bold",
        "constant.language",
      ],
      settings: { foreground: tone.strong, fontStyle: "bold" },
    },
    {
      scope: ["string", "string.quoted", "attribute-value", "markup.inline.raw", "markup.fenced_code"],
      settings: { foreground: tone.soft },
    },
    {
      scope: ["entity.other.attribute-name", "variable.parameter", "constant.numeric", "constant.character.escape"],
      settings: { foreground: tone.strong },
    },
    {
      scope: ["punctuation", "meta.brace", "punctuation.definition.tag", "keyword.operator"],
      settings: { foreground: tone.muted },
    },
    {
      scope: ["entity.name.function", "support.function", "meta.function-call"],
      settings: { foreground: tone.strong },
    },
  ],
};
