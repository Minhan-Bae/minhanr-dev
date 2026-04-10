"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AGENTS, AXIS_LABELS, type Axis } from "@/lib/agents";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  TrendingUp,
  FileText,
  Zap,
  ArrowRight,
  CheckCircle2,
  Newspaper,
} from "lucide-react";

interface AgentHeartbeat {
  agent_name: string;
  status: string;
  last_commit_at: string | null;
}

interface Commit {
  hash: string;
  message: string;
  agent: string;
  date: string;
}

interface BlogPost {
  title: string;
  slug: string;
  date: string;
  url: string;
}

function StatusDot({ status }: { status: string }) {
  const color = status === "active" ? "bg-emerald-400" : status === "error" ? "bg-red-400" : "bg-neutral-600";
  return (
    <span className="relative flex h-2 w-2">
      {status === "active" && (
        <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${color} opacity-75`} />
      )}
      <span className={`relative inline-flex h-2 w-2 rounded-full ${color}`} />
    </span>
  );
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "now";
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  return `${Math.floor(hr / 24)}d`;
}

const AGENT_COLORS: Record<string, string> = {
  Alpha: "text-primary",
  Beta: "text-emerald-400",
  Gamma: "text-purple-400",
  "RT Slot 1": "text-cyan-400",
  "RT Slot 2": "text-violet-400",
  "RT Slot 3": "text-amber-400",
  Omega: "text-red-400",
  Manual: "text-neutral-400",
};

const COMMIT_BADGE: Record<string, string> = {
  "RT Slot 1": "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
  "RT Slot 2": "bg-violet-500/15 text-violet-400 border-violet-500/20",
  "RT Slot 3": "bg-amber-500/15 text-amber-400 border-amber-500/20",
  Manual: "bg-neutral-500/15 text-neutral-400 border-neutral-500/20",
};

export default function Home() {
  const [agents, setAgents] = useState<AgentHeartbeat[]>([]);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    fetch("/api/heartbeat").then((r) => r.json()).then((d) => setAgents(d.agents || [])).catch(() => {});
    fetch("/api/activity").then((r) => r.json()).then((d) => setCommits(d.commits || [])).catch(() => {});
    fetch("/api/blog").then((r) => r.json()).then((d) => setBlogPosts(d.posts || [])).catch(() => {});
  }, []);

  const activeCount = agents.filter((a) => a.status === "active").length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-in fade-in duration-500">
      {/* Hero — compact */}
      <section className="space-y-3 text-center py-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs text-primary">
          <StatusDot status="active" />
          {activeCount} agents online
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Knowledge <span className="text-primary">OS</span>
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto text-sm">
          에이전트 {AGENTS.length}대가 24/7 수집 · 수렴 · 발행하는 개인 지식 시스템
        </p>
      </section>

      {/* Bento Grid */}
      <div className="grid grid-cols-12 gap-3 auto-rows-min">

        {/* Quick Nav — 4 cards */}
        <Link href="/calendar"
          className="col-span-6 sm:col-span-3 group rounded-xl border border-border bg-card p-4 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200">
          <Calendar className="h-5 w-5 text-primary mb-2" />
          <div className="text-sm font-medium group-hover:text-primary transition-colors">Calendar</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">타임블록 관리</div>
        </Link>
        <Link href="/trends"
          className="col-span-6 sm:col-span-3 group rounded-xl border border-border bg-card p-4 hover:border-chart-1/30 hover:bg-chart-1/5 transition-all duration-200">
          <TrendingUp className="h-5 w-5 text-chart-1 mb-2" />
          <div className="text-sm font-medium group-hover:text-chart-1 transition-colors">Trends</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">수집 방향 조정</div>
        </Link>
        <Link href="/review"
          className="col-span-6 sm:col-span-3 group rounded-xl border border-border bg-card p-4 hover:border-chart-3/30 hover:bg-chart-3/5 transition-all duration-200">
          <CheckCircle2 className="h-5 w-5 text-chart-3 mb-2" />
          <div className="text-sm font-medium group-hover:text-chart-3 transition-colors">Review</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">발행 승인</div>
        </Link>
        <Link href="/notes"
          className="col-span-6 sm:col-span-3 group rounded-xl border border-border bg-card p-4 hover:border-chart-4/30 hover:bg-chart-4/5 transition-all duration-200">
          <FileText className="h-5 w-5 text-chart-4 mb-2" />
          <div className="text-sm font-medium group-hover:text-chart-4 transition-colors">Notes</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">980+ 노트 탐색</div>
        </Link>

        {/* Agent Status — wide card */}
        <div className="col-span-12 lg:col-span-8 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Agent Team</span>
            </div>
            <Link href="/command" className="text-[11px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
              상세 <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {AGENTS.map((agent) => {
              const hb = agents.find((h) => h.agent_name === agent.name);
              return (
                <div key={agent.name}
                  className="rounded-lg border border-border/50 bg-background/50 p-2.5 hover:border-border transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-semibold ${AGENT_COLORS[agent.label] || "text-foreground"}`}>
                      {agent.label}
                    </span>
                    <StatusDot status={hb?.status || "idle"} />
                  </div>
                  <div className="text-[10px] text-muted-foreground">{agent.role}</div>
                  <div className="text-[10px] text-muted-foreground/50 mt-1">
                    {timeAgo(hb?.last_commit_at ?? null)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Blog Highlights — right column */}
        <div className="col-span-12 lg:col-span-4 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Newspaper className="h-4 w-4 text-chart-3" />
              <span className="text-sm font-semibold">Latest Posts</span>
            </div>
            <Link href="/blog" className="text-[11px] text-muted-foreground hover:text-chart-3 transition-colors flex items-center gap-1">
              전체 <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {(blogPosts.length > 0 ? blogPosts.slice(0, 4) : []).map((post) => (
              <a key={post.url} href={post.url} target="_blank" rel="noopener noreferrer"
                className="block rounded-lg border border-border/50 bg-background/50 p-2.5 hover:border-chart-3/30 transition-colors group">
                <div className="text-[10px] text-muted-foreground/60 tabular-nums">{post.date}</div>
                <div className="text-xs text-foreground/80 group-hover:text-foreground leading-snug mt-0.5 line-clamp-2">
                  {post.title.replace(/-/g, " ")}
                </div>
              </a>
            ))}
            {blogPosts.length === 0 && (
              <div className="h-32 rounded-lg bg-muted/20 animate-pulse" />
            )}
          </div>
        </div>

        {/* Activity Feed — full width */}
        <div className="col-span-12 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold">Recent Activity</span>
            <span className="text-[11px] text-muted-foreground tabular-nums">
              {commits.length > 0 ? `${commits.length} commits` : "loading..."}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {commits.slice(0, 8).map((c) => (
              <div key={c.hash}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-muted/10 transition-colors">
                <Badge variant="outline"
                  className={`shrink-0 text-[9px] px-1.5 py-0 border ${COMMIT_BADGE[c.agent] || COMMIT_BADGE.Manual}`}>
                  {c.agent}
                </Badge>
                <div className="min-w-0 flex-1">
                  <span className="text-xs text-foreground/80 truncate block">{c.message}</span>
                </div>
                <span className="text-[10px] text-muted-foreground/50 tabular-nums shrink-0">
                  {timeAgo(c.date)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
