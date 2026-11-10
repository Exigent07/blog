import { researchProfiles, site, socialProfiles } from "@/lib/site";
import { RESEARCH_AREAS } from "./facts";

const pageUrl = `${site.url}/about`;

/**
 * schema.org ProfilePage for search engines. The Person carries a stable @id
 * so article pages can reference the same author entity.
 */
const profilePage = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "@id": pageUrl,
  url: pageUrl,
  mainEntity: {
    "@type": "Person",
    "@id": `${pageUrl}#person`,
    name: site.author.name,
    alternateName: [site.author.handle, site.author.alias],
    url: pageUrl,
    email: site.author.email,
    jobTitle: "Independent security researcher",
    knowsAbout: RESEARCH_AREAS,
    sameAs: [...researchProfiles, ...socialProfiles].map((profile) => profile.href),
  },
};

export function ProfileJsonLd() {
  return (
    <script
      type="application/ld+json"
      // `<` is escaped so no value can close the script element (Next.js JSON-LD guide).
      dangerouslySetInnerHTML={{ __html: JSON.stringify(profilePage).replace(/</g, "\\u003c") }}
    />
  );
}
