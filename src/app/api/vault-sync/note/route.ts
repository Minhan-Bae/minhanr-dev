import { NextRequest, NextResponse } from "next/server";
import { commitToGitHub } from "@/lib/github";

export async function POST(request: NextRequest) {
  const { text } = await request.json();
  if (!text?.trim()) {
    return NextResponse.json({ error: "text required" }, { status: 400 });
  }

  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const dateStr = kst.toISOString().split("T")[0];
  const ts = kst.toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const slug = text.trim().slice(0, 30).replace(/[^a-zA-Z0-9가-힣\s-]/g, "").replace(/\s+/g, "-");
  const fileName = `dashboard_${ts}_${slug}`.slice(0, 80);
  const path = `000_Inbox/${fileName}.md`;

  const content = `---
source: dashboard
status: inbox
created: ${dateStr}
tags: [Quick-Capture]
---

${text.trim()}
`;

  const result = await commitToGitHub(
    path,
    content,
    `inbox: dashboard quick capture`
  );

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  return NextResponse.json({ status: "saved", path }, { status: 201 });
}
