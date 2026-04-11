import Image from "next/image";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  BookOpen,
  Bot,
  FolderKanban,
  Newspaper,
  Zap,
  Layers,
  Radio,
  Sparkles,
} from "lucide-react";

const HERO_IMAGE = "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1920&q=80&auto=format&fit=crop";

export default function Home() {
  const allPosts = getAllPosts();
  const featured = allPosts[0];
  const recentPosts = allPosts.slice(1, 4);

  return (
    <div>
      {/* ── Hero with image background ── */}
      <section className="relative w-full overflow-hidden">
        {/* Optimized hero image (next/image with priority + AVIF/WebP) */}
        <Image
          src={HERO_IMAGE}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover -z-10"
        />
        {/* Dark gradient overlay for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-background/30 to-transparent" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-24 sm:py-36 lg:py-44">
          <div className="space-y-6 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-4 py-1.5 text-sm text-white">
              <Sparkles className="h-4 w-4" />
              AI-powered knowledge system
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] text-white drop-shadow-lg">
              Minhan Bae
            </h1>
            <p className="text-lg sm:text-xl text-white/90 leading-relaxed drop-shadow">
              AI Researcher & Engineer. 에이전트 7대가 24/7 수집 · 수렴 · 발행하는
              개인 지식 시스템을 설계하고 운용합니다.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/blog"
                className="group inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-200"
              >
                블로그 읽기
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="#oikbas"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 backdrop-blur-md px-6 py-3 text-sm font-semibold text-white hover:bg-white/20 transition-all duration-200"
              >
                시스템 둘러보기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Content sections ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20 space-y-16">
        {/* Bento Grid */}
        <section className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {/* Featured Post — tall card */}
          {featured && (
            <Link
              href={`/blog/${featured.slug}`}
              className="md:col-span-2 md:row-span-2 rounded-2xl border border-border bg-card p-6 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 card-lift transition-all duration-300 group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <Badge variant="secondary" className="text-xs bg-primary/15 text-primary border-primary/20">
                  {featured.categories[0] || "Featured"}
                </Badge>
                <h3 className="text-xl sm:text-2xl font-bold group-hover:text-primary transition-colors leading-tight">
                  {featured.title}
                </h3>
                {featured.summary && (
                  <p className="text-sm text-muted-foreground line-clamp-5 leading-relaxed">
                    {featured.summary}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                <time className="text-xs text-muted-foreground tabular-nums">
                  {featured.date}
                </time>
                <span className="text-xs text-primary group-hover:translate-x-1 transition-transform flex items-center gap-1 font-medium">
                  Read <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          )}

          {/* Stats 2×2 Grid */}
          <div className="md:col-span-4 rounded-2xl border border-border bg-card p-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              System Overview
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Vault Notes", value: "980+", icon: Layers, color: "text-chart-1" },
                { label: "Blog Posts", value: `${allPosts.length}`, icon: Newspaper, color: "text-chart-2" },
                { label: "Agents", value: "7", icon: Bot, color: "text-chart-3" },
                { label: "Axes", value: "3", icon: Zap, color: "text-chart-4" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="text-center space-y-1.5 p-3 rounded-xl hover:bg-[var(--surface-1)] transition-colors"
                >
                  <stat.icon className={`h-5 w-5 mx-auto ${stat.color}`} />
                  <p className="text-3xl sm:text-4xl font-bold tabular-nums text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Projects Card */}
          <Link
            href="/projects"
            className="md:col-span-2 rounded-2xl border border-border bg-card p-5 hover:border-chart-3/40 hover:shadow-lg hover:shadow-chart-3/10 card-lift transition-all duration-300 group"
          >
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2 rounded-lg bg-chart-3/15">
                <FolderKanban className="h-5 w-5 text-chart-3" />
              </div>
              <h3 className="text-base font-semibold group-hover:text-chart-3 transition-colors">
                Projects
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              R&D 프로젝트 및 TrinityX 시스템 기록
            </p>
          </Link>

          {/* Papers Card */}
          <Link
            href="/papers"
            className="md:col-span-2 rounded-2xl border border-border bg-card p-5 hover:border-chart-1/40 hover:shadow-lg hover:shadow-chart-1/10 card-lift transition-all duration-300 group"
          >
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2 rounded-lg bg-chart-1/15">
                <BookOpen className="h-5 w-5 text-chart-1" />
              </div>
              <h3 className="text-base font-semibold group-hover:text-chart-1 transition-colors">
                Papers & Research
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              AI/VFX 기술 논문 리뷰 및 연구 노트
            </p>
          </Link>

          {/* Recent Posts — full row */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Newspaper className="h-4 w-4 text-primary" />
                <h2 className="text-lg font-semibold">Recent Posts</h2>
              </div>
              <Link
                href="/blog"
                className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 group"
              >
                전체 보기{" "}
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="rounded-2xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 card-lift transition-all duration-300 group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <time className="text-xs text-muted-foreground tabular-nums">
                      {post.date}
                    </time>
                    {post.categories.slice(0, 1).map((cat) => (
                      <Badge key={cat} variant="secondary" className="text-xs px-1.5 py-0">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                  <h3 className="text-sm font-semibold group-hover:text-primary transition-colors leading-snug line-clamp-2">
                    {post.title}
                  </h3>
                  {post.summary && (
                    <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                      {post.summary}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* OIKBAS — full row */}
          <section
            id="oikbas"
            className="md:col-span-6 rounded-2xl border border-primary/20 bg-card p-6 sm:p-10 space-y-6 scroll-mt-20"
          >
            <div className="flex items-center gap-2">
              <div className="h-1 w-8 rounded-full bg-gradient-to-r from-primary to-accent" />
              <h2 className="text-xs font-bold text-primary uppercase tracking-widest">
                About OIKBAS
              </h2>
            </div>
            <p className="text-base sm:text-lg text-foreground/85 leading-relaxed max-w-3xl">
              <span className="font-bold text-foreground">
                Open Intelligence Knowledge-Base Agent System
              </span>{" "}
              — 7개의 자율 에이전트가 3축으로 지식을 운용하는 개인 지식 시스템입니다.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { axis: "Acquisition", label: "수집", desc: "웹/논문/뉴스에서 자동 수집", color: "text-chart-1", borderColor: "border-chart-1/30", bgColor: "bg-chart-1/10", icon: Radio },
                { axis: "Convergence", label: "수렴", desc: "태그·링크·요약으로 정제", color: "text-chart-2", borderColor: "border-chart-2/30", bgColor: "bg-chart-2/10", icon: Layers },
                { axis: "Amplification", label: "확산", desc: "블로그·리포트로 자동 발행", color: "text-chart-3", borderColor: "border-chart-3/30", bgColor: "bg-chart-3/10", icon: Zap },
              ].map((a) => (
                <div
                  key={a.axis}
                  className={`rounded-xl border ${a.borderColor} ${a.bgColor} p-4 space-y-2 hover:scale-[1.02] transition-all duration-300`}
                >
                  <div className="flex items-center gap-2">
                    <a.icon className={`h-5 w-5 ${a.color}`} />
                    <span className={`text-sm font-bold ${a.color}`}>{a.axis}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <span className="font-semibold text-foreground/80">{a.label}</span> — {a.desc}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground/70">
              Built with Next.js · Supabase · Claude · GitHub Actions
            </p>
          </section>
        </section>
      </div>
    </div>
  );
}
