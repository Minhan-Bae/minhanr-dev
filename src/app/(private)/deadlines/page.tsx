import Link from "next/link";
import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VaultUnreachablePrivate } from "@/components/vault-unreachable";
import { NoteQuickActions } from "@/components/note-quick-actions";
import { getCachedVaultIndex } from "@/lib/vault-index";
import { vaultPathToHref } from "@/lib/vault-note";

export const metadata = {
  title: "Deadlines | minhanr.dev",
  robots: { index: false, follow: false },
};
export const revalidate = 300;

interface DeadlineItem {
  path: string;
  title: string;
  deadline: string;
  status?: string;
  priority?: string;
  bucket: "overdue" | "today" | "this_week" | "later";
}

function deriveTitle(path: string): string {
  return (path.split("/").pop() || path).replace(/\.md$/, "");
}

function bucketize(deadline: string, now: Date): DeadlineItem["bucket"] {
  const d = new Date(deadline);
  if (Number.isNaN(d.getTime())) return "later";
  const day = 24 * 60 * 60 * 1000;
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  if (target < startOfToday) return "overdue";
  if (target === startOfToday) return "today";
  if (target - startOfToday <= 7 * day) return "this_week";
  return "later";
}

async function DeadlinesContent() {
  let index;
  try {
    index = await getCachedVaultIndex();
  } catch (e) {
    return <VaultUnreachablePrivate error={e} />;
  }
  const now = new Date();
  const items: DeadlineItem[] = [];
  for (const [path, rec] of Object.entries(index.notes || {})) {
    const dl = typeof rec.deadline === "string" ? rec.deadline : "";
    if (!/^\d{4}-\d{2}-\d{2}/.test(dl)) continue;
    items.push({
      path,
      title: deriveTitle(path),
      deadline: dl,
      status: typeof rec.status === "string" ? rec.status : undefined,
      priority: typeof rec.priority === "string" ? rec.priority : undefined,
      bucket: bucketize(dl, now),
    });
  }
  items.sort((a, b) => a.deadline.localeCompare(b.deadline));

  const groups: Record<DeadlineItem["bucket"], DeadlineItem[]> = {
    overdue: [],
    today: [],
    this_week: [],
    later: [],
  };
  for (const it of items) groups[it.bucket].push(it);

  const groupOrder: Array<{ key: DeadlineItem["bucket"]; label: string; tone: string }> = [
    { key: "overdue", label: "Overdue", tone: "text-destructive" },
    { key: "today", label: "Today", tone: "text-foreground" },
    { key: "this_week", label: "This week", tone: "text-foreground" },
    { key: "later", label: "Later", tone: "text-muted-foreground" },
  ];

  if (items.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          deadline 필드가 있는 노트가 없다
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {groupOrder.map((g) => (
          <Card key={g.key}>
            <CardContent className="py-4">
              <CardDescription className="text-xs uppercase tracking-wider">
                {g.label}
              </CardDescription>
              <CardTitle className={`mt-1 text-3xl font-bold tabular-nums ${g.tone}`}>
                {groups[g.key].length}
              </CardTitle>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="space-y-4">
        {groupOrder.map((g) => {
          const list = groups[g.key];
          if (list.length === 0) return null;
          return (
            <Card key={g.key}>
              <CardHeader className="pb-2">
                <CardTitle className={`text-sm ${g.tone}`}>{g.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {list.map((it) => (
                    <li key={it.path} className="group flex items-start justify-between gap-3 text-sm py-1.5 px-2 -mx-2 rounded hover:bg-muted/50 transition-colors">
                      <div className="min-w-0 flex-1">
                        <Link
                          href={vaultPathToHref(it.path)}
                          className="font-medium hover:underline"
                        >
                          {it.title}
                        </Link>
                        <p className="text-[10px] text-muted-foreground/70 truncate font-mono">{it.path}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5 text-xs">
                        <NoteQuickActions path={it.path} />
                        {it.priority && (
                          <Badge variant="outline" className="font-normal">
                            {it.priority}
                          </Badge>
                        )}
                        {it.status && (
                          <Badge variant="outline" className="font-normal">
                            {it.status}
                          </Badge>
                        )}
                        <span className="tabular-nums text-muted-foreground">{it.deadline}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}

export default function DeadlinesPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Deadlines</h1>
        <p className="text-sm text-muted-foreground">
          프론트매터 deadline 필드 기반 마감일 트래커
        </p>
      </div>
      <Suspense fallback={<div className="h-40 skeleton-shimmer rounded-lg bg-muted" />}>
        <DeadlinesContent />
      </Suspense>
    </div>
  );
}
