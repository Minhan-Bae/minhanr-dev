import { NextRequest, NextResponse } from "next/server";
import { getFileContent, commitToGitHub } from "@/lib/github";

export const revalidate = 60;

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
  blocks: TimeBlock[];
  expenses: Array<{ category: string; amount: number; memo: string }>;
}

function parseTimeBlocks(content: string, date: string): TimeBlock[] {
  const blocks: TimeBlock[] = [];
  const tbSection = content.match(/## (?:🧱 )?Time Blocks\s*\n([\s\S]*?)(?=\n## |\n---|\z)/);
  if (!tbSection) return blocks;

  const lines = tbSection[1].split("\n");
  for (const line of lines) {
    // Match table rows: | 09-12 | 업무 | 코드리뷰 |
    const match = line.match(/\|\s*(\d{1,2})\s*-\s*(\d{1,2})\s*\|\s*([^|]+?)\s*\|\s*([^|]*?)\s*\|/);
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
  const focusSection = content.match(/## Focus\s*\n[\s\S]*?\n- \[.\]\s*(.*)/);
  return focusSection ? focusSection[1].trim() : "";
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

/**
 * GET /api/calendar?date=2026-04-10
 * Returns week's time blocks from Daily Notes
 */
export async function GET(req: NextRequest) {
  const dateParam = req.nextUrl.searchParams.get("date");
  const now = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const baseDate = dateParam || now.toISOString().split("T")[0];
  const weekDates = getWeekDates(baseDate);

  const days: DayData[] = [];

  for (const date of weekDates) {
    const dailyPath = `010_Daily/${date}.md`;
    const file = await getFileContent(dailyPath);

    const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
    const d = new Date(date + "T00:00:00");
    const dayName = dayNames[d.getDay()];

    if (file) {
      days.push({
        date,
        day: dayName,
        focus: parseFocus(file.content),
        blocks: parseTimeBlocks(file.content, date),
        expenses: [],
      });
    } else {
      days.push({
        date,
        day: dayName,
        focus: "",
        blocks: [],
        expenses: [],
      });
    }
  }

  return NextResponse.json({ week: weekDates, days });
}

/**
 * POST /api/calendar
 * Add a time block to a Daily Note
 * Body: { date: "2026-04-10", startHour: 9, endHour: 12, category: "업무", memo: "코드리뷰" }
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { date, startHour, endHour, category, memo } = body as {
    date?: string;
    startHour?: number;
    endHour?: number;
    category?: string;
    memo?: string;
  };

  if (!date || startHour == null || endHour == null || !category) {
    return NextResponse.json({ error: "date, startHour, endHour, category required" }, { status: 400 });
  }

  const dailyPath = `010_Daily/${date}.md`;
  const file = await getFileContent(dailyPath);

  const row = `| ${startHour}-${endHour} | ${category} | ${memo || ""} |`;

  if (file) {
    // Insert row into Time Blocks table
    const marker = /## (?:🧱 )?Time Blocks/;
    const markerMatch = file.content.match(marker);
    if (!markerMatch) {
      return NextResponse.json({ error: "Time Blocks section not found" }, { status: 400 });
    }

    // Find the table header row and insert after it
    const tableHeaderPattern = /\|.*시간.*\|.*카테고리.*\|.*메모.*\|\n\|[-\s|]+\|/;
    const headerMatch = file.content.match(tableHeaderPattern);

    let updated: string;
    if (headerMatch) {
      const insertPos = file.content.indexOf(headerMatch[0]) + headerMatch[0].length;
      updated = file.content.slice(0, insertPos) + "\n" + row + file.content.slice(insertPos);
    } else {
      // No table yet, add after Time Blocks heading
      const idx = file.content.search(marker);
      const headingEnd = file.content.indexOf("\n", idx);
      updated = file.content.slice(0, headingEnd + 1) +
        "\n| 시간 | 카테고리 | 메모 |\n|------|---------|------|\n" + row + "\n" +
        file.content.slice(headingEnd + 1);
    }

    const result = await commitToGitHub(
      dailyPath,
      updated,
      `daily: add time block ${startHour}-${endHour} ${category}`,
      file.sha
    );
    return NextResponse.json(result);
  } else {
    // Create new daily note with time block
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const d = new Date(date + "T00:00:00");
    const dayName = dayNames[d.getDay()];

    const content = `---\ntags: [Daily]\ndate: ${date}\nday: ${dayName}\nfocus: ""\n---\n\n# ${date}\n\n## Focus\n- [ ] \n\n## Time Blocks\n\n| 시간 | 카테고리 | 메모 |\n|------|---------|------|\n${row}\n\n## Log\n-\n`;
    const result = await commitToGitHub(dailyPath, content, `daily: create + time block ${startHour}-${endHour} ${category}`);
    return NextResponse.json(result);
  }
}
