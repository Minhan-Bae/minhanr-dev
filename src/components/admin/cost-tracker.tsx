"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MONTHLY_COST_USD } from "@/lib/constants";
import type { Commit } from "./types";

export function CostTracker({ commits }: { commits: Commit[] }) {
  const agentCosts = useMemo(() => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentCommits = commits.filter(
      (c) => new Date(c.date).getTime() >= thirtyDaysAgo
    );

    const counts: Record<string, number> = {};
    let total = 0;
    for (const c of recentCommits) {
      counts[c.agent] = (counts[c.agent] || 0) + 1;
      total++;
    }

    return Object.entries(counts)
      .map(([agent, count]) => ({
        agent,
        count,
        share: total > 0 ? count / total : 0,
        estimated: total > 0 ? Math.round((count / total) * MONTHLY_COST_USD) : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [commits]);

  const barColors: Record<string, string> = {
    Alpha: "bg-primary",
    Beta: "bg-green-400",
    Gamma: "bg-purple-400",
    "RT Slot 1": "bg-emerald-400",
    "RT Slot 2": "bg-cyan-400",
    "RT Slot 3": "bg-amber-400",
    Manual: "bg-muted-foreground",
  };

  return (
    <Card className="border-border">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">Cost Tracker</CardTitle>
          <span className="text-xs text-muted-foreground">
            Monthly: <span className="text-foreground font-medium">${MONTHLY_COST_USD}</span>{" "}
            <span className="text-muted-foreground/50">(Claude Max fixed)</span>
          </span>
        </div>
        <CardDescription className="text-xs">
          Per-agent estimated cost based on commit frequency (last 30 days)
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3">
        {/* Horizontal stacked bar */}
        <div className="flex h-4 w-full rounded overflow-hidden bg-muted">
          {agentCosts.map((ac) => (
            <div
              key={ac.agent}
              className={`${barColors[ac.agent] || "bg-muted-foreground"} transition-all`}
              style={{ width: `${ac.share * 100}%` }}
              title={`${ac.agent}: ${(ac.share * 100).toFixed(1)}%`}
            />
          ))}
        </div>
        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {agentCosts.map((ac) => (
            <div key={ac.agent} className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${barColors[ac.agent] || "bg-muted-foreground"}`}
              />
              <span className="text-xs text-muted-foreground">
                {ac.agent}
              </span>
              <span className="text-xs text-muted-foreground ml-auto">
                ~${ac.estimated}
              </span>
              <span className="text-xs text-muted-foreground/50">
                ({ac.count})
              </span>
            </div>
          ))}
        </div>
        {agentCosts.length === 0 && (
          <p className="text-xs text-muted-foreground/50 text-center py-2">
            No commits in the last 30 days
          </p>
        )}
      </CardContent>
    </Card>
  );
}
