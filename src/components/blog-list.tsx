"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PostMeta {
  title: string;
  date: string;
  slug: string;
  tags: string[];
  categories: string[];
  summary: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  AI: "border-l-primary",
  VFX: "border-l-chart-3",
  Research: "border-l-chart-1",
  "Creative Technology": "border-l-chart-4",
  TrinityX: "border-l-chart-2",
};

function getCategoryBorder(categories: string[]): string {
  for (const cat of categories) {
    if (CATEGORY_COLORS[cat]) return CATEGORY_COLORS[cat];
  }
  return "border-l-border";
}

export function BlogList({ posts }: { posts: PostMeta[] }) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => p.categories.forEach((c) => set.add(c)));
    return Array.from(set).sort();
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

  const hasFilters = query || selectedCategory || selectedTag;

  return (
    <>
      {/* 검색 */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search posts..."
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

      {/* 포스트 목록 */}
      <div className="space-y-4">
        {filtered.map((post, index) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block group animate-fade-up"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <Card
              className={`border-border hover:border-primary/20 hover:bg-[var(--surface-1)] card-lift transition-all border-l-4 ${getCategoryBorder(post.categories)} ${
                index === 0 && !hasFilters ? "ring-1 ring-primary/10" : ""
              }`}
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
                <CardTitle
                  className={`font-medium text-foreground group-hover:text-primary transition-colors leading-relaxed mt-1 ${
                    index === 0 && !hasFilters ? "text-base" : "text-sm"
                  }`}
                >
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
            </Card>
          </Link>
        ))}

        {filtered.length === 0 && (
          <Card className="border-border">
            <CardContent className="py-10 text-center text-muted-foreground text-sm">
              {hasFilters ? "No matching posts." : "No posts yet."}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
