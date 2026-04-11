import { NextResponse } from "next/server";
import { VAULT_INDEX_URL, CACHE_TTL_VAULT } from "@/lib/constants";
import { requireUser } from "@/lib/api-auth";

export async function GET() {
  const { response: authResponse } = await requireUser();
  if (authResponse) return authResponse;
  try {
    const token = process.env.GITHUB_TOKEN;

    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3.raw",
      "User-Agent": "minhanr-dev",
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(VAULT_INDEX_URL, { headers, next: { revalidate: CACHE_TTL_VAULT } });
    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch vault index", status: res.status },
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
