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
          className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-sm text-neutral-200 placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none transition-colors"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 text-xs"
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
                : "border-neutral-800 text-neutral-500 hover:border-neutral-600 hover:text-neutral-300"
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
            className={`rounded px-2 py-0.5 text-[10px] transition-colors ${
              selectedTag === tag
                ? "bg-neutral-700 text-neutral-200"
                : "bg-neutral-800/50 text-neutral-500 hover:bg-neutral-800 hover:text-neutral-400"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* 필터 상태 */}
      {hasFilters && (
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <span>{filtered.length} / {posts.length} posts</span>
          <button onClick={clearFilters} className="text-neutral-400 hover:text-neutral-200 underline">
            Reset
          </button>
        </div>
      )}

      {/* 포스트 목록 */}
      <div className="space-y-4">
        {filtered.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="block group">
            <Card className="border-neutral-800 hover:border-neutral-600 transition-colors">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <CardDescription className="text-[11px] text-neutral-500">
                    {post.date}
                  </CardDescription>
                  {post.categories.map((cat) => (
                    <Badge
                      key={cat}
                      variant="outline"
                      className="text-[9px] px-1.5 py-0 text-neutral-400 border-neutral-700"
                    >
                      {cat}
                    </Badge>
                  ))}
                </div>
                <CardTitle className="text-sm font-medium text-neutral-200 group-hover:text-neutral-50 transition-colors leading-relaxed mt-1">
                  {post.title}
                </CardTitle>
              </CardHeader>
              {(post.summary || post.tags.length > 0) && (
                <CardContent className="p-4 pt-0">
                  {post.summary && (
                    <p className="text-xs text-neutral-400 line-clamp-2 mb-2">
                      {post.summary}
                    </p>
                  )}
                  {post.tags.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap">
                      {post.tags.slice(0, 5).map((tag) => (
                        <span
                          key={tag}
                          className="text-[9px] text-neutral-500 bg-neutral-800/50 rounded px-1.5 py-0.5"
                        >
                          {tag}
                        </span>
                      ))}
                      {post.tags.length > 5 && (
                        <span className="text-[9px] text-neutral-600">
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
          <Card className="border-neutral-800">
            <CardContent className="py-10 text-center text-neutral-500 text-sm">
              {hasFilters ? "No matching posts." : "No posts yet."}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
