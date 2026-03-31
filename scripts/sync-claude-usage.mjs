#!/usr/bin/env node

/**
 * Claude Code 세션 JSONL 파일을 파싱하여 Supabase claude_usage 테이블에 동기화
 * /workspace/.env 에서 환경변수를 자동 로드합니다.
 *
 * 사용법:
 *   node scripts/sync-claude-usage.mjs
 */

import { createReadStream, readdirSync, readFileSync } from "fs";
import { createInterface } from "readline";
import { join } from "path";
import { homedir } from "os";

// /workspace/.env 자동 로드
try {
  const envPath = "/workspace/.env";
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const match = line.match(/^([A-Z_]+)="?([^"]*)"?$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2];
    }
  }
} catch {
  // .env 없으면 기존 환경변수 사용
}

const JSONL_DIR = join(homedir(), ".claude", "projects", "-workspace");

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Error: SUPABASE_URL and SUPABASE_SERVICE_KEY are required");
  process.exit(1);
}

async function parseJsonlFile(filePath) {
  const records = new Map(); // key: requestId -> usage data

  const rl = createInterface({
    input: createReadStream(filePath, "utf-8"),
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    try {
      const entry = JSON.parse(line);
      if (entry.type !== "assistant" || !entry.message?.usage) continue;

      const requestId = entry.requestId;
      if (!requestId) continue;

      const usage = entry.message.usage;
      const date = entry.timestamp?.slice(0, 10);
      const sessionId = entry.sessionId;
      if (!date || !sessionId) continue;

      // requestId 기준 마지막 행만 유지 (중복 제거)
      records.set(requestId, {
        date,
        sessionId,
        input_tokens: usage.input_tokens || 0,
        output_tokens: usage.output_tokens || 0,
        cache_creation_tokens: usage.cache_creation_input_tokens || 0,
        cache_read_tokens: usage.cache_read_input_tokens || 0,
      });
    } catch {
      // 파싱 실패한 행은 무시
    }
  }

  return Array.from(records.values());
}

function aggregateByDateSession(records) {
  const agg = new Map(); // key: "date|sessionId"

  for (const r of records) {
    const key = `${r.date}|${r.sessionId}`;
    const existing = agg.get(key);
    if (existing) {
      existing.input_tokens += r.input_tokens;
      existing.output_tokens += r.output_tokens;
      existing.cache_creation_tokens += r.cache_creation_tokens;
      existing.cache_read_tokens += r.cache_read_tokens;
    } else {
      agg.set(key, { ...r });
    }
  }

  return Array.from(agg.values()).map(({ sessionId, ...rest }) => ({
    ...rest,
    session_id: sessionId,
  }));
}

async function upsertToSupabase(rows) {
  if (rows.length === 0) {
    console.log("No data to sync.");
    return;
  }

  // Supabase REST API로 직접 upsert (의존성 없이)
  const url = `${SUPABASE_URL}/rest/v1/claude_usage`;

  // 50개씩 배치 처리
  const batchSize = 50;
  let total = 0;

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify(batch),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`Upsert failed (batch ${i / batchSize + 1}):`, res.status, body);
    } else {
      total += batch.length;
    }
  }

  console.log(`Synced ${total} rows to Supabase.`);
}

async function main() {
  let files;
  try {
    files = readdirSync(JSONL_DIR).filter((f) => f.endsWith(".jsonl"));
  } catch {
    console.error(`Cannot read directory: ${JSONL_DIR}`);
    process.exit(1);
  }

  console.log(`Found ${files.length} JSONL files in ${JSONL_DIR}`);

  const allRecords = [];
  for (const file of files) {
    const records = await parseJsonlFile(join(JSONL_DIR, file));
    allRecords.push(...records);
    console.log(`  ${file}: ${records.length} usage entries`);
  }

  const aggregated = aggregateByDateSession(allRecords);
  console.log(`Aggregated into ${aggregated.length} (date, session) rows`);

  await upsertToSupabase(aggregated);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
