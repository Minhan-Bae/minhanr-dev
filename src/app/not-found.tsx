import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <p className="kicker mb-6">404</p>
      <h1
        className="font-display leading-[0.95] tracking-[-0.03em]"
        style={{ fontSize: "var(--font-size-h1)" }}
      >
        Nothing here.
      </h1>
      <p className="mt-6 max-w-sm text-sm text-muted-foreground">
        The page you asked for does not exist — it may have been moved, or
        it never did.
      </p>
      <Link
        href="/"
        className="font-technical mt-10 inline-flex items-center gap-2 border-b border-primary pb-1 text-[13px] uppercase tracking-[0.16em] text-foreground transition-colors hover:text-primary"
      >
        Back to home
      </Link>
    </div>
  );
}
