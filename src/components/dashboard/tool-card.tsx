import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * ToolCard — the unit of the Dashboard Hub grid.
 *
 * Each card represents one personal-management tool the studio runs
 * (Time, Finance, Deadlines, Knowledge, Projects, …). Click-through
 * on the whole card jumps to that tool's dedicated page; the card
 * itself shows a tight "at a glance" summary.
 *
 * Intentionally spare — a ToolCard is a *signal*, not a working
 * surface. If the user wants to edit data they enter the tool.
 *
 * States:
 *   • normal       — title + metric(s) + children for extra
 *                    tool-specific rows
 *   • disabled     — hex diagonal stripe treatment + "soon" badge,
 *                    no href, reduced opacity. Use for roadmap stubs.
 */
export interface ToolCardProps {
  /** Upper-case tracking label, e.g. "Time · 01". */
  kicker: string;
  /** Main tool name, font-display italic. */
  title: string;
  /** One-line summary of current state, shown between title and
   *  metrics (optional). */
  description?: string;
  /** Link target when card is clickable. Omit + pass `disabled` for stubs. */
  href?: string;
  /** Icon in the top-right corner (lucide). */
  icon?: LucideIcon;
  /** Primary metric / label pair — sits prominent under the title. */
  primary?: { label: string; value: string };
  /** Secondary metrics — row of smaller label/value chips. */
  secondary?: Array<{ label: string; value: string; tint?: "primary" | "danger" | "muted" }>;
  /** Soft-disable (roadmap stub). Card becomes non-clickable + dim. */
  disabled?: boolean;
  /** Extra children render below metrics — e.g. mini bar, pill row. */
  children?: React.ReactNode;
}

export function ToolCard({
  kicker,
  title,
  description,
  href,
  icon: Icon,
  primary,
  secondary,
  disabled,
  children,
}: ToolCardProps) {
  const body = (
    <>
      <header className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="font-technical text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">
            {kicker}
          </p>
          <h3
            className="mt-1 font-display italic leading-tight tracking-[-0.015em] text-foreground"
            style={{ fontSize: "clamp(1.25rem, 2vw, 1.5rem)" }}
          >
            {title}
          </h3>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          {disabled ? (
            <span className="font-technical rounded-sm border border-[var(--hairline)] bg-muted/40 px-1.5 py-0.5 text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground/80">
              soon
            </span>
          ) : href ? (
            <ArrowUpRight
              className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
              strokeWidth={1.5}
              aria-hidden
            />
          ) : null}
          {Icon && (
            <Icon
              className="h-4 w-4 text-muted-foreground/70"
              strokeWidth={1.5}
              aria-hidden
            />
          )}
        </div>
      </header>

      {description && (
        <p className="mb-3 text-[12.5px] leading-[1.55] text-muted-foreground">
          {description}
        </p>
      )}

      {primary && (
        <div className="mb-1 flex items-baseline gap-2">
          <span
            className="font-display italic tabular-nums text-foreground"
            style={{ fontSize: "clamp(1.75rem, 3vw, 2.25rem)", lineHeight: "1" }}
          >
            {primary.value}
          </span>
          <span className="font-technical text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
            {primary.label}
          </span>
        </div>
      )}

      {secondary && secondary.length > 0 && (
        <div className="font-technical mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
          {secondary.map((s, i) => (
            <span key={i} className="flex items-baseline gap-1.5 tabular-nums">
              <span className="uppercase tracking-[0.14em] opacity-70">
                {s.label}
              </span>
              <span
                className={
                  s.tint === "primary"
                    ? "text-primary"
                    : s.tint === "danger"
                    ? "text-destructive"
                    : s.tint === "muted"
                    ? "text-muted-foreground/70"
                    : "text-foreground"
                }
              >
                {s.value}
              </span>
            </span>
          ))}
        </div>
      )}

      {children && <div className="mt-3">{children}</div>}
    </>
  );

  const baseCls =
    "relative block h-full overflow-hidden rounded-md border border-[var(--hairline)] bg-card/60 p-5 backdrop-blur-sm transition-all";
  const interactiveCls =
    "group hover:border-primary/40 hover:bg-card/80 hover:-translate-y-0.5";
  const disabledCls = "opacity-55 cursor-not-allowed";

  if (disabled || !href) {
    return (
      <div
        className={`${baseCls} ${disabled ? disabledCls : ""}`}
        aria-disabled={disabled || undefined}
      >
        {disabled && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, var(--foreground) 0 1px, transparent 1px 8px)",
            }}
          />
        )}
        {body}
      </div>
    );
  }

  return (
    <Link href={href} className={`${baseCls} ${interactiveCls}`}>
      {body}
    </Link>
  );
}
