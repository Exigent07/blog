/** Width of `text` in em, without letter spacing. */
export type Measure = (text: string) => number;

/**
 * Advance widths read from a TrueType font's `cmap` (format 4) and `hmtx`
 * tables, so a card's geometry can be computed before Satori draws it.
 * Kerning is ignored: in Host Grotesk it only ever tightens a line (by at
 * most 2% on real titles), so these widths are safe upper bounds.
 */
export function createMeasure(font: Uint8Array): Measure {
  const view = new DataView(font.buffer, font.byteOffset, font.byteLength);
  const u16 = (offset: number) => view.getUint16(offset);
  const i16 = (offset: number) => view.getInt16(offset);
  const u32 = (offset: number) => view.getUint32(offset);

  const tables = new Map<string, number>();
  for (let index = 0; index < u16(4); index++) {
    const record = 12 + index * 16;
    tables.set(String.fromCharCode(...font.subarray(record, record + 4)), u32(record + 8));
  }
  const table = (tag: string) => {
    const offset = tables.get(tag);
    if (offset === undefined) throw new Error(`Font has no "${tag}" table`);
    return offset;
  };

  const unitsPerEm = u16(table("head") + 18);
  const longMetrics = u16(table("hhea") + 34);
  const hmtx = table("hmtx");

  // The Windows Unicode BMP subtable (platform 3, encoding 1).
  const cmap = table("cmap");
  let subtable = -1;
  for (let index = 0; index < u16(cmap + 2); index++) {
    const record = cmap + 4 + index * 8;
    if (u16(record) === 3 && u16(record + 2) === 1) subtable = cmap + u32(record + 4);
  }
  if (subtable < 0 || u16(subtable) !== 4) throw new Error("Font has no format 4 Unicode cmap");

  const segments = u16(subtable + 6) / 2;
  const endCodes = subtable + 14;
  const startCodes = endCodes + segments * 2 + 2;
  const deltas = startCodes + segments * 2;
  const rangeOffsets = deltas + segments * 2;

  const glyphIndex = (codePoint: number) => {
    for (let segment = 0; segment < segments; segment++) {
      if (codePoint > u16(endCodes + segment * 2)) continue;
      const start = u16(startCodes + segment * 2);
      if (codePoint < start) return 0;
      const delta = i16(deltas + segment * 2);
      const rangeOffset = u16(rangeOffsets + segment * 2);
      if (rangeOffset === 0) return (codePoint + delta) & 0xffff;
      const glyph = u16(rangeOffsets + segment * 2 + rangeOffset + (codePoint - start) * 2);
      return glyph === 0 ? 0 : (glyph + delta) & 0xffff;
    }
    return 0;
  };

  const advance = (glyph: number) => u16(hmtx + 4 * Math.min(glyph, longMetrics - 1));

  return (text) =>
    Array.from(text).reduce((sum, char) => sum + advance(glyphIndex(char.codePointAt(0) ?? 0)), 0) / unitsPerEm;
}
