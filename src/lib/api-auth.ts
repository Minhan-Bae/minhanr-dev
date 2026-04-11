import { NextResponse, type NextRequest } from "next/server";
import type { User } from "@supabase/supabase-js";
import { createSupabaseServer } from "./supabase-server";

/**
 * api-auth.ts — API 라우트 인증 헬퍼.
 *
 * 배경: src/proxy.ts의 미들웨어 matcher가 페이지 경로(`/admin`, `/dashboard`,
 * `/calendar` 등)만 매칭하고 `/api/*`는 보호 범위 밖이다. 결과적으로 페이지가
 * Tier 3 protected여도 그 페이지의 backend API는 비인증 노출 상태가 된다.
 *
 * 해결: 모든 Tier 3 데이터를 다루는 API 라우트는 핸들러 시작에서 이 헬퍼로
 * 명시적으로 세션을 검증한다. matcher 기반 광역 보호 대신 라우트별 명시
 * 인증을 선택한 이유:
 *   1. cold-start 비용 — 모든 /api/* 요청에 Supabase 클라이언트 인스턴스 생성
 *   2. 정확성 — 의도적 public 라우트(/api/activity, /api/blog)와 자동 cron
 *      라우트는 다른 패턴이 필요. matcher는 단일 정책만 적용 가능
 *
 * 사용 패턴:
 *
 *   import { requireUser } from "@/lib/api-auth";
 *
 *   export async function GET(req: NextRequest) {
 *     const { response } = await requireUser();
 *     if (response) return response;
 *     // ... 기존 로직 (이 시점부터 인증된 사용자)
 *   }
 *
 * Phase F-Critical (2026-04-11)에서 신설.
 */

type AuthSuccess = { user: User; response: null };
type AuthFailure = { user: null; response: NextResponse };

/**
 * 현재 요청에 인증된 Supabase 사용자가 있는지 검증한다.
 *
 * - 성공: `{ user, response: null }` — 호출자는 user를 사용 가능
 * - 실패: `{ user: null, response: NextResponse }` — 호출자는 즉시 response를 반환해야 함
 *
 * Tagged union 반환 형식이라 호출자가 한 줄로 early-return 가능:
 *   const { response } = await requireUser();
 *   if (response) return response;
 *
 * `createSupabaseServer()`가 next/headers의 cookies()를 직접 읽으므로
 * `req` 매개변수가 없는 라우트에서도 작동한다.
 */
export async function requireUser(): Promise<AuthSuccess | AuthFailure> {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      ),
    };
  }
  return { user, response: null };
}

/**
 * Cron / 외부 자동화용 Bearer token 검증.
 *
 * 사용처: GitHub Action / 외부 cron service / 수동 trigger 등 사용자 세션이
 * 없는 자동화 호출. 호출자는 다음 헤더를 포함해야 한다:
 *
 *   Authorization: Bearer ${process.env.CRON_SECRET}
 *
 * 환경변수 CRON_SECRET 미설정 시 503을 반환한다 (클라이언트 401 vs 서버 503
 * 분리 — 미설정은 server config 오류이지 호출자 책임이 아님).
 */
export function requireCronSecret(req: NextRequest): NextResponse | null {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return NextResponse.json(
      { error: "CRON_SECRET not configured" },
      { status: 503 }
    );
  }
  const header = req.headers.get("authorization");
  if (header !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
