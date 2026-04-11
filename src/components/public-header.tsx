"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeSwitcher } from "@/components/theme-switcher";

type NavLink = { href: string; label: string };

const STATIC_NAV: NavLink[] = [
  { href: "/blog", label: "Blog" },
  { href: "/papers", label: "Papers" },
  { href: "/projects", label: "Projects" },
];

interface PublicHeaderProps {
  /**
   * Server-resolved auth state. Drives the trailing NAV item:
   * - true  → "Dashboard" (links to /dashboard, owner shortcut)
   * - false → "Login"     (links to /login, avoids dead-end for visitors)
   */
  isAuthenticated: boolean;
}

export function PublicHeader({ isAuthenticated }: PublicHeaderProps) {
  const pathname = usePathname() ?? "/";

  const trailingLink: NavLink = isAuthenticated
    ? { href: "/dashboard", label: "Dashboard" }
    : { href: "/login", label: "Login" };

  const navLinks: NavLink[] = [...STATIC_NAV, trailingLink];

  return (
    <header className="sticky top-0 z-30 border-b border-border/50 bg-background/80 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between">
        <Link
          href="/"
          className="text-sm font-bold tracking-tight hover:text-primary transition-colors"
        >
          <span className="text-primary font-black">M</span>inhanr
        </Link>
        <nav className="flex items-center gap-1">
          {navLinks.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`relative rounded-md px-3 py-1.5 text-sm transition-colors focus-visible:ring-1 focus-visible:ring-primary/40 outline-none ${
                  active
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
                {active && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            );
          })}
          <div className="ml-2 border-l border-border/50 pl-2">
            <ThemeSwitcher />
          </div>
        </nav>
      </div>
    </header>
  );
}
