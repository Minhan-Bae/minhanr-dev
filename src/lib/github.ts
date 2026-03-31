/**
 * GitHub Contents API wrapper for vault read/write.
 * Ported from oikbas-worker/worker.js commitToGitHub() + appendToDailyNote().
 */

import { GITHUB_REPO } from "./constants";

const GITHUB_API = `https://api.github.com/repos/${GITHUB_REPO}/contents`;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";

function headers() {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "minhanr-dev",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (GITHUB_TOKEN) h.Authorization = `Bearer ${GITHUB_TOKEN}`;
  return h;
}

function toBase64(str: string): string {
  return Buffer.from(str, "utf-8").toString("base64");
}

function fromBase64(b64: string): string {
  return Buffer.from(b64, "base64").toString("utf-8");
}

/* ── Read file ── */

export async function getFileContent(
  path: string
): Promise<{ content: string; sha: string } | null> {
  const res = await fetch(`${GITHUB_API}/${path}`, { headers: headers() });
  if (!res.ok) return null;
  const data = await res.json();
  return {
    content: fromBase64(data.content.replace(/\n/g, "")),
    sha: data.sha,
  };
}

/* ── Write file (create or update) ── */

export async function commitToGitHub(
  path: string,
  content: string,
  message: string,
  sha?: string
): Promise<{ ok: boolean; error?: string }> {
  if (!GITHUB_TOKEN) {
    return { ok: false, error: "GITHUB_TOKEN not configured" };
  }

  const body: Record<string, string> = {
    message,
    content: toBase64(content),
    branch: "main",
  };
  if (sha) body.sha = sha;

  const res = await fetch(`${GITHUB_API}/${path}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    return { ok: false, error: `GitHub API ${res.status}: ${err}` };
  }
  return { ok: true };
}

/* ── Append to Daily Note ── */

function todayDate(): string {
  const now = new Date();
  // KST (UTC+9)
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().split("T")[0];
}

function getDayName(): string {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return days[kst.getUTCDay()];
}

export async function appendToDailyNote(
  section: string,
  line: string,
  date?: string
): Promise<{ ok: boolean; error?: string }> {
  const dateStr = date || todayDate();
  const dailyPath = `010_Daily/${dateStr}.md`;
  const existing = await getFileContent(dailyPath);

  if (existing) {
    const marker = `## ${section}`;
    const idx = existing.content.indexOf(marker);
    let updated: string;

    if (idx !== -1) {
      const insertPos = idx + marker.length;
      const afterMarker = existing.content.substring(insertPos);
      const firstNewline = afterMarker.indexOf("\n");
      if (firstNewline !== -1) {
        updated =
          existing.content.substring(0, insertPos + firstNewline + 1) +
          line +
          "\n" +
          afterMarker.substring(firstNewline + 1);
      } else {
        updated = existing.content + "\n" + line + "\n";
      }
    } else {
      // Section doesn't exist — append at end
      updated = existing.content.trimEnd() + `\n\n## ${section}\n${line}\n`;
    }

    return commitToGitHub(
      dailyPath,
      updated,
      `daily: dashboard ${section.toLowerCase()} update`,
      existing.sha
    );
  } else {
    // Create new daily note
    const content = `---\ntags: [Daily]\ndate: ${dateStr}\nday: ${getDayName()}\nfocus: ""\n---\n\n# ${dateStr}\n\n## ${section}\n${line}\n`;
    return commitToGitHub(
      dailyPath,
      content,
      `daily: create + dashboard ${section.toLowerCase()}`
    );
  }
}

/* ── Update checkbox in Daily Note ── */

export async function updateDailyCheckbox(
  taskTitle: string,
  checked: boolean,
  date?: string
): Promise<{ ok: boolean; error?: string }> {
  const dateStr = date || todayDate();
  const dailyPath = `010_Daily/${dateStr}.md`;
  const existing = await getFileContent(dailyPath);
  if (!existing) return { ok: false, error: "Daily note not found" };

  const oldMark = checked ? `- [ ] ${taskTitle}` : `- [x] ${taskTitle}`;
  const newMark = checked ? `- [x] ${taskTitle}` : `- [ ] ${taskTitle}`;

  if (!existing.content.includes(oldMark)) {
    return { ok: false, error: "Checkbox line not found" };
  }

  const updated = existing.content.replace(oldMark, newMark);
  return commitToGitHub(
    dailyPath,
    updated,
    `daily: ${checked ? "complete" : "reopen"} "${taskTitle}"`,
    existing.sha
  );
}
