import type Lenis from "lenis";

/**
 * The element with `id` inside the article that contains `from`. Never a
 * document-wide lookup: Next keeps recently visited routes mounted (hidden),
 * and their ids can repeat this article's.
 */
export function findInArticle(from: Element, id: string) {
  return from.closest("article")?.querySelector<HTMLElement>(`#${CSS.escape(id)}`) ?? null;
}

/**
 * Scrolls to `target` (Lenis when it runs, honouring scroll-margin and the
 * root scroll-padding either way), records it in the URL without adding a
 * history entry, and moves focus there for keyboard and screen reader users.
 */
export function scrollToElement(target: HTMLElement, lenis: Lenis | undefined) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (lenis) {
    lenis.scrollTo(target, { immediate: reduced });
  } else {
    const margin = Number.parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
    const padding = Number.parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY - margin - padding,
      behavior: reduced ? "instant" : "smooth",
    });
  }

  window.history.replaceState(null, "", `#${target.id}`);
  if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
  target.focus({ preventScroll: true });
}
