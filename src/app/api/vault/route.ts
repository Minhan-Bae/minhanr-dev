import { NextResponse } from "next/server";

const VAULT_INDEX_URL =
  "https://raw.githubusercontent.com/MiiNhanr/oikbas/main/090_System/vault_index.json";

export async function GET() {
  try {
    const res = await fetch(VAULT_INDEX_URL, { next: { revalidate: 300 } });
    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch vault index" },
        { status: 502 }
      );
    }

    const index = await res.json();
    const meta = index._meta || {};

    return NextResponse.json({
      total_notes: meta.total_notes || 0,
      last_full_scan: meta.last_full_scan || null,
      last_commit_hash: meta.last_commit_hash || null,
      stats: meta.stats || {},
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "unknown error" },
      { status: 500 }
    );
  }
}
