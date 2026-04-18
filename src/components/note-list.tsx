import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { VaultNote } from "@/lib/vault-index";
import { vaultPathToHref } from "@/lib/vault-note";

export interface NoteListProps {
  notes: VaultNote[];
  total: number;
  page: number;
  pageSize: number;
  baseHref: string;
  searchParams: Record<string, string | number | undefined>;
}

function buildHref(base: string, params: Record<string, string | number | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    sp.set(k, String(v));
  }
  const qs = sp.toString();
  return qs ? `${base}?${qs}` : base;
}

const STATUS_COLORS: Record<string, string> = {
  seed: "bg-chart-4/15 text-chart-4 border-chart-4/30",
  growing: "bg-chart-1/15 text-chart-1 border-chart-1/30",
  mature: "bg-primary/15 text-primary border-primary/30",
  active: "bg-chart-3/15 text-chart-3 border-chart-3/30",
  _default: "bg-muted/15 text-muted-foreground border-border/30",
};

// Active Grid (2026 Bento 진화형): 상태별 좌측 accent stripe + hover 시 excerpt 줄 확장.
const STATUS_ACCENT: Record<string, string> = {
  seed: "before:bg-chart-4",
  growing: "before:bg-chart-1",
  mature: "before:bg-primary",
  active: "before:bg-chart-3",
  _default: "before:bg-border",
};

export function NoteList({ notes, total, page, pageSize, baseHref, searchParams }: NoteListProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const prevHref = page > 1 ? buildHref(baseHref, { ...searchParams, page: page - 1 }) : null;
  const nextHref = page < totalPages ? buildHref(baseHref, { ...searchParams, page: page + 1 }) : null;

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        총 {total.toLocaleString()}건 · {page}/{totalPages} 페이지
      </p>
      {notes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            결과 없음
          </CardContent>
        </Card>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 auto-rows-fr">
          {notes.map((n, idx) => {
            const href = vaultPathToHref(n.path);
            const statusKey = n.status || "_default";
            const statusClass = STATUS_COLORS[statusKey] || STATUS_COLORS._default;
            const accentClass = STATUS_ACCENT[statusKey] || STATUS_ACCENT._default;
            // 첫 번째 카드 = featured: 2-span on lg, 더 큰 타이포, excerpt 항상 표시
            const featured = idx === 0 && page === 1;
            return (
              <li key={n.path} className={featured ? "sm:col-span-2 lg:col-span-2" : ""}>
                <Card
                  className={`group h-full relative overflow-hidden hover-lift transition-[border-color,background-color] duration-[var(--duration-quick)] hover:border-primary/50 hover:bg-[var(--surface-1)] before:absolute before:left-0 before:top-0 before:h-full before:w-[3px] before:transition-opacity before:duration-[var(--duration-quick)] before:opacity-60 group-hover:before:opacity-100 ${accentClass}`}
                >
                  <CardContent className={`${featured ? "py-5" : "py-3"} pl-4 space-y-2`}>
                    <Link
                      href={href}
                      className={`block font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors ${featured ? "text-base" : "text-sm"}`}
                    >
                      {n.title}
                    </Link>
                    {typeof n.excerpt === "string" && n.excerpt && (
                      <p className={`text-xs text-muted-foreground/80 leading-relaxed ${featured ? "line-clamp-3" : "line-clamp-2 group-hover:line-clamp-4 transition-[line-clamp]"}`}>
                        {n.excerpt}
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground/60 truncate font-mono">{n.path}</p>
                    <div className="flex flex-wrap items-center gap-1.5 text-xs pt-1">
                      {n.status && (
                        <Badge
                          variant="outline"
                          className={`font-normal text-xs ${statusClass}`}
                        >
                          {n.status}
                        </Badge>
                      )}
                      {n.created && (
                        <span className="text-muted-foreground tabular-nums text-xs">
                          {n.created}
                        </span>
                      )}
                      {Array.isArray(n.tags) &&
                        n.tags.slice(0, featured ? 5 : 3).map((t) => (
                          <Badge key={t} variant="outline" className="font-normal text-xs">
                            #{t}
                          </Badge>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
      <div className="flex items-center justify-between pt-2">
        {prevHref ? (
          <Link
            href={prevHref}
            className="text-xs px-3 py-1.5 rounded-md border border-border hover:bg-muted/50 hover:border-primary/30 transition-colors"
          >
            ← 이전
          </Link>
        ) : (
          <span />
        )}
        {nextHref ? (
          <Link
            href={nextHref}
            className="text-xs px-3 py-1.5 rounded-md border border-border hover:bg-muted/50 hover:border-primary/30 transition-colors"
          >
            다음 →
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
