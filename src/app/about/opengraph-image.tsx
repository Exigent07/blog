import { RECORD_TOTALS } from "@/components/about/facts";
import { cardSize, renderCard } from "@/lib/og/card";
import { site } from "@/lib/site";

export const alt = `About ${site.author.name}, the researcher behind exigent07: accepted reports and programs`;
export const size = cardSize;
export const contentType = "image/png";

/** The About card: the author's name crossing the boundary, with the disclosure record in figures. */
export default function Image() {
  return renderCard(
    {
      kicker: { text: "Independent security researcher", voice: "label" },
      title: site.author.name,
      tracking: -0.045,
      maxFontSize: 200,
      maxLines: 1,
      crossing: 0.62,
      meta: [
        { label: "Handle", value: site.author.handle },
        { label: "Accepted reports", value: String(RECORD_TOTALS.reports) },
        { label: "Programs", value: String(RECORD_TOTALS.programs) },
      ],
    },
    { wordmark: true },
  );
}
