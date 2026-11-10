/**
 * The desktop stage: wide screens at a landscape aspect, where the hero and
 * the chrome use the reference's own geometry (tokens.css declares the same
 * query for --u, --stage-x and --stage-y).
 */
export const STAGE_QUERY = "(min-width: 64rem) and (min-aspect-ratio: 7/5)";

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
