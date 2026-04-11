/**
 * HoverGauge — hairline progress bar that fills L→R when the parent
 * `.group` is hovered. Used as a unified hover-feedback vocabulary across
 * blog cards (category-colored) and home page entry points (primary).
 *
 * Tenet 4 ("instruments first, atmosphere allowed"): the gauge is an
 * instrument-in-disguise — a measurement motif rather than decoration.
 * It sits below the card/row text, so the "opacity ≤ 0.25 over text"
 * rule does not apply. Single source of truth for thickness, duration
 * and easing — change here once and the whole vocabulary moves together.
 *
 * Requirements at the call site:
 *   - Parent element MUST have the `group` class (Tailwind group hover).
 *   - Parent element MUST be `relative` (and usually `overflow-hidden`
 *     unless it already clips the gauge with a border).
 */

interface HoverGaugeProps {
  /** Tailwind bg-* class. Defaults to `bg-primary` (single accent vocabulary). */
  color?: string;
  /**
   * - `"border"` — sits at `-bottom-px` so it overlaps the parent's
   *   `border-b` hairline (use for divided list rows).
   * - `"edge"` — sits at `bottom-0` (use for solid cards / surfaces).
   */
  align?: "border" | "edge";
}

export function HoverGauge({ color = "bg-primary", align = "edge" }: HoverGaugeProps) {
  const bottom = align === "border" ? "-bottom-px" : "bottom-0";
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute ${bottom} left-0 h-0.5 w-0 group-hover:w-full transition-[width] duration-[600ms] ease-out ${color}`}
    />
  );
}
