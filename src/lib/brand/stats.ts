/**
 * BRAND_STATS — vault 카운트 등 OG / 외부 채널에 노출되는 통계 스냅샷.
 *
 * Edge runtime의 OG 라우트는 vault index를 fetch할 수 없으므로
 * (request time + GitHub network 비용 + cold-start), 이 파일이 수동으로
 * 갱신되는 정적 스냅샷 역할을 한다.
 *
 * Tenet 1 ("Live from the vault — 거짓말 금지") 준수:
 * 자동화 전까지는 "정직하게 갱신된 stale 값"이 "영원히 stale한 mock"보다
 * 낫다. 라이브 홈에서 vault count를 확인 후 1분 작업으로 갱신할 수 있다.
 *
 * Phase F 후보: GitHub Action이 매일 1회 vault_index.json fetch →
 * 이 파일의 숫자를 자동 commit. 이번 phase는 수동 갱신 정책으로 ship.
 *
 * 마지막 수동 갱신: 2026-04-11 (Phase E)
 */
export const BRAND_STATS = {
  /** Total vault note count (Tier 2 + Tier 3 합). 라이브 홈의 "Notes total" 타일과 동일. */
  vaultNotes: 1071,
  /** 발행된 블로그 포스트 수 (`getAllPosts().length`와 동일). */
  blogPosts: 116,
  /** 가장 최근 vault harvest 상대 시각. "today" / "1d" / "3d" 등 짧은 문구. */
  lastHarvest: "today",
} as const;
