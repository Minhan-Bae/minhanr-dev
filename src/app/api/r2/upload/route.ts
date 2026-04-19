import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

/**
 * POST /api/r2/upload — 이미지·첨부를 R2 minhanr-dev-notes 버킷으로 업로드.
 *
 * 요청: multipart/form-data
 *   file      File — 업로드 파일 (10MB 이하)
 *   path      string — 노트 경로 (예: 020_Projects/foo.md), 저장 경로 파생용
 *
 * 응답 200:
 *   { url: string, key: string }
 * 응답 401 unauthenticated / 413 too large / 501 if R2 env not configured.
 *
 * 인증: Supabase session 필수 (studio 편집자 전용).
 * 저장 경로: `notes/<note-slug>/<timestamp>-<original>` — note별 그룹핑,
 *   시간 prefix로 collision 회피.
 *
 * Phase A 노트: R2 dev-url 활성화 또는 custom domain 연결 이후 작동.
 *   env 미설정 상태에서는 501 반환 — 에디터 UX는 paste 실패 토스트만.
 */

const MAX_BYTES = 10 * 1024 * 1024; // 10MB

export async function POST(req: Request) {
  // Auth
  const sb = await createSupabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Env check
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKey = process.env.R2_ACCESS_KEY_ID;
  const secretKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_NOTES_BUCKET || "minhanr-dev-notes";
  const publicBase = process.env.R2_NOTES_PUBLIC_URL;
  if (!accountId || !accessKey || !secretKey || !publicBase) {
    return NextResponse.json(
      {
        error:
          "R2 not configured — set R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / R2_NOTES_PUBLIC_URL in env",
      },
      { status: 501 }
    );
  }

  // Parse multipart
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }
  const file = form.get("file");
  const notePath = form.get("path");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `파일 크기가 10MB를 넘습니다 (${file.size}).` },
      { status: 413 }
    );
  }

  // Derive key
  const noteSlug =
    typeof notePath === "string"
      ? notePath
          .replace(/\.md$/, "")
          .replace(/[^0-9a-zA-Z가-힣_\-/]/g, "_")
          .replace(/_+/g, "_")
      : "_loose";
  const safeName = file.name.replace(/[^0-9a-zA-Z가-힣._\-]/g, "_").replace(/_+/g, "_");
  const ts = new Date()
    .toISOString()
    .replace(/[:.]/g, "-")
    .replace(/T/, "_")
    .slice(0, 19); // 20260419_033658
  const key = `notes/${noteSlug}/${ts}-${safeName}`;

  // S3 (R2) PUT
  const s3 = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
  });

  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: bytes,
        ContentType: file.type || "application/octet-stream",
      })
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[r2.upload] PUT failed", msg);
    return NextResponse.json({ error: `R2 PUT failed: ${msg}` }, { status: 502 });
  }

  const url = `${publicBase.replace(/\/$/, "")}/${key}`;
  return NextResponse.json({ ok: true, url, key });
}
