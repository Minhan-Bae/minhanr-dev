import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
    "AI 에이전트 6대를 오케스트레이션하는 개인 지식 시스템 대시보드",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
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
