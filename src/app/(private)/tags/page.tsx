import Link from "next/link";
import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TagTopBarChart } from "@/components/charts/tag-top-bar-chart";
import { VaultUnreachablePrivate } from "@/components/vault-unreachable";
import { aggregate, getCachedVaultIndex } from "@/lib/vault-index";
import { TAG_CLUSTERS, clusterOfTag, tagNamespace } from "@/lib/tag-clusters";

export const metadata = {
  title: "Tags | minhanr.dev",
  robots: { index: false, follow: false },
};
export const revalidate = 300;

async function TagsContent() {
  let agg;
  try {
    agg = aggregate(await getCachedVaultIndex());
  } catch (e) {
    return <VaultUnreachablePrivate error={e} />;
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

  // 클러스터별로 묶기 (vault_schema v2.0)
  const tagsByCluster = new Map<string, Array<{ tag: string; count: number }>>();
  for (const t of agg.by_tag_top) {
    const cluster = clusterOfTag(t.tag);
    if (!tagsByCluster.has(cluster.id)) tagsByCluster.set(cluster.id, []);
    tagsByCluster.get(cluster.id)!.push(t);
  }

  // 네임스페이스 분포 (사전 집계 사용)
  const ns = agg.by_tag_namespace || {};
  const totalTagged = Object.values(ns).reduce((a, b) => a + b, 0) || 1;

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">태그 네임스페이스 분포</CardTitle>
          <CardDescription className="text-xs">
            type / domain / tech / proj — vault_schema v2.0
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {(["type", "domain", "tech", "proj", "other"] as const).map((k) => (
              <div key={k} className="space-y-1">
                <div className="text-xs text-muted-foreground capitalize">{k}</div>
                <div className="text-lg font-semibold tabular-nums">{ns[k] ?? 0}</div>
                <div className="text-xs text-muted-foreground tabular-nums">
                  {(((ns[k] ?? 0) / totalTagged) * 100).toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">군집별 태그 (vault_schema clusters)</CardTitle>
          <CardDescription className="text-xs">
            VFX·AI 시스템·교육·지원사업·개인 5개 군집 — 색상 = /graph 노드 색상
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {TAG_CLUSTERS.map((cluster) => {
            const tags = tagsByCluster.get(cluster.id) ?? [];
            if (!tags.length) return null;
            const total = tags.reduce((a, b) => a + b.count, 0);
            return (
              <div key={cluster.id} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ backgroundColor: cluster.color }}
                  />
                  <span className="text-sm font-medium">{cluster.label}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    ({tags.length}종 · 총 {total})
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 pl-5">
                  {tags.map((t) => (
                    <Link
                      key={t.tag}
                      href={`/notes?tag=${encodeURIComponent(t.tag)}`}
                      className="text-sm text-foreground/80 hover:text-primary transition-colors"
                    >
                      #{t.tag}
                      <span className="ml-1 text-xs text-muted-foreground tabular-nums">
                        {t.count}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Tag Cloud (TOP 30)</CardTitle>
          <CardDescription className="text-xs">빈도 비례 폰트 + 네임스페이스 색상</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {top30.map((t) => {
              const ns = tagNamespace(t.tag);
              const colorClass =
                ns === "domain" ? "text-blue-600/80 dark:text-blue-400/80"
                : ns === "tech" ? "text-emerald-600/80 dark:text-emerald-400/80"
                : ns === "proj" ? "text-amber-600/80 dark:text-amber-400/80"
                : ns === "type" ? "text-rose-600/80 dark:text-rose-400/80"
                : "text-foreground/80";
              return (
                <Link
                  key={t.tag}
                  href={`/notes?tag=${encodeURIComponent(t.tag)}`}
                  className={`${fontSize(t.count)} ${colorClass} hover:text-primary transition-colors`}
                >
                  #{t.tag}
                  <span className="ml-1 text-xs text-muted-foreground tabular-nums">
                    {t.count}
                  </span>
                </Link>
              );
            })}
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
          전체 노트 태그 — 클러스터 분류 + 네임스페이스 색상 (vault_schema v2.0)
        </p>
      </div>
      <Suspense fallback={<div className="h-40 skeleton-shimmer rounded-lg bg-muted" />}>
        <TagsContent />
      </Suspense>
    </div>
  );
}
