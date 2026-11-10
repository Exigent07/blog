import type { Metadata } from "next";
import { Author } from "@/components/home/author/Author";
import { Hero } from "@/components/home/hero/Hero";
import { ResearchIndex } from "@/components/home/index/ResearchIndex";
import { Method } from "@/components/home/method/Method";
import { Seam } from "@/components/home/Seam";
import { SelectedResearch } from "@/components/home/selected/SelectedResearch";
import { PageTransition } from "@/components/navigation/PageTransition";
import { getAllResearch, getEditorial } from "@/lib/content/research";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": [{ url: "/feed.xml", title: `${site.name} research` }] },
  },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_US",
    url: "/",
    title: site.title,
    description: site.description,
  },
};

export default async function HomePage() {
  const [{ selected }, research] = await Promise.all([getEditorial(), getAllResearch()]);
  return (
    <PageTransition>
      <Hero />
      <SelectedResearch entries={selected} />
      <Seam />
      <Method research={research} />
      <ResearchIndex research={research} />
      <Author />
    </PageTransition>
  );
}
