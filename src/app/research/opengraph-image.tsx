import { getAllResearch } from "@/lib/content/research";
import { formatYearSpan } from "@/lib/format";
import { cardSize, renderCard } from "@/lib/og/card";

export const alt = "The exigent07 research archive card: how many investigations it holds and the years they span";
export const size = cardSize;
export const contentType = "image/png";

/** The archive's card: its name crossing the boundary, with the archive's own figures. */
export default async function Image() {
  const research = await getAllResearch();
  const years = formatYearSpan(research.map((entry) => entry.publishedAt));

  return renderCard(
    {
      kicker: { text: "Research archive", voice: "label" },
      title: "Research",
      tracking: -0.045,
      maxFontSize: 200,
      maxLines: 1,
      crossing: 0.62,
      meta: [
        { label: "Investigations", value: String(research.length) },
        ...(years ? [{ label: "Published", value: years }] : []),
      ],
    },
    { wordmark: true },
  );
}
