import { NextRequest, NextResponse } from "next/server";
import { getFileContent, commitToGitHub } from "@/lib/github";
import { requireUser } from "@/lib/api-auth";
import { todayKstDate, isoWeek } from "@/lib/time";

export const dynamic = "force-dynamic";

const WEEKLY_DIR = "010_Daily/Weekly";

function section(content: string, heading: string): string {
  const re = new RegExp(`## ${heading}\\s*\\n([\\s\\S]*?)(?=\\n## |\\n---|$)`);
  return content.match(re)?.[1].trim() ?? "";
}

/**
 * GET /api/review/weekly?week=2026-W16 — load existing review if any.
 * Defaults to current ISO week in KST.
 */
export async function GET(req: NextRequest) {
  const { response: authResponse } = await requireUser();
  if (authResponse) return authResponse;

  const week = req.nextUrl.searchParams.get("week") || isoWeek(todayKstDate());
  const path = `${WEEKLY_DIR}/${week}.md`;
  const file = await getFileContent(path);
  if (!file) {
    return NextResponse.json({ exists: false, week, path });
  }
  return NextResponse.json({
    exists: true,
    week,
    path,
    alive: section(file.content, "무엇이 살아있었나"),
    waning: section(file.content, "무엇이 시들었나"),
    next_focus: section(file.content, "다음 주 한 가지만 고른다면"),
  });
}

/**
 * POST /api/review/weekly — save or overwrite this week's review.
 * Body: { week?, alive, waning, next_focus }
 */
export async function POST(req: NextRequest) {
  const { response: authResponse } = await requireUser();
  if (authResponse) return authResponse;

  const body = await req.json();
  const {
    week,
    alive = "",
    waning = "",
    next_focus = "",
  } = body as {
    week?: string;
    alive?: string;
    waning?: string;
    next_focus?: string;
  };

  const weekId = week || isoWeek(todayKstDate());
  const path = `${WEEKLY_DIR}/${weekId}.md`;

  const existing = await getFileContent(path);
  const createdMatch = existing?.content.match(/^created:\s*(.+)$/m);
  const created = createdMatch ? createdMatch[1].trim() : todayKstDate();

  const content = `---
type: weekly-review
week: ${weekId}
created: ${created}
updated: ${todayKstDate()}
---

# 주간 회고 ${weekId}

## 무엇이 살아있었나
${alive.trim()}

## 무엇이 시들었나
${waning.trim()}

## 다음 주 한 가지만 고른다면
${next_focus.trim()}
`;

  const result = await commitToGitHub(
    path,
    content,
    `weekly: review ${weekId}`,
    existing?.sha
  );
  return NextResponse.json({ ...result, path, week: weekId });
}
