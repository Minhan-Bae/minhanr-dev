import Link from "next/link";
import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TagTopBarChart } from "@/components/charts/tag-top-bar-chart";
import { aggregate, getCachedVaultIndex } from "@/lib/vault-index";

export const metadata = {
  title: "Tags | OIKBAS",
  robots: { index: false, follow: false },
};
export const revalidate = 300;

async function TagsContent() {
  let agg;
  try {
    agg = aggregate(await getCachedVaultIndex());
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
  const top30 = agg.by_tag_top.slice(0, 30);
  const top10 = agg.by_tag_top.slice(0, 10);
  const max = top30[0]?.count || 1;
  const min = top30[top30.length - 1]?.count || 1;

  function fontSize(count: number): string {
    if (max === min) return "text-base";
    const ratio = (count - min) / (max - min);
    if (ratio > 0.8) return "text-2xl";
    if (ratio > 0.6) return "text-xl";
    if (ratio > 0.4) return "text-lg";
    if (ratio > 0.2) return "text-base";
    return "text-sm";
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Tag Cloud (TOP 30)</CardTitle>
          <CardDescription className="text-xs">빈도 비례 폰트</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {top30.map((t) => (
              <Link
                key={t.tag}
                href={`/notes?tag=${encodeURIComponent(t.tag)}`}
                className={`${fontSize(t.count)} text-foreground/80 hover:text-primary transition-colors`}
              >
                #{t.tag}
                <span className="ml-1 text-xs text-muted-foreground tabular-nums">
                  {t.count}
                </span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">TOP 10 막대</CardTitle>
        </CardHeader>
        <CardContent>
          <TagTopBarChart data={top10} />
        </CardContent>
      </Card>
    </>
  );
}

export default function TagsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Tags</h1>
        <p className="text-sm text-muted-foreground">
          전체 노트 태그 클라우드 — 클릭 시 해당 태그로 Notes 필터링
        </p>
      </div>
      <Suspense fallback={<div className="h-40 skeleton-shimmer rounded-lg bg-muted" />}>
        <TagsContent />
      </Suspense>
    </div>
  );
}
