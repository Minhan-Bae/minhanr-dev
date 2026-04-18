import type { Metadata } from "next";
import { getAllPosts } from "@/lib/blog";
import { BlogList } from "@/components/blog-list";

export const metadata: Metadata = {
  title: "글",
  description:
    "스튜디오의 메모 — 배민한이 쓰는 AI · VFX · 크리에이티브 테크놀로지 에세이.",
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
          <p className="kicker mb-5">글 · Writing</p>
          <h1
            className="font-display leading-[1.1] tracking-[-0.02em]"
            style={{ fontSize: "var(--font-size-h1)" }}
          >
            스튜디오의 메모.
          </h1>
          <p className="mt-6 max-w-xl text-[15px] leading-[1.7] text-muted-foreground sm:text-base">
            AI 시스템, VFX 파이프라인, 그리고 그 사이에 놓이는 도구에 대한 글{" "}
            <span className="font-technical tabular-nums">{posts.length}</span>편.
          </p>
        </div>
      </section>

      <section className="hairline-t mx-auto w-full max-w-[1440px] space-y-8 px-6 py-12 sm:px-10 sm:py-16">
        <BlogList posts={posts} />
      </section>
    </>
  );
}
