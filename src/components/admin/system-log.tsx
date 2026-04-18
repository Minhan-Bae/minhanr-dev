"use client";

import { useEffect, useMemo, useState } from "react";
import { AGENTS } from "@/lib/agents";
import { AGENT_BADGE, timeAgo } from "./utils";
import type { AgentHeartbeat, Commit } from "./types";

export function SystemLog({
  commits,
  filter,
  onFilterChange,
  agents,
}: {
  commits: Commit[];
  filter: string;
  onFilterChange: (f: string) => void;
  agents: AgentHeartbeat[];
}) {
  const [search, setSearch] = useState("");

  const filtered = commits
    .filter((c) => (filter ? c.agent === filter : true))
    .filter((c) =>
      search ? c.message.toLowerCase().includes(search.toLowerCase()) : true
    );

  // Build set of agent labels whose heartbeat status is "error"
  const errorAgentLabels = useMemo(() => {
    const set = new Set<string>();
    for (const hb of agents) {
      if (hb.status === "error") {
        const def = AGENTS.find((a) => a.name === hb.agent_name);
        if (def) set.add(def.label);
      }
    }
    return set;
  }, [agents]);

  // Webhook health: any agents with recent heartbeats (within 15 min)?
  // nowMs as state (ticks every minute) keeps the memo below as a pure
  // function of (agents, nowMs) — not of Date.now() at render time.
  const [nowMs, setNowMs] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);
  const webhookHealthy = useMemo(() => {
    const fifteenMin = 15 * 60 * 1000;
    return agents.some(
      (a) =>
        a.last_commit_at &&
        nowMs - new Date(a.last_commit_at).getTime() < fifteenMin
    );
  }, [agents, nowMs]);

  return (
    <div className="space-y-3">
      {/* Webhook health + search */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span
              className={`relative inline-flex h-2 w-2 rounded-full ${
                webhookHealthy ? "bg-green-400" : "bg-yellow-400"
              }`}
            />
          </span>
          <span className="text-xs text-muted-foreground">
            Webhook {webhookHealthy ? "healthy" : "no recent pushes"}
          </span>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search commits..."
          className="flex-1 max-w-[240px] rounded border border-border bg-card px-2 py-1 text-xs text-foreground/80 placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => onFilterChange("")}
          className={`rounded px-2 py-0.5 text-xs border transition-colors ${
            !filter
              ? "border-primary text-primary"
              : "border-border text-muted-foreground hover:text-foreground/80"
          }`}
        >
          All
        </button>
        {Object.keys(AGENT_BADGE).map((name) => (
          <button
            key={name}
            onClick={() => onFilterChange(name)}
            className={`rounded px-2 py-0.5 text-xs border transition-colors ${
              filter === name
                ? "border-primary text-primary"
                : "border-border text-muted-foreground hover:text-foreground/80"
            }`}
          >
            {name}
          </button>
        ))}
      </div>
      <div className="space-y-1 max-h-[400px] overflow-y-auto">
        {filtered.slice(0, 20).map((c) => {
          const isError = errorAgentLabels.has(c.agent);
          return (
            <div
              key={c.hash + c.date}
              className={`flex items-start gap-2 rounded border px-3 py-2 ${
                isError
                  ? "border-red-500/40 bg-red-500/5"
                  : "border-border bg-card/30"
              }`}
            >
              <span
                className={`mt-0.5 shrink-0 rounded px-1 py-0.5 text-xs font-medium ${AGENT_BADGE[c.agent] || AGENT_BADGE.Manual}`}
              >
                {c.agent}
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={`text-xs truncate ${
                    isError ? "text-red-300" : "text-foreground/80"
                  }`}
                >
                  {c.message}
                </p>
                <p className="text-xs text-muted-foreground/50">
                  <code className="text-muted-foreground">{c.hash}</code> ·{" "}
                  {timeAgo(c.date)}
                </p>
              </div>
              {isError && (
                <span className="text-xs text-red-400 shrink-0 mt-0.5">
                  ERROR
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
