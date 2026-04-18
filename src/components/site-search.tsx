"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search as SearchIcon } from "lucide-react";

/**
 * Site-wide search overlay. Matches posts by substring across title
 * (score +10), tags (+4) and summary (+1). Up to 10 results. Empty
 * query shows the 8 most-recent posts as a zero-effort launch surface.
 *
 * Opens via:
 *   • ⌘K / Ctrl+K (most OS-native shortcut)
 *   • `/` key when no input is focused (vim/gmail convention)
 *   • `window.dispatchEvent(new Event("site-search-open"))` from any
 *     UI button (e.g. the dock search pill)
 * Closes via: Escape, backdrop click, or post selection.
 *
 * Keyboard in the open state: ↑↓ navigate, Enter opens, Esc closes.
 */

export interface SiteSearchItem {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  summary: string;
}

const OPEN_EVENT = "site-search-open";

export function openSiteSearch() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(OPEN_EVENT));
  }
}

export function SiteSearch({ items }: { items: SiteSearchItem[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setSelected(0);
  }, []);

  // Global shortcuts + custom open event
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const cmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
      if (cmdK) {
        e.preventDefault();
        setOpen((o) => !o);
        return;
      }
      const slash =
        e.key === "/" &&
        !(e.target as HTMLElement | null)?.matches(
          "input,textarea,[contenteditable='true']"
        );
      if (slash) {
        e.preventDefault();
        setOpen(true);
      }
    }
    function onCustomOpen() {
      setOpen(true);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_EVENT, onCustomOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_EVENT, onCustomOpen);
    };
  }, []);

  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items.slice(0, 8);
    const scored: Array<{ item: SiteSearchItem; score: number }> = [];
    for (const item of items) {
      const title = item.title.toLowerCase();
      const tags = item.tags.join(" ").toLowerCase();
      const summary = (item.summary ?? "").toLowerCase();
      let score = 0;
      if (title.includes(q)) score += 10;
      if (tags.includes(q)) score += 4;
      if (summary.includes(q)) score += 1;
      if (score > 0) scored.push({ item, score });
    }
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 10).map((x) => x.item);
  }, [items, query]);

  useEffect(() => {
    setSelected(0);
  }, [query]);

  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      close();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, Math.max(results.length - 1, 0)));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    }
    if (e.key === "Enter") {
      const target = results[selected];
      if (target) {
        close();
        router.push(`/blog/${target.slug}`);
      }
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/55 backdrop-blur-sm pt-[12vh]"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      <div
        className="mx-4 w-full max-w-xl overflow-hidden rounded-sm border border-[var(--hairline)] bg-[var(--card)]/96 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.7)]"
        onClick={(e) => e.stopPropagation()}
      >
        <label className="flex items-center gap-2 border-b border-[var(--hairline)] px-3">
          <SearchIcon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder="제목 · 태그 · 요약 검색…"
            aria-label="노트 검색"
            className="w-full border-0 bg-transparent py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <kbd className="font-technical hidden shrink-0 rounded-sm border border-[var(--hairline)] bg-[var(--surface-2)] px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground sm:inline-block">
            Esc
          </kbd>
        </label>

        <ul className="max-h-[54vh] overflow-y-auto py-1" role="listbox">
          {results.length === 0 ? (
            <li className="px-4 py-6 text-center text-xs text-muted-foreground">
              결과 없음 · 다른 키워드를 시도해 보세요
            </li>
          ) : (
            results.map((r, i) => {
              const active = i === selected;
              return (
                <li
                  key={r.slug}
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    close();
                    router.push(`/blog/${r.slug}`);
                  }}
                  onMouseEnter={() => setSelected(i)}
                  className={`cursor-pointer px-4 py-2 transition-colors ${
                    active ? "bg-[var(--primary)]/12" : ""
                  }`}
                >
                  <div className="font-technical flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    <span className="tabular-nums">{r.date}</span>
                    {r.tags.slice(0, 2).map((t) => (
                      <span key={t} className="before:mr-2 before:content-['·']">
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="line-clamp-1 text-sm text-foreground">{r.title}</div>
                  {r.summary && (
                    <div className="mt-0.5 line-clamp-1 text-[11.5px] text-muted-foreground">
                      {r.summary}
                    </div>
                  )}
                </li>
              );
            })
          )}
        </ul>

        <div className="font-technical flex items-center justify-between border-t border-[var(--hairline)] px-4 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          <span>↑↓ 선택 · ⏎ 열기 · esc 닫기</span>
          <span>
            {query.trim() && results.length > 0
              ? `${results.length} match${results.length === 1 ? "" : "es"}`
              : "recent"}
          </span>
        </div>
      </div>
    </div>
  );
}
