import type { Metadata } from "next";
import { AboutPage } from "@/components/about/AboutPage";
import { RECORD_TOTALS } from "@/components/about/facts";
import { PageTransition } from "@/components/navigation/PageTransition";
import { getAllResearch } from "@/lib/content/research";
import { site } from "@/lib/site";

const description = `${site.author.name} (${site.author.handle}) is an independent security researcher with ${RECORD_TOTALS.reports} accepted reports across ${RECORD_TOTALS.programs} programs: the disclosure record, investigations and contact details.`;

export const metadata: Metadata = {
  title: "About",
  description,
  alternates: {
    canonical: "/about",
    types: { "application/rss+xml": [{ url: "/feed.xml", title: `${site.name} research` }] },
  },
  openGraph: {
    type: "profile",
    siteName: site.name,
    locale: "en_US",
    url: "/about",
    title: `About — ${site.name}`,
    description,
    firstName: site.author.name,
    username: site.author.handle,
  },
};

export default async function About() {
  const research = await getAllResearch();
  return (
    <PageTransition>
      <AboutPage research={research} />
    </PageTransition>
  );
}
