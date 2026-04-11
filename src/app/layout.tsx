import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { TooltipProvider } from "@/components/ui/tooltip";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | minhanr.dev",
    default: "Minhan Bae — AI Researcher | minhanr.dev",
  },
  description:
    "AI 연구자 배민한의 기술 블로그 및 프로젝트 포트폴리오",
  metadataBase: new URL("https://minhanr.dev"),
  openGraph: {
    title: "Minhan Bae — AI Researcher",
    description:
      "AI, VFX, Creative Technology 분야의 기술 리서치와 프로젝트 기록",
    url: "https://minhanr.dev",
    siteName: "minhanr.dev",
    type: "website",
    images: [{ url: "/api/og", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Minhan Bae — AI Researcher",
    description:
      "AI, VFX, Creative Technology 분야의 기술 리서치와 프로젝트 기록",
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
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#16132a" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("oikbas-theme");if(t&&["dark","light","gray"].includes(t)){document.documentElement.classList.remove("dark","light","gray");document.documentElement.classList.add(t)}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-full bg-background text-foreground">
        <NuqsAdapter>
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
