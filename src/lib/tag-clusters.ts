/**
 * 태그 군집 정의 — vault_schema.json#tag_clusters와 동기화.
 *
 * /graph 라우트에서 노드 색상 분류, /tags 라우트에서 군집 헤더 분류,
 * /dashboard 위젯에서 도메인별 그룹 카운트에 사용.
 *
 * SSOT: oikbas-vault/090_System/vault_schema.json
 */

export interface TagCluster {
  id: string;
  label: string;
  color: string;
  tags: readonly string[];
}

export const TAG_CLUSTERS: readonly TagCluster[] = [
  {
    id: "vfx_pipeline",
    label: "VFX 파이프라인",
    color: "#FF6B6B",
    tags: [
      "domain/vfx", "domain/video", "domain/3d", "domain/rendering",
      "domain/inpainting", "domain/color-depth", "domain/diffusion",
      "domain/multimodal", "domain/relighting", "domain/compositing",
      "domain/video-generation", "domain/animation", "domain/character",
      "proj/charactershift", "proj/pathfinder", "proj/colordepth",
    ],
  },
  {
    id: "ai_systems",
    label: "AI 시스템",
    color: "#4ECDC4",
    tags: [
      "domain/llm", "domain/agents", "domain/automation",
      "domain/infrastructure", "domain/governance", "domain/devops",
      "domain/security", "domain/optimization",
      "tech/MCP", "tech/agent", "tech/A2A", "tech/orchestration",
      "proj/trinityx", "proj/minhanr-dev",
    ],
  },
  {
    id: "education",
    label: "교육·소모임",
    color: "#FFE66D",
    tags: ["proj/aix", "domain/career", "domain/culture"],
  },
  {
    id: "grants",
    label: "지원사업",
    color: "#A8E6CF",
    tags: ["proj/ai-champion", "지원사업"],
  },
  {
    id: "personal",
    label: "개인 영역",
    color: "#C7B8EA",
    tags: ["domain/macro", "domain/finance", "domain/health", "domain/hobbies"],
  },
] as const;

const DEFAULT_CLUSTER: TagCluster = {
  id: "other",
  label: "기타",
  color: "#999999",
  tags: [],
};

const TAG_TO_CLUSTER: Map<string, TagCluster> = (() => {
  const m = new Map<string, TagCluster>();
  for (const cluster of TAG_CLUSTERS) {
    for (const tag of cluster.tags) m.set(tag, cluster);
  }
  return m;
})();

/**
 * 태그 1개 → 소속 군집. 매칭 실패 시 기본(기타) 반환.
 */
export function clusterOfTag(tag: string): TagCluster {
  return TAG_TO_CLUSTER.get(tag) ?? DEFAULT_CLUSTER;
}

/**
 * 노트의 태그들 → 가장 강한 군집(가장 많은 태그가 속한 곳).
 * 동률 시 TAG_CLUSTERS 정의 순서 우선.
 */
export function dominantCluster(tags: readonly string[]): TagCluster {
  if (!tags.length) return DEFAULT_CLUSTER;
  const counts = new Map<string, number>();
  for (const t of tags) {
    const c = TAG_TO_CLUSTER.get(t);
    if (c) counts.set(c.id, (counts.get(c.id) || 0) + 1);
  }
  if (counts.size === 0) return DEFAULT_CLUSTER;
  let best: TagCluster = DEFAULT_CLUSTER;
  let bestScore = 0;
  for (const c of TAG_CLUSTERS) {
    const score = counts.get(c.id) || 0;
    if (score > bestScore) {
      best = c;
      bestScore = score;
    }
  }
  return best;
}

/**
 * 태그 네임스페이스 추출 — 정렬·그룹화용.
 */
export function tagNamespace(tag: string): "type" | "domain" | "tech" | "proj" | "other" {
  if (tag.startsWith("domain/")) return "domain";
  if (tag.startsWith("tech/")) return "tech";
  if (tag.startsWith("proj/")) return "proj";
  if (/^[A-Z]/.test(tag)) return "type";
  return "other";
}
