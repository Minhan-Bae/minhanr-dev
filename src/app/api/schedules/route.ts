import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("schedules")
    .select("*")
    .order("day_of_week")
    .order("start_hour");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ schedules: data });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, day_of_week, start_hour, end_hour, category, color, is_routine, specific_date } = body;

  if (!title || day_of_week == null || start_hour == null || end_hour == null) {
    return NextResponse.json(
      { error: "title, day_of_week, start_hour, end_hour required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("schedules")
    .insert({
      title,
      day_of_week,
      start_hour,
      end_hour,
      category: category || "event",
      color: color || null,
      is_routine: is_routine || false,
      specific_date: specific_date || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ schedule: data }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("schedules")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ schedule: data });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const { error } = await supabase.from("schedules").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ status: "deleted" });
}
