import type { Metadata, Viewport } from "next";
import { Footer } from "@/components/chrome/Footer";
import { Header } from "@/components/chrome/Header";
import { ScrollProgress } from "@/components/chrome/ScrollProgress";
import { SkipLink } from "@/components/chrome/SkipLink";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { SearchDialog } from "@/components/search/SearchDialog";
import { SearchProvider } from "@/components/search/SearchProvider";
import { site, socialProfiles } from "@/lib/site";
import { hostGrotesk, plexMono } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s — ${site.name}` },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.author.name, url: site.url }],
  creator: site.author.name,
  // Canonical URLs are set per page: a layout-level canonical would be
  // inherited by every page that forgets to override it.
  alternates: {
    types: { "application/rss+xml": [{ url: "/feed.xml", title: `${site.name} research` }] },
  },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: site.title,
    description: site.description,
    locale: "en_US",
  },
  twitter: { card: "summary_large_image", creator: socialProfiles.find((profile) => profile.label === "X")?.handle },
};

export const viewport: Viewport = {
  themeColor: "#f8f2f0",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning: the inline script below adds data-js before React hydrates.
    <html lang={site.locale} className={`${hostGrotesk.variable} ${plexMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.dataset.js = ''" }} />
      </head>
      <body>
        <SearchProvider>
          <SkipLink />
          <Header />
          <main id="main" tabIndex={-1}>
            {children}
          </main>
          <Footer />
          <ScrollProgress />
          <SearchDialog />
        </SearchProvider>
        <SmoothScroll />
      </body>
    </html>
  );
}
