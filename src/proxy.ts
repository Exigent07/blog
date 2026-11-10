import { type NextRequest, NextResponse } from "next/server";

/**
 * Runs before rendering, with the tables next.config.ts reads from the
 * content's frontmatter at build time:
 *
 * - Legacy `/posts/<title>` URLs redirect permanently to their research
 *   pages, however the old site or a sharer encoded the title (encodeURI,
 *   encodeURIComponent, lowercase escapes, letter case).
 * - Unknown `/research/<slug>` paths get the 404 page and status at once,
 *   instead of the article route's instant shell (a 200) and a cache entry
 *   for every arbitrary slug.
 */

const decode = (value: string) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const legacyKey = (pathname: string) => decode(pathname).normalize("NFC").toLowerCase();

const LEGACY_POSTS = new Map(
  Object.entries(JSON.parse(process.env.LEGACY_POSTS ?? "{}") as Record<string, string>).map(
    ([legacyPath, slug]) => [legacyKey(legacyPath), slug],
  ),
);

const RESEARCH_SLUGS = new Set(JSON.parse(process.env.RESEARCH_SLUGS ?? "[]") as string[]);

/** Metadata image routes that live beside the slugs (src/app/research/opengraph-image.tsx). */
const RESEARCH_FILES = new Set(["opengraph-image", "twitter-image"]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/posts/")) {
    const slug = LEGACY_POSTS.get(legacyKey(pathname));
    return slug ? NextResponse.redirect(new URL(`/research/${slug}`, request.url), 308) : NextResponse.next();
  }

  // In development articles come and go without a restart; the page itself still rejects them.
  const slug = decode(pathname.slice("/research/".length));
  if (process.env.NODE_ENV === "production" && !RESEARCH_SLUGS.has(slug) && !RESEARCH_FILES.has(slug)) {
    return NextResponse.rewrite(new URL("/404", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/posts/:title", "/research/:slug"],
};
