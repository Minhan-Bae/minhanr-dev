/**
 * Vault frontmatter 수정 유틸.
 * GitHub Contents API를 통해 vault 노트의 프론트매터를 직접 수정한다.
 */

import { getFileContent, commitToGitHub } from "./github";

/**
 * 노트의 프론트매터 필드를 업데이트하고 커밋한다.
 * 본문은 보존하고 프론트매터만 수정.
 */
export async function updateFrontmatterField(
  path: string,
  fields: Record<string, string | boolean | number>,
  commitMessage: string
): Promise<{ ok: boolean; error?: string }> {
  const file = await getFileContent(path);
  if (!file) return { ok: false, error: `File not found: ${path}` };

  const fmMatch = file.content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!fmMatch) return { ok: false, error: "No frontmatter found" };

  let fm = fmMatch[1];
  const body = fmMatch[2];

  for (const [key, value] of Object.entries(fields)) {
    const strVal = typeof value === "string" ? value : String(value);
    const regex = new RegExp(`^${key}:.*$`, "m");
    if (regex.test(fm)) {
      fm = fm.replace(regex, `${key}: ${strVal}`);
    } else {
      fm += `\n${key}: ${strVal}`;
    }
  }

  const updated = `---\n${fm}\n---\n${body}`;
  return commitToGitHub(path, updated, commitMessage, file.sha);
}

/**
 * feedback_signals.json의 특정 필드를 업데이트.
 */
export async function updateFeedbackSignals(
  updater: (current: Record<string, unknown>) => Record<string, unknown>,
  commitMessage: string
): Promise<{ ok: boolean; error?: string }> {
  const file = await getFileContent("090_System/feedback_signals.json");
  if (!file) return { ok: false, error: "feedback_signals.json not found" };

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(file.content);
  } catch {
    return { ok: false, error: "Invalid JSON in feedback_signals.json" };
  }

  const updated = updater(data);
  const content = JSON.stringify(updated, null, 2) + "\n";
  return commitToGitHub(
    "090_System/feedback_signals.json",
    content,
    commitMessage,
    file.sha
  );
}
