"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <p className="kicker mb-6 text-destructive">Error</p>
      <h1
        className="font-display leading-[0.95] tracking-[-0.03em]"
        style={{ fontSize: "var(--font-size-h1)" }}
      >
        Something broke.
      </h1>
      <p className="mt-6 max-w-md text-sm text-muted-foreground">
        An unexpected error occurred while rendering this page.
      </p>
      {error.message && (
        <p className="font-technical mt-3 max-w-lg text-[12px] uppercase tracking-[0.14em] text-muted-foreground/70">
          {error.message}
        </p>
      )}
      <button
        onClick={reset}
        className="font-technical mt-10 inline-flex items-center gap-2 border-b border-primary pb-1 text-[13px] uppercase tracking-[0.16em] text-foreground transition-colors hover:text-primary"
      >
        Try again
      </button>
    </div>
  );
}
