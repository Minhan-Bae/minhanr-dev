import type { Metadata } from "next";
import { getAllPosts } from "@/lib/blog";
import { BlogList } from "@/components/blog-list";

export const metadata: Metadata = {
  title: "Writing",
  description:
    "Notes from the studio — AI, VFX, and creative-technology essays by Minhan Bae.",
  openGraph: {
    title: "Writing — minhanr.dev",
    description:
      "Notes from the studio — AI, VFX, and creative-technology essays by Minhan Bae.",
    type: "website",
    images: [{ url: "/api/og", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Writing — minhanr.dev",
    description:
      "Notes from the studio — AI, VFX, and creative-technology essays by Minhan Bae.",
    images: ["/api/og"],
  },
};

export default function WritingIndex() {
  const posts = getAllPosts();

  return (
    <>
      <section className="relative mx-auto w-full max-w-[1440px] px-6 pt-20 pb-12 sm:px-10 sm:pt-28 sm:pb-16">
        <div
          aria-hidden
          className="absolute left-6 top-20 h-20 w-[3px] bg-primary sm:left-10 sm:top-28"
        />
        <div className="ml-8 sm:ml-12">
          <p className="kicker mb-5">Writing</p>
          <h1
            className="font-display leading-[0.95] tracking-[-0.03em]"
            style={{ fontSize: "var(--font-size-h1)" }}
          >
            Notes from the studio.
          </h1>
          <p className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
            {posts.length} pieces on AI systems, VFX pipelines, and the tools
            that sit between them.
          </p>
        </div>
      </section>

      <section className="hairline-t mx-auto w-full max-w-[1440px] space-y-8 px-6 py-12 sm:px-10 sm:py-16">
        <BlogList posts={posts} />
      </section>
    </>
  );
}
