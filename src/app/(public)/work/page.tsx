import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getAllWork } from "@/lib/work";
import { WorkCover } from "@/components/work-cover";

export const metadata: Metadata = {
  title: "Work",
  description: "Selected case studies by Minhan Bae — AI systems, VFX R&D, editorial engineering.",
  openGraph: {
    title: "Work — minhanr.dev",
    description: "Selected case studies — AI systems, VFX R&D, editorial engineering.",
    images: [{ url: "/api/og", width: 1200, height: 630 }],
  },
};

export default function WorkIndex() {
  const all = getAllWork();

  return (
    <>
      <section className="relative mx-auto w-full max-w-[1440px] px-6 pt-20 pb-16 sm:px-10 sm:pt-28 sm:pb-20">
        <div
          aria-hidden
          className="absolute left-6 top-20 h-20 w-[3px] bg-primary sm:left-10 sm:top-28"
        />
        <div className="ml-8 sm:ml-12">
          <p className="kicker mb-5">Work</p>
          <h1
            className="font-display leading-[0.95] tracking-[-0.03em]"
            style={{ fontSize: "var(--font-size-h1)" }}
          >
            Case studies.
          </h1>
          <p className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
            Selected projects, ordered the way I'd walk a visitor through them —
            not by date, not by size, but by how they fit together.
          </p>
        </div>
      </section>

      <section className="hairline-t mx-auto w-full max-w-[1440px] px-6 py-16 sm:px-10 sm:py-24">
        <ul className="flex flex-col gap-20 sm:gap-32">
          {all.map((item, i) => (
            <li key={item.slug}>
              <Link
                href={`/work/${item.slug}`}
                className="group grid items-start gap-8 sm:grid-cols-12 sm:gap-12"
              >
                {/* Alternate the media column left/right so the page has rhythm */}
                <div
                  className={`media-zoom ${
                    i % 2 === 0
                      ? "sm:col-span-7"
                      : "sm:col-span-7 sm:col-start-6 sm:order-2"
                  }`}
                >
                  <WorkCover
                    src={item.coverImage}
                    alt={item.coverAlt ?? item.title}
                    label={item.title}
                    sublabel={item.subject}
                    aspect={i % 2 === 0 ? "frame-4x5" : "frame-16x9"}
                    priority={i === 0}
                  />
                </div>
                <div
                  className={`${
                    i % 2 === 0
                      ? "sm:col-span-5 sm:pt-8"
                      : "sm:col-span-5 sm:col-start-1 sm:row-start-1 sm:pt-8"
                  }`}
                >
                  <p className="font-technical text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    {String(i + 1).padStart(2, "0")} · {item.year}
                  </p>
                  <h2
                    className="mt-3 font-display tracking-[-0.02em] transition-colors group-hover:text-primary"
                    style={{ fontSize: "var(--font-size-h2)" }}
                  >
                    {item.title}
                  </h2>
                  <p className="font-technical mt-1 text-[13px] uppercase tracking-[0.16em] text-muted-foreground">
                    {item.discipline}
                  </p>
                  <p className="mt-6 max-w-prose text-base leading-relaxed text-muted-foreground">
                    {item.summary}
                  </p>
                  <span className="font-technical mt-8 inline-flex items-center gap-2 text-[13px] uppercase tracking-[0.14em] text-foreground/80">
                    Read case study
                    <ArrowUpRight
                      className="h-4 w-4 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                      strokeWidth={1.5}
                    />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
