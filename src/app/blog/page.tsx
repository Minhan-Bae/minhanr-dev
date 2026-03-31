import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Blog | OIKBAS",
  description: "AI, VFX, Creative Technology 기술 리서치와 프로젝트 기록",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-8">
      <section className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
        <p className="text-neutral-400 text-sm">
          AI, VFX, Creative Technology 분야의 기술 리서치와 프로젝트 기록.
        </p>
        <p className="text-neutral-500 text-xs">{posts.length} posts</p>
      </section>

      <div className="space-y-4">
        {posts.map((post) => (
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

        {posts.length === 0 && (
          <Card className="border-neutral-800">
            <CardContent className="py-10 text-center text-neutral-500 text-sm">
              No posts yet.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
