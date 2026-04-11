import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * supabase-admin.ts — service-role 기반 server-side Supabase 클라이언트.
 *
 * 배경 (Phase F-2-RLS, 2026-04-11):
 * Phase F-Critical 가 API 라우트에 `requireUser()` 를 추가했지만, 데이터 호출
 * 자체는 여전히 [src/lib/supabase.ts](./supabase.ts) 의 anon 브라우저 클라이언트를
 * 재사용하고 있었다. 이 클라이언트는 cookies/세션이 없어 Supabase 입장에서는
 * 무세션 anon 호출이다. 그래서 Supabase advisor 가 `tasks` / `agent_heartbeats`
 * / `axis_metrics` 3 테이블에 RLS 가 비활성화돼 있다고 ERROR 를 띄우는 동시에,
 * RLS 를 켜면 (정책이 어떻든) 앱 전체가 깨지는 dead-end 상황이었다.
 *
 * 해결 (옵션 A — service-role admin client):
 * - 모든 server-side 데이터 호출은 `createSupabaseAdmin()` 으로 교체.
 * - service-role 키는 RLS 를 우회하므로 정책 모양과 무관하게 작동.
 * - RLS 는 anon PostgREST 직접 접근을 차단하는 defense-in-depth 로 활성화.
 * - 인증은 `requireUser()` 가 createSupabaseServer (cookies) 로 별도 검증 →
 *   admin client 와 분리된 두 책임.
 *
 * 절대 client 컴포넌트나 브라우저로 import 하지 말 것. service-role 키가
 * 노출되면 RLS 우회된 전권 접근이 가능해진다.
 */

let cachedAdmin: SupabaseClient | null = null;

export function createSupabaseAdmin(): SupabaseClient {
  if (cachedAdmin) return cachedAdmin;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;

  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
  }
  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_KEY is not set — required for server-side Supabase access. " +
        "Get the value from https://supabase.com/dashboard/project/_/settings/api " +
        "(service_role key) and add it to .env.local + Vercel env vars. " +
        "See docs/security.md §6 for details."
    );
  }

  cachedAdmin = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cachedAdmin;
}
