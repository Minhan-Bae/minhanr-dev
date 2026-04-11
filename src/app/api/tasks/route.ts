import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { requireUser } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  const { response: authResponse } = await requireUser();
  if (authResponse) return authResponse;
  const supabase = createSupabaseAdmin();
  const { searchParams } = new URL(request.url);
  const axis = searchParams.get("axis");
  const status = searchParams.get("status");

  let query = supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });

  if (axis) query = query.eq("axis", axis);
  if (status) query = query.eq("status", status);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ tasks: data });
}

export async function POST(request: NextRequest) {
  const { response: authResponse } = await requireUser();
  if (authResponse) return authResponse;
  const supabase = createSupabaseAdmin();
  const body = await request.json();
  const { title, axis, priority, assigned_to } = body;

  if (!title || !axis) {
    return NextResponse.json({ error: "title and axis required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      title,
      axis,
      priority: priority || "P2",
      assigned_to: assigned_to || null,
      status: "backlog",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ task: data }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const { response: authResponse } = await requireUser();
  if (authResponse) return authResponse;
  const supabase = createSupabaseAdmin();
  const body = await request.json();
  const { id, status, title, priority, assigned_to } = body;

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

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
  return NextResponse.json({ task: data });
}

export async function DELETE(request: NextRequest) {
  const { response: authResponse } = await requireUser();
  if (authResponse) return authResponse;
  const supabase = createSupabaseAdmin();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const { error } = await supabase.from("tasks").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ status: "deleted" });
}
