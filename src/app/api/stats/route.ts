import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
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

  return NextResponse.json({ latest, history: metrics ?? [] });
}
