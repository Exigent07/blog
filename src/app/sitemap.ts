import type { MetadataRoute } from "next";
import { getAllResearch } from "@/lib/content/research";
import { absoluteUrl } from "@/lib/site";

/**
 * Dates come from the content, never the clock: reading the clock would make
 * this route dynamic, and the dates untrue.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const research = await getAllResearch();
  const modified = research.map((entry) => entry.updatedAt ?? entry.publishedAt);
  // The home page and the archive list every article, so they change when any article does.
  const latest = modified.toSorted().at(-1);

  return [
    { url: absoluteUrl("/"), lastModified: latest },
    { url: absoluteUrl("/research"), lastModified: latest },
    { url: absoluteUrl("/about") },
    ...research.map((entry, index) => ({
      url: absoluteUrl(`/research/${entry.slug}`),
      lastModified: modified[index],
    })),
  ];
}
