import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { getAllWork, getWorkBySlug } from "@/lib/work";
import { WorkCover } from "@/components/work-cover";

export function generateStaticParams() {
  return getAllWork().map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = getWorkBySlug(slug);
  if (!item) return { title: "Not found" };
  return {
    title: item.title,
    description: item.summary,
    openGraph: {
      title: item.title,
      description: item.summary,
      type: "article",
      images: [
        {
          url: `/api/og?variant=note&title=${encodeURIComponent(item.title)}&category=${encodeURIComponent(item.discipline)}&date=${encodeURIComponent(item.year)}`,
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = getWorkBySlug(slug);
  if (!item) notFound();

  const all = getAllWork();
  const currentIndex = all.findIndex((w) => w.slug === item.slug);
  const nextItem = all[(currentIndex + 1) % all.length];

  return (
    <article>
      {/* ─── Cover ─── */}
      <section className="relative mx-auto w-full max-w-[1440px] px-6 pt-12 sm:px-10 sm:pt-16">
        <Link
          href="/work"
          className="font-technical inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
          All work
        </Link>

        <header className="mt-12 grid gap-8 sm:mt-16 sm:grid-cols-12 sm:gap-12">
          <div className="sm:col-span-8">
            <p className="kicker mb-4">
              {item.discipline} · {item.year}
            </p>
            <h1
              className="font-display leading-[0.95] tracking-[-0.03em]"
              style={{ fontSize: "var(--font-size-display)" }}
            >
              {item.title}
            </h1>
            <p className="mt-6 font-display italic text-xl text-muted-foreground sm:text-2xl">
              {item.subject}
            </p>
          </div>

          {item.facts && (
            <dl className="font-technical sm:col-span-4 sm:pt-2">
              {item.facts.map((f) => (
                <div
                  key={f.label}
                  className="hairline-b flex items-baseline justify-between gap-4 py-3 first:hairline-t"
                >
                  <dt className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    {f.label}
                  </dt>
                  <dd className="text-[13px] text-foreground text-right">
                    {f.value}
                  </dd>
                </div>
              ))}
              {item.role && (
                <div className="hairline-b flex items-baseline justify-between gap-4 py-3">
                  <dt className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    Role
                  </dt>
                  <dd className="text-[13px] text-foreground text-right">
                    {item.role}
                  </dd>
                </div>
              )}
            </dl>
          )}
        </header>
      </section>

      {/* Cover image — edge-to-edge */}
      <section className="mx-auto mt-16 w-full max-w-[1440px] px-6 sm:mt-24 sm:px-10">
        <WorkCover
          src={item.coverImage}
          alt={item.coverAlt ?? item.title}
          label={item.title}
          sublabel={item.subject}
          aspect="frame-21x9"
          sizes="100vw"
          priority
        />
      </section>

      {/* ─── Body ─── */}
      <section className="mx-auto mt-20 mb-24 w-full max-w-[900px] px-6 sm:mt-32 sm:mb-32 sm:px-10">
        <div className="drop-cap text-lg leading-[1.7] text-foreground/90 sm:text-xl">
          {item.body}
        </div>

        {item.link && (
          <div className="mt-16 hairline-t pt-10">
            <a
              href={item.link.href}
              target="_blank"
              rel="noreferrer"
              className="group font-technical inline-flex items-center gap-3 text-[13px] uppercase tracking-[0.16em] text-foreground hover:text-primary"
            >
              {item.link.label}
              <ArrowUpRight
                className="h-4 w-4 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                strokeWidth={1.5}
              />
            </a>
          </div>
        )}
      </section>

      {/* ─── Next ─── */}
      {nextItem && nextItem.slug !== item.slug && (
        <section className="hairline-t mx-auto w-full max-w-[1440px] px-6 py-16 sm:px-10 sm:py-24">
          <Link
            href={`/work/${nextItem.slug}`}
            className="group block"
          >
            <p className="kicker mb-3">Next</p>
            <div className="flex items-baseline justify-between gap-6">
              <h2
                className="font-display tracking-[-0.02em] transition-colors group-hover:text-primary"
                style={{ fontSize: "var(--font-size-h1)" }}
              >
                {nextItem.title}
              </h2>
              <ArrowUpRight
                className="hidden h-8 w-8 flex-none text-muted-foreground transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-primary sm:block"
                strokeWidth={1.25}
              />
            </div>
            <p className="font-technical mt-3 text-[13px] uppercase tracking-[0.16em] text-muted-foreground">
              {nextItem.discipline} · {nextItem.year}
            </p>
          </Link>
        </section>
      )}
    </article>
  );
}
