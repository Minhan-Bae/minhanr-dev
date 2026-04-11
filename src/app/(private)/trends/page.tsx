import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCachedVaultIndex } from "@/lib/vault-index";
import { BoostButton, SuppressButton } from "@/components/trends-actions";

export const metadata = {
  title: "Trends | OIKBAS",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

async function TrendsContent() {
  let index;
  try {
    index = await getCachedVaultIndex();
  } catch {
    return (
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-destructive text-sm">Vault index 로드 실패</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const stats = index._meta?.stats;
  const tagTop = stats?.by_tag_top || [];
  const researchCats = stats?.by_research_category || {};
  const monthCreated = stats?.by_month_created || [];

  // 최근 7일 growing/seed 노트에서 도메인 태그 분포
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weekAgoStr = weekAgo.toISOString().slice(0, 10);

  const recentDomains: Record<string, number> = {};
  const recentSourceTypes: Record<string, number> = {};
  let recentCount = 0;

  for (const [, note] of Object.entries(index.notes)) {
    if (typeof note !== "object" || !note) continue;
    const created = (note.created as string) || "";
    if (created < weekAgoStr) continue;
    recentCount++;

    const tags = Array.isArray(note.tags) ? note.tags : [];
    for (const tag of tags) {
      if (typeof tag === "string" && tag.startsWith("domain/")) {
        recentDomains[tag] = (recentDomains[tag] || 0) + 1;
      }
    }
    const st = (note.source_type as string) || "unknown";
    recentSourceTypes[st] = (recentSourceTypes[st] || 0) + 1;
  }

  const sortedDomains = Object.entries(recentDomains).sort((a, b) => b[1] - a[1]);
  const sortedSourceTypes = Object.entries(recentSourceTypes).sort((a, b) => b[1] - a[1]);
  const sortedResearch = Object.entries(researchCats).sort((a, b) => b[1] - a[1]);

  // 폴더별 최근 수집일 (gap 감지)
  const folderDates: Record<string, string> = {};
  for (const [path, note] of Object.entries(index.notes)) {
    if (typeof note !== "object" || !note) continue;
    const folder = path.split("/").slice(0, 2).join("/");
    const created = (note.created as string) || "";
    if (!folderDates[folder] || created > folderDates[folder]) {
      folderDates[folder] = created;
    }
  }

  const todayStr = now.toISOString().slice(0, 10);
  const gaps: { folder: string; daysSince: number }[] = [];
  for (const [folder, lastDate] of Object.entries(folderDates)) {
    if (!folder.startsWith("040_") && !folder.startsWith("030_")) continue;
    const diff = Math.floor((new Date(todayStr).getTime() - new Date(lastDate).getTime()) / (24 * 60 * 60 * 1000));
    if (diff >= 2) {
      gaps.push({ folder: folder.replace(/^\d+_/, ""), daysSince: diff });
    }
  }
  gaps.sort((a, b) => b.daysSince - a.daysSince);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-t-2 border-t-primary">
          <CardHeader className="pb-2">
            <CardDescription>최근 7일 수집</CardDescription>
            <CardTitle className="text-3xl font-bold tabular-nums">{recentCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-t-2 border-t-chart-3">
          <CardHeader className="pb-2">
            <CardDescription>활성 도메인</CardDescription>
            <CardTitle className="text-3xl font-bold tabular-nums">{sortedDomains.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-t-2 border-t-destructive">
          <CardHeader className="pb-2">
            <CardDescription>수집 갭</CardDescription>
            <CardTitle className="text-3xl font-bold tabular-nums">{gaps.length}개 폴더</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>도메인 분포 (7일)</CardTitle>
            <CardDescription>최근 수집된 노트의 도메인 태그</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sortedDomains.slice(0, 15).map(([domain, count]) => (
                <div key={domain} className="flex items-center justify-between">
                  <span className="text-sm">{domain.replace("domain/", "")}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min(count * 8, 120)}px` }} />
                    <span className="text-xs text-muted-foreground w-6 text-right">{count}</span>
                    <BoostButton target={domain} label="강화" />
                    <SuppressButton target={domain} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Research 카테고리</CardTitle>
            <CardDescription>전체 논문 분포</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sortedResearch.map(([cat, count]) => (
                <div key={cat} className="flex items-center justify-between">
                  <span className="text-sm">{cat}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 rounded-full bg-chart-2" style={{ width: `${Math.min(count * 3, 120)}px` }} />
                    <span className="text-xs text-muted-foreground w-6 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {gaps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>수집 갭 경고</CardTitle>
            <CardDescription>2일 이상 신규 수집이 없는 폴더</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {gaps.map((g) => (
                <div
                  key={g.folder}
                  className={`flex items-center justify-between py-1.5 border-b last:border-0 ${
                    g.daysSince >= 5
                      ? "border-destructive/20 bg-destructive/5 rounded px-2 -mx-2"
                      : g.daysSince >= 3
                        ? "border-chart-4/20"
                        : "border-border"
                  }`}
                >
                  <span className="text-sm">{g.folder}</span>
                  <Badge variant={g.daysSince >= 5 ? "destructive" : "secondary"}>{g.daysSince}일</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>소스 유형 분포 (7일)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {sortedSourceTypes.map(([type, count]) => (
              <Badge key={type} variant="outline" className="text-sm">
                {type}: {count}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>인기 태그 Top 20</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {tagTop.slice(0, 20).map((t) => (
              <Badge key={t.tag} variant="secondary" className="text-sm">
                {t.tag} ({t.count})
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function TrendsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Trends</h1>
      <p className="text-muted-foreground">수집 트렌드 및 방향성 모니터링</p>
      <Suspense fallback={<div className="text-muted-foreground">Loading...</div>}>
        <TrendsContent />
      </Suspense>
    </div>
  );
}
