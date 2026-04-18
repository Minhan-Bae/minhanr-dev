"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeSwitcher } from "@/components/theme-switcher";

type NavLink = { href: string; label: string };

// URL paths stay stable (SEO, inbound links). Labels carry the editorial
// naming: /blog is displayed as "Writing".
const STATIC_NAV: NavLink[] = [
  { href: "/work", label: "Work" },
  { href: "/blog", label: "Writing" },
  { href: "/about", label: "About" },
];

interface PublicHeaderProps {
  /**
   * Server-resolved auth state. Drives the trailing nav item:
   * - true  → "Studio" (links to /dashboard, owner shortcut)
   * - false → no extra item (visitors never see a login link on public surface)
   */
  isAuthenticated: boolean;
}

export function PublicHeader({ isAuthenticated }: PublicHeaderProps) {
  const pathname = usePathname() ?? "/";

  const navLinks: NavLink[] = isAuthenticated
    ? [...STATIC_NAV, { href: "/dashboard", label: "Studio" }]
    : STATIC_NAV;

  return (
    <header className="sticky top-0 z-30 glass font-technical">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6 sm:px-10">
        {/* Wordmark — serif, always a link home */}
        <Link
          href="/"
          aria-label="Home"
          className="group flex items-baseline gap-2 tap-scale"
        >
          <span className="font-display text-2xl tracking-tight leading-none transition-colors group-hover:text-primary">
            Minhan Bae
          </span>
          <span className="hidden sm:inline text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            minhanr.dev
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-0.5 sm:gap-1">
          {navLinks.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`relative px-3 py-2 text-[13px] tracking-wide transition-colors outline-none focus-visible:text-primary ${
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
                <span
                  aria-hidden
                  className={`pointer-events-none absolute left-3 right-3 bottom-1 h-px origin-left scale-x-0 bg-primary transition-transform duration-300 ${
                    active ? "scale-x-100" : ""
                  }`}
                />
              </Link>
            );
          })}
          <div className="ml-1 sm:ml-2 border-l border-[var(--hairline)] pl-1 sm:pl-2">
            <ThemeSwitcher />
          </div>
        </nav>
      </div>
    </header>
  );
}
