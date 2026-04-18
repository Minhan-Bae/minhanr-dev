import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Public visit counter — intentionally unauthenticated.
 *
 *   GET  → read-only {today, total}
 *   POST → increment today's counter, return {today, total}
 *
 * The table is locked down with RLS; the service-role admin client is
 * the only path that can touch it. Errors are swallowed to {today: 0,
 * total: 0} so the visitor-counter UI never breaks the dock — this is
 * a decoration, not a critical data path.
 */

type VisitStats = { today: number; total: number };

function zeroStats(): VisitStats {
  return { today: 0, total: 0 };
}

async function readStats(): Promise<VisitStats> {
  try {
    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase.rpc("get_visit_stats");
    if (error || !data || !Array.isArray(data) || data.length === 0) {
      return zeroStats();
    }
    const row = data[0] as { today: number | string; total: number | string };
    return {
      today: Number(row.today ?? 0),
      total: Number(row.total ?? 0),
    };
  } catch {
    return zeroStats();
  }
}

async function recordVisit(): Promise<VisitStats> {
  try {
    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase.rpc("record_visit");
    if (error || !data || !Array.isArray(data) || data.length === 0) {
      return readStats();
    }
    const row = data[0] as { today: number | string; total: number | string };
    return {
      today: Number(row.today ?? 0),
      total: Number(row.total ?? 0),
    };
  } catch {
    return zeroStats();
  }
}

export async function GET() {
  const stats = await readStats();
  return NextResponse.json(stats, {
    headers: { "cache-control": "no-store" },
  });
}

export async function POST() {
  const stats = await recordVisit();
  return NextResponse.json(stats, {
    headers: { "cache-control": "no-store" },
  });
}
