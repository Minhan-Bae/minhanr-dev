"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServer } from "@/lib/supabase-server";
import type {
  TimeCategory,
  TimeCategoryInsert,
  TimeCategoryUpdate,
  TimeEntry,
  TimeEntryInsert,
  TimeEntryUpdate,
} from "@/lib/database.types";
import { SLOT_MINUTES } from "@/lib/time/week";

/**
 * Time-tracking server actions. Every call:
 *   1. Re-validates the Supabase session (middleware already gates the
 *      route, but actions can be triggered from stale clients).
 *   2. Scopes to the current user via RLS — we never pass user_id in
 *      from the client.
 *   3. Revalidates /calendar so the grid re-fetches.
 */

async function requireUser() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, user };
}

function invalidate() {
  revalidatePath("/calendar");
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
}

// ── Categories ────────────────────────────────────────────────────

export async function listCategories(): Promise<TimeCategory[]> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("time_categories")
    .select("*")
    .order("display_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function seedDefaultCategories(): Promise<{ inserted: number }> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.rpc("seed_default_time_categories", {
    p_user_id: user.id,
  });
  if (error) throw error;
  invalidate();
  // We don't get row count back from the RPC; re-query to report.
  const { count } = await supabase
    .from("time_categories")
    .select("*", { count: "exact", head: true });
  return { inserted: count ?? 0 };
}

export async function createCategory(
  input: Pick<TimeCategoryInsert, "label" | "color_hex" | "display_order">
): Promise<TimeCategory> {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("time_categories")
    .insert({ ...input, user_id: user.id })
    .select()
    .single();
  if (error) throw error;
  invalidate();
  return data;
}

export async function updateCategory(
  id: string,
  patch: TimeCategoryUpdate
): Promise<TimeCategory> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("time_categories")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  invalidate();
  return data;
}

export async function deleteCategory(id: string): Promise<void> {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("time_categories").delete().eq("id", id);
  if (error) throw error;
  invalidate();
}

// ── Entries ───────────────────────────────────────────────────────

/**
 * Range query for the weekly grid. `from` is inclusive (Sunday 00:00
 * KST), `toExclusive` is the following Sunday's midnight.
 */
export async function listEntriesInRange(
  fromIso: string,
  toExclusiveIso: string
): Promise<TimeEntry[]> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("time_entries")
    .select("*")
    .gte("slot_start", fromIso)
    .lt("slot_start", toExclusiveIso)
    .order("slot_start", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createEntry(input: {
  slot_start: string; // ISO, must already be 30-min aligned UTC
  duration_minutes?: number;
  category_id: string | null;
  intensity?: "main" | "buffer";
  note?: string | null;
}): Promise<TimeEntry> {
  const { supabase, user } = await requireUser();
  const payload: TimeEntryInsert = {
    user_id: user.id,
    slot_start: input.slot_start,
    duration_minutes: input.duration_minutes ?? SLOT_MINUTES,
    category_id: input.category_id,
    intensity: input.intensity ?? "main",
    note: input.note ?? null,
  };
  const { data, error } = await supabase
    .from("time_entries")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  invalidate();
  return data;
}

export async function updateEntry(
  id: string,
  patch: TimeEntryUpdate
): Promise<TimeEntry> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("time_entries")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  invalidate();
  return data;
}

export async function deleteEntry(id: string): Promise<void> {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("time_entries").delete().eq("id", id);
  if (error) throw error;
  invalidate();
}
