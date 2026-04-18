import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HoverGauge } from "@/components/hover-gauge";
import type { BlogPostMeta } from "@/lib/blog";

/**
 * Public category palette — single source of truth.
 *
 * Adding a public category: add one entry here. Done.
 * Removing / hiding a category: delete the entry. `isPublicCategory()`
 *   automatically excludes it from the filter UI in BlogList.
 *
 * TrinityX is intentionally absent — Tier 3 internal codename, never exposed.
 */
const CATEGORY_PALETTE: Record<string, { border: string; bg: string }> = {
  AI: { border: "border-l-primary", bg: "bg-primary" },
  VFX: { border: "border-l-chart-3", bg: "bg-chart-3" },
  Research: { border: "border-l-chart-1", bg: "bg-chart-1" },
  "Creative Technology": { border: "border-l-chart-4", bg: "bg-chart-4" },
};

const FALLBACK_COLORS = { border: "border-l-border", bg: "bg-foreground/30" };

/** True iff `cat` is in the public palette (i.e. safe to expose in filter UIs). */
export function isPublicCategory(cat: string): boolean {
  return cat in CATEGORY_PALETTE;
}

/**
 * Resolve the visual treatment for a post's categories.
 * Picks the first matching public category; falls back to neutral border/bg.
 */
export function getCategoryColors(categories: string[]): { border: string; bg: string } {
  for (const cat of categories) {
    const palette = CATEGORY_PALETTE[cat];
    if (palette) return palette;
  }
  return FALLBACK_COLORS;
}

type Variant = "featured" | "default" | "cover-hero" | "quote";

interface BlogCardProps {
  post: BlogPostMeta;
  variant?: Variant;
  className?: string;
}

/**
 * variant 자동 선택:
 *   - cover 이미지 있으면 cover-hero
 *   - summary가 길고 의미 있으면 (≥120자) quote
 *   - 그 외 default
 */
export function pickVariant(post: BlogPostMeta): Exclude<Variant, "featured"> {
  if (post.cover?.image) return "cover-hero";
  if (post.summary && post.summary.length >= 120) return "quote";
  return "default";
}

export function BlogCard({ post, variant = "default", className = "" }: BlogCardProps) {
  if (variant === "featured") return <FeaturedCard post={post} className={className} />;
  if (variant === "cover-hero") return <CoverHeroCard post={post} className={className} />;
  if (variant === "quote") return <QuoteCard post={post} className={className} />;
  return <DefaultCard post={post} className={className} />;
}

function FeaturedCard({ post, className }: { post: BlogPostMeta; className: string }) {
  const colors = getCategoryColors(post.categories);
  const hasCover = Boolean(post.cover?.image);

  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`block group ${className}`}
    >
      <Card
        className={`relative border-border hover:border-primary/30 hover:bg-[var(--surface-1)] card-lift transition-all border-l-4 ${colors.border} overflow-hidden`}
      >
        <div className="grid md:grid-cols-[3fr_2fr] gap-0">
          {/* Text column */}
          <div className="flex flex-col justify-between p-5 sm:p-6 min-h-[200px]">
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                {post.categories.map((cat) => (
                  <Badge
                    key={cat}
                    variant="secondary"
                    className="text-xs px-2 py-0.5"
                  >
                    {cat}
                  </Badge>
                ))}
                <CardDescription className="text-xs text-muted-foreground tabular-nums">
                  {post.date}
                </CardDescription>
              </div>
              <h2
                className="font-medium text-foreground group-hover:text-primary transition-colors leading-tight"
                style={{ fontSize: "var(--font-size-h4)" }}
              >
                {post.title}
              </h2>
              {post.summary && (
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {post.summary}
                </p>
              )}
            </div>
            {post.tags.length > 0 && (
              <div className="flex gap-1.5 flex-wrap mt-4">
                {post.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs text-primary/80 bg-primary/10 rounded px-1.5 py-0.5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Visual column — cover image or aurora placeholder */}
          <div className="relative aspect-[16/10] md:aspect-auto md:min-h-full bg-[var(--surface-1)] overflow-hidden">
            {hasCover ? (
              // Project pattern: raw <img> for cover (matches blog/[slug] detail page).
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.cover!.image}
                alt={post.cover?.alt || post.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
              />
            ) : (
              <div
                aria-hidden="true"
                className="absolute inset-0 mesh-aurora"
              />
            )}
          </div>
        </div>
        <HoverGauge color={colors.bg} align="edge" />
      </Card>
    </Link>
  );
}

function CoverHeroCard({ post, className }: { post: BlogPostMeta; className: string }) {
  const colors = getCategoryColors(post.categories);
  return (
    <Link href={`/blog/${post.slug}`} className={`block group ${className}`}>
      <Card
        className={`relative overflow-hidden hover-lift border-border hover:border-primary/30 transition-[border-color] duration-[var(--duration-quick)] border-l-4 ${colors.border}`}
      >
        {/* Cover dominant — 16:9 상단 */}
        <div className="relative aspect-[16/9] bg-[var(--surface-1)] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.cover!.image}
            alt={post.cover?.alt || post.title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
          />
          {/* Gradient scrim for legibility */}
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />
          {/* Date/category chip overlayed */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
            {post.categories.slice(0, 1).map((cat) => (
              <Badge key={cat} variant="secondary" className="text-[10px] px-1.5 py-0 bg-background/80 backdrop-blur-sm">
                {cat}
              </Badge>
            ))}
            <span className="text-[10px] text-white/80 tabular-nums bg-black/30 backdrop-blur-sm rounded px-1.5 py-0.5">
              {post.date}
            </span>
          </div>
        </div>
        <CardContent className="p-4 space-y-2">
          <CardTitle className="text-sm font-semibold leading-tight group-hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </CardTitle>
          {post.summary && (
            <p className="text-xs text-muted-foreground line-clamp-2">{post.summary}</p>
          )}
        </CardContent>
        <HoverGauge color={colors.bg} align="edge" />
      </Card>
    </Link>
  );
}

function QuoteCard({ post, className }: { post: BlogPostMeta; className: string }) {
  const colors = getCategoryColors(post.categories);
  return (
    <Link href={`/blog/${post.slug}`} className={`block group ${className}`}>
      <Card
        className={`relative hover-lift border-border hover:border-primary/20 transition-[border-color] duration-[var(--duration-quick)] border-l-4 ${colors.border}`}
      >
        <CardContent className="p-5 space-y-3">
          {/* Pull quote — summary를 시각 중심으로 */}
          <div className="relative pl-6">
            <span
              aria-hidden
              className="absolute left-0 top-0 text-3xl leading-none font-serif text-primary/30 select-none"
            >
              &ldquo;
            </span>
            <p className="text-sm font-medium text-foreground/90 leading-relaxed line-clamp-3 italic">
              {post.summary}
            </p>
          </div>
          {/* Footer: title as small caption + meta */}
          <div className="pt-2 border-t border-hairline space-y-1">
            <CardTitle className="text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors line-clamp-1 not-italic">
              — {post.title}
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] text-muted-foreground/70 tabular-nums">{post.date}</span>
              {post.categories.slice(0, 1).map((cat) => (
                <Badge key={cat} variant="secondary" className="text-[10px] px-1.5 py-0">
                  {cat}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
        <HoverGauge color={colors.bg} align="edge" />
      </Card>
    </Link>
  );
}

function DefaultCard({ post, className }: { post: BlogPostMeta; className: string }) {
  const colors = getCategoryColors(post.categories);

  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`block group ${className}`}
    >
      <Card
        className={`relative border-border hover:border-primary/20 hover:bg-[var(--surface-1)] card-lift transition-all border-l-4 ${colors.border}`}
      >
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <CardDescription className="text-xs text-muted-foreground tabular-nums">
              {post.date}
            </CardDescription>
            {post.categories.map((cat) => (
              <Badge
                key={cat}
                variant="secondary"
                className="text-xs px-1.5 py-0"
              >
                {cat}
              </Badge>
            ))}
          </div>
          <CardTitle className="text-sm font-medium text-foreground group-hover:text-primary transition-colors leading-relaxed mt-1">
            {post.title}
          </CardTitle>
        </CardHeader>
        {(post.summary || post.tags.length > 0) && (
          <CardContent className="p-4 pt-0">
            {post.summary && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                {post.summary}
              </p>
            )}
            {post.tags.length > 0 && (
              <div className="flex gap-1.5 flex-wrap">
                {post.tags.slice(0, 5).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs text-primary/80 bg-primary/10 rounded px-1.5 py-0.5"
                  >
                    {tag}
                  </span>
                ))}
                {post.tags.length > 5 && (
                  <span className="text-xs text-muted-foreground/50">
                    +{post.tags.length - 5}
                  </span>
                )}
              </div>
            )}
          </CardContent>
        )}
        <HoverGauge color={colors.bg} align="edge" />
      </Card>
    </Link>
  );
}
