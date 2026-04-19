import Link from "next/link";
import { Suspense } from "react";
import { searchNotes } from "@/lib/notes-supabase";
import { vaultPathToHref } from "@/lib/vault-note";

/**
 * /search — Supabase FTS 기반 전체 노트 검색 (Sprint 3.3).
 *
 * Query는 to_tsquery('simple', …) plain mode. 한글+영문 혼용이라 stemmer
 * 없이 토큰 일치. 짧은 한 글자 쿼리는 FTS가 매칭 못 하는 경우가 있어
 * 2자 미만은 안내 메시지만 표시.
 *
 * 결과는 body_md 하이라이트 없이 summary/excerpt만 — 진짜 하이라이트는
 * PG `ts_headline()` RPC 도입 시 추가 (후속).
 */

export const metadata = {
  title: "Search | minhanr.dev",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

async function SearchResults({ q }: { q: string }) {
  if (q.trim().length < 2) {
    return (
      <p className="text-sm text-muted-foreground">
        두 글자 이상 입력해 주세요.
      </p>
    );
  }
  const { notes, total } = await searchNotes(q, { limit: 60 });
  return (
    <div className="space-y-4">
      <p className="font-technical text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        {total.toLocaleString()}건 매칭 · "{q}"
      </p>
      {notes.length === 0 ? (
        <p className="text-sm text-muted-foreground">결과 없음</p>
      ) : (
        <ul className="space-y-1">
          {notes.map((n) => {
            const tags = n.tags ?? [];
            const status =
              n.maturity ?? n.workflow ?? n.publish ?? n.type ?? null;
            return (
              <li key={n.path}>
                <Link
                  href={vaultPathToHref(n.path)}
                  className="group flex items-start gap-4 py-3 border-b border-[var(--hairline)] transition-colors hover:border-primary/30"
                >
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        {n.title ?? n.path}
                      </span>
                      {status && (
                        <span className="font-technical text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground/70">
                          {status}
                        </span>
                      )}
                      {n.created && (
                        <time className="font-mono text-[10px] text-muted-foreground/60 tabular-nums">
                          {n.created}
                        </time>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground/80 line-clamp-2">
                      {n.summary || n.excerpt || n.path}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap text-[10px] text-muted-foreground/70 font-mono">
                      <span className="truncate">{n.path}</span>
                      {tags.slice(0, 5).map((t) => (
                        <span
                          key={t}
                          className="bg-muted/40 rounded px-1 py-0.5"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default async function SearchPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  return (
    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 py-8 space-y-6">
      <div className="space-y-1">
        <p className="font-technical text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">
          Search · FTS
        </p>
        <h1 className="text-2xl font-bold tracking-tight">노트 전체 검색</h1>
        <p className="text-sm text-muted-foreground">
          제목·요약·본문 대상. Supabase tsvector(simple) 기반.
        </p>
      </div>

      <form method="GET" className="flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="키워드 입력 후 Enter…"
          autoFocus
          className="flex-1 rounded-sm border border-[var(--hairline)] bg-card/40 px-3 py-2 text-sm outline-none focus:border-primary/50"
        />
        <button
          type="submit"
          className="font-technical rounded-sm bg-primary px-4 py-2 text-[12px] uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-primary/90"
        >
          검색
        </button>
      </form>

      {q && (
        <Suspense
          fallback={
            <div className="h-32 skeleton-shimmer rounded-sm bg-muted/40" />
          }
        >
          <SearchResults q={q} />
        </Suspense>
      )}
    </div>
  );
}
