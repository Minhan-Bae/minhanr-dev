import type { Metadata } from "next";
import { ViewTransition } from "react";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BRAND_IDENTITY } from "@/lib/brand/tokens";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// Editorial display face. One weight — Instrument Serif reads confidently
// at 400 and we never stack it. Pair with `font-style: italic` for a soft
// secondary voice in pull-quotes.
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: `%s — ${BRAND_IDENTITY.domain}`,
    default: `${BRAND_IDENTITY.person} — ${BRAND_IDENTITY.domain}`,
  },
  description: BRAND_IDENTITY.manifesto,
  metadataBase: new URL("https://minhanr.dev"),
  authors: [{ name: BRAND_IDENTITY.person }],
  openGraph: {
    title: `${BRAND_IDENTITY.person} — ${BRAND_IDENTITY.domain}`,
    description: BRAND_IDENTITY.manifesto,
    url: "https://minhanr.dev",
    siteName: BRAND_IDENTITY.domain,
    type: "website",
    images: [{ url: "/api/og", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND_IDENTITY.person} — ${BRAND_IDENTITY.domain}`,
    description: BRAND_IDENTITY.manifesto,
  },
  icons: { icon: "/favicon.ico", apple: "/icon-192.png" },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} dark h-full antialiased`}
    >
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#0e0f14" />
        {/* Performance: pre-establish connections to external hosts */}
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://api.github.com" />
        <link rel="dns-prefetch" href="https://raw.githubusercontent.com" />
        <script
          // Pre-paint theme application + one-shot migration from legacy
          // "oikbas-theme" key to "minhanr-theme" (Tier 0 brand: Minhan Bae,
          // not OIKBAS — see docs/brand-tenets.md).
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var k="minhanr-theme",legacy="oikbas-theme",t=localStorage.getItem(k);if(!t){var old=localStorage.getItem(legacy);if(old){t=old;localStorage.setItem(k,old);localStorage.removeItem(legacy);}}if(t&&["dark","light","gray"].indexOf(t)>=0){document.documentElement.classList.remove("dark","light","gray");document.documentElement.classList.add(t);}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-full bg-background text-foreground">
        <NuqsAdapter>
          <TooltipProvider>
            <ViewTransition>{children}</ViewTransition>
          </TooltipProvider>
        </NuqsAdapter>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
