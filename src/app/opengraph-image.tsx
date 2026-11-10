import { cardSize, renderCard } from "@/lib/og/card";
import { site } from "@/lib/site";

export const alt = site.title;
export const size = cardSize;
export const contentType = "image/png";

/** The site's card: the wordmark crosses into the ink territory, as it does in the footer. */
export default function Image() {
  return renderCard(
    {
      kicker: { text: "Independent security research", voice: "lead" },
      title: site.name,
      tracking: -0.05,
      maxFontSize: 200,
      maxLines: 1,
      crossing: 0.72,
      meta: [{ label: "Author", value: site.author.name }],
    },
    { wordmark: false },
  );
}
