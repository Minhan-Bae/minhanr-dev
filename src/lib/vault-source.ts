/**
 * vault-source.ts — 볼트 인덱스 소스 파사드.
 *
 * env `VAULT_SOURCE`로 GitHub vs Supabase 백엔드 전환. 기본값 `github`.
 * 라우트 코드는 `getVaultIndex()`만 호출하고 어느 소스인지 알 필요 없다.
 *
 * 마이그레이션 전략:
 *   1. Supabase 스키마 적용 + sync 스크립트 실행 (M1/M2)
 *   2. Vercel preview 환경에 `VAULT_SOURCE=supabase` 세팅, Knowledge Hub 정상 확인
 *   3. 프로덕션에 `VAULT_SOURCE=supabase` 설정, `VaultUnreachable` 유발 빈도 모니터링
 *   4. 안정화 후 `vault-index.ts`의 GitHub fetch 코드 제거 (본 파사드도 함께 철거)
 *
 * 상태: **미활성**. 현재는 어느 환경변수에도 `VAULT_SOURCE`가 세팅돼있지 않아 기본 GitHub로 동작.
 */

import { getCachedVaultIndex } from "./vault-index";
import { getCachedVaultIndexFromSupabase } from "./vault-supabase";
import type { VaultIndexFile } from "./vault-index";

export type VaultSource = "github" | "supabase";

export function resolveVaultSource(): VaultSource {
  const raw = (process.env.VAULT_SOURCE || "").toLowerCase();
  if (raw === "supabase") return "supabase";
  return "github";
}

/**
 * 선택된 소스에서 vault_index를 가져온다. 양쪽 모두 5분 ISR 캐시 적용.
 * 실패 시 폴백 없음 — 소스별 `VaultUnreachable`로 명확히 노출.
 */
export async function getVaultIndex(): Promise<VaultIndexFile> {
  const source = resolveVaultSource();
  if (source === "supabase") {
    return getCachedVaultIndexFromSupabase();
  }
  return getCachedVaultIndex();
}
