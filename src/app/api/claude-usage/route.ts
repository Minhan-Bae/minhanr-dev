import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

interface UsageBucket {
  input: number;
  output: number;
  cache_create: number;
  cache_read: number;
  total: number;
}

function emptyBucket(): UsageBucket {
  return { input: 0, output: 0, cache_create: 0, cache_read: 0, total: 0 };
}

export async function GET() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 86_400_000)
    .toISOString()
    .slice(0, 10);

  const { data, error } = await supabase
    .from("claude_usage")
    .select(
      "date, input_tokens, output_tokens, cache_creation_tokens, cache_read_tokens"
    )
    .gte("date", sevenDaysAgo)
    .order("date", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const byDate: Record<string, UsageBucket> = {};
  for (const row of data ?? []) {
    const d = row.date;
    if (!byDate[d]) byDate[d] = emptyBucket();
    byDate[d].input += row.input_tokens;
    byDate[d].output += row.output_tokens;
    byDate[d].cache_create += row.cache_creation_tokens;
    byDate[d].cache_read += row.cache_read_tokens;
    byDate[d].total +=
      row.input_tokens +
      row.output_tokens +
      row.cache_creation_tokens +
      row.cache_read_tokens;
  }

  const today = new Date().toISOString().slice(0, 10);
  const todayStats = byDate[today] ?? emptyBucket();

  const weekTotal = Object.values(byDate).reduce((acc, d) => {
    acc.input += d.input;
    acc.output += d.output;
    acc.cache_create += d.cache_create;
    acc.cache_read += d.cache_read;
    acc.total += d.total;
    return acc;
  }, emptyBucket());

  return NextResponse.json({ today: todayStats, week: weekTotal, byDate });
}
