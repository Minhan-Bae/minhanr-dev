import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { BlogPostMeta } from "@/lib/blog";

/**
 * Public category palette — single source of truth.
 *
 * Adding a public category: add one entry here. Done.
 * Removing / hiding a category: delete the entry. `isPublicCategory()`
 *   automatically excludes it from the filter UI in BlogList.
 */
const PUBLIC_CATEGORIES = new Set([
  "AI",
  "VFX",
  "Research",
  "Creative Technology",
  "General",
]);

/** True iff `cat` is in the public palette (i.e. safe to expose in filter UIs). */
export function isPublicCategory(cat: string): boolean {
  return PUBLIC_CATEGORIES.has(cat);
}

type Variant = "featured" | "default" | "cover-hero" | "quote";

interface BlogCardProps {
  post: BlogPostMeta;
  variant?: Variant;
  className?: string;
}

/**
 * variant auto-selection. Editorial design uses a single card family;
 * `featured` is promoted, everything else collapses to the same `default`
 * list-item. `cover-hero` survives when a post ships with real imagery.
 */
export function pickVariant(post: BlogPostMeta): Exclude<Variant, "featured"> {
  if (post.cover?.image) return "cover-hero";
  return "default";
}

export function BlogCard({
  post,
  variant = "default",
  className = "",
}: BlogCardProps) {
  if (variant === "featured") return <FeaturedCard post={post} className={className} />;
  if (variant === "cover-hero") return <CoverCard post={post} className={className} />;
  // `quote` collapses into default — the new layout conveys that via the
  // lede italic under the title instead of a separate card shape.
  return <DefaultRow post={post} className={className} />;
}

/** ISO YYYY-MM-DD → "MAR 22 '26" short editorial stamp. */
function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) return iso;
  const month = d
    .toLocaleString("en-US", { month: "short", timeZone: "UTC" })
    .toUpperCase();
  const day = String(d.getUTCDate()).padStart(2, "0");
  const year = String(d.getUTCFullYear()).slice(-2);
  return `${month} ${day} '${year}`;
}

/**
 * Featured — first post in an unfiltered listing. Pulls a larger layout
 * that leads the page editorially.
 */
function FeaturedCard({
  post,
  className,
}: {
  post: BlogPostMeta;
  className: string;
}) {
  const hasCover = Boolean(post.cover?.image);
  const primaryCategory = post.categories[0];

  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`group block ${className}`}
    >
      <article className="grid gap-8 sm:grid-cols-12 sm:gap-10">
        <div className="sm:col-span-7 media-zoom overflow-hidden rounded-sm">
          {hasCover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.cover!.image}
              alt={post.cover?.alt || post.title}
              className="aspect-[16/10] w-full object-cover"
            />
          ) : (
            <div
              className="grain relative aspect-[16/10] w-full"
              style={{
                background:
                  "linear-gradient(135deg, color-mix(in oklch, var(--primary) 22%, var(--surface-2)) 0%, var(--surface-1) 60%, var(--background) 100%)",
              }}
            >
              <div
                aria-hidden
                className="absolute left-6 top-0 h-12 w-[3px] bg-primary"
              />
              <div className="absolute inset-0 flex items-end p-8">
                <span className="font-display text-4xl leading-[0.95] tracking-tight text-foreground">
                  {post.title.slice(0, 28)}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="sm:col-span-5 sm:pt-4">
          <p className="kicker mb-4">
            Featured
            {primaryCategory ? ` · ${primaryCategory}` : ""} ·{" "}
            {formatDate(post.date)}
          </p>
          <h3
            className="font-display leading-[0.98] tracking-[-0.02em] transition-colors group-hover:text-primary"
            style={{ fontSize: "var(--font-size-h2)" }}
          >
            {post.title}
          </h3>
          {post.summary && (
            <p className="mt-5 max-w-prose text-base leading-relaxed text-muted-foreground">
              {post.summary}
            </p>
          )}
          <span className="font-technical mt-8 inline-flex items-center gap-2 text-[13px] uppercase tracking-[0.14em] text-foreground/80">
            Read
            <ArrowUpRight
              className="h-4 w-4 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
              strokeWidth={1.5}
            />
          </span>
        </div>
      </article>
    </Link>
  );
}

/**
 * CoverCard — post with a cover image, rendered as a media-forward card.
 * Used when a grid layout is appropriate (e.g. filtered results two-up).
 */
function CoverCard({
  post,
  className,
}: {
  post: BlogPostMeta;
  className: string;
}) {
  const primaryCategory = post.categories[0];

  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`group block ${className}`}
    >
      <article>
        <div className="media-zoom overflow-hidden rounded-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.cover!.image}
            alt={post.cover?.alt || post.title}
            loading="lazy"
            className="aspect-[16/10] w-full object-cover"
          />
        </div>
        <div className="mt-4">
          <p className="font-technical text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {primaryCategory ?? "Writing"} · {formatDate(post.date)}
          </p>
          <h3
            className="mt-2 font-display leading-tight tracking-[-0.015em] transition-colors group-hover:text-primary"
            style={{ fontSize: "var(--font-size-h4)" }}
          >
            {post.title}
          </h3>
          {post.summary && (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2">
              {post.summary}
            </p>
          )}
        </div>
      </article>
    </Link>
  );
}

/**
 * DefaultRow — the workhorse. Hairline-divided editorial list row. Parent
 * should wrap children in `<ul className="divide-y divide-[var(--hairline)] hairline-t">`
 * to stack these correctly.
 */
function DefaultRow({
  post,
  className,
}: {
  post: BlogPostMeta;
  className: string;
}) {
  const primaryCategory = post.categories[0];

  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`group grid grid-cols-[auto_1fr_auto] items-baseline gap-4 py-5 transition-colors hover:bg-[var(--surface-1)] sm:grid-cols-[88px_120px_1fr_auto] sm:gap-6 ${className}`}
    >
      <time
        dateTime={post.date}
        className="font-technical w-20 text-[11px] uppercase tracking-[0.16em] text-muted-foreground tabular-nums sm:w-auto"
      >
        {formatDate(post.date)}
      </time>
      <span className="font-technical hidden text-[11px] uppercase tracking-[0.16em] text-muted-foreground sm:inline">
        {primaryCategory ?? ""}
      </span>
      <div className="min-w-0 col-span-2 sm:col-span-1">
        <h3
          className="font-display leading-snug tracking-[-0.01em] transition-colors group-hover:text-primary"
          style={{ fontSize: "var(--font-size-h4)" }}
        >
          {post.title}
        </h3>
        {post.summary && (
          <p className="mt-1 line-clamp-1 text-[14px] text-muted-foreground">
            {post.summary}
          </p>
        )}
      </div>
      <ArrowUpRight
        className="h-4 w-4 flex-none text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
        strokeWidth={1.5}
      />
    </Link>
  );
}
