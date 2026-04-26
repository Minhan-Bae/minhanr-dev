import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { requireUser } from "@/lib/api-auth";

export async function GET() {
  const { response: authResponse } = await requireUser();
  if (authResponse) return authResponse;
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("agent_heartbeats")
    .select("*")
    .order("agent_layer", { ascending: true })
    .order("agent_name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ agents: data });
}

/**
 * POST /api/heartbeat — vault → minhanr-dev SSOT 브리지
 * 2026-04-26 추가: rt_heartbeat.jsonl push GHA가 호출하여 Supabase
 *                  agent_heartbeats를 동기화한다.
 *
 * 인증: 헤더 `x-heartbeat-secret` = MINHANR_DEV_HEARTBEAT_SECRET (=CRON_SECRET)
 * 본문: { entries: [{ ts: string, slot: number|string, action?: string,
 *                    collected?: number, notes?: string }, ...] }
 *       또는 { ts, slot, ... } 단일 엔트리
 */
export async function POST(req: NextRequest) {
  const expected = process.env.MINHANR_DEV_HEARTBEAT_SECRET || process.env.CRON_SECRET;
  if (!expected) {
    return NextResponse.json({ error: "server_misconfigured" }, { status: 503 });
  }
  const provided = req.headers.get("x-heartbeat-secret");
  if (provided !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const arr = Array.isArray((body as { entries?: unknown[] })?.entries)
    ? ((body as { entries: unknown[] }).entries)
    : [body];

  const supabase = createSupabaseAdmin();
  const results: Array<{ agent: string; ok: boolean; error?: string }> = [];

  for (const raw of arr) {
    const entry = raw as { ts?: string; slot?: number | string; action?: string; collected?: number; notes?: string };
    if (!entry?.ts || entry.slot == null) continue;

    const slotNum = typeof entry.slot === "string" ? parseInt(entry.slot, 10) : entry.slot;
    if (!Number.isFinite(slotNum) || slotNum < 1 || slotNum > 3) continue;
    const agentName = `rt_slot${slotNum}`;

    const msg = entry.action
      ? `slot${slotNum} ${entry.action}${entry.notes ? `: ${entry.notes}` : ""}`
      : `slot${slotNum} collected=${entry.collected ?? 0}${entry.notes ? `: ${entry.notes}` : ""}`;

    const { error } = await supabase
      .from("agent_heartbeats")
      .upsert(
        {
          agent_name: agentName,
          status: "active",
          last_commit_at: entry.ts,
          last_commit_msg: msg.slice(0, 200),
          error_message: null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "agent_name" }
      );

    results.push({ agent: agentName, ok: !error, error: error?.message });
  }

  return NextResponse.json({ status: "ok", count: results.length, results });
}
