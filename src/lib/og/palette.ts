/**
 * Satori cannot read CSS custom properties, so generated images use these
 * mirrors of src/styles/tokens.css. Keep the two in step.
 */
export const palette = {
  paper: "#F8F2F0",
  ink: "#070706",
  graphite: "#66666B",
  rule: "#BDBBBA",
  paperDim: "#A3A09D",
  ruleInk: "#34322F",
  dot: "#FFFFFF",
} as const;

/** The boundary's dx/dy: 46.4° from horizontal (tokens.css --boundary-slope). */
export const BOUNDARY_SLOPE = 0.953;
