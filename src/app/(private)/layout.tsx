import Link from "next/link";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { BRAND_IDENTITY } from "@/lib/brand/tokens";

/** A single "Home" escape hatch to the public face lives on the far
 *  right of the top bar. The earlier four-link set (Home · Work ·
 *  Writing · About) duplicated the now-simpler public nav that
 *  visitors already know — the public SiteDock shows exactly those
 *  destinations whenever the visitor is out of the studio, so the
 *  private workspace only needs the escape route back. */
const PUBLIC_EXIT = { href: "/", label: "Exit to site" };

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex min-h-svh flex-col">
        <header className="sticky top-0 z-30 flex h-12 shrink-0 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur-md">
          <SidebarTrigger className="-ml-1" />
          <Link
            href="/dashboard"
            className="font-display text-sm tracking-[-0.01em] text-foreground transition-colors hover:text-primary"
          >
            {BRAND_IDENTITY.studio}
            <span className="text-muted-foreground">.dev</span>
          </Link>
          <Link
            href={PUBLIC_EXIT.href}
            className="font-technical ml-auto text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
          >
            {PUBLIC_EXIT.label} →
          </Link>
        </header>
        <main className="flex-1 animate-in fade-in slide-in-from-bottom-2 duration-500">
          {children}
        </main>
        <footer className="border-t border-border/30 px-6 py-2.5 text-center text-xs text-muted-foreground/50">
          minhanr.dev
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
