import { getAllResearch, type ResearchMeta } from "@/lib/content/research";
import { KINDS, TOPICS } from "@/lib/content/schema";
import { absoluteUrl, site } from "@/lib/site";

/** Characters XML 1.0 does not allow anywhere; one would make the whole feed unreadable. */
const NOT_XML = /[^\t\n\r -퟿-�\u{10000}-\u{10FFFF}]/gu;
const ENTITIES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" };

const xml = (text: string) => text.replace(NOT_XML, "").replace(/[&<>"']/g, (char) => ENTITIES[char]);

/** RFC 822, as RSS 2.0 requires. Content dates are calendar days, so midnight UTC. */
const rfc822 = (isoDate: string) => new Date(`${isoDate}T00:00:00Z`).toUTCString();

function item(entry: ResearchMeta) {
  const url = absoluteUrl(`/research/${entry.slug}`);
  const title = entry.subtitle ? `${entry.title}: ${entry.subtitle}` : entry.title;
  const categories = new Set([TOPICS[entry.topic], KINDS[entry.kind], ...entry.tags]);

  return [
    "    <item>",
    `      <title>${xml(title)}</title>`,
    `      <link>${xml(url)}</link>`,
    `      <guid isPermaLink="true">${xml(url)}</guid>`,
    `      <pubDate>${rfc822(entry.publishedAt)}</pubDate>`,
    `      <description>${xml(entry.summary)}</description>`,
    ...Array.from(categories, (category) => `      <category>${xml(category)}</category>`),
    "    </item>",
  ].join("\n");
}

/**
 * RSS 2.0 feed of all published research. It is prerendered: content comes
 * only through the cached loaders, and the build date is the newest
 * article's, never the clock's.
 */
export async function GET() {
  const research = await getAllResearch();
  const lastBuild = research
    .map((entry) => entry.updatedAt ?? entry.publishedAt)
    .toSorted()
    .at(-1);

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${xml(site.name)}</title>`,
    `    <link>${xml(absoluteUrl("/"))}</link>`,
    `    <description>${xml(site.description)}</description>`,
    `    <language>${site.locale}</language>`,
    ...(lastBuild ? [`    <lastBuildDate>${rfc822(lastBuild)}</lastBuildDate>`] : []),
    `    <atom:link href="${xml(absoluteUrl("/feed.xml"))}" rel="self" type="application/rss+xml"/>`,
    ...research.map(item),
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");

  return new Response(body, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
