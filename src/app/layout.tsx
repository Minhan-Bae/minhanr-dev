import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TokenUsageIndicator } from "@/components/token-usage-indicator";
import { ThemeSwitcher } from "@/components/theme-switcher";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OIKBAS Command Center | minhanr.dev",
  description:
    "AI 멀티에이전트 오케스트레이션 개인 지식 시스템 대시보드",
  metadataBase: new URL("https://minhanr.dev"),
  openGraph: {
    title: "OIKBAS Command Center",
    description:
      "1인 AI 연구자의 에이전트 오케스트레이션 대시보드 — 수집·수렴·확산 3축 자율 운용",
    url: "https://minhanr.dev",
    siteName: "minhanr.dev",
    type: "website",
    images: [{ url: "/api/og", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "OIKBAS Command Center",
    description:
      "AI 멀티에이전트 오케스트레이션 개인 지식 시스템 대시보드",
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
        <meta name="theme-color" content="#0a0a0a" />
      </head>
      <body className="min-h-full flex flex-col bg-neutral-950 text-neutral-100">
        <header className="border-b border-neutral-800 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold tracking-tight">OIKBAS</span>
            <span className="text-xs text-neutral-500 hidden sm:inline">
              Command Center
            </span>
          </div>
          <nav className="flex items-center gap-4 text-sm text-neutral-400">
            <a href="/" className="hover:text-neutral-100 transition-colors">
              Home
            </a>
            <a
              href="/dashboard"
              className="hover:text-neutral-100 transition-colors"
            >
              Dashboard
            </a>
            <a
              href="/blog"
              className="hover:text-neutral-100 transition-colors"
            >
              Blog
            </a>
            <a
              href="/admin"
              className="hover:text-neutral-100 transition-colors"
            >
              Admin
            </a>
            <div className="w-px h-4 bg-neutral-700" />
            <ThemeSwitcher />
            <div className="w-px h-4 bg-neutral-700" />
            <TokenUsageIndicator />
          </nav>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-neutral-800 px-6 py-3 text-xs text-neutral-600 text-center">
          minhanr.dev &mdash; Powered by TrinityX
        </footer>
      </body>
    </html>
  );
}
