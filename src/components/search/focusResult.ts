/** Moves focus to a result link, scrolling it into view only as far as needed. */
export function focusResult(link: HTMLAnchorElement) {
  link.focus({ preventScroll: true });
  link.scrollIntoView({ block: "nearest" });
}
