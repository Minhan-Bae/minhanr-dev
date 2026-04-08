import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchVaultIndex } from "@/lib/vault-index";

export const metadata = { title: "Deadlines | OIKBAS" };
export const revalidate = 300;

const VAULT_REPO = "Minhan-Bae/oikbas-vault";

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
    index = await fetchVaultIndex();
  } catch (e) {
    return (
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-destructive text-sm">Vault index 로드 실패</CardTitle>
          <CardDescription>{e instanceof Error ? e.message : String(e)}</CardDescription>
        </CardHeader>
      </Card>
    );
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
              <CardDescription className="text-[11px] uppercase tracking-wider">
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
                    <li key={it.path} className="flex items-start justify-between gap-3 text-sm">
                      <div className="min-w-0 flex-1">
                        <a
                          href={`https://github.com/${VAULT_REPO}/blob/main/${encodeURI(it.path)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium hover:underline"
                        >
                          {it.title}
                        </a>
                        <p className="text-[10px] text-muted-foreground truncate">{it.path}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5 text-[10px]">
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
      <Suspense fallback={<div className="h-40 animate-pulse rounded-lg bg-muted" />}>
        <DeadlinesContent />
      </Suspense>
    </div>
  );
}
