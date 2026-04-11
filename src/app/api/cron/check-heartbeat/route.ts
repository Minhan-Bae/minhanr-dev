import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireCronSecret } from "@/lib/api-auth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

import { GITHUB_COMMITS_URL, CRON_COMMITS_PER_PAGE, COMMIT_MSG_MAX_LEN, ERROR_THRESHOLDS } from "@/lib/constants";

const AGENT_PREFIXES: Record<string, string> = {
  "alpha:": "alpha",
  "beta:": "beta",
  "gamma:": "gamma",
  "omega:": "omega",
  "auto: collect-all": "rt_slot1",
  "auto: collect": "rt_slot1",
  "auto: converge": "rt_slot2",
  "auto: morning": "rt_slot3",
};

function identifyAgent(msg: string): string | null {
  for (const [prefix, agent] of Object.entries(AGENT_PREFIXES)) {
    if (msg.startsWith(prefix)) return agent;
  }
  if (msg.startsWith("auto:")) return "rt_slot1";
  return null;
}

async function sendTelegramAlert(message: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: message }),
  });
}

export async function GET(req: NextRequest) {
  const unauthorized = requireCronSecret(req);
  if (unauthorized) return unauthorized;
  const results: string[] = [];

  // 1. Fallback polling: check recent GitHub commits and sync missing heartbeats
  try {
    const token = process.env.GITHUB_TOKEN;
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "User-Agent": "minhanr-dev",
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${GITHUB_COMMITS_URL}?per_page=${CRON_COMMITS_PER_PAGE}`, { headers });
    if (res.ok) {
      const commits = await res.json();
      for (const c of commits) {
        const msg: string = c.commit?.message || "";
        const agentName = identifyAgent(msg);
        if (!agentName) continue;

        const commitAt = c.commit?.author?.date;
        const commitHash = c.sha?.slice(0, 7);

        // Check if this commit is already reflected
        const { data: hb } = await supabase
          .from("agent_heartbeats")
          .select("last_commit_hash")
          .eq("agent_name", agentName)
          .single();

        if (hb && hb.last_commit_hash !== commitHash) {
          await supabase
            .from("agent_heartbeats")
            .update({
              status: "active",
              last_commit_hash: commitHash,
              last_commit_at: commitAt,
              last_commit_msg: msg.slice(0, COMMIT_MSG_MAX_LEN),
              error_message: null,
              updated_at: new Date().toISOString(),
            })
            .eq("agent_name", agentName);
          results.push(`synced ${agentName} → ${commitHash}`);
        }
      }
    }
  } catch (e) {
    results.push(`fallback error: ${e instanceof Error ? e.message : "unknown"}`);
  }

  // 2. Error detection for RT slots
  const { data: agents } = await supabase
    .from("agent_heartbeats")
    .select("*")
    .in("agent_name", ["rt_slot1", "rt_slot2", "rt_slot3"]);

  const now = Date.now();
  const alerts: string[] = [];

  for (const agent of agents || []) {
    const threshold = ERROR_THRESHOLDS[agent.agent_name];
    if (!threshold) continue;

    const lastActive = agent.last_commit_at
      ? new Date(agent.last_commit_at).getTime()
      : 0;
    const elapsed = now - lastActive;

    if (elapsed > threshold && agent.status !== "error") {
      const hours = Math.round(elapsed / (60 * 60 * 1000));
      await supabase
        .from("agent_heartbeats")
        .update({
          status: "error",
          error_message: `${hours}h 미활동 (임계: ${threshold / (60 * 60 * 1000)}h)`,
          updated_at: new Date().toISOString(),
        })
        .eq("agent_name", agent.agent_name);

      alerts.push(`${agent.agent_name} 비활동 ${hours}시간`);
      results.push(`error: ${agent.agent_name} (${hours}h)`);
    }
  }

  // 3. Send Telegram alerts
  if (alerts.length > 0) {
    await sendTelegramAlert(
      `⚠️ OIKBAS Agent Alert\n${alerts.join("\n")}`
    );
    results.push(`telegram: ${alerts.length} alerts sent`);
  }

  return NextResponse.json({ status: "ok", results });
}
