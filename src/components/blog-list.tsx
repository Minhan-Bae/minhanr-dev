"use client";

import { useState, useMemo } from "react";
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
    return Array.from(set).filter(isPublicCategory).sort();
  }, [posts]);

  const topTags = useMemo(() => {
    const counts: Record<string, number> = {};
    posts.forEach((p) =>
      p.tags.forEach((t) => {
        counts[t] = (counts[t] || 0) + 1;
      })
    );
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
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
      {/* Search + filter rail — editorial hairline style */}
      <div className="font-technical mx-auto max-w-[1120px] space-y-6">
        <div className="relative">
          <input
            type="search"
            placeholder={`Search ${posts.length} pieces`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full border-b border-[var(--hairline)] bg-transparent pb-3 pt-1 text-base text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-0 top-1 text-[11px] uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-3 text-[11px] uppercase tracking-[0.16em]">
          <span className="text-muted-foreground/70">Category</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() =>
                setSelectedCategory(selectedCategory === cat ? null : cat)
              }
              className={`transition-colors ${
                selectedCategory === cat
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {topTags.length > 0 && (
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2 text-[11px] tracking-[0.08em]">
            <span className="uppercase text-muted-foreground/70 tracking-[0.16em]">
              Tags
            </span>
            {topTags.map((tag) => (
              <button
                key={tag}
                onClick={() =>
                  setSelectedTag(selectedTag === tag ? null : tag)
                }
                className={`transition-colors ${
                  selectedTag === tag
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        {hasFilters && (
          <div className="flex items-center gap-4 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            <span>
              {filtered.length} / {posts.length}
            </span>
            <button
              onClick={clearFilters}
              className="link-underline hover:text-foreground"
            >
              Reset
            </button>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="mx-auto max-w-[1120px] pt-6">
        {hasFilters ? (
          <ul className="divide-y divide-[var(--hairline)] hairline-t hairline-b">
            {filtered.map((post) => (
              <li key={post.slug}>
                <BlogCard post={post} variant={pickVariant(post)} />
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="py-16 text-center text-sm text-muted-foreground">
                No matching pieces.
              </li>
            )}
          </ul>
        ) : (
          <div className="space-y-20 sm:space-y-28">
            {featured && (
              <div>
                <BlogCard post={featured} variant="featured" />
              </div>
            )}

            {groups.map((group) => (
              <section key={group.key}>
                <header className="mb-6 flex items-baseline justify-between hairline-b pb-3">
                  <h2
                    className="font-display tracking-[-0.015em]"
                    style={{ fontSize: "var(--font-size-h3)" }}
                  >
                    {group.label}
                  </h2>
                  <span className="font-technical text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    {group.posts.length}
                  </span>
                </header>
                <ul className="divide-y divide-[var(--hairline)] hairline-b">
                  {group.posts.map((post) => (
                    <li key={post.slug}>
                      <BlogCard post={post} variant={pickVariant(post)} />
                    </li>
                  ))}
                </ul>
              </section>
            ))}

            {posts.length === 0 && (
              <p className="py-16 text-center text-sm text-muted-foreground">
                No pieces published yet.
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
