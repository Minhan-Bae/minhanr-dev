"use client";

import { useState } from "react";
import { AGENTS, AXIS_LABELS, type Axis } from "@/lib/agents";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusLed, timeAgo } from "./utils";
import type { AgentHeartbeat, Commit } from "./types";

export function HeartbeatMonitor({
  agents,
  commits,
}: {
  agents: AgentHeartbeat[];
  commits: Commit[];
}) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {AGENTS.map((def) => {
          const hb = agents.find((h) => h.agent_name === def.name);
          const isSelected = selected === def.name;
          return (
            <Card
              key={def.name}
              className={`${def.bgColor} ${def.borderColor} border cursor-pointer transition-all ${
                isSelected ? "ring-1 ring-ring" : "hover:brightness-110"
              }`}
              onClick={() => setSelected(isSelected ? null : def.name)}
            >
              <CardHeader className="p-3 pb-1">
                <div className="flex items-center justify-between">
                  <CardTitle className={`text-xs font-semibold ${def.color}`}>
                    {def.label}
                  </CardTitle>
                  <StatusLed status={hb?.status || "idle"} />
                </div>
                <CardDescription className="text-xs">
                  {def.role}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-0 space-y-1">
                <p className="text-xs text-muted-foreground truncate">
                  {hb?.last_commit_msg?.slice(0, 50) || "—"}
                </p>
                <p className="text-xs text-muted-foreground/50">
                  {hb?.last_commit_hash && (
                    <code className="text-muted-foreground mr-1">
                      {hb.last_commit_hash}
                    </code>
                  )}
                  {timeAgo(hb?.last_commit_at ?? null)}
                </p>
                {hb?.error_message && (
                  <p className="text-xs text-red-400 truncate">
                    {hb.error_message}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      {/* Agent detail panel */}
      {selected && (() => {
        const def = AGENTS.find((a) => a.name === selected);
        const hb = agents.find((h) => h.agent_name === selected);
        const agentCommits = commits
          .filter((c) => c.agent === def?.label)
          .slice(0, 5);
        return (
          <div className="rounded-lg border border-border bg-card/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-foreground/80">
                {def?.label} — Recent Activity
              </p>
              <button
                onClick={() => setSelected(null)}
                className="text-muted-foreground/50 hover:text-muted-foreground text-xs"
              >
                &times;
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="rounded border border-border px-2 py-1.5">
                <span className="text-muted-foreground">Status</span>
                <p className={hb?.status === "active" ? "text-green-400 font-medium" : hb?.status === "error" ? "text-red-400 font-medium" : "text-muted-foreground"}>
                  {hb?.status || "idle"}
                </p>
              </div>
              <div className="rounded border border-border px-2 py-1.5">
                <span className="text-muted-foreground">Last active</span>
                <p className="text-foreground/80">{timeAgo(hb?.last_commit_at ?? null)}</p>
              </div>
              <div className="rounded border border-border px-2 py-1.5">
                <span className="text-muted-foreground">Axis</span>
                <p className="text-foreground/80">{AXIS_LABELS[hb?.axis as Axis] || hb?.axis || "—"}</p>
              </div>
            </div>
            {hb?.error_message && (
              <div className="rounded border border-red-500/30 bg-red-500/5 px-3 py-2">
                <p className="text-xs text-red-400">{hb.error_message}</p>
              </div>
            )}
            {agentCommits.length > 0 ? (
              <div className="space-y-1">
                {agentCommits.map((c) => (
                  <div key={c.hash + c.date} className="flex items-center gap-2 text-xs">
                    <code className="text-muted-foreground shrink-0">{c.hash}</code>
                    <span className="text-muted-foreground truncate">{c.message}</span>
                    <span className="text-muted-foreground/50 shrink-0 ml-auto">{timeAgo(c.date)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground/50">No recent commits</p>
            )}
          </div>
        );
      })()}
    </div>
  );
}
