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
import { ReviewActions } from "@/components/review-actions";

export const metadata = {
  title: "Review | OIKBAS",
  robots: { index: false, follow: false },
};
export const revalidate = 300;

interface PublishCandidate {
  path: string;
  title: string;
  slug: string;
  summary: string;
  created: string;
  sourceType: string;
  confidence?: string;
  coverImage?: string;
}

async function ReviewContent() {
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

  const candidates: PublishCandidate[] = [];
  const published: { path: string; title: string; created: string }[] = [];

  for (const [path, note] of Object.entries(index.notes)) {
    if (typeof note !== "object" || !note) continue;

    if (note.status === "published") {
      published.push({
        path,
        title: note.title || path.split("/").pop()?.replace(/\.md$/, "") || path,
        created: (note.created as string) || "",
      });
    }

    if (note.status !== "mature") continue;
    if (note.source_type === "synthesis") continue;

    const tags = Array.isArray(note.tags) ? note.tags : [];
    if (tags.some((t: string) => ["Career", "Meeting"].includes(t))) continue;

    const content = note as Record<string, unknown>;
    const hasPublishReady = content.publish_ready === true || content.publish_ready === "true";
    const hasPublish = content.publish === true || content.publish === "true";

    if (hasPublishReady || hasPublish) {
      candidates.push({
        path,
        title: (note.title || path.split("/").pop()?.replace(/\.md$/, "") || path).replace(/_/g, " "),
        slug: (content.slug as string) || "",
        summary: (note.summary as string) || (note.excerpt as string) || "",
        created: (note.created as string) || "",
        sourceType: (note.source_type as string) || "",
        confidence: (content.confidence as string) || "",
        coverImage: typeof content.cover === "object" && content.cover
          ? (content.cover as Record<string, unknown>).image as string || ""
          : "",
      });
    }
  }

  candidates.sort((a, b) => b.created.localeCompare(a.created));
  published.sort((a, b) => b.created.localeCompare(a.created));

  const pendingCount = candidates.filter((c) => {
    const note = index.notes[c.path] as Record<string, unknown>;
    return note.publish !== true && note.publish !== "true";
  }).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>발행 대기</CardDescription>
            <CardTitle className="text-2xl">{pendingCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>발행 승인 완료</CardDescription>
            <CardTitle className="text-2xl">{candidates.length - pendingCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>총 발행</CardDescription>
            <CardTitle className="text-2xl">{published.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>발행 후보</CardTitle>
          <CardDescription>{candidates.length}건의 mature 노트가 발행 준비 상태입니다</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {candidates.map((c) => {
              const note = index.notes[c.path] as Record<string, unknown>;
              const isPublished = note.publish === true || note.publish === "true";
              return (
                <div key={c.path} className="flex items-start gap-3 p-3 rounded-lg border border-neutral-800 hover:border-neutral-700 transition-colors">
                  {c.coverImage && !c.coverImage.startsWith("/api/") && (
                    <img src={c.coverImage} alt="" className="w-16 h-16 rounded object-cover shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm truncate">{c.title}</span>
                      <Badge variant={isPublished ? "default" : "secondary"} className="shrink-0 text-xs">
                        {isPublished ? "승인됨" : "대기"}
                      </Badge>
                      {c.sourceType && (
                        <Badge variant="outline" className="shrink-0 text-xs">{c.sourceType}</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{c.summary}</p>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{c.created}</span>
                        {c.slug && <span className="text-neutral-600">/{c.slug}</span>}
                      </div>
                      <ReviewActions path={c.path} isPublished={isPublished} />
                    </div>
                  </div>
                </div>
              );
            })}
            {candidates.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">발행 후보가 없습니다</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>최근 발행</CardTitle>
          <CardDescription>최근 발행된 {Math.min(published.length, 10)}건</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {published.slice(0, 10).map((p) => (
              <div key={p.path} className="flex items-center justify-between py-1.5 border-b border-neutral-800 last:border-0">
                <span className="text-sm truncate">{p.title.replace(/_/g, " ")}</span>
                <span className="text-xs text-muted-foreground shrink-0 ml-2">{p.created}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Review</h1>
      <p className="text-muted-foreground">발행 후보 검토 및 승인 현황</p>
      <Suspense fallback={<div className="text-muted-foreground">Loading...</div>}>
        <ReviewContent />
      </Suspense>
    </div>
  );
}
