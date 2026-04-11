"use client";

import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
      <AlertTriangle className="h-12 w-12 text-destructive/50 mb-4" />
      <h1 className="text-4xl font-bold tracking-tight text-gradient">
        Error
      </h1>
      <p className="mt-4 text-sm text-muted-foreground">
        문제가 발생했습니다.
      </p>
      <p className="mt-1 text-xs text-muted-foreground/60 max-w-md">
        {error.message}
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        다시 시도
      </button>
    </div>
  );
}
