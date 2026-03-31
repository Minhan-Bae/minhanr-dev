import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, getAllSlugs } from "@/lib/blog";
import { Badge } from "@/components/ui/badge";

export async function generateStaticParams() {
  const slugs = getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post Not Found" };
  const title = `${post.title} | OIKBAS Blog`;
  const description = post.summary || post.title;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.date,
      authors: [post.author || "MinHanr"],
      images: [{ url: `/api/og?title=${encodeURIComponent(post.title)}`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/api/og?title=${encodeURIComponent(post.title)}`],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <Link
        href="/blog"
        className="inline-flex items-center text-xs text-neutral-500 hover:text-neutral-300 transition-colors mb-8"
      >
        &larr; Back to Blog
      </Link>

      <article>
        <header className="mb-8 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <time className="text-xs text-neutral-500">{post.date}</time>
            {post.author && (
              <span className="text-xs text-neutral-600">by {post.author}</span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
            {post.title}
          </h1>
          {post.categories.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {post.categories.map((cat) => (
                <Badge
                  key={cat}
                  variant="outline"
                  className="text-[10px] text-neutral-400 border-neutral-700"
                >
                  {cat}
                </Badge>
              ))}
            </div>
          )}
          {post.tags.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[9px] text-neutral-500 bg-neutral-800/50 rounded px-1.5 py-0.5"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {post.cover?.image && (
          <div className="mb-8 rounded-lg overflow-hidden border border-neutral-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.cover.image}
              alt={post.cover.alt || post.title}
              className="w-full h-auto"
            />
          </div>
        )}

        <div
          className="prose prose-invert prose-sm max-w-none
            prose-headings:font-semibold prose-headings:tracking-tight
            prose-h2:text-lg prose-h2:mt-8 prose-h2:mb-3
            prose-h3:text-base prose-h3:mt-6 prose-h3:mb-2
            prose-p:text-neutral-300 prose-p:leading-relaxed
            prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-neutral-200
            prose-code:text-sm prose-code:bg-neutral-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-neutral-300
            prose-pre:bg-neutral-900 prose-pre:border prose-pre:border-neutral-800 prose-pre:rounded-lg
            prose-img:rounded-lg prose-img:border prose-img:border-neutral-800
            prose-table:text-sm
            prose-th:text-neutral-300 prose-th:border-neutral-700
            prose-td:border-neutral-800
            prose-li:text-neutral-300
            prose-blockquote:border-neutral-700 prose-blockquote:text-neutral-400"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>

      <div className="mt-12 pt-6 border-t border-neutral-800">
        <Link
          href="/blog"
          className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
        >
          &larr; Back to Blog
        </Link>
      </div>
    </div>
  );
}
