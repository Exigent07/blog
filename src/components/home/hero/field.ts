/**
 * The dot field inside the ink territory, measured from the reference: a
 * square grid (26u pitch, origin 7u/10u) whose dots brighten in a band that
 * runs parallel to the boundary, roughly 5u–400u inside it, and fades toward
 * the top of the hero. The band is defined relative to the boundary, so it
 * travels with it when the boundary moves.
 */

/** dx/dy of the boundary, and the length factor √(1 + 0.953²). */
const SLOPE = 0.953;
const NORM = Math.hypot(1, SLOPE);
const PITCH = 26;

export type FieldGeometry = {
  width: number;
  height: number;
  dpr: number;
  /** Stage unit in px (1 off-stage). */
  unit: number;
  /** First grid point, in px from the hero's top-left. */
  originX: number;
  originY: number;
  /** Where the boundary meets y = 0, in px. */
  xTop: number;
  /** The dot colour, from the --dot token. */
  color: string;
};

export type FieldPointer = { x: number; y: number } | null;

const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

/** Deterministic per-dot variation in [-1, 1], so the field never shimmers. */
const jitter = (column: number, row: number) => {
  const n = Math.sin(column * 127.1 + row * 311.7) * 43758.5453;
  return (n - Math.floor(n)) * 2 - 1;
};

export function drawField(context: CanvasRenderingContext2D, geometry: FieldGeometry, pointer: FieldPointer) {
  const { width, height, dpr, unit, originX, originY, xTop, color } = geometry;
  const pitch = PITCH * unit;

  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.clearRect(0, 0, width, height);
  context.fillStyle = color;

  // The territory never reaches further left than where the boundary meets the bottom edge.
  const firstColumn = Math.ceil((Math.max(0, xTop - SLOPE * height) - originX) / pitch);
  const lastColumn = Math.floor((width - originX) / pitch);
  const lastRow = Math.floor((height - originY) / pitch);

  for (let row = 0; row <= lastRow; row++) {
    const y = originY + row * pitch;
    const t = y / height;
    // Along the boundary: dim near the top of the hero, full through the middle.
    const along = 0.42 + 0.58 * smoothstep(0.04, 0.36, t) * (1 - 0.3 * smoothstep(0.85, 1, t));

    for (let column = firstColumn; column <= lastColumn; column++) {
      const x = originX + column * pitch;
      // Perpendicular distance into the territory, in stage units.
      const depth = (x - (xTop - SLOPE * y)) / NORM / unit;
      if (depth < 4) continue;

      const across = smoothstep(4, 50, depth) * (1 - smoothstep(210, 370, depth));
      let level = across * along * (1 + 0.14 * jitter(column, row));

      if (pointer) {
        const reach = Math.hypot(x - pointer.x, y - pointer.y) / unit;
        level += 0.45 * (1 - smoothstep(0, 170, reach)) * Math.min(1, depth / 30);
      }

      if (level < 0.04) continue;
      level = Math.min(level, 1);

      context.globalAlpha = 0.1 + 0.9 * level;
      context.beginPath();
      context.arc(x, y, (0.55 + 1.05 * level) * unit, 0, Math.PI * 2);
      context.fill();
    }
  }
  context.globalAlpha = 1;
}
