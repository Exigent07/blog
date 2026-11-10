import "react";

declare module "react" {
  /** Allow typed CSS custom properties in `style` props. */
  interface CSSProperties {
    [property: `--${string}`]: string | number | undefined;
  }
}
