import { Suspense } from "react";
import { getCachedVaultIndex } from "@/lib/vault-index";
import { VaultUnreachablePrivate } from "@/components/vault-unreachable";
import { VaultGraph, type GraphNode, type GraphEdge } from "@/components/vault-graph";
import { deriveNoteTitle } from "@/lib/vault-note";
import { isTier2Path } from "@/lib/vault-tiers";

export const metadata = {
  title: "Graph | minhanr.dev",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

const WIKILINK_RE = /^\[\[([^\]|]+?)(?:\|[^\]]+?)?\]\]$/;

function pathBasename(p: string): string {
  return (p.split("/").pop() ?? p).replace(/\.md$/, "");
}

function parseRelatedEntry(entry: string): string | null {
  const t = entry.trim();
  if (!t) return null;
  const m = t.match(WIKILINK_RE);
  return m ? m[1] : t;
}

async function GraphContent() {
  let index;
  try {
    index = await getCachedVaultIndex();
  } catch (e) {
    return <VaultUnreachablePrivate error={e} />;
  }

  // 1) basename → paths[] 매핑
  const basenameMap = new Map<string, string[]>();
  for (const path of Object.keys(index.notes)) {
    const base = pathBasename(path);
    const list = basenameMap.get(base) ?? [];
    list.push(path);
    basenameMap.set(base, list);
  }

  // 2) edges 수집 (tier-2 노트만)
  type Rec = { related?: unknown; status?: unknown; tags?: unknown };
  const rawEdges: Array<{ from: string; to: string }> = [];
  const degree = new Map<string, number>();
  const bump = (p: string) => degree.set(p, (degree.get(p) ?? 0) + 1);

  for (const [sourcePath, rec] of Object.entries(index.notes)) {
    if (!isTier2Path(sourcePath)) continue;
    const related = (rec as Rec).related;
    const entries: string[] = Array.isArray(related)
      ? (related.filter((r) => typeof r === "string") as string[])
      : typeof related === "string"
        ? [related]
        : [];
    if (!entries.length) continue;
    for (const raw of entries) {
      const basename = parseRelatedEntry(raw);
      if (!basename) continue;
      const targets = basenameMap.get(basename);
      if (!targets) continue;
      for (const targetPath of targets) {
        if (targetPath === sourcePath) continue;
        if (!isTier2Path(targetPath)) continue;
        rawEdges.push({ from: sourcePath, to: targetPath });
        bump(sourcePath);
        bump(targetPath);
      }
    }
  }

  // 3) 상위 N 연결 노드만 선택 (노이즈 감소)
  const TOP_N = 80;
  const topPaths = new Set(
    [...degree.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, TOP_N)
      .map(([p]) => p)
  );

  // 4) 상위 노드만 포함하는 edges
  const edges: GraphEdge[] = rawEdges
    .filter((e) => topPaths.has(e.from) && topPaths.has(e.to))
    .filter((e, i, arr) => arr.findIndex((x) => x.from === e.from && x.to === e.to) === i);

  // 5) Node payload
  const nodes: GraphNode[] = [...topPaths].map((path) => {
    const rec = index.notes[path] as Rec;
    return {
      path,
      title: deriveNoteTitle(path, rec as Record<string, unknown>),
      status: typeof rec?.status === "string" ? rec.status : undefined,
      degree: degree.get(path) ?? 0,
      folder: path.split("/")[0] ?? "other",
    };
  });

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Graph</h1>
        <p className="text-sm text-muted-foreground">
          vault backlink graph — 연결 상위 {nodes.length} 노트, {edges.length} 엣지
        </p>
      </div>
      <VaultGraph nodes={nodes} edges={edges} />
    </div>
  );
}

export default function GraphPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-8">
      <Suspense fallback={<div className="h-[640px] skeleton-shimmer rounded-lg bg-muted" />}>
        <GraphContent />
      </Suspense>
    </div>
  );
}
