import { NextRequest, NextResponse } from "next/server";
import { getFileContent, commitToGitHub } from "@/lib/github";
import { requireUser } from "@/lib/api-auth";
import { todayKstDate } from "@/lib/time";

export const dynamic = "force-dynamic";

interface TimeBlock {
  date: string;
  startHour: number;
  endHour: number;
  category: string;
  memo: string;
}

interface DayData {
  date: string;
  day: string;
  focus: string;
  title: string;
  blocks: TimeBlock[];
}

/**
 * Parse `## Time Blocks` table rows out of a Daily Note's markdown.
 *
 * Accepted hour syntaxes (manual Obsidian edits often use the HH:MM form):
 *   | 9-11 | ... | ... |              ← writer's canonical form
 *   | 9 - 11 | ... | ... |
 *   | 09-11 | ... | ... |
 *   | 09:00-11:00 | ... | ... |       ← manual edit, common variant
 *   | 09:00 - 11:00 | ... | ... |
 *   | 9:00-11:00 | ... | ... |
 *
 * The minute portion is *captured but discarded* — TimeBlock stores
 * integer hours only. A user who writes `9:30-11:30` will see the
 * block silently rounded to `9-11`. This is a known limitation; an
 * upgrade to fractional hours requires a wider TimeBlock change and
 * lives in a future phase.
 */
function parseTimeBlocks(content: string, date: string): TimeBlock[] {
  const blocks: TimeBlock[] = [];
  const tbSection = content.match(/## (?:🧱 )?Time Blocks\s*\n([\s\S]*?)(?=\n## |\n---|\z)/);
  if (!tbSection) return blocks;

  // `(?::\d{2})?` makes the `:MM` minute portion optional and discards it.
  const ROW_RE = /\|\s*(\d{1,2})(?::\d{2})?\s*-\s*(\d{1,2})(?::\d{2})?\s*\|\s*([^|]+?)\s*\|\s*([^|]*?)\s*\|/;
  for (const line of tbSection[1].split("\n")) {
    const match = line.match(ROW_RE);
    if (match) {
      blocks.push({
        date,
        startHour: parseInt(match[1]),
        endHour: parseInt(match[2]),
        category: match[3].trim(),
        memo: match[4].trim(),
      });
    }
  }
  return blocks;
}

function parseFocus(content: string): string {
  const m = content.match(/## Focus\s*\n[\s\S]*?\n- \[.\]\s*(.*)/);
  return m ? m[1].trim() : "";
}

function parseTitle(content: string): string {
  // Custom title after the date heading, before Focus
  const m = content.match(/^# .+\n\n(?:>.*\n)*\n?(?:.*\n)*?## (?:일자 메모|Daily Title)\s*\n([\s\S]*?)(?=\n## |\n---)/);
  if (m) return m[1].trim();
  return "";
}

function getWeekDates(baseDate: string): string[] {
  const d = new Date(baseDate + "T00:00:00+09:00");
  const day = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - ((day + 6) % 7));
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const dt = new Date(monday);
    dt.setDate(monday.getDate() + i);
    dates.push(dt.toISOString().split("T")[0]);
  }
  return dates;
}

export async function GET(req: NextRequest) {
  const { response: authResponse } = await requireUser();
  if (authResponse) return authResponse;
  const dateParam = req.nextUrl.searchParams.get("date");
  const baseDate = dateParam || todayKstDate();
  const weekDates = getWeekDates(baseDate);

  const days: DayData[] = [];
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

  for (const date of weekDates) {
    const file = await getFileContent(`010_Daily/${date}.md`);
    const d = new Date(date + "T00:00:00");
    const dayName = dayNames[d.getDay()];

    if (file) {
      days.push({
        date,
        day: dayName,
        focus: parseFocus(file.content),
        title: parseTitle(file.content),
        blocks: parseTimeBlocks(file.content, date),
      });
    } else {
      days.push({ date, day: dayName, focus: "", title: "", blocks: [] });
    }
  }

  return NextResponse.json({ week: weekDates, days });
}

/**
 * POST — Add a time block
 */
export async function POST(req: NextRequest) {
  const { response: authResponse } = await requireUser();
  if (authResponse) return authResponse;
  const body = await req.json();
  const { date, startHour, endHour, category, memo } = body as {
    date?: string; startHour?: number; endHour?: number; category?: string; memo?: string;
  };

  if (!date || startHour == null || endHour == null || !category) {
    return NextResponse.json({ error: "date, startHour, endHour, category required" }, { status: 400 });
  }

  const dailyPath = `010_Daily/${date}.md`;
  const file = await getFileContent(dailyPath);
  const row = `| ${startHour}-${endHour} | ${category} | ${memo || ""} |`;

  if (file) {
    const hintPattern = /^>\s*Telegram\s*`\/t/m;
    const hintMatch = file.content.match(hintPattern);
    let updated: string;
    if (hintMatch && hintMatch.index != null) {
      updated = file.content.slice(0, hintMatch.index) + row + "\n" + file.content.slice(hintMatch.index);
    } else {
      const marker = /## (?:🧱 )?Time Blocks/;
      const idx = file.content.search(marker);
      if (idx >= 0) {
        const headingEnd = file.content.indexOf("\n", idx);
        updated = file.content.slice(0, headingEnd + 1) +
          "\n| 시간 | 카테고리 | 메모 |\n|------|---------|------|\n" + row + "\n" + file.content.slice(headingEnd + 1);
      } else {
        updated = file.content.trimEnd() + `\n\n## Time Blocks\n\n| 시간 | 카테고리 | 메모 |\n|------|---------|------|\n${row}\n`;
      }
    }
    return NextResponse.json(await commitToGitHub(dailyPath, updated, `daily: add time block ${startHour}-${endHour} ${category}`, file.sha));
  } else {
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const d = new Date(date + "T00:00:00");
    const content = `---\ntags: [Daily]\ndate: ${date}\nday: ${dayNames[d.getDay()]}\nfocus: ""\n---\n\n# ${date}\n\n## Focus\n- [ ] \n\n## Time Blocks\n\n| 시간 | 카테고리 | 메모 |\n|------|---------|------|\n${row}\n\n## Log\n-\n`;
    return NextResponse.json(await commitToGitHub(dailyPath, content, `daily: create + time block ${startHour}-${endHour} ${category}`));
  }
}

/**
 * DELETE — Remove a time block
 * Body: { date, startHour, endHour }
 */
export async function DELETE(req: NextRequest) {
  const { response: authResponse } = await requireUser();
  if (authResponse) return authResponse;
  const body = await req.json();
  const { date, startHour, endHour } = body as { date?: string; startHour?: number; endHour?: number };

  if (!date || startHour == null || endHour == null) {
    return NextResponse.json({ error: "date, startHour, endHour required" }, { status: 400 });
  }

  const dailyPath = `010_Daily/${date}.md`;
  const file = await getFileContent(dailyPath);
  if (!file) return NextResponse.json({ error: "Daily note not found" }, { status: 404 });

  // Remove the matching table row. Allow optional `:MM` suffix on
  // both hours so manual `09:00-11:00` edits delete cleanly too
  // (matches the parser strengthening above).
  const pattern = new RegExp(
    `\\|\\s*${startHour}(?::\\d{2})?\\s*-\\s*${endHour}(?::\\d{2})?\\s*\\|[^\\n]*\\|[^\\n]*\\|\\n?`,
    "g"
  );
  const updated = file.content.replace(pattern, "");

  if (updated === file.content) {
    return NextResponse.json({ error: "Block not found" }, { status: 404 });
  }

  return NextResponse.json(await commitToGitHub(dailyPath, updated, `daily: delete time block ${startHour}-${endHour}`, file.sha));
}

/**
 * PATCH — Update a time block or daily title
 * Body: { date, action, ... }
 *   action: "update_block" — { oldStartHour, oldEndHour, startHour, endHour, category, memo }
 *   action: "set_title" — { title }
 */
export async function PATCH(req: NextRequest) {
  const { response: authResponse } = await requireUser();
  if (authResponse) return authResponse;
  const body = await req.json();
  const { date, action } = body as { date?: string; action?: string };

  if (!date || !action) {
    return NextResponse.json({ error: "date and action required" }, { status: 400 });
  }

  const dailyPath = `010_Daily/${date}.md`;
  const file = await getFileContent(dailyPath);
  if (!file) return NextResponse.json({ error: "Daily note not found" }, { status: 404 });

  if (action === "update_block") {
    const { oldStartHour, oldEndHour, startHour, endHour, category, memo } = body;
    const pattern = new RegExp(`\\|\\s*${oldStartHour}\\s*-\\s*${oldEndHour}\\s*\\|[^\\n]*\\|[^\\n]*\\|`);
    const newRow = `| ${startHour}-${endHour} | ${category} | ${memo || ""} |`;
    const updated = file.content.replace(pattern, newRow);
    return NextResponse.json(await commitToGitHub(dailyPath, updated, `daily: update time block ${startHour}-${endHour} ${category}`, file.sha));
  }

  if (action === "set_title") {
    const { title } = body as { title: string };
    const marker = "## Daily Title";
    let updated: string;
    if (file.content.includes(marker)) {
      updated = file.content.replace(/## Daily Title\s*\n[\s\S]*?(?=\n## |\n---)/,  `## Daily Title\n${title}`);
    } else {
      // Insert before ## Focus
      const focusIdx = file.content.indexOf("## Focus");
      if (focusIdx >= 0) {
        updated = file.content.slice(0, focusIdx) + `## Daily Title\n${title}\n\n` + file.content.slice(focusIdx);
      } else {
        updated = file.content.trimEnd() + `\n\n## Daily Title\n${title}\n`;
      }
    }
    return NextResponse.json(await commitToGitHub(dailyPath, updated, `daily: set title "${title.slice(0, 30)}"`, file.sha));
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
