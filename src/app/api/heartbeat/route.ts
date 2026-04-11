import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireUser } from "@/lib/api-auth";

export async function GET() {
  const { response: authResponse } = await requireUser();
  if (authResponse) return authResponse;
  const { data, error } = await supabase
    .from("agent_heartbeats")
    .select("*")
    .order("agent_layer", { ascending: true })
    .order("agent_name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ agents: data });
}
