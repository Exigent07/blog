import type { SVGProps } from "react";

/**
 * The `//` mark. Geometry is measured from the reference logo: two
 * parallelogram bars, 31 units tall, leaning 62°, 18 units apart. The same
 * drawing is reused at every size (logo, navigation marker, progress marker),
 * so the slashes stay geometrically identical across the system.
 */
const HEIGHT = 31;
const BAR = 9.5;
const LEAN = 16.5;
const PITCH = 18;
export const SLASH_MARK_RATIO = (LEAN + BAR + PITCH) / HEIGHT;

const bar = (x: number) =>
  `M${x + LEAN} 0H${x + LEAN + BAR}L${x + BAR} ${HEIGHT}H${x}Z`;

export function SlashMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox={`0 0 ${LEAN + BAR + PITCH} ${HEIGHT}`}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d={`${bar(0)}${bar(PITCH)}`} />
    </svg>
  );
}
