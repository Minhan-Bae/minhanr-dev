"use client";

import { ErrorFallback } from "@/components/error-fallback";

export default function GraphError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorFallback error={error} reset={reset} scope="Graph" />;
}
