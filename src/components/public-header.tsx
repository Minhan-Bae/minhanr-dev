"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeSwitcher } from "@/components/theme-switcher";

type NavLink = { href: string; label: string };

// URL paths stay stable (SEO, inbound links). Labels are Korean-first.
const STATIC_NAV: NavLink[] = [
  { href: "/work", label: "작업" },
  { href: "/blog", label: "글" },
  { href: "/about", label: "소개" },
];

interface PublicHeaderProps {
  /**
   * Server-resolved auth state. Drives the trailing nav item:
   * - true  → "스튜디오" (links directly to /dashboard)
   * - false → "로그인"   (links to /login so the owner can sign in
   *                      without typing the URL by hand)
   */
  isAuthenticated: boolean;
}

export function PublicHeader({ isAuthenticated }: PublicHeaderProps) {
  const pathname = usePathname() ?? "/";

  // Always surface a way to reach the authenticated surface — without it
  // signing in requires memorising /login. Labelled softly.
  const trailing: NavLink = isAuthenticated
    ? { href: "/dashboard", label: "스튜디오" }
    : { href: "/login", label: "로그인" };

  const navLinks: NavLink[] = [...STATIC_NAV, trailing];

  return (
    <header className="sticky top-0 z-30 glass font-technical">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6 sm:px-10">
        {/* Wordmark — serif, always a link home. Korean reads first,
            Latin wordmark sits as a quiet subtitle. */}
        <Link
          href="/"
          aria-label="홈"
          className="group flex items-baseline gap-2 tap-scale"
        >
          <span className="font-display text-xl sm:text-2xl tracking-tight leading-none transition-colors group-hover:text-primary">
            배민한
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
