import { NextRequest, NextResponse } from "next/server";
import { getFileContent, commitToGitHub } from "@/lib/github";
import { requireUser } from "@/lib/api-auth";
import { nowInKST } from "@/lib/time";

/**
 * POST /api/finance — 워치리스트 관리
 * Body: { action: "add" | "remove", symbol: string }
 */
export async function POST(req: NextRequest) {
  const { response: authResponse } = await requireUser();
  if (authResponse) return authResponse;
  const body = await req.json();
  const { action, symbol } = body as { action?: string; symbol?: string };

  if (!action || !symbol) {
    return NextResponse.json({ error: "action and symbol required" }, { status: 400 });
  }

  const ticker = symbol.toUpperCase();

  // 오늘 날짜의 Insider_Scan 노트 찾기 (KST)
  const now = nowInKST();
  const dateStr = now.toISOString().split("T")[0].replace(/-/g, "").slice(2);
  const scanPath = `030_Areas/034_Finance/${dateStr}_Insider_Scan.md`;

  const file = await getFileContent(scanPath);

  if (action === "add") {
    if (!file) {
      // 새 워치리스트 노트 생성
      const content = `---\ntags: [Finance, Watchlist]\nstatus: active\ncreated: ${now.toISOString().split("T")[0]}\n---\n\n# Watchlist\n\n## 수동 추가\n- ${ticker}\n`;
      const result = await commitToGitHub(
        scanPath,
        content,
        `web: add ${ticker} to watchlist`
      );
      return NextResponse.json(result);
    }

    // 기존 노트에 추가
    const marker = "## 워치리스트 현황";
    let updated: string;
    if (file.content.includes(marker)) {
      updated = file.content.replace(
        marker,
        `${marker}\n- ${ticker} (수동 추가 ${now.toISOString().split("T")[0]})`
      );
    } else {
      updated = file.content.trimEnd() + `\n\n## 워치리스트 현황\n- ${ticker} (수동 추가 ${now.toISOString().split("T")[0]})\n`;
    }
    const result = await commitToGitHub(scanPath, updated, `web: add ${ticker} to watchlist`, file.sha);
    return NextResponse.json(result);
  }

  if (action === "remove") {
    if (!file) {
      return NextResponse.json({ ok: false, error: "No scan note found for today" });
    }
    const regex = new RegExp(`^.*${ticker}.*$`, "gm");
    const updated = file.content.replace(regex, "").replace(/\n{3,}/g, "\n\n");
    const result = await commitToGitHub(scanPath, updated, `web: remove ${ticker} from watchlist`, file.sha);
    return NextResponse.json(result);
  }

  return NextResponse.json({ error: "action must be add or remove" }, { status: 400 });
}
