import type { Metadata } from "next";
import Link from "next/link";
import { getAllTags } from "@/lib/blog-taxonomy";
import { Typewriter } from "@/components/typewriter";

export const metadata: Metadata = {
  title: "Tags",
  description: "Every tag across the studio's writing, sized by post count.",
};

export default function TagsIndex() {
  const tags = getAllTags();

  return (
    <>
      <section className="relative mx-auto w-full max-w-[1440px] px-6 pt-20 pb-12 sm:px-10 sm:pt-28 sm:pb-16">
        <div
          aria-hidden
          className="animate-fade-in absolute left-6 top-20 h-20 w-[3px] bg-primary sm:left-10 sm:top-28"
          style={{ animationDelay: "360ms" }}
        />
        <div className="ml-8 sm:ml-12">
          <p
            className="kicker mb-5 animate-fade-up"
            style={{ animationDelay: "0ms" }}
          >
            Tags · {tags.length}
          </p>
          <Typewriter
            as="h1"
            lang="en"
            text="Every label, every count."
            stagger={55}
            delay={120}
            className="font-display italic leading-[1.1] tracking-[-0.02em] block"
            style={{ fontSize: "var(--font-size-h1)" }}
          />
          <p
            className="mt-6 max-w-xl text-[15px] leading-[1.7] text-muted-foreground sm:text-base animate-fade-up"
            style={{ animationDelay: "280ms" }}
          >
            The studio's writing has accumulated {tags.length} distinct tags
            across {tags.reduce((s, t) => s + t.count, 0)} post–tag pairs. Each
            label scales with how often it's been written about.
          </p>
        </div>
      </section>

      <section className="hairline-t mx-auto w-full max-w-[1440px] px-6 py-16 sm:px-10 sm:py-20 reveal-up">
        <ul className="flex flex-wrap gap-x-6 gap-y-3 leading-none">
          {tags.map((t) => {
            // Log-scale the font so a tag with 30 posts isn't 30× a tag
            // with 1. Range: 0.85rem (singleton) → ~2rem (most common).
            const size = 0.85 + Math.log2(1 + t.count) * 0.35;
            return (
              <li key={t.slug}>
                <Link
                  href={`/blog/tag/${t.slug}`}
                  className="font-display italic text-foreground/85 transition-colors hover:text-primary"
                  style={{ fontSize: `${size.toFixed(2)}rem` }}
                >
                  {t.tag}
                  <span className="ml-1 align-super font-technical text-[10px] not-italic tracking-[0.16em] text-muted-foreground">
                    {t.count}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
