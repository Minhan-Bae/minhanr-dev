import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface PostMeta {
  title: string;
  date: string;
  slug: string;
  categories: string[];
  summary: string;
}

interface RelatedPostsProps {
  currentSlug: string;
  currentCategories: string[];
  currentTags: string[];
  allPosts: PostMeta[];
  limit?: number;
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
      // Tag overlap for finer relevance
      if ("tags" in p && Array.isArray((p as { tags?: string[] }).tags)) {
        for (const tag of (p as { tags: string[] }).tags) {
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
    <section className="space-y-4">
      <h2 className="text-base font-semibold">Related Posts</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {scored.map(({ post }) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="rounded-lg border border-border p-4 hover:border-primary/30 hover:bg-[var(--surface-1)] card-lift transition-all duration-200 group space-y-2"
          >
            <div className="flex items-center gap-2">
              <time className="text-xs text-muted-foreground tabular-nums">
                {post.date}
              </time>
              {post.categories.slice(0, 1).map((cat) => (
                <Badge key={cat} variant="secondary" className="text-xs">
                  {cat}
                </Badge>
              ))}
            </div>
            <h3 className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-2">
              {post.title}
            </h3>
          </Link>
        ))}
      </div>
    </section>
  );
}
