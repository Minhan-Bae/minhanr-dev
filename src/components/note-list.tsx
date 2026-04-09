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
            return (
              <li key={n.path}>
                <Card className="h-full transition-colors hover:border-primary/40">
                  <CardContent className="py-3 space-y-2">
                    <Link
                      href={href}
                      className="block font-medium text-sm leading-tight line-clamp-2 hover:underline"
                    >
                      {n.title}
                    </Link>
                    <p className="text-[10px] text-muted-foreground truncate">{n.path}</p>
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                      {n.status && (
                        <Badge variant="outline" className="font-normal">
                          {n.status}
                        </Badge>
                      )}
                      {n.created && (
                        <span className="text-muted-foreground tabular-nums">
                          {n.created}
                        </span>
                      )}
                      {Array.isArray(n.tags) &&
                        n.tags.slice(0, 3).map((t) => (
                          <Badge key={t} variant="outline" className="font-normal text-[9px]">
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
      <div className="flex items-center justify-between">
        {prevHref ? (
          <Link href={prevHref} className="text-xs underline">
            ← 이전
          </Link>
        ) : (
          <span />
        )}
        {nextHref ? (
          <Link href={nextHref} className="text-xs underline">
            다음 →
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
