/**
 * minhanr.dev 정보 아키텍처 — 3-Tier 모델 (2026-04-09 사용자 결정)
 *
 * Tier 1 — Public + indexed: /, /blog, /blog/[slug]
 *   "외부 독자에게 보여주려고 다듬은 글"
 *
 * Tier 2 — Public + noindex (auth 불필요): /papers, /projects, /notes/[...path]
 *   "보여줘도 될 작업". 친구·콜라보·관심 방문자 환영. 검색엔진은 제외.
 *   아래 TIER2_PREFIXES에 해당하는 vault 폴더 경로만 노출.
 *
 * Tier 3 — Personal command center (auth 필수):
 *   /notes (전체 검색), /dashboard, /command, /admin, /deadlines, /links,
 *   /tags, /statistics, 그리고 TIER2_PREFIXES에 없는 모든 vault 폴더 경로.
 *   middleware가 비로그인 시 /login으로 redirect.
 */

/**
 * Tier 2로 분류된 vault 폴더 prefix 목록.
 * 이 목록에 포함된 폴더 안의 노트만 비인증 사용자에게 노출된다.
 *
 * 변경 시 영향:
 * - /notes/[...path]: 화이트리스트 필터의 기준
 * - /papers, /projects: 인덱스 페이지의 노출 폴더 결정
 * - middleware: /notes/{prefix}/... 경로의 auth 우회 결정
 */
export const TIER2_PREFIXES = [
  "040_Resources/041_Tech/Research/",
  "030_Areas/031_Research/",
  "030_Areas/035_Hobbies/",
  "020_Projects/021_R&D/",
  "020_Projects/023_Trinity_x/",
] as const;

/**
 * /papers 인덱스에 포함될 폴더 (Lab notebook 결합).
 */
export const PAPERS_FOLDERS = [
  "040_Resources/041_Tech/Research/",
  "030_Areas/031_Research/",
] as const;

/**
 * /projects 인덱스에 포함될 폴더 (Tier 2 화이트리스트).
 */
export const PROJECTS_FOLDERS = [
  "020_Projects/021_R&D/",
  "020_Projects/023_Trinity_x/",
] as const;

/**
 * 주어진 vault 경로가 Tier 2 화이트리스트에 속하는지 검사.
 * 비인증 사용자에게 노출 가능한 경로인지 판단할 때 사용.
 */
export function isTier2Path(path: string): boolean {
  return TIER2_PREFIXES.some((prefix) => path.startsWith(prefix));
}

/**
 * 주어진 폴더 prefix 배열 중 어디에든 속하는지.
 * listNotes에는 단일 folder만 받지만, 여러 폴더를 OR 매칭할 때 사용.
 */
export function isInAnyFolder(path: string, prefixes: readonly string[]): boolean {
  return prefixes.some((prefix) => path.startsWith(prefix));
}

/**
 * URL pathname이 Tier 2 노트 경로인지 검사.
 * `/notes/{prefix}/...` 형태의 URL에서 prefix가 TIER2에 속하면 true.
 * middleware에서 auth bypass 결정에 사용.
 */
export function isTier2NoteUrl(pathname: string): boolean {
  if (!pathname.startsWith("/notes/")) return false;
  // /notes/ 다음의 경로 부분을 vault path로 변환
  const vaultPath = pathname
    .slice("/notes/".length)
    .split("/")
    .map(decodeURIComponent)
    .join("/");
  return isTier2Path(vaultPath);
}
