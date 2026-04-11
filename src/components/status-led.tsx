/**
 * Animated status indicator dot.
 * Shared across Home, Command, and Admin pages.
 */
export function StatusLed({ status }: { status: string }) {
  const color =
    status === "active"
      ? "bg-emerald-400"
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
