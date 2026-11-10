import NextLink, { type LinkProps } from "next/link";

const BOUNDARY = ["boundary"];

/**
 * next/link with the publication's route transition. Navigations are tagged
 * with the "boundary" transition type, which <PageTransition> animates as a
 * diagonal wipe. Browser back/forward carry no type and stay instant, so the
 * wipe never fights native swipe gestures. Typed routes are preserved.
 */
export function Link<RouteType>({ transitionTypes = BOUNDARY, ...props }: LinkProps<RouteType>) {
  return <NextLink {...props} transitionTypes={transitionTypes} />;
}
