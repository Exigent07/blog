import type { Route } from "next";
import { getEditorial } from "@/lib/content/research";
import { KINDS, TOPICS } from "@/lib/content/schema";
import { formatReadingTime, formatShortDate } from "@/lib/format";
import { HeroComposition, type HeroContent } from "./HeroComposition";
import { HeroStage } from "./HeroStage";

/** The homepage's first screen: the editorially featured investigation. */
export async function Hero() {
  const { featured } = await getEditorial();

  const content: HeroContent = {
    href: `/research/${featured.slug}` as Route,
    lines: featured.lines,
    label: "Featured research",
    sublabel: featured.isLatest ? "Latest analysis" : KINDS[featured.kind],
    summary: featured.heroSummary,
    meta: [
      { label: "Topic", value: TOPICS[featured.topic] },
      { label: "Technique", value: featured.technique },
      { label: "Published", value: formatShortDate(featured.publishedAt), dateTime: featured.publishedAt },
      { label: "Read time", value: formatReadingTime(featured.readingMinutes) },
    ],
  };

  const words = featured.lines.flatMap((line) => line.split(" "));

  return (
    <HeroStage
      style={{
        "--lines": featured.lines.length,
        "--words": words.length,
        "--longest-word": Math.max(...words.map((word) => word.length)),
      }}
      paper={<HeroComposition {...content} />}
      ink={<HeroComposition {...content} decorative />}
    />
  );
}
