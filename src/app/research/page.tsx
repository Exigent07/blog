import type { Metadata } from "next";
import { PageTransition } from "@/components/navigation/PageTransition";
import { ResearchArchive } from "@/components/research/ResearchArchive";
import { getAllResearch } from "@/lib/content/research";
import { toSearchEntry } from "@/lib/search";
import { site } from "@/lib/site";

const description =
  "Every investigation published here, newest first: bugs in browser, web and applications, how they were found and how they work.";

export const metadata: Metadata = {
  title: "Research",
  description,
  alternates: {
    canonical: "/research",
    types: { "application/rss+xml": [{ url: "/feed.xml", title: `${site.name} research` }] },
  },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_US",
    url: "/research",
    title: `Research — ${site.name}`,
    description,
  },
};

export default async function ResearchPage() {
  const entries = (await getAllResearch()).map(toSearchEntry);
  return (
    <PageTransition>
      <ResearchArchive entries={entries} description={description} />
    </PageTransition>
  );
}
