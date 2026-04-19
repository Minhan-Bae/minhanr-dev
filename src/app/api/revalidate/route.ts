import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

/**
 * POST /api/revalidate — 외부 sync 도구 / Supabase trigger가 호출하는
 * 재검증 엔드포인트.
 *
 * 주 사용처: `scripts/vault-sync.mjs` bulk/watch 완료 후 자기 자신이 이
 * 엔드포인트를 POST → /notes · /search · /graph · /dashboard 등 vault
 * 의존 경로가 즉시 fresh ISR로 재생성.
 *
 * 인증: `REVALIDATE_SECRET` env 문자열을 `x-revalidate-secret` 헤더로
 * 제출해야 200. 누락시 401. 공개 keyless 호출 방지 목적 — 내부 도구만.
 */

const DEFAULT_PATHS = [
  "/",
  "/notes",
  "/search",
  "/graph",
  "/dashboard",
  "/blog",
] as const;

export async function POST(req: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "REVALIDATE_SECRET not configured" },
      { status: 501 }
    );
  }
  const header = req.headers.get("x-revalidate-secret");
  if (header !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { paths?: string[] } = {};
  try {
    body = await req.json();
  } catch {
    // 빈 바디 허용 — 기본 경로 돌림
  }
  const paths = body.paths && body.paths.length > 0 ? body.paths : DEFAULT_PATHS;

  const results: { target: string; ok: true }[] = [];
  for (const p of paths) {
    try {
      // Next.js 16: type 인자가 dynamic route가 아닐 때는 optional.
      revalidatePath(p, "page");
      results.push({ target: p, ok: true });
    } catch {
      // next/cache는 실제로 실패를 throw 하지 않지만 방어적으로
    }
  }

  return NextResponse.json({ ok: true, revalidated: results });
}
