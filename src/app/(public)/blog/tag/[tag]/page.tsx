import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { notFound } from "next/navigation";
import { getAllTags, getPostsByTag } from "@/lib/blog-taxonomy";
import { Typewriter } from "@/components/typewriter";

export function generateStaticParams() {
  return getAllTags().map((t) => ({ tag: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag: slug } = await params;
  const { tag, posts } = getPostsByTag(slug);
  if (!tag) return { title: "Tag not found" };
  return {
    title: `${tag} — Tag`,
    description: `${posts.length} post${posts.length === 1 ? "" : "s"} tagged "${tag}".`,
  };
}

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) return iso;
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag: slug } = await params;
  const { tag, posts } = getPostsByTag(slug);
  if (!tag) notFound();

  return (
    <>
      <section className="relative mx-auto w-full max-w-[1440px] px-6 pt-20 pb-12 sm:px-10 sm:pt-28 sm:pb-16">
        <div className="ml-0">
          <Link
            href="/blog/tags"
            className="font-technical inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
            All tags
          </Link>
          <div
            aria-hidden
            className="animate-fade-in mt-10 h-[3px] w-20 bg-primary"
            style={{ animationDelay: "360ms" }}
          />
          <p
            className="kicker mb-5 mt-6 animate-fade-up"
            style={{ animationDelay: "0ms" }}
          >
            Tag · {posts.length} {posts.length === 1 ? "piece" : "pieces"}
          </p>
          <Typewriter
            as="h1"
            lang="en"
            text={`#${tag}`}
            stagger={80}
            delay={120}
            className="font-display italic leading-[1.1] tracking-[-0.02em] block"
            style={{ fontSize: "var(--font-size-h1)" }}
          />
        </div>
      </section>

      <section className="hairline-t mx-auto w-full max-w-[1440px] px-6 py-12 sm:px-10 sm:py-16 reveal-up">
        <ol>
          {posts.map((post, i) => {
            const n = String(i + 1).padStart(2, "0");
            return (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group grid grid-cols-[auto_1fr_auto] items-baseline gap-5 border-t border-[var(--hairline)] py-6 transition-colors hover:bg-[var(--surface-1)] sm:grid-cols-[auto_1fr_auto_auto] sm:gap-8"
                >
                  <span
                    className="font-display italic tabular-nums text-muted-foreground transition-colors group-hover:text-primary"
                    style={{ fontSize: "clamp(1.5rem, 2.4vw, 2rem)", lineHeight: "0.9" }}
                  >
                    {n}
                  </span>
                  <h2
                    className="font-display italic tracking-[-0.015em] text-foreground transition-colors group-hover:text-primary"
                    style={{
                      fontSize: "clamp(1.1rem, 1.8vw, 1.5rem)",
                      lineHeight: "1.2",
                    }}
                  >
                    {post.title}
                  </h2>
                  <time
                    dateTime={post.date}
                    className="hidden font-technical tabular-nums text-[11px] uppercase tracking-[0.18em] text-muted-foreground sm:block"
                  >
                    {formatDate(post.date)}
                  </time>
                  <ArrowUpRight
                    className="hidden self-center text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary sm:block"
                    strokeWidth={1.25}
                    size={18}
                  />
                </Link>
              </li>
            );
          })}
        </ol>
      </section>
    </>
  );
}
