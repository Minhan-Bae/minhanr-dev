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
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {notes.map((n) => {
            const href = vaultPathToHref(n.path);
            const statusClass = n.status ? (STATUS_COLORS[n.status] || STATUS_COLORS._default) : "";
            return (
              <li key={n.path}>
                <Card className="h-full transition-all duration-200 hover:border-primary/40 hover:bg-[var(--surface-1)] card-lift">
                  <CardContent className="py-3 space-y-2">
                    <Link
                      href={href}
                      className="block font-medium text-sm leading-tight line-clamp-2 hover:text-primary transition-colors"
                    >
                      {n.title}
                    </Link>
                    {typeof n.excerpt === "string" && n.excerpt && (
                      <p className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed">
                        {n.excerpt}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground/60 truncate">{n.path}</p>
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
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
                        n.tags.slice(0, 3).map((t) => (
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
