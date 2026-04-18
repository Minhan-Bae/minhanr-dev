"use client";

import { Search as SearchIcon } from "lucide-react";
import { openSiteSearch } from "@/components/site-search";

/**
 * Hero search pill — the Chrome-new-tab-style landing search input,
 * sitting just beneath the MinhanR wordmark. Visually an input but
 * actually a button: clicking opens the site-wide SiteSearch overlay
 * so all typing, keyboard nav, and result rendering live in one place.
 *
 * Same UX as the dock's SearchIcon pill, just foregrounded on the
 * hero so first-time visitors immediately see they can search.
 */
export function HeroSearch() {
  return (
    <div className="mx-auto mt-10 w-full max-w-[520px] px-6 sm:mt-14 sm:px-0">
      <button
        type="button"
        onClick={openSiteSearch}
        aria-label="Search notes — opens ⌘K palette"
        className="group flex w-full items-center gap-3 rounded-full border border-[var(--hairline)] bg-[var(--card)]/70 px-5 py-3 text-left backdrop-blur-sm transition-all hover:border-[var(--primary)]/50 hover:bg-[var(--card)]/88 focus:outline-none focus-visible:border-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--primary)]/30"
      >
        <SearchIcon
          className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
          aria-hidden
        />
        <span className="font-technical flex-1 truncate text-[13px] text-muted-foreground group-hover:text-foreground/80">
          제목 · 태그 · 요약 검색…
        </span>
        <kbd className="font-technical hidden shrink-0 rounded-sm border border-[var(--hairline)] bg-[var(--surface-2)] px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground sm:inline-block">
          ⌘K
        </kbd>
      </button>
    </div>
  );
}
