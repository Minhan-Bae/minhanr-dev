/**
 * 재사용 가능한 skeleton 컴포넌트 — Next.js loading.tsx에서 사용.
 * skeleton-shimmer 클래스(globals.css 정의)와 결합.
 */

export function PageHeaderSkeleton() {
  return (
    <div className="space-y-2">
      <div className="h-8 w-48 skeleton-shimmer rounded-md bg-muted" />
      <div className="h-4 w-64 skeleton-shimmer rounded bg-muted" />
    </div>
  );
}

/**
 * 7-day × N-row timebox grid skeleton — header row + 6 "hour" stripes
 * so the eye reads the shape (weekly schedule) while data loads.
 */
export function CalendarGridSkeleton() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-5 sm:px-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <PageHeaderSkeleton />
        <div className="h-8 w-56 skeleton-shimmer rounded-full bg-muted" />
      </div>
      <div className="mb-2 flex items-center justify-between">
        <div className="h-7 w-48 skeleton-shimmer rounded bg-muted" />
        <div className="h-4 w-40 skeleton-shimmer rounded bg-muted" />
      </div>
      <div className="overflow-hidden rounded-md border border-border bg-background">
        <div
          className="grid min-w-[760px]"
          style={{
            gridTemplateColumns: "64px repeat(7, 1fr)",
            gridTemplateRows: "44px repeat(12, 36px)",
          }}
        >
          {/* Header row */}
          <div className="border-b border-r border-border bg-muted/30" />
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={`h-${i}`}
              className="skeleton-shimmer border-b border-r border-border bg-muted/40"
            />
          ))}
          {/* Body rows */}
          {Array.from({ length: 12 }).flatMap((_, row) =>
            Array.from({ length: 8 }).map((_, col) => (
              <div
                key={`r-${row}-${col}`}
                className={`skeleton-shimmer border-r border-t border-border/70 ${
                  col === 0 ? "bg-muted/30" : "bg-muted/20"
                }`}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-32 skeleton-shimmer rounded-lg border border-border/40 bg-muted/40"
        />
      ))}
    </div>
  );
}

export function StatStripSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className={`grid grid-cols-2 lg:grid-cols-${count} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-24 skeleton-shimmer rounded-lg border border-border/40 bg-muted/40"
        />
      ))}
    </div>
  );
}

export function ListSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-2">
          <div className="h-4 flex-1 skeleton-shimmer rounded bg-muted" />
          <div className="h-3 w-20 skeleton-shimmer rounded bg-muted/60" />
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="space-y-1">
        <div className="h-8 w-72 skeleton-shimmer rounded-md bg-muted" />
        <div className="h-4 w-48 skeleton-shimmer rounded bg-muted/60" />
      </div>
      <StatStripSkeleton count={4} />
      <div className="h-96 skeleton-shimmer rounded-lg border border-border/40 bg-muted/40" />
      <div className="h-32 skeleton-shimmer rounded-lg border border-border/40 bg-muted/40" />
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-7 h-64 skeleton-shimmer rounded-lg bg-muted/40" />
        <div className="col-span-12 lg:col-span-5 h-64 skeleton-shimmer rounded-lg bg-muted/40" />
      </div>
    </div>
  );
}

export function NotesPageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-8 space-y-6">
      <PageHeaderSkeleton />
      <div className="h-12 skeleton-shimmer rounded-lg bg-muted/40" />
      <CardGridSkeleton count={9} />
    </div>
  );
}

export function GenericPageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-8 space-y-6">
      <PageHeaderSkeleton />
      <ListSkeleton rows={8} />
    </div>
  );
}
