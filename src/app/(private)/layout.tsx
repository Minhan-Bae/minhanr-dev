import Link from "next/link";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { BRAND_IDENTITY } from "@/lib/brand/tokens";

/** Public surfaces the studio visitor can hop to from inside the
 *  workspace. Kept minimal — the sidebar already has every private
 *  destination, so the top bar just links OUT to the public face. */
const PUBLIC_LINKS = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Work" },
  { href: "/blog", label: "Writing" },
  { href: "/about", label: "About" },
];

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
          <nav className="font-technical ml-auto flex items-center gap-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground sm:gap-3">
            {PUBLIC_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-2 py-1 transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
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
