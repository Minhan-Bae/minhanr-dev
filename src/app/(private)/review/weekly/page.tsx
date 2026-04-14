import { Suspense } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCachedVaultIndex } from "@/lib/vault-index";
import { VaultUnreachablePrivate } from "@/components/vault-unreachable";
import { WeeklyReviewForm } from "@/components/weekly-review-form";
import { vaultPathToHref } from "@/lib/vault-note";
import { isoWeek, isoWeekMonday, todayKstDate } from "@/lib/time";

export const metadata = {
  title: "Weekly Review | minhanr.dev",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

function addDays(iso: string, n: number): string {
  const d = new Date(iso + "T00:00:00+09:00");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().split("T")[0];
}

async function WeeklyReviewContent() {
  let index;
  try {
    index = await getCachedVaultIndex();
  } catch (e) {
    return <VaultUnreachablePrivate error={e} />;
  }

  const today = todayKstDate();
  const week = isoWeek(today);
  const monday = isoWeekMonday(today);
  const sunday = addDays(monday, 6);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(monday, i));

  // Aggregations from vault index (cheap, no GitHub reads beyond the cached index)
  const dailyFilled: string[] = [];
  let publishedCount = 0;
  const publishedList: Array<{ path: string; title: string; created: string }> = [];
  const slipped: Array<{ path: string; title: string; deadline: string; status?: string }> = [];

  for (const [path, rec] of Object.entries(index.notes || {})) {
    // Daily fill
    const dailyMatch = /^010_Daily\/(\d{4}-\d{2}-\d{2})\.md$/.exec(path);
    if (dailyMatch && weekDays.includes(dailyMatch[1])) {
      dailyFilled.push(dailyMatch[1]);
    }
    const created = typeof rec.created === "string" ? rec.created : "";
    if (rec.status === "published" && created >= monday && created <= sunday) {
      publishedCount += 1;
      publishedList.push({
        path,
        title: (path.split("/").pop() || path).replace(/\.md$/, ""),
        created,
      });
    }
    const dl = typeof rec.deadline === "string" ? rec.deadline : "";
    if (/^\d{4}-\d{2}-\d{2}/.test(dl) && dl >= monday && dl <= sunday) {
      // Slipped = deadline landed in this week AND status is not done-like
      const st = typeof rec.status === "string" ? rec.status : "";
      if (!["published", "archived", "completed", "done"].includes(st)) {
        slipped.push({
          path,
          title: (path.split("/").pop() || path).replace(/\.md$/, ""),
          deadline: dl,
          status: st || undefined,
        });
      }
    }
  }

  publishedList.sort((a, b) => b.created.localeCompare(a.created));
  slipped.sort((a, b) => a.deadline.localeCompare(b.deadline));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider">
              데일리 채움
            </CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {dailyFilled.length}
              <span className="text-sm text-muted-foreground"> / 7</span>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider">
              발행
            </CardDescription>
            <CardTitle className="text-2xl tabular-nums">{publishedCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider">
              슬립된 마감
            </CardDescription>
            <CardTitle className={`text-2xl tabular-nums ${slipped.length > 0 ? "text-destructive" : ""}`}>
              {slipped.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider">
              기간
            </CardDescription>
            <CardTitle className="text-sm tabular-nums pt-1">
              {monday} ~ {sunday}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <WeeklyReviewForm week={week} monday={monday} />

      {(publishedList.length > 0 || slipped.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {publishedList.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">발행한 것</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5 text-sm">
                  {publishedList.map((p) => (
                    <li key={p.path} className="flex items-center justify-between gap-2">
                      <Link
                        href={vaultPathToHref(p.path)}
                        className="truncate hover:text-primary transition-colors"
                      >
                        {p.title.replace(/_/g, " ")}
                      </Link>
                      <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                        {p.created}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          {slipped.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">슬립된 마감</CardTitle>
                <CardDescription className="text-xs">이번 주로 잡혔던 것 중 아직 미완</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5 text-sm">
                  {slipped.map((s) => (
                    <li key={s.path} className="flex items-center justify-between gap-2">
                      <Link
                        href={vaultPathToHref(s.path)}
                        className="truncate hover:text-primary transition-colors"
                      >
                        {s.title.replace(/_/g, " ")}
                      </Link>
                      <div className="flex items-center gap-1.5 shrink-0 text-xs">
                        {s.status && (
                          <Badge variant="outline" className="font-normal">
                            {s.status}
                          </Badge>
                        )}
                        <span className="text-muted-foreground tabular-nums">{s.deadline}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

export default function WeeklyReviewPage() {
  const today = todayKstDate();
  const week = isoWeek(today);
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Weekly Review</h1>
        <p className="text-sm text-muted-foreground">
          {week} · 5분 회고로 다음 주의 anchor 를 고른다
        </p>
      </div>
      <Suspense fallback={<div className="h-40 skeleton-shimmer rounded-lg bg-muted" />}>
        <WeeklyReviewContent />
      </Suspense>
    </div>
  );
}
