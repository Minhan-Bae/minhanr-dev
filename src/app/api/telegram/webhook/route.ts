import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

/**
 * POST /api/telegram/webhook — Telegram → minhanr-dev 콜백 수신
 *
 * 2026-04-26 status: **fallback only**
 *   현재 텔레그램의 production webhook은 Cloudflare Worker(oikbas-worker,
 *   https://oikbas-worker.miinh-anr.workers.dev) 가 SSOT로 처리한다.
 *   이 라우트는 다음의 fallback/대체 시나리오를 위해 보존된다:
 *     1) Cloudflare Worker 장애 시 setWebhook을 이 URL로 임시 절체
 *     2) Worker가 일부 update만 처리하고 나머지를 mirror할 때의 sink
 *     3) 자체 통합 테스트용 (curl로 update payload 흉내 가능)
 *
 * 활성화 시 등록:
 *   curl -X POST "https://api.telegram.org/bot${BOT_TOKEN}/setWebhook" \
 *     -d "url=https://minhanr.dev/api/telegram/webhook" \
 *     -d "secret_token=${TELEGRAM_WEBHOOK_SECRET}"
 *
 * 인증: Telegram이 모든 요청에 `X-Telegram-Bot-Api-Secret-Token` 헤더를 붙여
 *      보내주는 값이 setWebhook 시 등록한 secret_token과 일치하면 통과.
 *
 * 동작:
 *   1. update_id 중복 차단 (Supabase telegram_updates 테이블)
 *   2. callback_query → telegram_callbacks 기록 + 슬롯 명령 라우팅
 *   3. message (텍스트/명령) → telegram_messages 기록
 *   4. 알 수 없는 update 타입은 200 OK로 무시 (Telegram 재시도 폭주 방지)
 *
 * Supabase 스키마 (선택, 필요 시 마이그레이션 추가):
 *   telegram_updates(update_id bigint primary key, payload jsonb, created_at timestamptz)
 *   telegram_callbacks(id uuid, callback_id text, chat_id bigint, user_id bigint,
 *                      data text, message_id bigint, created_at timestamptz)
 *   telegram_messages(id uuid, chat_id bigint, user_id bigint, text text,
 *                     command text, created_at timestamptz)
 */

type TelegramUpdate = {
  update_id: number;
  message?: {
    message_id: number;
    from?: { id: number; username?: string };
    chat: { id: number };
    text?: string;
    entities?: Array<{ type: string; offset: number; length: number }>;
  };
  callback_query?: {
    id: string;
    from: { id: number; username?: string };
    message?: { message_id: number; chat: { id: number } };
    data?: string;
  };
};

async function answerCallback(token: string, callbackId: string, text?: string) {
  try {
    await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ callback_query_id: callbackId, text: text || "" }),
    });
  } catch {
    /* swallow — best effort */
  }
}

async function sendReply(token: string, chatId: number, text: string) {
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
  } catch {
    /* swallow — best effort */
  }
}

function parseCommand(text: string | undefined): string | null {
  if (!text || !text.startsWith("/")) return null;
  return text.split(/\s+/)[0].slice(1).split("@")[0].toLowerCase();
}

export async function POST(req: NextRequest) {
  // 1. Secret token 검증 — Telegram이 setWebhook 시 등록한 토큰을
  //    매 요청마다 동일 헤더로 전달함
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!expected) {
    // 미설정 시 503 — 등록 자체를 막아 노이즈 방지
    return NextResponse.json({ error: "server_misconfigured" }, { status: 503 });
  }
  const provided = req.headers.get("x-telegram-bot-api-secret-token");
  if (provided !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let update: TelegramUpdate;
  try {
    update = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  if (!update?.update_id) {
    return NextResponse.json({ status: "ignored" });
  }

  const cmdToken =
    process.env.TELEGRAM_CMD_BOT_TOKEN ||
    process.env.TELEGRAM_BOT_TOKEN ||
    "";

  const supabase = createSupabaseAdmin();

  // 2. update_id 중복 차단 (best-effort — 테이블 없으면 silently skip)
  try {
    const { error } = await supabase
      .from("telegram_updates")
      .insert({ update_id: update.update_id, payload: update });
    if (error && error.code === "23505") {
      // duplicate — Telegram retry. 200으로 응답하여 재시도 종료.
      return NextResponse.json({ status: "duplicate" });
    }
  } catch {
    /* table may not exist yet — ignore */
  }

  // 3. callback_query 처리 (인라인 키보드 응답)
  if (update.callback_query) {
    const cb = update.callback_query;
    try {
      await supabase.from("telegram_callbacks").insert({
        callback_id: cb.id,
        chat_id: cb.message?.chat.id ?? null,
        user_id: cb.from.id,
        data: cb.data ?? null,
        message_id: cb.message?.message_id ?? null,
      });
    } catch {
      /* table may not exist — ignore */
    }
    if (cmdToken) {
      await answerCallback(cmdToken, cb.id, "받았어요");
    }
    return NextResponse.json({ status: "ok", type: "callback_query" });
  }

  // 4. message 처리
  if (update.message) {
    const m = update.message;
    const cmd = parseCommand(m.text);
    try {
      await supabase.from("telegram_messages").insert({
        chat_id: m.chat.id,
        user_id: m.from?.id ?? null,
        text: m.text ?? "",
        command: cmd,
      });
    } catch {
      /* table may not exist — ignore */
    }

    // 슬래시 명령 라우팅 (간단 echo + status)
    if (cmd && cmdToken) {
      switch (cmd) {
        case "start":
        case "help":
          await sendReply(
            cmdToken,
            m.chat.id,
            "<b>OIKBAS bot</b>\n/status — 시스템 상태\n/heartbeat — RT slot 최근 동작\n/ping — 헬스체크"
          );
          break;
        case "ping":
          await sendReply(cmdToken, m.chat.id, "pong");
          break;
        case "status":
        case "heartbeat": {
          const { data } = await supabase
            .from("agent_heartbeats")
            .select("agent_name,status,last_commit_at,error_message")
            .in("agent_name", ["rt_slot1", "rt_slot2", "rt_slot3"]);
          const lines = (data ?? []).map((r) => {
            const ago = r.last_commit_at
              ? `${Math.round((Date.now() - new Date(r.last_commit_at).getTime()) / 3600000)}h`
              : "?";
            return `• ${r.agent_name}: ${r.status} (last ${ago} ago)`;
          });
          await sendReply(
            cmdToken,
            m.chat.id,
            lines.length ? lines.join("\n") : "No heartbeat data."
          );
          break;
        }
        default:
          await sendReply(cmdToken, m.chat.id, `unknown command: /${cmd}`);
      }
    }
    return NextResponse.json({ status: "ok", type: "message" });
  }

  return NextResponse.json({ status: "ignored" });
}
