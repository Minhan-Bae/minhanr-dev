"use client";

import { useEffect, useState } from "react";
import { AGENTS, AXIS_LABELS, AXIS_COLORS, type Axis } from "@/lib/agents";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface AgentHeartbeat {
  agent_name: string;
  agent_layer: number;
  axis: string;
  status: string;
  last_commit_hash: string | null;
  last_commit_at: string | null;
  last_commit_msg: string | null;
}

interface VaultStats {
  total_notes: number;
  last_full_scan: string | null;
  last_commit_hash: string | null;
  stats: {
    by_status?: Record<string, number>;
    by_folder?: Record<string, number>;
  };
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
  if (!dateStr) return "never";
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

function AxisGauge({ axis, utilization }: { axis: Axis; utilization: number }) {
  const pct = Math.min(100, Math.max(0, utilization));
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="96" height="96" viewBox="0 0 96 96">
        <circle
          cx="48"
          cy="48"
          r="36"
          fill="none"
          stroke="currentColor"
          className="text-neutral-800"
          strokeWidth="6"
        />
        <circle
          cx="48"
          cy="48"
          r="36"
          fill="none"
          stroke="currentColor"
          className={AXIS_COLORS[axis]}
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 48 48)"
        />
        <text
          x="48"
          y="48"
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-neutral-200 text-lg font-bold"
          fontSize="18"
        >
          {pct}%
        </text>
      </svg>
      <span className={`text-xs font-medium ${AXIS_COLORS[axis]}`}>
        {AXIS_LABELS[axis]}
      </span>
    </div>
  );
}

export default function Dashboard() {
  const [agents, setAgents] = useState<AgentHeartbeat[]>([]);
  const [vault, setVault] = useState<VaultStats | null>(null);

  useEffect(() => {
    fetch("/api/heartbeat")
      .then((r) => r.json())
      .then((d) => setAgents(d.agents || []))
      .catch(() => {});
    fetch("/api/vault")
      .then((r) => r.json())
      .then((d) => setVault(d))
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-10">
      <h1 className="text-2xl font-bold tracking-tight">
        Public Dashboard
      </h1>

      {/* 3-Axis Gauges */}
      <section className="space-y-4">
        <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wider">
          3-Axis Utilization
        </h2>
        <div className="flex justify-center gap-12">
          <AxisGauge axis="acquisition" utilization={85} />
          <AxisGauge axis="convergence" utilization={70} />
          <AxisGauge axis="amplification" utilization={45} />
        </div>
      </section>

      <Separator className="bg-neutral-800" />

      {/* Agent Org Chart */}
      <section className="space-y-4">
        <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wider">
          Agent Organization
        </h2>

        {/* Layer 1: Omega */}
        <div className="flex justify-center">
          <Card className="border-amber-500/30 bg-amber-500/5 w-48 text-center">
            <CardHeader className="py-3">
              <CardTitle className="text-sm text-amber-400">
                Omega
              </CardTitle>
              <CardDescription className="text-[10px]">
                Orchestrator &middot; L1
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Layer 2: Interactive */}
        <div className="grid grid-cols-3 gap-4">
          {AGENTS.filter((a) => a.layer === 2).map((agent) => {
            const hb = agents.find((h) => h.agent_name === agent.name);
            return (
              <Card
                key={agent.name}
                className={`${agent.bgColor} ${agent.borderColor} border`}
              >
                <CardHeader className="py-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className={`text-sm ${agent.color}`}>
                      {agent.label}
                    </CardTitle>
                    <StatusLed status={hb?.status || "idle"} />
                  </div>
                  <CardDescription className="text-[10px]">
                    {agent.role} &middot; L{agent.layer}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 text-[11px] text-neutral-500">
                  {hb?.last_commit_msg
                    ? hb.last_commit_msg.slice(0, 60)
                    : "Awaiting activity..."}
                  <div className="mt-1 text-neutral-600">
                    {timeAgo(hb?.last_commit_at ?? null)}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Layer 3: RT Slots */}
        <div className="grid grid-cols-3 gap-4">
          {AGENTS.filter((a) => a.layer === 3).map((agent) => {
            const hb = agents.find((h) => h.agent_name === agent.name);
            return (
              <Card
                key={agent.name}
                className={`${agent.bgColor} ${agent.borderColor} border`}
              >
                <CardHeader className="py-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className={`text-sm ${agent.color}`}>
                      {agent.label}
                    </CardTitle>
                    <StatusLed status={hb?.status || "idle"} />
                  </div>
                  <CardDescription className="text-[10px]">
                    {agent.role} &middot; L{agent.layer}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 text-[11px] text-neutral-500">
                  {hb?.last_commit_msg
                    ? hb.last_commit_msg.slice(0, 60)
                    : "Awaiting activity..."}
                  <div className="mt-1 text-neutral-600">
                    {timeAgo(hb?.last_commit_at ?? null)}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <Separator className="bg-neutral-800" />

      {/* Vault Stats */}
      <section className="space-y-4">
        <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wider">
          Vault Statistics
        </h2>
        {vault ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="border-neutral-800">
              <CardHeader className="py-3">
                <CardDescription className="text-[10px]">
                  Total Notes
                </CardDescription>
                <CardTitle className="text-2xl">
                  {vault.total_notes}
                </CardTitle>
              </CardHeader>
            </Card>
            {vault.stats?.by_status &&
              Object.entries(vault.stats.by_status)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 3)
                .map(([status, count]) => (
                  <Card key={status} className="border-neutral-800">
                    <CardHeader className="py-3">
                      <CardDescription className="text-[10px]">
                        {status}
                      </CardDescription>
                      <CardTitle className="text-2xl">{count}</CardTitle>
                    </CardHeader>
                  </Card>
                ))}
          </div>
        ) : (
          <Card className="border-neutral-800">
            <CardContent className="py-6 text-center text-neutral-500 text-sm">
              Loading vault data...
            </CardContent>
          </Card>
        )}
        {vault?.last_commit_hash && (
          <p className="text-xs text-neutral-600 text-right">
            Last index: {vault.last_commit_hash} &middot;{" "}
            {vault.last_full_scan
              ? new Date(vault.last_full_scan).toLocaleDateString()
              : ""}
          </p>
        )}
      </section>
    </div>
  );
}
