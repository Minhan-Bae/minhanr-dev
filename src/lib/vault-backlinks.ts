import { unstable_cache } from "next/cache";
import { CACHE_TTL_VAULT } from "./constants";
import { getCachedVaultIndex, type VaultIndexFile } from "./vault-index";
import { isTier2Path } from "./vault-tiers";
import { deriveNoteTitle } from "./vault-note";

/**
 * vault-backlinks.ts — "Links to this note" 데이터 레이어.
 *
 * Andy Matuschak / Maggie Appleton 모델의 시그니처 패턴: 한 노트를 가리키는
 * 다른 노트들의 reverse-link 그래프. PKM-as-brand의 핵심 메커니즘.
 *
 * ## 데이터 소스
 *
 * Layer 1 indexer (oikbas-vault repo)는 현재 본문 wikilink를 추출하지 않는다.
 * 대신 frontmatter `related: [[Title]] | "Title"` 필드만 활용 가능하며,
 * 1071 노트 중 726개 (68%)가 이 필드를 채우고 있다.
 *
 * 본문 wikilink 추출 (나머지 32% 보강)은 Phase F에서 Layer 1 indexer 변경
 * 후에 처리. 그때까지는 `related` field 기반 backlinks로 ship.
 *
 * ## 보안 / Tier 분리
 *
 * Source 노트가 Tier 3 (010_Daily, 030_Areas/034_Finance, 등)이면 backlink로
 * 노출되지 않는다 — 그 노트의 존재 자체가 비공개여야 하기 때문. `isTier2Path`
 * 필터를 vault-tiers.ts에서 import해서 단일 출처로 사용한다 (미들웨어와 동일).
 *
 * ## 캐싱
 *
 * Reverse map은 vault index TTL과 동일한 5분 (CACHE_TTL_VAULT) 단위로 한 번
 * 빌드된다. 노트 페이지 진입마다 N×M traversal 하지 않고, ISR cycle 안에서
 * 한 번 cached graph를 lookup만 한다.
 */

export interface BacklinkRef {
  /** Source 노트 (이 노트가 target을 가리킴)의 vault path */
  path: string;
  /** Source 노트의 표시용 제목 */
  title: string;
  /** Source 노트의 status (growing / mature / published / etc.), 없으면 undefined */
  status?: string;
  /** Source 노트의 created date (ISO 또는 yyyy-mm-dd) */
  created?: string;
  /** Source 노트의 본문 첫 ~240자 (vault index의 excerpt 필드) */
  excerpt?: string;
}

const WIKILINK_RE = /^\[\[([^\]|]+?)(?:\|[^\]]+?)?\]\]$/;

function pathBasename(p: string): string {
  const last = p.split("/").pop() ?? p;
  return last.replace(/\.md$/, "");
}

/**
 * `related` 필드의 한 entry를 정규화. 두 형식 지원:
 *   "[[Note Title]]"  → "Note Title"
 *   "[[Note Title|alias]]" → "Note Title" (alias 무시)
 *   "Note Title" → "Note Title" (plain text도 그대로)
 *
 * 빈 문자열이면 null 반환 (silent skip).
 */
function parseRelatedEntry(entry: string): string | null {
  const trimmed = entry.trim();
  if (trimmed.length === 0) return null;
  const m = trimmed.match(WIKILINK_RE);
  return m ? m[1] : trimmed;
}

/**
 * vault index의 모든 노트 path에서 basename → fullPath[] 매핑을 빌드.
 * 같은 basename을 가진 노트가 여러 폴더에 있을 수 있으므로 array.
 */
function buildBasenameMap(index: VaultIndexFile): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const path of Object.keys(index.notes)) {
    const base = pathBasename(path);
    const list = map.get(base) ?? [];
    list.push(path);
    map.set(base, list);
  }
  return map;
}

/**
 * 전체 vault에서 reverse-link map을 한 번 빌드.
 * Returns: Map<targetPath, BacklinkRef[]>
 *
 * 비용: O(N) where N = total notes (1071). frontmatter `related`만 읽으므로
 * 본문 fetch 없음. 메모리 안에서 map 구축.
 */
async function buildBacklinkGraph(): Promise<Map<string, BacklinkRef[]>> {
  const index = await getCachedVaultIndex();
  const basenameMap = buildBasenameMap(index);
  const graph = new Map<string, BacklinkRef[]>();

  for (const [sourcePath, rec] of Object.entries(index.notes)) {
    // Tier 3 source는 backlink로 노출 금지 (vault-tiers.ts 단일 출처)
    if (!isTier2Path(sourcePath)) continue;
    if (typeof rec !== "object" || rec === null) continue;

    const related = (rec as { related?: unknown }).related;
    const entries: string[] = Array.isArray(related)
      ? related.filter((r): r is string => typeof r === "string")
      : typeof related === "string"
        ? [related]
        : [];

    if (entries.length === 0) continue;

    const ref: BacklinkRef = {
      path: sourcePath,
      title: deriveNoteTitle(sourcePath, rec),
      status:
        typeof (rec as { status?: unknown }).status === "string"
          ? ((rec as { status: string }).status)
          : undefined,
      created:
        typeof (rec as { created?: unknown }).created === "string"
          ? ((rec as { created: string }).created)
          : undefined,
      excerpt:
        typeof (rec as { excerpt?: unknown }).excerpt === "string"
          ? ((rec as { excerpt: string }).excerpt)
          : undefined,
    };

    for (const raw of entries) {
      const basename = parseRelatedEntry(raw);
      if (!basename) continue;
      const targets = basenameMap.get(basename);
      if (!targets) continue; // 매칭 실패 silent skip

      for (const targetPath of targets) {
        // self-reference 방지
        if (targetPath === sourcePath) continue;
        const list = graph.get(targetPath) ?? [];
        // dedupe: 같은 source가 같은 target을 여러 번 가리키면 1번만
        if (!list.some((r) => r.path === ref.path)) {
          list.push(ref);
        }
        graph.set(targetPath, list);
      }
    }
  }
  return graph;
}

/**
 * Cached graph builder. Map은 직렬화 불가능한데 unstable_cache는 직렬화하므로
 * Map 대신 plain object/array 형식으로 cache. 호출 시 Map으로 복원.
 */
const getCachedRawGraph = unstable_cache(
  async (): Promise<Record<string, BacklinkRef[]>> => {
    const map = await buildBacklinkGraph();
    return Object.fromEntries(map.entries());
  },
  ["vault-backlink-graph-v1"],
  { revalidate: CACHE_TTL_VAULT }
);

/**
 * 특정 노트의 backlinks를 반환. 최신 created 우선 정렬, 12개 cap.
 *
 * @param targetPath vault 루트 기준 상대경로 (예: "020_Projects/.../note.md")
 * @returns BacklinkRef 배열. 없으면 빈 배열.
 */
export async function getBacklinks(targetPath: string): Promise<BacklinkRef[]> {
  try {
    const raw = await getCachedRawGraph();
    const refs = raw[targetPath] ?? [];
    return [...refs]
      .sort((a, b) => (b.created ?? "").localeCompare(a.created ?? ""))
      .slice(0, 12);
  } catch {
    // Vault index 접근 실패 시 graceful empty
    return [];
  }
}
