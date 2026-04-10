import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
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
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="flex min-h-svh flex-col">
              <header className="flex h-11 shrink-0 items-center gap-2 border-b border-border/50 px-4 bg-background/80 backdrop-blur-sm sticky top-0 z-30">
                <SidebarTrigger className="-ml-1" />
                <div className="flex flex-1 items-center justify-between">
                  <span className="text-sm font-semibold tracking-tight text-foreground/80">
                    OIKBAS
                  </span>
                  <div className="flex items-center gap-2">
                    <kbd className="hidden sm:inline-flex items-center gap-1 rounded-md border border-border/50 bg-muted/30 px-2 py-0.5 text-[10px] text-muted-foreground">
                      <span className="text-xs">⌘</span>K
                    </kbd>
                  </div>
                </div>
              </header>
              <main className="flex-1 animate-in fade-in duration-300">{children}</main>
              <footer className="border-t border-border/30 px-6 py-2.5 text-[11px] text-muted-foreground/50 text-center">
                minhanr.dev · TrinityX v7.0
              </footer>
            </SidebarInset>
          </SidebarProvider>
        </TooltipProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
