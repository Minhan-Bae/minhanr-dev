import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface PostMeta {
  title: string;
  date: string;
  slug: string;
  categories: string[];
  summary: string;
  tags?: string[];
}

interface RelatedPostsProps {
  currentSlug: string;
  currentCategories: string[];
  currentTags: string[];
  allPosts: PostMeta[];
  limit?: number;
}

/** YYYY-MM-DD → "MAR 22 '26" */
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

export function RelatedPosts({
  currentSlug,
  currentCategories,
  currentTags,
  allPosts,
  limit = 3,
}: RelatedPostsProps) {
  const scored = allPosts
    .filter((p) => p.slug !== currentSlug)
    .map((p) => {
      let score = 0;
      for (const cat of p.categories) {
        if (currentCategories.includes(cat)) score += 3;
      }
      if (Array.isArray(p.tags)) {
        for (const tag of p.tags) {
          if (currentTags.includes(tag)) score += 1;
        }
      }
      return { post: p, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  if (scored.length === 0) return null;

  return (
    <section>
      <header className="mb-6 flex items-baseline justify-between hairline-b pb-3">
        <h2
          className="font-display tracking-[-0.015em]"
          style={{ fontSize: "var(--font-size-h3)" }}
        >
          Keep reading
        </h2>
        <span className="font-technical text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Related
        </span>
      </header>

      <ul className="divide-y divide-[var(--hairline)]">
        {scored.map(({ post }) => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="group grid grid-cols-[auto_1fr_auto] items-baseline gap-4 py-5 transition-colors hover:bg-[var(--surface-1)] sm:grid-cols-[90px_110px_1fr_auto] sm:gap-6"
            >
              <time className="font-technical text-[11px] uppercase tracking-[0.16em] text-muted-foreground tabular-nums">
                {formatDate(post.date)}
              </time>
              <span className="font-technical hidden text-[11px] uppercase tracking-[0.16em] text-muted-foreground sm:inline">
                {post.categories[0] ?? ""}
              </span>
              <h3
                className="font-display tracking-[-0.01em] transition-colors group-hover:text-primary col-span-2 sm:col-span-1"
                style={{ fontSize: "var(--font-size-h4)" }}
              >
                {post.title}
              </h3>
              <ArrowUpRight
                className="h-4 w-4 flex-none text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                strokeWidth={1.5}
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
