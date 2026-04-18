"use client";

/**
 * 최후의 안전망 — 라우트별 error.tsx가 잡지 못한 에러.
 * Next.js는 global-error.tsx에서 자체 <html>/<body> 렌더 요구.
 */

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
        <div className="max-w-md space-y-4 text-center">
          <h1 className="text-2xl font-bold">애플리케이션 오류</h1>
          <p className="text-sm text-muted-foreground">
            {error.message || "알 수 없는 오류가 발생했습니다."}
          </p>
          {error.digest && (
            <p className="text-xs font-mono text-muted-foreground/60">
              digest: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:opacity-90 transition-opacity"
          >
            다시 시도
          </button>
        </div>
      </body>
    </html>
  );
}
