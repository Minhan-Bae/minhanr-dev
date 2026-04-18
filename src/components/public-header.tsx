"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeSwitcher } from "@/components/theme-switcher";

type NavLink = { href: string; label: string };

// URLs stay stable, labels are Korean-first.
const STATIC_NAV: NavLink[] = [
  { href: "/work", label: "작업" },
  { href: "/blog", label: "글" },
  { href: "/about", label: "소개" },
];

interface PublicHeaderProps {
  /**
   * Server-resolved auth state. Drives how the "스튜디오" link is wired:
   *   - authenticated     → /dashboard directly
   *   - not authenticated → /login?next=/dashboard (middleware redirects
   *     on the way back, so the label stays constant and the path is
   *     always reachable).
   */
  isAuthenticated: boolean;
}

export function PublicHeader({ isAuthenticated }: PublicHeaderProps) {
  const pathname = usePathname() ?? "/";

  // The label never changes — "스튜디오" — so the owner always sees a
  // single door. What changes is only the target URL.
  const studio: NavLink = {
    href: isAuthenticated
      ? "/dashboard"
      : "/login?next=%2Fdashboard",
    label: "스튜디오",
  };

  const navLinks: NavLink[] = [...STATIC_NAV, studio];

  return (
    <header className="sticky top-0 z-30 glass font-technical">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6 sm:px-10">
        {/* Wordmark — studio name, lowercase, serif for brand signature.
            The personal name is intentionally absent from public surfaces. */}
        <Link
          href="/"
          aria-label="홈"
          className="group flex items-baseline gap-2 tap-scale"
        >
          <span className="font-display text-2xl tracking-[-0.02em] leading-none transition-colors group-hover:text-primary">
            minhanr
          </span>
          <span className="hidden sm:inline text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            .dev
          </span>
        </Link>

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
