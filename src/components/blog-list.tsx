"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BlogCard, isPublicCategory, pickVariant } from "@/components/blog-card";
import type { BlogPostMeta } from "@/lib/blog";

type Group = { key: string; label: string; posts: BlogPostMeta[] };

const FOURTEEN_DAYS_MS = 14 * 86400000;
const ONE_YEAR_MS = 365 * 86400000;
const MONTH_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});

function groupPostsByTime(posts: BlogPostMeta[]): Group[] {
  const now = Date.now();
  const recent: BlogPostMeta[] = [];
  const monthBuckets = new Map<string, Group>();
  const older: BlogPostMeta[] = [];

  for (const post of posts) {
    if (!post.date) {
      older.push(post);
      continue;
    }
    const d = new Date(post.date);
    const ageMs = now - d.getTime();
    if (ageMs < FOURTEEN_DAYS_MS) {
      recent.push(post);
    } else if (ageMs < ONE_YEAR_MS) {
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const existing = monthBuckets.get(key);
      if (existing) {
        existing.posts.push(post);
      } else {
        monthBuckets.set(key, {
          key,
          label: MONTH_FORMATTER.format(d),
          posts: [post],
        });
      }
    } else {
      older.push(post);
    }
  }

  const groups: Group[] = [];
  if (recent.length > 0) {
    groups.push({ key: "recent", label: "Recent", posts: recent });
  }
  // Insertion order is newest-first because input is date-desc sorted.
  for (const bucket of monthBuckets.values()) {
    groups.push(bucket);
  }
  if (older.length > 0) {
    groups.push({ key: "older", label: "Older", posts: older });
  }
  return groups;
}

export function BlogList({ posts }: { posts: BlogPostMeta[] }) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => p.categories.forEach((c) => set.add(c)));
    // Defense in depth: only show categories listed in the public palette
    // (CATEGORY_PALETTE in blog-card.tsx). Anything else — including the
    // Tier 3 TrinityX codename — is filtered out even if a stale post
    // still carries that frontmatter.
    return Array.from(set).filter(isPublicCategory).sort();
  }, [posts]);

  const topTags = useMemo(() => {
    const counts: Record<string, number> = {};
    posts.forEach((p) => p.tags.forEach((t) => { counts[t] = (counts[t] || 0) + 1; }));
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([tag]) => tag);
  }, [posts]);

  const filtered = useMemo(() => {
    let result = posts;
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.summary.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (selectedCategory) {
      result = result.filter((p) => p.categories.includes(selectedCategory));
    }
    if (selectedTag) {
      result = result.filter((p) => p.tags.includes(selectedTag));
    }
    return result;
  }, [posts, query, selectedCategory, selectedTag]);

  const clearFilters = () => {
    setQuery("");
    setSelectedCategory(null);
    setSelectedTag(null);
  };

  const hasFilters = Boolean(query || selectedCategory || selectedTag);

  const featured = !hasFilters && posts.length > 0 ? posts[0] : null;
  const groups = useMemo(() => {
    if (hasFilters || posts.length === 0) return [];
    return groupPostsByTime(posts.slice(1));
  }, [hasFilters, posts]);

  return (
    <>
      {/* 검색 */}
      <div className="relative">
        <input
          type="text"
          placeholder={`Wander through ${posts.length} notes...`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground/80 text-xs"
          >
            Clear
          </button>
        )}
      </div>

      {/* 카테고리 필터 */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
            className={`rounded-full px-3 py-1 text-xs border transition-colors ${
              selectedCategory === cat
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground/80"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 태그 필터 */}
      <div className="flex flex-wrap gap-1.5">
        {topTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
            className={`rounded px-2 py-0.5 text-xs transition-colors ${
              selectedTag === tag
                ? "bg-primary/15 text-primary"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground/80"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* 필터 상태 */}
      {hasFilters && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{filtered.length} / {posts.length} posts</span>
          <button onClick={clearFilters} className="text-muted-foreground hover:text-primary underline">
            Reset
          </button>
        </div>
      )}

      {/* 본문: 필터 활성 시 평면 결과, 아니면 Featured + 시간 그루핑 */}
      {hasFilters ? (
        <div className="space-y-3">
          {filtered.map((post) => (
            <BlogCard key={post.slug} post={post} variant={pickVariant(post)} />
          ))}
          {filtered.length === 0 && (
            <Card className="border-border">
              <CardContent className="py-10 text-center text-muted-foreground text-sm">
                No matching posts.
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="space-y-10">
          {featured && <BlogCard post={featured} variant="featured" />}

          {groups.map((group) => (
            <section key={group.key} className="space-y-3">
              <h2
                className="font-medium text-foreground/90 tracking-tight"
                style={{ fontSize: "var(--font-size-h3)" }}
              >
                {group.label}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {group.posts.map((post) => (
                  <BlogCard key={post.slug} post={post} variant={pickVariant(post)} />
                ))}
              </div>
            </section>
          ))}

          {posts.length === 0 && (
            <Card className="border-border">
              <CardContent className="py-10 text-center text-muted-foreground text-sm">
                No posts yet.
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </>
  );
}
