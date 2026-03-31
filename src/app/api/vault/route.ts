import { NextResponse } from "next/server";

export async function GET() {
  try {
    const token = process.env.GITHUB_TOKEN;
    const url =
      "https://api.github.com/repos/Minhan-Bae/oikbas-vault/contents/090_System/vault_index.json";

    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3.raw",
      "User-Agent": "minhanr-dev",
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(url, { headers, next: { revalidate: 300 } });
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
