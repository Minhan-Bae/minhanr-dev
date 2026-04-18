"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search as SearchIcon } from "lucide-react";
import { VisitorCounter } from "@/components/visitor-counter";
import { AmbientToggle } from "@/components/ambient-audio";
import { openSiteSearch } from "@/components/site-search";

type NavLink = { href: string; label: string };

// The "Work" destination is intentionally not in the dock — the home
// deck already devotes a WorkZigzag slide to every selected case, and
// each row's "Read case" link deep-links into the individual case
// study (/work/[slug]). The /work index page still exists for direct
// URL access + sitemap inclusion, just without a nav pill pointing at
// it. Keeps the dock itself tighter.
const NAV: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Writing" },
  { href: "/about", label: "About" },
  { href: "/studio", label: "Studio" },
];

/**
 * SiteDock — floating bottom-center navigation pill.
 *
 * Replaces the old top-sticky PublicHeader. All primary destinations
 * live in a single glass pill anchored to the bottom of the viewport,
 * alongside the theme switcher, ambient toggle, and a tiny visitor
 * counter — a richer but compact alternative to a footer.
 *
 * Positioned `fixed bottom` so it's reachable on any page without
 * needing a scroll back to the top. z-40 keeps it above content but
 * below modals / slide-deck overlays. On mobile the pill spans the
 * full bleed with generous tap targets.
 */
export function SiteDock() {
  const pathname = usePathname() ?? "/";

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[clamp(84px,10.5vh,128px)] z-40 flex justify-center px-3 sm:px-6">
      <nav
        aria-label="Primary"
        className="pointer-events-auto glass font-technical flex w-full max-w-[720px] items-center gap-1 rounded-full border border-[var(--hairline)] px-1.5 py-1 shadow-[0_16px_42px_-20px_rgba(0,0,0,0.55)] sm:gap-2 sm:px-2 sm:py-1.5"
      >
        <ul className="flex flex-1 items-center justify-between gap-0.5 sm:gap-1">
          {NAV.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <li key={link.href} className="flex-1">
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative block rounded-full px-2.5 py-1.5 text-center text-[11px] uppercase tracking-[0.18em] transition-colors sm:px-3 sm:text-[12px] ${
                    active
                      ? "bg-[var(--surface-2)] text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="mx-1 h-4 w-px bg-[var(--hairline)] sm:mx-2" aria-hidden />
        <div className="flex items-center gap-0.5 sm:gap-1">
          <button
            type="button"
            onClick={openSiteSearch}
            aria-label="Search notes (⌘K)"
            title="Search — ⌘K"
            className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-[var(--surface-2)] hover:text-foreground sm:h-8 sm:w-8"
          >
            <SearchIcon className="h-[14px] w-[14px]" aria-hidden />
          </button>
          <AmbientToggle />
          <VisitorCounter />
        </div>
      </nav>
    </div>
  );
}
