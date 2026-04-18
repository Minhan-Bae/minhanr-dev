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
