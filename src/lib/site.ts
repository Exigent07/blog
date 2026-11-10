/**
 * Site-wide facts. Everything here is verified against the author's own
 * published profiles; do not add claims that are not.
 */
export const site = {
  name: "exigent07",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://exigent07.com",
  locale: "en",
  title: "exigent07 — Independent security research",
  description:
    "Independent security research on browser, web and application boundaries: where untrusted content meets privileged rendering.",
  author: {
    name: "Aravindh",
    handle: "exigent07",
    alias: "ex1g3n7",
    email: "contact@exigent07.com",
  },
} as const;

/** An absolute URL on this site, for documents read off-site: the feed, the sitemap, robots.txt. */
export const absoluteUrl = (path: string) => new URL(path, site.url).href;

export type Profile = {
  label: string;
  href: string;
  handle: string;
};

/** Research platforms, in the order the author lists them. */
export const researchProfiles: readonly Profile[] = [
  {
    label: "Google Bug Hunters",
    href: "https://bughunters.google.com/profile/4721fa3e-45eb-417b-b86b-c7b0961ed033",
    handle: "Exigent07",
  },
  { label: "HackerOne", href: "https://hackerone.com/exigent07", handle: "exigent07" },
  { label: "Bugcrowd", href: "https://bugcrowd.com/h/exigent07", handle: "Exigent07" },
];

export const socialProfiles: readonly Profile[] = [
  { label: "GitHub", href: "https://github.com/Exigent07", handle: "@Exigent07" },
  { label: "X", href: "https://x.com/Exigent07", handle: "@Exigent07" },
  { label: "LinkedIn", href: "https://linkedin.com/in/exigent07", handle: "exigent07" },
  { label: "Bluesky", href: "https://bsky.app/profile/exigent07.bsky.social", handle: "@exigent07.bsky.social" },
];

export const navigation = [
  { href: "/", label: "Home" },
  { href: "/research", label: "Research" },
  { href: "/about", label: "About" },
] as const;
