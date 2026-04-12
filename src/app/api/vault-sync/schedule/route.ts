import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { appendToDailyNote } from "@/lib/github";
import { requireUser } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
  const { response: authResponse } = await requireUser();
  if (authResponse) return authResponse;
  const supabase = createSupabaseAdmin();
  const body = await request.json();
  const { title, day_of_week, start_hour, end_hour, category, is_routine, specific_date } = body;

  if (!title || day_of_week == null || start_hour == null || end_hour == null) {
    return NextResponse.json(
      { error: "title, day_of_week, start_hour, end_hour required" },
      { status: 400 }
    );
  }

  const startStr = `${String(Math.floor(start_hour)).padStart(2, "0")}:${start_hour % 1 ? "30" : "00"}`;
  const endStr = `${String(Math.floor(end_hour)).padStart(2, "0")}:${end_hour % 1 ? "30" : "00"}`;
  const line = `- 🧱 ${startStr}-${endStr} ${title} [${category || "event"}]`;
  const dateStr: string | undefined = specific_date || undefined;

  // Supabase INSERT + Daily Note append are independent — run in parallel.
  const [dbResult, vaultResult] = await Promise.all([
    supabase
      .from("schedules")
      .insert({
        title,
        day_of_week,
        start_hour,
        end_hour,
        category: category || "event",
        is_routine: is_routine || false,
        specific_date: specific_date || null,
      })
      .select()
      .single(),
    appendToDailyNote("Time Blocks", line, dateStr),
  ]);

  if (dbResult.error) {
    return NextResponse.json({ error: dbResult.error.message }, { status: 500 });
  }

  return NextResponse.json({
    schedule: dbResult.data,
    vault: vaultResult.ok ? "synced" : vaultResult.error || "skipped",
  }, { status: 201 });
}
