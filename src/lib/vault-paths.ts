/**
 * OIKBAS 볼트 경로 상수 (minhanr-dev TS 미러).
 *
 * SSOT: `oikbas-vault/090_System/vault_config.json` (2026-04-18 baseline refactor).
 * 볼트 폴더 이동/이름 변경 시 이 파일도 동기화 필요. 미러 이유는 minhanr-dev가
 * 런타임에 oikbas-vault의 JSON을 직접 읽지 않기 때문 (빌드 격리).
 *
 * 동기화 체크리스트:
 *   1. oikbas-vault/090_System/vault_config.json 수정
 *   2. 이 파일의 VAULT_PATHS / VAULT_FILES 갱신
 *   3. 본 리포 npm run build 검증
 */

export const VAULT_PATHS = {
  inbox: "000_Inbox",
  daily: "010_Daily",
  dailyArchive: "010_Daily/011_Archive",
  weeklyReview: "010_Daily/012_Weekly_Review",
  projects: "020_Projects",
  areas: "030_Areas",
  research: "030_Areas/031_Research",
  career: "030_Areas/032_Career",
  finance: "030_Areas/034_Finance",
  resources: "040_Resources",
  tech: "040_Resources/041_Tech",
  techResearch: "040_Resources/041_Tech/Research",
  techTrends: "040_Resources/041_Tech/Trends",
  techReports: "040_Resources/041_Tech/Reports",
  macro: "040_Resources/044_Macro",
  archive: "050_Archive",
  system: "090_System",
} as const;

export const VAULT_FILES = {
  vaultIndex: "090_System/vault_index.json",
  vaultIndexSlim: "090_System/vault_index_slim.json",
} as const;

/** Top-level bucket 분류 — 통계·차트 그룹핑. */
export type VaultBucket = "Daily" | "Projects" | "Resources" | "Areas" | "Other";

export function bucketOf(path: string): VaultBucket {
  if (path.startsWith(`${VAULT_PATHS.daily}/`)) return "Daily";
  if (path.startsWith(`${VAULT_PATHS.projects}/`)) return "Projects";
  if (path.startsWith(`${VAULT_PATHS.resources}/`)) return "Resources";
  if (path.startsWith(`${VAULT_PATHS.areas}/`)) return "Areas";
  return "Other";
}

/** 노트 상세 페이지에서 "돌아가기" 링크용 surface 분류. */
export type VaultSurface =
  | "papers"
  | "projects"
  | "notes"
  | "daily"
  | "areas"
  | "inbox"
  | "archive"
  | "system";

export interface VaultSurfaceInfo {
  surface: VaultSurface;
  label: string;
  backHref: string;
}

/**
 * Note 경로의 상위 폴더로 surface 컨텍스트 결정.
 * 순서 중요 — 긴 prefix가 먼저 매칭되도록 정렬 상태 유지.
 */
interface SurfaceRule {
  prefix: string;
  surface: VaultSurface;
  label: string;
}

const SURFACE_RULES: readonly SurfaceRule[] = [
  { prefix: `${VAULT_PATHS.techResearch}/`, surface: "papers", label: "Research" },
  { prefix: `${VAULT_PATHS.projects}/`, surface: "projects", label: "Projects" },
  { prefix: `${VAULT_PATHS.daily}/`, surface: "daily", label: "Daily" },
  { prefix: `${VAULT_PATHS.areas}/`, surface: "areas", label: "Areas" },
  { prefix: `${VAULT_PATHS.inbox}/`, surface: "inbox", label: "Inbox" },
  { prefix: `${VAULT_PATHS.archive}/`, surface: "archive", label: "Archive" },
  { prefix: `${VAULT_PATHS.system}/`, surface: "system", label: "System" },
];

export function surfaceOf(path: string): VaultSurfaceInfo {
  for (const rule of SURFACE_RULES) {
    if (path.startsWith(rule.prefix)) {
      return { surface: rule.surface, label: rule.label, backHref: "/notes" };
    }
  }
  return { surface: "notes", label: "Notes", backHref: "/notes" };
}
