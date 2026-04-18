"use server";

/**
 * Weekly review Server Action — useActionState 호환.
 *
 * 기존 POST /api/review/weekly와 동일한 vault 커밋 로직을 직접 호출.
 * useActionState((prev, formData) => state) 시그너처에 맞춤.
 */

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/api-auth";
import { getFileContent, commitToGitHub } from "@/lib/github";
import { todayKstDate, isoWeek } from "@/lib/time";
import { VAULT_PATHS } from "@/lib/vault-paths";

// 2026-04-18 Level 1 청소: 010_Daily/Weekly/ 폴더 → 010_Daily/012_Weekly_Review/ 통합.
const WEEKLY_DIR = VAULT_PATHS.weeklyReview;

export interface WeeklyReviewState {
  ok: boolean;
  message: string;
  week?: string;
  path?: string;
  /** 마지막 시도 timestamp — useActionState가 같은 ok 결과 연속 시 React가
   *  re-render를 trigger하도록 변화 보장 */
  ts?: number;
}

export const initialWeeklyReviewState: WeeklyReviewState = {
  ok: false,
  message: "",
};

export async function saveWeeklyReviewAction(
  _prev: WeeklyReviewState,
  formData: FormData,
): Promise<WeeklyReviewState> {
  const { response } = await requireUser();
  if (response) {
    return { ok: false, message: "unauthorized", ts: Date.now() };
  }

  const week = (formData.get("week") as string) || isoWeek(todayKstDate());
  const alive = ((formData.get("alive") as string) || "").trim();
  const waning = ((formData.get("waning") as string) || "").trim();
  const next_focus = ((formData.get("next_focus") as string) || "").trim();

  const path = `${WEEKLY_DIR}/${week}.md`;
  const existing = await getFileContent(path);
  const createdMatch = existing?.content.match(/^created:\s*(.+)$/m);
  const created = createdMatch ? createdMatch[1].trim() : todayKstDate();

  const content = `---
type: weekly-review
week: ${week}
created: ${created}
updated: ${todayKstDate()}
---

# 주간 회고 ${week}

## 무엇이 살아있었나
${alive}

## 무엇이 시들었나
${waning}

## 다음 주 한 가지만 고른다면
${next_focus}
`;

  const result = await commitToGitHub(
    path,
    content,
    `weekly: review ${week}`,
    existing?.sha,
  );

  if (!result.ok) {
    return { ok: false, message: result.error || "save failed", week, path, ts: Date.now() };
  }

  revalidatePath("/review/weekly");
  revalidatePath("/review");
  revalidatePath("/dashboard");
  return { ok: true, message: "✓ 저장됨", week, path, ts: Date.now() };
}
