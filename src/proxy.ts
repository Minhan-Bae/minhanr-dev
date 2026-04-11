import { updateSession } from "@/lib/supabase-middleware";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

/**
 * Tier 3 보호 라우트 + /notes catch-all (Tier 2 vs 3 판단은 미들웨어 함수 내부에서).
 *
 * 정적 파일과 API는 제외 (성능 + 무한 리다이렉트 방지).
 * /login, /, /blog, /papers, /projects 등 공개 surface는 매칭 자체에서 빠지므로
 * Supabase 호출을 발생시키지 않는다.
 */
export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/command/:path*",
    "/calendar/:path*",
    "/finance/:path*",
    "/trends/:path*",
    "/review/:path*",
    "/deadlines/:path*",
    "/links/:path*",
    "/tags/:path*",
    "/statistics/:path*",
    "/notes",
    "/notes/:path*",
  ],
};
