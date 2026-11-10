import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";
import { parse as parseYaml } from "yaml";

const RESEARCH_DIR = path.join(process.cwd(), "content/research");

/**
 * The published research slugs and the legacy `/posts/<title>` paths that
 * lead to them, read from each article's frontmatter at build time. The proxy
 * (src/proxy.ts) runs before rendering and has no content loader of its own,
 * so it receives them as build-time constants.
 */
function researchRoutes() {
  const slugs: string[] = [];
  const legacyPosts: Record<string, string> = {};
  for (const file of readdirSync(RESEARCH_DIR).filter((name) => /\.mdx?$/.test(name))) {
    const source = readFileSync(path.join(RESEARCH_DIR, file), "utf8");
    const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source)?.[1] ?? "";
    const { legacyPaths = [], draft = false } = (parseYaml(frontmatter) ?? {}) as {
      legacyPaths?: string[];
      draft?: boolean;
    };
    if (draft) continue;
    const slug = path.basename(file, path.extname(file));
    slugs.push(slug);
    for (const legacyPath of legacyPaths) legacyPosts[legacyPath] = slug;
  }
  return { slugs, legacyPosts };
}

const { slugs, legacyPosts } = researchRoutes();

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  typedRoutes: true,
  poweredByHeader: false,
  devIndicators: false,
  env: {
    RESEARCH_SLUGS: JSON.stringify(slugs),
    LEGACY_POSTS: JSON.stringify(legacyPosts),
  },
  async redirects() {
    return [{ source: "/posts", destination: "/research", permanent: true }];
  },
};

export default nextConfig;
