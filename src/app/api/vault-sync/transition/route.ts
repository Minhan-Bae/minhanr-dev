/**
 * POST /api/vault-sync/transition
 *
 * Dashboard 퀵 액션(대기·완료·삭제)을 vault 프론트매터 수정으로 커밋한다.
 *
 * Body:
 *   { path: string, action: 'pause' | 'complete' | 'archive' }
 *
 * 각 action이 매핑하는 frontmatter 변경:
 *   pause    → status: paused           (v3: workflow도 함께 갱신)
 *   complete → status: completed
 *   archive  → status: archived
 *              + lifecycle_state: archived
 *              + archived_at: YYYY-MM-DD (KST)
 *              + archived_reason: manual
 *
 * 실제 파일 이동(050_Archive/)은 하지 않는다 — vault-health.yml과 RT-2의
 * auto-archive 로직이 lifecycle_state를 보고 다음 사이클에 정리한다.
 */
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/api-auth";
import { updateFrontmatterField } from "@/lib/vault-write";
import { nowInKST } from "@/lib/time";

type Action = "pause" | "complete" | "archive";

const ALLOWED: ReadonlySet<Action> = new Set(["pause", "complete", "archive"]);

function buildFields(action: Action): Record<string, string> {
  if (action === "pause") {
    return { status: "paused", workflow: "paused" };
  }
  if (action === "complete") {
    return { status: "completed", workflow: "completed" };
  }
  // archive
  const today = nowInKST().toISOString().slice(0, 10);
  return {
    status: "archived",
    lifecycle_state: "archived",
    archived_at: today,
    archived_reason: "manual",
  };
}

function buildMessage(action: Action, path: string): string {
  const basename = (path.split("/").pop() || path).replace(/\.md$/, "");
  switch (action) {
    case "pause":
      return `chore: dashboard pause — ${basename}`;
    case "complete":
      return `chore: dashboard complete — ${basename}`;
    case "archive":
      return `chore: dashboard archive — ${basename}`;
  }
}

export async function POST(request: NextRequest) {
  const { response: authResponse } = await requireUser();
  if (authResponse) return authResponse;

  let body: { path?: unknown; action?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const path = typeof body.path === "string" ? body.path : "";
  const action = typeof body.action === "string" ? body.action : "";

  if (!path || !path.endsWith(".md")) {
    return NextResponse.json({ error: "path must be a .md vault path" }, { status: 400 });
  }
  // 경로 화이트리스트: 볼트 최상위 숫자 폴더 패턴만 허용
  if (!/^\d{3}_[^/]+\//.test(path)) {
    return NextResponse.json({ error: "path must be within vault folders" }, { status: 400 });
  }
  if (!ALLOWED.has(action as Action)) {
    return NextResponse.json({ error: `action must be one of ${[...ALLOWED].join(", ")}` }, { status: 400 });
  }

  const fields = buildFields(action as Action);
  const message = buildMessage(action as Action, path);

  const result = await updateFrontmatterField(path, fields, message);
  if (!result.ok) {
    return NextResponse.json({ error: result.error || "update failed" }, { status: 502 });
  }

  // vault-index 의존 Knowledge Hub 라우트 전체 재검증 — status/lifecycle 변경 시
  // tag count, link list, trend, finance note 등도 같이 갱신되어야 정합성 유지.
  // (revalidateTag는 Next.js 16에서 2번째 인자 필수 — revalidatePath가 더 간결)
  // /projects, /papers, /now, /colophon are redirect stubs now
  // (editorial redesign retired them) — dropped from the invalidate list.
  for (const r of [
    "/dashboard",
    "/notes",
    "/deadlines",
    "/review",
    "/tags",
    "/links",
    "/trends",
    "/finance",
    "/statistics",
    "/graph",
    "/",  // 홈(vault aggregate)
  ]) {
    revalidatePath(r);
  }

  return NextResponse.json({ status: "ok", path, action, fields });
}
