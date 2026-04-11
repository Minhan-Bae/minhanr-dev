import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isTier2NoteUrl } from "./vault-tiers";

/**
 * Tier 3 보호 라우트 prefix.
 * 이 목록에 매칭되는 경로는 비인증 사용자에게 /login 리다이렉트.
 *
 * /notes는 정확 매칭으로 처리한다 (전체 검색 인덱스만 보호하고
 * /notes/{tier2 path}는 통과시키기 위함).
 */
const TIER3_PROTECTED_PREFIXES = [
  "/admin",
  "/dashboard",
  "/command",
  "/calendar",
  "/finance",
  "/trends",
  "/review",
  "/deadlines",
  "/links",
  "/tags",
  "/statistics",
];

/**
 * 주어진 pathname이 인증 보호 대상인지 판단.
 * - /admin, /dashboard 등 Tier 3 surface는 무조건 보호
 * - /notes 는 정확 매칭만 보호 (인덱스 페이지)
 * - /notes/{...} 는 Tier 2 화이트리스트면 통과, 그 외는 보호
 */
function isProtectedPath(pathname: string): boolean {
  // /login 자체는 통과 (무한 리다이렉트 방지)
  if (pathname.startsWith("/login")) return false;

  // Tier 3 surface 정확/접두사 매칭
  for (const prefix of TIER3_PROTECTED_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) {
      return true;
    }
  }

  // /notes 정확 매칭 (전체 검색 인덱스)
  if (pathname === "/notes") return true;

  // /notes/{...path} — Tier 2 prefix면 통과, 그 외는 보호
  if (pathname.startsWith("/notes/")) {
    return !isTier2NoteUrl(pathname);
  }

  return false;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const pathname = request.nextUrl.pathname;
  // 보호 대상이 아니면 Supabase 호출 자체를 생략 (성능 + Edge cold-start)
  if (!isProtectedPath(pathname)) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    // 로그인 후 돌아갈 경로 보존
    url.searchParams.set("next", pathname + request.nextUrl.search);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
