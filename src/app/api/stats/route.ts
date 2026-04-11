import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { aggregate, getCachedVaultIndex } from "@/lib/vault-index";
import { requireUser } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const { response: authResponse } = await requireUser();
  if (authResponse) return authResponse;
  const supabase = createSupabaseAdmin();
  // Axis metrics from Supabase (existing behavior, kept backward compatible)
  const { data: metrics, error } = await supabase
    .from("axis_metrics")
    .select("*")
    .order("date", { ascending: false })
    .limit(21);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const axes = ["acquisition", "convergence", "amplification"];
  const latest: Record<string, { utilization: number; notes_count: number; delta: unknown }> = {};
  for (const axis of axes) {
    const row = metrics?.find((m) => m.axis === axis);
    latest[axis] = {
      utilization: row?.utilization ?? 0,
      notes_count: row?.notes_count ?? 0,
      delta: row?.delta ?? {},
    };
  }

  // Vault aggregates (new)
  let vault: Awaited<ReturnType<typeof aggregate>> | null = null;
  let vault_error: string | null = null;
  try {
    const index = await getCachedVaultIndex();
    vault = aggregate(index);
  } catch (e) {
    vault_error = e instanceof Error ? e.message : "vault aggregate failed";
  }

  return NextResponse.json({
    latest,
    history: metrics ?? [],
    vault,
    vault_error,
  });
}
