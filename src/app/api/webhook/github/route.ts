import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { supabase } from "@/lib/supabase";

function verifySignature(payload: string, signature: string | null): boolean {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret) return false;
  if (!signature) return false;
  const expected = "sha256=" + createHmac("sha256", secret).update(payload).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

const AGENT_PREFIXES: Record<string, string> = {
  "alpha:": "alpha",
  "beta:": "beta",
  "gamma:": "gamma",
  "auto: collect-all": "rt_slot1",
  "auto: collect": "rt_slot1",
  "auto: converge": "rt_slot2",
  "auto: morning": "rt_slot3",
};

function identifyAgent(commitMsg: string): string | null {
  for (const [prefix, agent] of Object.entries(AGENT_PREFIXES)) {
    if (commitMsg.startsWith(prefix)) return agent;
  }
  if (commitMsg.startsWith("auto:")) return "rt_slot1";
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-hub-signature-256");
    if (!verifySignature(body, signature)) {
      const secret = process.env.GITHUB_WEBHOOK_SECRET;
      return NextResponse.json({ error: "invalid signature", debug: { secretLen: secret?.length, hasSig: !!signature, bodyLen: body.length } }, { status: 401 });
    }
    const payload = JSON.parse(body);

    if (!payload.commits || payload.commits.length === 0) {
      return NextResponse.json({ status: "no commits" });
    }

    const latestCommit = payload.commits[payload.commits.length - 1];
    const commitMsg: string = latestCommit.message || "";
    const commitHash: string = latestCommit.id?.slice(0, 7) || "";
    const commitAt: string = latestCommit.timestamp || new Date().toISOString();

    const agentName = identifyAgent(commitMsg);
    if (!agentName) {
      return NextResponse.json({ status: "unknown agent", commit: commitMsg });
    }

    const { error } = await supabase
      .from("agent_heartbeats")
      .update({
        status: "active",
        last_commit_hash: commitHash,
        last_commit_at: commitAt,
        last_commit_msg: commitMsg.slice(0, 200),
        error_message: null,
        updated_at: new Date().toISOString(),
      })
      .eq("agent_name", agentName);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ status: "ok", agent: agentName, commit: commitHash });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "unknown error" },
      { status: 500 }
    );
  }
}
