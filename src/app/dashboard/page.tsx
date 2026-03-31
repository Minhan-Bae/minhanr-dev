"use client";

import { useEffect, useState, useCallback } from "react";
import { AGENTS, AXIS_LABELS, AXIS_COLORS, type Axis } from "@/lib/agents";
import { DASHBOARD_POLL_MS, TIMELINE_DISPLAY } from "@/lib/constants";
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

interface AxisMetrics {
  latest: Record<
    string,
    { utilization: number; notes_count: number; delta: Record<string, number> }
  >;
}

interface Commit {
  hash: string;
  fullHash?: string;
  message: string;
  agent: string;
  date: string;
  url?: string;
}

/* ── Helpers ── */

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

/* ── Skeleton ── */

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-neutral-800 ${className}`}
    />
  );
}

function SkeletonCard() {
  return (
    <Card className="border-neutral-800">
      <CardContent className="py-6 space-y-3">
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-3/4" />
      </CardContent>
    </Card>
  );
}

/* ── AxisGauge (SVG 원형 게이지 + 드릴다운) ── */

function AxisGauge({
  axis,
  utilization,
  notesCount,
  isExpanded,
  onClick,
}: {
  axis: Axis;
  utilization: number;
  notesCount: number;
  isExpanded: boolean;
  onClick: () => void;
}) {
  const pct = Math.min(100, Math.max(0, utilization));
  const r = 36;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 rounded-lg p-3 transition-colors cursor-pointer ${
        isExpanded
          ? "bg-neutral-800/50 ring-1 ring-neutral-700"
          : "hover:bg-neutral-800/30"
      }`}
    >
      <svg width="96" height="96" viewBox="0 0 96 96">
        <circle
          cx="48"
          cy="48"
          r={r}
          fill="none"
          stroke="currentColor"
          className="text-neutral-800"
          strokeWidth="6"
        />
        <circle
          cx="48"
          cy="48"
          r={r}
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
          y="44"
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-neutral-200 font-bold"
          fontSize="18"
        >
          {pct}%
        </text>
        <text
          x="48"
          y="62"
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-neutral-500"
          fontSize="9"
        >
          {notesCount} notes
        </text>
      </svg>
      <span className={`text-xs font-medium ${AXIS_COLORS[axis]}`}>
        {AXIS_LABELS[axis]}
      </span>
    </button>
  );
}

/* ── Axis Drilldown Panel ── */

function AxisDrilldown({
  axis,
  vault,
}: {
  axis: Axis;
  vault: VaultStats | null;
}) {
  const byStatus = vault?.stats?.by_status || {};

  const content: Record<Axis, { label: string; items: { name: string; count: number }[] }> = {
    acquisition: {
      label: "최근 수집 현황",
      items: [
        { name: "seed (수집 대기)", count: byStatus.seed || 0 },
        { name: "inbox (미정리)", count: byStatus.inbox || 0 },
      ],
    },
    convergence: {
      label: "수렴 현황",
      items: [
        { name: "growing (정제 중)", count: byStatus.growing || 0 },
        { name: "mature (완숙)", count: byStatus.mature || 0 },
      ],
    },
    amplification: {
      label: "확산 현황",
      items: [
        { name: "published (발행)", count: byStatus.published || 0 },
        { name: "mature (발행 대기)", count: byStatus.mature || 0 },
      ],
    },
  };

  const data = content[axis];

  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
      <p className="text-xs font-medium text-neutral-300">{data.label}</p>
      <div className="grid grid-cols-2 gap-3">
        {data.items.map((item) => (
          <div key={item.name} className="rounded border border-neutral-800 px-3 py-2">
            <p className="text-lg font-bold text-neutral-200">{item.count}</p>
            <p className="text-[10px] text-neutral-500">{item.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── StatusBar (수평 비율 바 + 클릭 필터) ── */

const STATUS_COLORS: Record<string, string> = {
  seed: "bg-yellow-500",
  growing: "bg-blue-500",
  published: "bg-green-500",
  active: "bg-cyan-500",
  mature: "bg-purple-500",
  archived: "bg-neutral-600",
  inbox: "bg-orange-500",
  evergreen: "bg-emerald-500",
  no_status: "bg-neutral-700",
};

function StatusDistribution({
  byStatus,
  total,
  selectedStatus,
  onSelect,
}: {
  byStatus: Record<string, number>;
  total: number;
  selectedStatus: string | null;
  onSelect: (status: string | null) => void;
}) {
  const sorted = Object.entries(byStatus).sort(([, a], [, b]) => b - a);

  return (
    <div className="space-y-3">
      {/* Bar */}
      <div className="flex h-4 w-full overflow-hidden rounded-full">
        {sorted.map(([status, count]) => (
          <button
            key={status}
            className={`${STATUS_COLORS[status] || "bg-neutral-700"} transition-all cursor-pointer ${
              selectedStatus && selectedStatus !== status ? "opacity-30" : ""
            }`}
            style={{ width: `${(count / total) * 100}%` }}
            title={`${status}: ${count}`}
            onClick={() => onSelect(selectedStatus === status ? null : status)}
          />
        ))}
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {sorted.slice(0, 6).map(([status, count]) => (
          <button
            key={status}
            onClick={() => onSelect(selectedStatus === status ? null : status)}
            className={`flex items-center gap-1.5 transition-opacity cursor-pointer ${
              selectedStatus && selectedStatus !== status ? "opacity-40" : ""
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${STATUS_COLORS[status] || "bg-neutral-700"}`}
            />
            <span className="text-[10px] text-neutral-400">
              {status}{" "}
              <span className="text-neutral-500">{count}</span>
            </span>
          </button>
        ))}
      </div>
      {/* Selected status detail */}
      {selectedStatus && byStatus[selectedStatus] != null && (
        <div className="rounded border border-neutral-800 bg-neutral-900/50 px-3 py-2 animate-in fade-in duration-150">
          <p className="text-xs text-neutral-300">
            <span className="font-medium">{selectedStatus}</span>:{" "}
            <span className="text-neutral-200 font-bold">{byStatus[selectedStatus]}</span> notes
            <span className="text-neutral-600 ml-2">
              ({((byStatus[selectedStatus] / total) * 100).toFixed(1)}%)
            </span>
          </p>
        </div>
      )}
    </div>
  );
}

/* ── Pipeline flow diagram ── */

function PipelineFlow() {
  const steps = [
    { label: "수집", sub: "Collect", color: "border-green-400 text-green-400" },
    { label: "정제", sub: "Refine", color: "border-blue-400 text-blue-400" },
    { label: "수렴", sub: "Converge", color: "border-cyan-400 text-cyan-400" },
    {
      label: "확산",
      sub: "Amplify",
      color: "border-purple-400 text-purple-400",
    },
  ];

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2">
      {steps.map((step, i) => (
        <div key={step.label} className="flex items-center gap-1 sm:gap-2">
          <div
            className={`rounded-lg border ${step.color} px-3 sm:px-4 py-2 text-center`}
          >
            <div className="text-xs sm:text-sm font-medium">{step.label}</div>
            <div className="text-[9px] sm:text-[10px] opacity-60">
              {step.sub}
            </div>
          </div>
          {i < steps.length - 1 && (
            <span className="text-neutral-600 text-xs">&rarr;</span>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Agent badge colors ── */

const AGENT_BADGE_COLORS: Record<string, string> = {
  Alpha: "bg-blue-400/20 text-blue-300",
  Beta: "bg-green-400/20 text-green-300",
  Gamma: "bg-purple-400/20 text-purple-300",
  "RT Slot 1": "bg-emerald-400/20 text-emerald-300",
  "RT Slot 2": "bg-cyan-400/20 text-cyan-300",
  "RT Slot 3": "bg-amber-400/20 text-amber-300",
  Omega: "bg-red-400/20 text-red-300",
  Manual: "bg-neutral-400/20 text-neutral-300",
};

/* ── Main page ── */

export default function Dashboard() {
  const [agents, setAgents] = useState<AgentHeartbeat[]>([]);
  const [vault, setVault] = useState<VaultStats | null>(null);
  const [metrics, setMetrics] = useState<AxisMetrics | null>(null);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedAxis, setExpandedAxis] = useState<Axis | null>(null);
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    const results = await Promise.allSettled([
      fetch("/api/heartbeat").then((r) => r.json()),
      fetch("/api/vault").then((r) => r.json()),
      fetch("/api/stats").then((r) => r.json()),
      fetch("/api/activity").then((r) => r.json()),
    ]);

    if (results[0].status === "fulfilled") setAgents(results[0].value.agents || []);
    if (results[1].status === "fulfilled") setVault(results[1].value);
    if (results[2].status === "fulfilled") setMetrics(results[2].value);
    if (results[3].status === "fulfilled") setCommits(results[3].value.commits || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, DASHBOARD_POLL_MS);
    return () => clearInterval(interval);
  }, [fetchAll]);

  const acq = metrics?.latest?.acquisition;
  const conv = metrics?.latest?.convergence;
  const amp = metrics?.latest?.amplification;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
        Public Dashboard
      </h1>

      {/* 3-Axis Gauges */}
      <section className="space-y-4">
        <h2 className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
          3-Axis Utilization
        </h2>
        {loading ? (
          <div className="flex justify-center gap-8">
            <Skeleton className="h-[120px] w-[120px] rounded-lg" />
            <Skeleton className="h-[120px] w-[120px] rounded-lg" />
            <Skeleton className="h-[120px] w-[120px] rounded-lg" />
          </div>
        ) : (
          <>
            <div className="flex justify-center gap-4 sm:gap-8">
              <AxisGauge
                axis="acquisition"
                utilization={acq?.utilization ?? 0}
                notesCount={acq?.notes_count ?? 0}
                isExpanded={expandedAxis === "acquisition"}
                onClick={() =>
                  setExpandedAxis(expandedAxis === "acquisition" ? null : "acquisition")
                }
              />
              <AxisGauge
                axis="convergence"
                utilization={conv?.utilization ?? 0}
                notesCount={conv?.notes_count ?? 0}
                isExpanded={expandedAxis === "convergence"}
                onClick={() =>
                  setExpandedAxis(expandedAxis === "convergence" ? null : "convergence")
                }
              />
              <AxisGauge
                axis="amplification"
                utilization={amp?.utilization ?? 0}
                notesCount={amp?.notes_count ?? 0}
                isExpanded={expandedAxis === "amplification"}
                onClick={() =>
                  setExpandedAxis(
                    expandedAxis === "amplification" ? null : "amplification"
                  )
                }
              />
            </div>
            {expandedAxis && <AxisDrilldown axis={expandedAxis} vault={vault} />}
          </>
        )}
      </section>

      <Separator className="bg-neutral-800" />

      {/* Pipeline */}
      <section className="space-y-4">
        <h2 className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
          Pipeline Flow
        </h2>
        <PipelineFlow />
      </section>

      <Separator className="bg-neutral-800" />

      {/* Agent Org Chart */}
      <section className="space-y-4">
        <h2 className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
          Agent Organization
        </h2>

        {loading ? (
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <>
            {/* Omega (L1) */}
            <div className="flex justify-center">
              {AGENTS.filter((a) => a.layer === 1).map((agent) => {
                const hb = agents.find((h) => h.agent_name === agent.name);
                const isExpanded = expandedAgent === agent.name;
                return (
                  <div key={agent.name}>
                    <Card
                      className={`${agent.bgColor} ${agent.borderColor} border w-40 sm:w-48 text-center cursor-pointer transition-colors ${
                        isExpanded ? "ring-1 ring-neutral-600" : "hover:brightness-110"
                      }`}
                      onClick={() =>
                        setExpandedAgent(isExpanded ? null : agent.name)
                      }
                    >
                      <CardHeader className="py-2.5">
                        <div className="flex items-center justify-center gap-2">
                          <CardTitle className={`text-xs ${agent.color}`}>
                            {agent.label}
                          </CardTitle>
                          <StatusLed status={hb?.status || "idle"} />
                        </div>
                        <CardDescription className="text-[10px]">
                          {agent.role} · L{agent.layer}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                    {isExpanded && (
                      <AgentDetail
                        agent={agent}
                        heartbeat={hb || null}
                        commits={commits}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* L2 + L3 */}
            {[2, 3].map((layer) => (
              <div key={layer} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {AGENTS.filter((a) => a.layer === layer).map((agent) => {
                  const hb = agents.find((h) => h.agent_name === agent.name);
                  const isExpanded = expandedAgent === agent.name;
                  return (
                    <div key={agent.name}>
                      <Card
                        className={`${agent.bgColor} ${agent.borderColor} border cursor-pointer transition-colors ${
                          isExpanded ? "ring-1 ring-neutral-600" : "hover:brightness-110"
                        }`}
                        onClick={() =>
                          setExpandedAgent(isExpanded ? null : agent.name)
                        }
                      >
                        <CardHeader className="py-2.5">
                          <div className="flex items-center justify-between">
                            <CardTitle className={`text-xs ${agent.color}`}>
                              {agent.label}
                            </CardTitle>
                            <StatusLed status={hb?.status || "idle"} />
                          </div>
                          <CardDescription className="text-[10px]">
                            {agent.role} · L{agent.layer}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0 pb-3 text-[11px] text-neutral-500">
                          {hb?.last_commit_msg
                            ? hb.last_commit_msg.slice(0, 50)
                            : "Awaiting..."}
                          <div className="mt-1 text-neutral-600">
                            {timeAgo(hb?.last_commit_at ?? null)}
                          </div>
                        </CardContent>
                      </Card>
                      {isExpanded && (
                        <AgentDetail
                          agent={agent}
                          heartbeat={hb || null}
                          commits={commits}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </>
        )}
      </section>

      <Separator className="bg-neutral-800" />

      {/* Activity Timeline */}
      <section className="space-y-4">
        <h2 className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
          Activity Timeline
        </h2>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : commits.length > 0 ? (
          <div className="relative border-l border-neutral-800 ml-3 space-y-4">
            {commits.slice(0, TIMELINE_DISPLAY).map((c) => (
              <a
                key={c.hash}
                href={
                  c.url ||
                  `https://github.com/Minhan-Bae/oikbas-vault/commit/${c.fullHash || c.hash}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="relative pl-6 block group"
              >
                <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-neutral-800 bg-neutral-600 group-hover:bg-neutral-400 transition-colors" />
                <div className="flex items-start gap-2">
                  <span
                    className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[9px] font-medium ${AGENT_BADGE_COLORS[c.agent] || AGENT_BADGE_COLORS.Manual}`}
                  >
                    {c.agent}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-neutral-300 truncate group-hover:text-neutral-100 transition-colors">
                      {c.message}
                    </p>
                    <p className="text-[10px] text-neutral-600">
                      <code className="text-neutral-500">{c.hash}</code> ·{" "}
                      {timeAgo(c.date)}
                    </p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <Card className="border-neutral-800">
            <CardContent className="py-4 text-center text-neutral-500 text-xs">
              No activity data
            </CardContent>
          </Card>
        )}
      </section>

      <Separator className="bg-neutral-800" />

      {/* Vault Stats */}
      <section className="space-y-4">
        <h2 className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
          Vault Statistics
        </h2>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : vault && vault.total_notes > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
            {vault.stats?.by_status && (
              <StatusDistribution
                byStatus={vault.stats.by_status}
                total={vault.total_notes}
                selectedStatus={selectedStatus}
                onSelect={setSelectedStatus}
              />
            )}
          </div>
        ) : (
          <Card className="border-neutral-800">
            <CardContent className="py-4 text-center text-neutral-500 text-xs">
              No vault data
            </CardContent>
          </Card>
        )}
        {vault?.last_commit_hash && (
          <p className="text-[10px] text-neutral-600 text-right">
            Index: {vault.last_commit_hash} ·{" "}
            {vault.last_full_scan
              ? new Date(vault.last_full_scan).toLocaleDateString()
              : ""}
          </p>
        )}
      </section>
    </div>
  );
}

/* ── Agent Detail Panel ── */

function AgentDetail({
  agent,
  heartbeat,
  commits,
}: {
  agent: (typeof AGENTS)[number];
  heartbeat: AgentHeartbeat | null;
  commits: Commit[];
}) {
  const agentCommits = commits
    .filter((c) => c.agent === agent.label)
    .slice(0, 3);

  return (
    <div className="mt-2 rounded-lg border border-neutral-800 bg-neutral-900/60 p-3 space-y-2 animate-in fade-in duration-150">
      <div className="flex items-center gap-3 text-[10px]">
        <span className="text-neutral-500">Status:</span>
        <span
          className={
            heartbeat?.status === "active"
              ? "text-green-400"
              : heartbeat?.status === "error"
                ? "text-red-400"
                : "text-neutral-500"
          }
        >
          {heartbeat?.status || "idle"}
        </span>
        <span className="text-neutral-700">|</span>
        <span className="text-neutral-500">Last:</span>
        <span className="text-neutral-400">
          {timeAgo(heartbeat?.last_commit_at ?? null)}
        </span>
      </div>
      {agentCommits.length > 0 ? (
        <div className="space-y-1">
          <p className="text-[10px] text-neutral-600">Recent commits:</p>
          {agentCommits.map((c) => (
            <a
              key={c.hash}
              href={
                c.url ||
                `https://github.com/Minhan-Bae/oikbas-vault/commit/${c.fullHash || c.hash}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="block text-[10px] text-neutral-400 truncate hover:text-neutral-200 transition-colors"
            >
              <code className="text-neutral-500 mr-1">{c.hash}</code>
              {c.message}
            </a>
          ))}
        </div>
      ) : (
        <p className="text-[10px] text-neutral-600">No recent commits</p>
      )}
    </div>
  );
}
