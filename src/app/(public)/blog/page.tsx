import { getAllPosts } from "@/lib/blog";
import { BlogList } from "@/components/blog-list";

export const metadata = {
  title: "Blog",
  description: "AI, VFX, Creative Technology 기술 리서치와 프로젝트 기록",
  openGraph: {
    title: "Blog",
    description: "AI, VFX, Creative Technology 기술 리서치와 프로젝트 기록",
    type: "website" as const,
    images: [{ url: "/api/og", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image" as const,
    title: "Blog",
    description: "AI, VFX, Creative Technology 기술 리서치와 프로젝트 기록",
    images: ["/api/og"],
  },
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-6">
      <section className="space-y-2">
        <h1
          className="font-bold tracking-tight"
          style={{ fontSize: "var(--font-size-h1)" }}
        >
          Blog
        </h1>
        <p className="text-muted-foreground text-sm">
          AI, VFX, Creative Technology 분야의 기술 리서치와 프로젝트 기록.
        </p>
        <p className="text-muted-foreground text-xs">{posts.length} posts</p>
      </section>

      <BlogList posts={posts} />
    </div>
  );
}
