"use client";

/**
 * Error fallback UI — Next.js error.tsx에서 재사용.
 * 에러 메시지 + 다시 시도 + 홈으로 돌아가기.
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ErrorFallbackProps {
  error: Error & { digest?: string };
  reset: () => void;
  /** 페이지 식별 라벨 (디버깅 + 사용자 안내) */
  scope?: string;
}

export function ErrorFallback({ error, reset, scope }: ErrorFallbackProps) {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 py-12">
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 space-y-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="size-5 text-destructive shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold text-destructive">
              {scope ? `${scope} 로드 실패` : "예상치 못한 오류"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {error.message || "알 수 없는 오류가 발생했습니다."}
            </p>
            {error.digest && (
              <p className="mt-2 text-[10px] font-mono text-muted-foreground/60">
                digest: {error.digest}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={reset} size="sm" variant="default">
            다시 시도
          </Button>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/50 hover:border-primary/30 transition-colors"
          >
            대시보드로
          </Link>
        </div>
      </div>
    </div>
  );
}
