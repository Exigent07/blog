/**
 * Whether a view transition (the route wipe) is running. While it runs, the
 * page's content is lifted into the transition: it cannot be hit-tested, and
 * what the reader sees is the transition's snapshots, not the live page.
 * Browsers without view transitions reject the selector: never active there.
 */
export function viewTransitionActive() {
  try {
    return document.documentElement.matches(":active-view-transition");
  } catch {
    return false;
  }
}
