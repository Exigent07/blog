import type { Metadata } from "next";
import type { ResearchMeta } from "@/lib/content/research";
import { TOPICS } from "@/lib/content/schema";
import { site } from "@/lib/site";

/** Content dates are calendar dates; Open Graph and schema.org want a timestamp with a zone. */
const timestamp = (isoDate: string) => `${isoDate}T00:00:00Z`;

const articleTitle = (research: ResearchMeta) =>
  research.subtitle ? `${research.title}: ${research.subtitle}` : research.title;

const articlePath = (research: ResearchMeta) => `/research/${research.slug}`;

/**
 * Page metadata. Metadata merges shallowly, so every nested object the root
 * layout also sets (alternates, openGraph, twitter) is restated in full.
 * Open Graph images come from the route's opengraph-image file.
 */
export function articleMetadata(research: ResearchMeta): Metadata {
  const title = articleTitle(research);
  const url = articlePath(research);

  return {
    title,
    description: research.summary,
    keywords: research.tags,
    alternates: {
      canonical: url,
      types: { "application/rss+xml": [{ url: "/feed.xml", title: `${site.name} research` }] },
    },
    openGraph: {
      type: "article",
      siteName: site.name,
      locale: "en_US",
      url,
      title,
      description: research.summary,
      publishedTime: timestamp(research.publishedAt),
      modifiedTime: research.updatedAt ? timestamp(research.updatedAt) : undefined,
      authors: [site.author.name],
      tags: research.tags,
      section: TOPICS[research.topic],
    },
    twitter: {
      card: "summary_large_image",
      creator: "@Exigent07",
      title,
      description: research.summary,
    },
  };
}

/** schema.org BlogPosting for the article, with absolute URLs. */
export function articleStructuredData(research: ResearchMeta) {
  const url = `${site.url}${articlePath(research)}`;
  const author = {
    "@type": "Person",
    name: site.author.name,
    alternateName: site.author.handle,
    url: `${site.url}/about`,
  };

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: research.title,
    alternativeHeadline: research.subtitle,
    description: research.summary,
    datePublished: timestamp(research.publishedAt),
    dateModified: timestamp(research.updatedAt ?? research.publishedAt),
    author,
    publisher: author,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    image: `${url}/opengraph-image`,
    keywords: research.tags,
    articleSection: TOPICS[research.topic],
    inLanguage: site.locale,
  };
}
