import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { appendToDailyNote, updateDailyCheckbox } from "@/lib/github";
import { requireUser } from "@/lib/api-auth";

const PRIORITY_LABELS: Record<string, string> = {
  P0: "DO NOW",
  P1: "SCHEDULE",
  P2: "DELEGATE",
  P3: "ELIMINATE",
};

export async function POST(request: NextRequest) {
  const { response: authResponse } = await requireUser();
  if (authResponse) return authResponse;
  const { title, axis, priority, assigned_to } = await request.json();
  if (!title?.trim()) {
    return NextResponse.json({ error: "title required" }, { status: 400 });
  }

  const prio = priority || "P2";

  // 1. Supabase INSERT
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      title: title.trim(),
      axis: axis || "convergence",
      priority: prio,
      assigned_to: assigned_to || null,
      status: "backlog",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 2. Daily Note append (best-effort)
  const label = PRIORITY_LABELS[prio] || prio;
  const line = `- [ ] ${title.trim()} (${prio} ${label})${assigned_to ? ` @${assigned_to}` : ""}`;
  const vaultResult = await appendToDailyNote("Tasks", line);

  return NextResponse.json({
    task: data,
    vault: vaultResult.ok ? "synced" : vaultResult.error || "skipped",
  }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const { response: authResponse } = await requireUser();
  if (authResponse) return authResponse;
  const { id, status, title, priority, assigned_to } = await request.json();
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  // Get current task for vault sync
  const { data: current } = await supabase
    .from("tasks")
    .select("title, status")
    .eq("id", id)
    .single();

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (status) updates.status = status;
  if (title) updates.title = title;
  if (priority) updates.priority = priority;
  if (assigned_to !== undefined) updates.assigned_to = assigned_to || null;
  if (status === "done") updates.completed_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Vault sync: done toggle (best-effort)
  let vaultStatus = "skipped";
  if (current?.title && status === "done" && current.status !== "done") {
    const r = await updateDailyCheckbox(current.title, true);
    vaultStatus = r.ok ? "synced" : r.error || "skipped";
  }

  return NextResponse.json({ task: data, vault: vaultStatus });
}
