import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";
import { CACHE_TTL_VAULT, GITHUB_API_BASE } from "./constants";
import { surfaceOf } from "./vault-paths";

export interface VaultNoteFrontmatter {
  title?: string;
  status?: string;
  created?: string;
  tags?: string[];
  source_type?: string;
  source_url?: string;
  summary?: string;
  domain?: string | string[];
  related?: string | string[];
  relevance?: string | number;
  // catch-all
  [k: string]: unknown;
}

export interface VaultNoteContent {
  path: string;
  frontmatter: VaultNoteFrontmatter;
  contentHtml: string;
}

/**
 * vault 노트 본문을 GitHub API contents 엔드포인트에서 raw로 fetch.
 * fetchVaultIndex와 동일한 인증/캐시 전략을 따른다.
 */
export async function fetchVaultNoteRaw(path: string): Promise<string | null> {
  // path는 vault 루트 기준 상대경로 (예: "040_Resources/041_Tech/Research/.../xxx.md")
  const url = `${GITHUB_API_BASE}/contents/${path
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;

  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3.raw",
    "User-Agent": "minhanr-dev",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, {
    headers,
    next: { revalidate: CACHE_TTL_VAULT },
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`vault note fetch failed: ${res.status} ${path}`);
  }
  return await res.text();
}

/**
 * `[[wikilink]]` 패턴을 일반 텍스트로 치환 (1차 단순 변환).
 * `[[Note Name]]` → `Note Name`
 * `[[Note Name|alias]]` → `alias`
 * 향후 vault_index 매핑으로 내부 링크 변환 가능 (C-4 후속).
 */
function stripWikilinks(md: string): string {
  return md.replace(/\[\[([^\]|]+?)(?:\|([^\]]+?))?\]\]/g, (_, target, alias) => {
    return alias || target;
  });
}

/**
 * 마크다운 원본을 frontmatter + HTML로 파싱.
 * 블로그와 동일한 unified 파이프라인 (remark → rehype → stringify).
 */
export async function parseVaultNote(
  path: string,
  raw: string
): Promise<VaultNoteContent> {
  const { data, content } = matter(raw);
  const stripped = stripWikilinks(content);
  const processed = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeHighlight, { detect: true })
    .use(rehypeStringify)
    .process(stripped);

  return {
    path,
    frontmatter: data as VaultNoteFrontmatter,
    contentHtml: processed.toString(),
  };
}

/**
 * 한 번의 호출로 fetch + parse. 라우트에서 주로 이걸 쓴다.
 * 노트가 없으면 null.
 */
export async function getVaultNote(path: string): Promise<VaultNoteContent | null> {
  const raw = await fetchVaultNoteRaw(path);
  if (raw === null) return null;
  return await parseVaultNote(path, raw);
}

/**
 * vault 경로를 native /notes/[...path] 라우트 URL로 변환.
 * 각 세그먼트를 encodeURIComponent로 안전 인코딩.
 * Knowledge Hub의 모든 노트 카드/링크는 이 함수를 통해 내부 라우트로 이동해야 한다.
 */
export function vaultPathToHref(path: string): string {
  return `/notes/${path
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}

/**
 * vault 경로에서 표시용 제목 추출 (frontmatter title이 없을 때 fallback).
 */
export function deriveNoteTitle(path: string, frontmatter?: VaultNoteFrontmatter): string {
  if (frontmatter?.title && typeof frontmatter.title === "string") {
    return frontmatter.title;
  }
  const base = path.split("/").pop() || path;
  return base.replace(/\.md$/, "").replace(/^\d+_/, "").replace(/_/g, " ");
}

/**
 * vault 경로의 상위 폴더에 따라 surface 컨텍스트를 결정.
 * 노트 상세 페이지에서 "어디로 돌아가기" 링크 결정에 사용.
 *
 * /papers and /projects were retired as private surfaces in the editorial
 * redesign. Research and Projects notes now fall back to /notes (the unified
 * vault browser), so no back-link ever lands on a redirect stub.
 *
 * 실제 prefix 매칭 규칙은 vault-paths.ts의 surfaceOf로 위임 (SSOT 단일화).
 */
export function deriveNoteSurface(path: string): {
  surface: "papers" | "projects" | "notes" | "daily" | "areas" | "inbox" | "archive" | "system";
  label: string;
  backHref: string;
} {
  return surfaceOf(path);
}
