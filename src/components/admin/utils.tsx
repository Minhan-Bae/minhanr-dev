/**
 * Shared helpers for admin/* components.
 *
 * Phase Admin-Cleanup (2026-04-11): extracted from the 1167-line
 * src/app/(private)/admin/page.tsx.
 */

export function StatusLed({ status }: { status: string }) {
  const color =
    status === "active"
      ? "bg-green-400"
      : status === "error"
        ? "bg-red-400"
        : "bg-muted-foreground";
  return (
    <span className="relative flex h-2.5 w-2.5">
      {status === "active" && (
        <span
          className={`absolute inline-flex h-full w-full animate-ping rounded-full ${color} opacity-75`}
        />
      )}
      <span
        className={`relative inline-flex h-2.5 w-2.5 rounded-full ${color}`}
      />
    </span>
  );
}

export function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "never";
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

export const PRIORITY_COLORS: Record<string, string> = {
  P0: "bg-red-500/20 text-red-300 border-red-500/30",
  P1: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  P2: "bg-primary/20 text-primary border-primary/30",
  P3: "bg-muted/50 text-foreground/80 border-border",
};

export const KANBAN_COLUMNS = ["backlog", "in_progress", "done", "blocked"] as const;

export const COLUMN_LABELS: Record<string, string> = {
  backlog: "Backlog",
  in_progress: "In Progress",
  done: "Done",
  blocked: "Blocked",
};

export const AGENT_BADGE: Record<string, string> = {
  Alpha: "bg-primary/20 text-primary",
  Beta: "bg-green-400/20 text-green-300",
  Gamma: "bg-purple-400/20 text-purple-300",
  "RT Slot 1": "bg-emerald-400/20 text-emerald-300",
  "RT Slot 2": "bg-cyan-400/20 text-cyan-300",
  "RT Slot 3": "bg-amber-400/20 text-amber-300",
  Manual: "bg-muted/50 text-foreground/80",
};

export const STATUS_OPTIONS = [
  "seed",
  "growing",
  "mature",
  "published",
  "active",
  "archived",
] as const;
