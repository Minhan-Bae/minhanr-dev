import { NextRequest, NextResponse } from "next/server";
import { updateFrontmatterField } from "@/lib/vault-write";

/**
 * POST /api/review — 발행 승인/거부/보류
 * Body: { path: string, action: "approve" | "reject" | "hold" }
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { path, action } = body as { path?: string; action?: string };

  if (!path || !action) {
    return NextResponse.json({ error: "path and action required" }, { status: 400 });
  }

  if (!["approve", "reject", "hold"].includes(action)) {
    return NextResponse.json({ error: "action must be approve/reject/hold" }, { status: 400 });
  }

  if (action === "approve") {
    const result = await updateFrontmatterField(
      path,
      { publish: "true", status: "published" },
      `web: approve publish ${path.split("/").pop()?.replace(/\.md$/, "")}`
    );
    return NextResponse.json(result);
  }

  if (action === "reject") {
    const result = await updateFrontmatterField(
      path,
      { publish: "false", publish_ready: "false" },
      `web: reject publish ${path.split("/").pop()?.replace(/\.md$/, "")}`
    );
    return NextResponse.json(result);
  }

  // hold — 변경 없음, 로그만
  return NextResponse.json({ ok: true, message: "held — no changes made" });
}
