import { Header } from "@/components/Header";
import { FloatingMenu } from "@/components/FloatingMenu";
import { UIProvider } from "@/contexts/UIContext";
import { Toaster } from "sonner";
import "./globals.css";
import type { Metadata, Viewport } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://exigent07.com";

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Exigent07 | Security Research & CTF Writeups",
    template: "%s | Exigent07",
  },
  description:
    "I'm Aravindh. I kind of hate security, but it pays well, so here I am — doing CTFs, finding bugs, and sharing whatever I learn along the way.",
  icons: {
    icon: [
      { url: "/icon.png", sizes: "64x64", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "Exigent07 Security Blog",
    title: "Exigent07 | Security Research",
    description:
      "Security research, CTF writeups, and web exploitation techniques.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Exigent07 Security Research",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Exigent07 | Security Research",
    description: "Web exploitation, CTF writeups, and security research.",
    creator: "@Exigent07",
    images: ["/og-image.png"],
  },

  manifest: "/site.webmanifest",

  other: {
    "apple-touch-icon": "/apple-touch-icon.png",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-black min-h-screen text-white antialiased selection:bg-purple-500/30 selection:text-purple-200">
        <UIProvider>
          <Header />
          <main className="relative min-h-screen">{children}</main>
          <FloatingMenu />
          <Toaster position="top-right" closeButton theme="dark" />
        </UIProvider>
      </body>
    </html>
  );
}
