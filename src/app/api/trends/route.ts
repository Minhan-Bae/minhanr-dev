import { NextRequest, NextResponse } from "next/server";
import { updateFeedbackSignals } from "@/lib/vault-write";
import { requireUser } from "@/lib/api-auth";

/**
 * POST /api/trends — 수집 방향 조정 (boost/suppress)
 * Body: { action: "boost" | "suppress", target: string, value?: number }
 *   - boost: project_weights[target] = value (default 1.5)
 *   - suppress: domain_suppressions에 target 추가 (7일)
 */
export async function POST(req: NextRequest) {
  const { response: authResponse } = await requireUser();
  if (authResponse) return authResponse;
  const body = await req.json();
  const { action, target, value } = body as {
    action?: string;
    target?: string;
    value?: number;
  };

  if (!action || !target) {
    return NextResponse.json({ error: "action and target required" }, { status: 400 });
  }

  if (action === "boost") {
    const weight = value ?? 1.5;
    const result = await updateFeedbackSignals((data) => {
      const weights = (data.project_weights as Record<string, number>) || {};
      weights[target] = weight;
      data.project_weights = weights;
      (data._meta as Record<string, unknown>).updated = new Date().toISOString();
      return data;
    }, `web: boost ${target} → ${value ?? 1.5}`);
    return NextResponse.json(result);
  }

  if (action === "suppress") {
    const until = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    const result = await updateFeedbackSignals((data) => {
      const suppressions = (data.domain_suppressions as Array<Record<string, string>>) || [];
      suppressions.push({
        domain: target,
        until,
        reason: `web: user suppressed`,
      });
      data.domain_suppressions = suppressions;
      (data._meta as Record<string, unknown>).updated = new Date().toISOString();
      return data;
    }, `web: suppress ${target} for 7d`);
    return NextResponse.json(result);
  }

  return NextResponse.json({ error: "action must be boost or suppress" }, { status: 400 });
}
