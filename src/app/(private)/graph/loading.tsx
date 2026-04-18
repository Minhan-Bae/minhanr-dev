import { PageHeaderSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-8 space-y-6">
      <PageHeaderSkeleton />
      <div className="h-[640px] skeleton-shimmer rounded-lg border border-border/40 bg-muted/40" />
    </div>
  );
}
