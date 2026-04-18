"use server";

/**
 * Vault Server Actions — React 19 + Next.js 16 패턴.
 *
 * 기존 /api/vault-sync/* POST와 동일 동작이지만:
 *   - HTTP 왕복 제거 (서버 함수 직접 호출)
 *   - useOptimistic / useActionState와 자연스럽게 결합
 *   - 직렬화/역직렬화 오버헤드 제거
 *
 * REST 엔드포인트(/api/vault-sync/*)는 외부 도구·webhook용으로 유지.
 */

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/api-auth";
import { updateFrontmatterField } from "@/lib/vault-write";
import { commitToGitHub } from "@/lib/github";
import { nowInKST } from "@/lib/time";
import { VAULT_PATHS } from "@/lib/vault-paths";

export type VaultAction = "pause" | "complete" | "archive";

const ALLOWED: ReadonlySet<VaultAction> = new Set(["pause", "complete", "archive"]);

// Retired routes (/papers /projects /now /colophon) are redirect stubs
// now, so there's nothing to revalidate on those paths. Dropped from
// the list to avoid noise.
const REVALIDATE_PATHS = [
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
  "/",
] as const;

function buildFields(action: VaultAction): Record<string, string> {
  if (action === "pause") return { status: "paused", workflow: "paused" };
  if (action === "complete") return { status: "completed", workflow: "completed" };
  // archive
  const today = nowInKST().toISOString().slice(0, 10);
  return {
    status: "archived",
    lifecycle_state: "archived",
    archived_at: today,
    archived_reason: "manual",
  };
}

function buildMessage(action: VaultAction, path: string): string {
  const basename = (path.split("/").pop() || path).replace(/\.md$/, "");
  return `chore: dashboard ${action} — ${basename}`;
}

export interface VaultActionResult {
  ok: boolean;
  path: string;
  action: VaultAction;
  error?: string;
}

/**
 * Note frontmatter transition — useOptimistic / useTransition와 결합 사용.
 *
 * @example
 *   const [pending, startTransition] = useTransition();
 *   const [optimistic, addHidden] = useOptimistic<Set<string>, string>(
 *     new Set(),
 *     (set, path) => new Set([...set, path])
 *   );
 *   startTransition(async () => {
 *     addHidden(path);
 *     const result = await transitionNoteAction(path, "archive");
 *     if (!result.ok) toast.error(result.error);
 *   });
 */
export async function transitionNoteAction(
  path: string,
  action: VaultAction,
): Promise<VaultActionResult> {
  // 인증
  const { response } = await requireUser();
  if (response) {
    return { ok: false, path, action, error: "unauthorized" };
  }

  // 입력 검증 (REST 엔드포인트와 동일 규칙)
  if (!path || !path.endsWith(".md")) {
    return { ok: false, path, action, error: "path must be a .md vault path" };
  }
  if (!/^\d{3}_[^/]+\//.test(path)) {
    return { ok: false, path, action, error: "path must be within vault folders" };
  }
  if (!ALLOWED.has(action)) {
    return { ok: false, path, action, error: `action must be one of ${[...ALLOWED].join(", ")}` };
  }

  const fields = buildFields(action);
  const message = buildMessage(action, path);

  const result = await updateFrontmatterField(path, fields, message);
  if (!result.ok) {
    return { ok: false, path, action, error: result.error || "update failed" };
  }

  for (const r of REVALIDATE_PATHS) {
    revalidatePath(r);
  }

  return { ok: true, path, action };
}

// ─────────────────────────────────────────────────────────────────────
// Quick Capture — 000_Inbox 신규 노트 생성 (useActionState 호환)
// ─────────────────────────────────────────────────────────────────────

export interface QuickCaptureState {
  ok: boolean;
  message: string;
  path?: string;
  ts?: number;
}

export const initialQuickCaptureState: QuickCaptureState = {
  ok: false,
  message: "",
};

export async function createInboxNoteAction(
  _prev: QuickCaptureState,
  formData: FormData,
): Promise<QuickCaptureState> {
  const { response } = await requireUser();
  if (response) return { ok: false, message: "unauthorized", ts: Date.now() };

  const text = ((formData.get("text") as string) || "").trim();
  if (!text) return { ok: false, message: "내용을 입력하세요", ts: Date.now() };

  const kst = nowInKST();
  const dateStr = kst.toISOString().slice(0, 10);
  const ts = kst.toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const slug = text
    .slice(0, 30)
    .replace(/[^a-zA-Z0-9가-힣\s-]/g, "")
    .replace(/\s+/g, "-");
  const fileName = `dashboard_${ts}_${slug}`.slice(0, 80);
  const path = `${VAULT_PATHS.inbox}/${fileName}.md`;

  const content = `---
source: dashboard
status: inbox
created: ${dateStr}
tags: [Quick-Capture]
---

${text}
`;

  const result = await commitToGitHub(
    path,
    content,
    `inbox: dashboard quick capture`,
  );

  if (!result.ok) {
    return { ok: false, message: result.error || "저장 실패", ts: Date.now() };
  }

  revalidatePath("/dashboard");
  revalidatePath("/notes");
  revalidatePath("/");
  return { ok: true, message: "✓ Inbox에 저장됨", path, ts: Date.now() };
}

