"use client";

import { useEffect, useState } from "react";
import { AGENTS, AXIS_LABELS, type Axis } from "@/lib/agents";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

function StatusLed({ status }: { status: string }) {
  const color =
    status === "active"
      ? "bg-green-400"
      : status === "error"
        ? "bg-red-400"
        : "bg-neutral-600";
  return (
    <span className="relative flex h-2.5 w-2.5">
      {status === "active" && (
        <span
          className={`absolute inline-flex h-full w-full animate-ping rounded-full ${color} opacity-75`}
        />
      )}
      <span
        className={`relative inline-flex h-2.5 w-2.5 rounded-full ${color}`}
      />
    </span>
  );
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

const AGENT_BADGE_COLORS: Record<string, string> = {
  Alpha: "bg-blue-400/20 text-blue-300",
  Beta: "bg-green-400/20 text-green-300",
  Gamma: "bg-purple-400/20 text-purple-300",
  "RT Slot 1": "bg-emerald-400/20 text-emerald-300",
  "RT Slot 2": "bg-cyan-400/20 text-cyan-300",
  "RT Slot 3": "bg-amber-400/20 text-amber-300",
  Manual: "bg-neutral-400/20 text-neutral-300",
};

export default function Home() {
  const [agents, setAgents] = useState<AgentHeartbeat[]>([]);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    fetch("/api/heartbeat")
      .then((r) => r.json())
      .then((d) => setAgents(d.agents || []))
      .catch(() => {});
    fetch("/api/activity")
      .then((r) => r.json())
      .then((d) => setCommits(d.commits || []))
      .catch(() => {});
    fetch("/api/blog")
      .then((r) => r.json())
      .then((d) => setBlogPosts(d.posts || []))
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-14">
      {/* Hero */}
      <section className="space-y-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-neutral-700 px-4 py-1.5 text-xs text-neutral-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
          </span>
          6 agents online
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">
          MinHanr&apos;s{" "}
          <span className="text-blue-400">Command Center</span>
        </h1>
        <p className="text-neutral-400 max-w-xl mx-auto text-sm sm:text-base">
          1인 AI 연구자. 에이전트 6대가 24시간 자율 운용하는 개인 지식 시스템.
          <br className="hidden sm:inline" />
          수집 → 수렴 → 확산, 3축 오케스트레이션.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <a
            href="/dashboard"
            className="inline-flex items-center rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 transition-colors"
          >
            Dashboard →
          </a>
          <a
            href="https://blog.minhanr.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-lg border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-300 hover:border-neutral-500 transition-colors"
          >
            Blog
          </a>
        </div>
      </section>

      {/* Agent Team — live heartbeat */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Agent Team</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {AGENTS.map((agent) => {
            const hb = agents.find((h) => h.agent_name === agent.name);
            return (
              <Card
                key={agent.name}
                className={`${agent.bgColor} ${agent.borderColor} border`}
              >
                <CardHeader className="p-3 pb-1">
                  <div className="flex items-center justify-between">
                    <CardTitle className={`text-xs font-semibold ${agent.color}`}>
                      {agent.label}
                    </CardTitle>
                    <StatusLed status={hb?.status || "idle"} />
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <p className="text-[10px] text-neutral-500">{agent.role}</p>
                  <Badge variant="outline" className="mt-1.5 text-[9px] px-1.5 py-0">
                    {AXIS_LABELS[agent.axis as Axis]}
                  </Badge>
                  <p className="text-[10px] text-neutral-600 mt-1">
                    {timeAgo(hb?.last_commit_at ?? null)}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Live Activity Feed */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Recent Activity</h2>
        {commits.length > 0 ? (
          <div className="space-y-2">
            {commits.slice(0, 7).map((c) => (
              <div
                key={c.hash}
                className="flex items-start gap-3 rounded-lg border border-neutral-800 bg-neutral-900/50 px-4 py-3"
              >
                <span
                  className={`mt-0.5 inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${AGENT_BADGE_COLORS[c.agent] || AGENT_BADGE_COLORS.Manual}`}
                >
                  {c.agent}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-neutral-300 truncate">
                    {c.message}
                  </p>
                  <p className="text-[10px] text-neutral-600 mt-0.5">
                    <code className="text-neutral-500">{c.hash}</code>{" "}
                    · {timeAgo(c.date)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card className="border-neutral-800">
            <CardContent className="py-6 text-center text-neutral-500 text-sm">
              Loading activity feed...
            </CardContent>
          </Card>
        )}
      </section>

      {/* Blog Highlights */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Blog Highlights</h2>
          <a
            href="https://blog.minhanr.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            View all →
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(blogPosts.length > 0 ? blogPosts.slice(0, 3) : []).map((post) => (
            <a
              key={post.url}
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <Card className="border-neutral-800 hover:border-neutral-600 transition-colors h-full">
                <CardHeader className="p-4">
                  <CardDescription className="text-[10px]">
                    {post.date}
                  </CardDescription>
                  <CardTitle className="text-xs font-medium text-neutral-300 group-hover:text-neutral-100 transition-colors leading-relaxed">
                    {post.title}
                  </CardTitle>
                </CardHeader>
              </Card>
            </a>
          ))}
          {blogPosts.length === 0 && (
            <Card className="border-neutral-800 col-span-3">
              <CardContent className="py-4 text-center text-neutral-500 text-xs">
                Loading blog posts...
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
