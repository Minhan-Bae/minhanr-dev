import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, getAllSlugs, getAllPosts, extractHeadings } from "@/lib/blog";
import { Badge } from "@/components/ui/badge";
import { ReadingProgress } from "@/components/reading-progress";
import { RelatedPosts } from "@/components/related-posts";
import { TableOfContents } from "@/components/toc";

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
  const title = post.title;
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

function estimateReadingTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, "");
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
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

  const readingTime = estimateReadingTime(post.content);
  const headings = extractHeadings(post.content);
  const allPosts = getAllPosts();

  return (
    <>
      <ReadingProgress />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-8 group"
        >
          <span className="group-hover:-translate-x-0.5 transition-transform">&larr;</span>
          Back to Blog
        </Link>

        {/* 2-col grid: Article + TOC */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-8">
          <article className="min-w-0">
            <header className="mb-8 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <time className="text-xs text-muted-foreground">{post.date}</time>
                <span className="text-xs text-muted-foreground/50">
                  {readingTime} min read
                </span>
                {post.author && (
                  <span className="text-xs text-muted-foreground/50">by {post.author}</span>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight text-gradient">
                {post.title}
              </h1>
              {post.categories.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {post.categories.map((cat) => (
                    <Badge
                      key={cat}
                      variant="secondary"
                      className="text-xs"
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
                      className="text-xs text-primary/70 bg-primary/10 rounded px-1.5 py-0.5"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </header>

            {post.cover?.image && (
              <div className="mb-8 rounded-lg overflow-hidden border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.cover.image}
                  alt={post.cover.alt || post.title}
                  className="w-full h-auto"
                />
              </div>
            )}

            <div
              className="prose prose-sm dark:prose-invert max-w-none
                prose-headings:font-semibold prose-headings:tracking-tight
                prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3 prose-h2:border-l-2 prose-h2:border-l-primary prose-h2:pl-3 prose-h2:scroll-mt-20
                prose-h3:text-base prose-h3:mt-6 prose-h3:mb-2 prose-h3:scroll-mt-20
                prose-p:text-foreground/80 prose-p:leading-relaxed
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-strong:text-foreground
                prose-code:text-sm prose-code:bg-[var(--surface-2)] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:border prose-code:border-border/30 prose-code:text-foreground/80
                prose-pre:bg-card prose-pre:border prose-pre:border-border prose-pre:rounded-lg
                prose-img:rounded-lg prose-img:border prose-img:border-border
                prose-table:text-sm
                prose-th:text-foreground/80 prose-th:border-border
                prose-td:border-border
                prose-tr:hover:bg-[var(--surface-1)]/30
                prose-li:text-foreground/80
                prose-blockquote:border-primary/30 prose-blockquote:text-muted-foreground prose-blockquote:bg-[var(--surface-1)]/30 prose-blockquote:rounded-r-lg"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </article>

          <TableOfContents headings={headings} />
        </div>

        <div className="mt-16 pt-8 border-t border-border space-y-8">
          <RelatedPosts
            currentSlug={post.slug}
            currentCategories={post.categories}
            currentTags={post.tags}
            allPosts={allPosts}
          />
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors group"
          >
            <span className="group-hover:-translate-x-0.5 transition-transform">&larr;</span>
            Back to Blog
          </Link>
        </div>
      </div>
    </>
  );
}
