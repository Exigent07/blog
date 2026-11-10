import { notFound } from "next/navigation";
import { getAllResearch } from "@/lib/content/research";
import { KINDS, TOPICS } from "@/lib/content/schema";
import { formatShortDate } from "@/lib/format";
import { cardSize, renderCard } from "@/lib/og/card";

export const alt = "The article’s title, kind, topic and publication date on the exigent07 card";
export const size = cardSize;
export const contentType = "image/png";

/** Metadata image routes do not inherit the page's params; without these every card renders per request. */
export async function generateStaticParams() {
  const research = await getAllResearch();
  return research.map(({ slug }) => ({ slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const research = (await getAllResearch()).find((entry) => entry.slug === slug);
  if (!research) notFound();

  return renderCard(
    {
      kicker: { text: KINDS[research.kind], voice: "label" },
      title: research.title,
      tracking: -0.045,
      maxFontSize: 116,
      maxLines: 3,
      crossing: 0.6,
      meta: [
        { label: "Topic", value: TOPICS[research.topic] },
        { label: "Published", value: formatShortDate(research.publishedAt) },
      ],
    },
    { wordmark: true },
  );
}
