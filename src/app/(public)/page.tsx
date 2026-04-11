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

export default function Home() {
  const allPosts = getAllPosts();
  const featured = allPosts[0];
  const recentPosts = allPosts.slice(1, 4);

  return (
    <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 space-y-16 mesh-aurora">
      {/* Floating orbs background */}
      <div className="absolute top-0 left-[10%] w-[400px] h-[400px] orb orb-primary orb-anim-1" />
      <div className="absolute top-[40%] right-[5%] w-[350px] h-[350px] orb orb-pink orb-anim-2" />
      <div className="absolute bottom-[10%] left-[30%] w-[300px] h-[300px] orb orb-cyan orb-anim-1" />

      {/* ── Hero ── */}
      <section className="relative">
        <div className="relative z-10 space-y-6 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/15 backdrop-blur-sm px-4 py-1.5 text-sm text-primary shadow-lg shadow-primary/10">
            <Sparkles className="h-4 w-4" />
            AI-powered knowledge system
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] text-gradient-animated">
            Minhan Bae
          </h1>
          <p className="text-lg sm:text-xl text-foreground/75 leading-relaxed">
            AI Researcher & Engineer.{" "}
            <span className="text-foreground">
              에이전트 7대가 24/7 수집 · 수렴 · 발행하는 개인 지식 시스템
            </span>
            을 설계하고 운용합니다.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/blog"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary/80 px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-200"
            >
              블로그 읽기
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="#oikbas"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/60 backdrop-blur-sm px-6 py-3 text-sm font-semibold text-foreground hover:bg-card hover:border-primary/30 transition-all duration-200"
            >
              시스템 둘러보기
            </Link>
          </div>
        </div>
      </section>

      {/* ── Bento Grid ── */}
      <section className="relative grid grid-cols-1 md:grid-cols-6 gap-4 z-10">
        {/* Featured Post — tall card with glass */}
        {featured && (
          <Link
            href={`/blog/${featured.slug}`}
            className="md:col-span-2 md:row-span-2 rounded-2xl glass p-6 hover:border-primary/40 glow-on-hover card-lift transition-all duration-300 group flex flex-col justify-between animate-fade-up"
          >
            <div className="space-y-3">
              <Badge variant="secondary" className="text-xs bg-primary/15 text-primary border-primary/20">
                {featured.categories[0] || "Featured"}
              </Badge>
              <h3 className="text-xl sm:text-2xl font-bold group-hover:text-gradient-animated transition-colors leading-tight">
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

        {/* Stats 2×2 Grid — gradient border */}
        <div
          className="md:col-span-4 gradient-border p-6 animate-fade-up"
          style={{ animationDelay: "80ms" }}
        >
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            System Overview
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Vault Notes", value: "980+", icon: Layers, color: "text-chart-1", glow: "shadow-chart-1/20" },
              { label: "Blog Posts", value: `${allPosts.length}`, icon: Newspaper, color: "text-chart-2", glow: "shadow-chart-2/20" },
              { label: "Agents", value: "7", icon: Bot, color: "text-chart-3", glow: "shadow-chart-3/20" },
              { label: "Axes", value: "3", icon: Zap, color: "text-chart-4", glow: "shadow-chart-4/20" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="text-center space-y-1.5 p-3 rounded-xl hover:bg-[var(--surface-1)] transition-colors"
              >
                <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${stat.color === "text-chart-1" ? "from-chart-1/20 to-chart-1/5" : stat.color === "text-chart-2" ? "from-chart-2/20 to-chart-2/5" : stat.color === "text-chart-3" ? "from-chart-3/20 to-chart-3/5" : "from-chart-4/20 to-chart-4/5"}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <p className="text-3xl sm:text-4xl font-bold tabular-nums text-gradient-animated">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Projects Card — with subtle glow */}
        <Link
          href="/projects"
          className="md:col-span-2 rounded-2xl glass p-5 hover:border-chart-3/40 hover:shadow-lg hover:shadow-chart-3/15 card-lift transition-all duration-300 group animate-fade-up"
          style={{ animationDelay: "160ms" }}
        >
          <div className="flex items-center gap-2.5 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-chart-3/20 to-chart-3/5">
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
          className="md:col-span-2 rounded-2xl glass p-5 hover:border-chart-1/40 hover:shadow-lg hover:shadow-chart-1/15 card-lift transition-all duration-300 group animate-fade-up"
          style={{ animationDelay: "240ms" }}
        >
          <div className="flex items-center gap-2.5 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-chart-1/20 to-chart-1/5">
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
            {recentPosts.map((post, i) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="rounded-2xl glass p-5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/15 card-lift transition-all duration-300 group animate-fade-up"
                style={{ animationDelay: `${(i + 4) * 60}ms` }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <time className="text-xs text-muted-foreground tabular-nums">
                    {post.date}
                  </time>
                  {post.categories.slice(0, 1).map((cat) => (
                    <Badge key={cat} variant="secondary" className="text-xs px-1.5 py-0 bg-primary/10 text-primary border-primary/20">
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

        {/* OIKBAS — full row, dramatic gradient */}
        <section
          id="oikbas"
          className="relative md:col-span-6 rounded-2xl overflow-hidden p-6 sm:p-10 space-y-6 scroll-mt-20 animate-fade-up"
          style={{ animationDelay: "400ms" }}
        >
          {/* Gradient background layer */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-chart-2/15 to-accent/15" />
          <div className="absolute inset-0 bg-gradient-to-br from-card/80 via-card/60 to-card/40" />
          {/* Glass overlay */}
          <div className="absolute inset-0 backdrop-blur-xl border border-primary/20 rounded-2xl" />

          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-2">
              <div className="h-1 w-8 rounded-full bg-gradient-to-r from-primary to-accent" />
              <h2 className="text-xs font-bold text-primary uppercase tracking-widest">
                About OIKBAS
              </h2>
            </div>
            <p className="text-base sm:text-lg text-foreground/85 leading-relaxed max-w-3xl">
              <span className="font-bold text-gradient-animated">
                Open Intelligence Knowledge-Base Agent System
              </span>{" "}
              — 7개의 자율 에이전트가 3축으로 지식을 운용하는 개인 지식 시스템입니다.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { axis: "Acquisition", label: "수집", desc: "웹/논문/뉴스에서 자동 수집", color: "text-chart-1", bgColor: "from-chart-1/20 to-chart-1/5", borderColor: "border-chart-1/30", icon: Radio },
                { axis: "Convergence", label: "수렴", desc: "태그·링크·요약으로 정제", color: "text-chart-2", bgColor: "from-chart-2/20 to-chart-2/5", borderColor: "border-chart-2/30", icon: Layers },
                { axis: "Amplification", label: "확산", desc: "블로그·리포트로 자동 발행", color: "text-chart-3", bgColor: "from-chart-3/20 to-chart-3/5", borderColor: "border-chart-3/30", icon: Zap },
              ].map((a, i) => (
                <div
                  key={a.axis}
                  className={`relative rounded-xl border ${a.borderColor} bg-gradient-to-br ${a.bgColor} backdrop-blur-sm p-4 space-y-2 hover:scale-[1.02] hover:shadow-lg transition-all duration-300 animate-fade-up`}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-md bg-gradient-to-br ${a.bgColor}`}>
                      <a.icon className={`h-4 w-4 ${a.color}`} />
                    </div>
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
          </div>
        </section>
      </section>
    </div>
  );
}
