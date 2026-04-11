"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AGENTS, AXIS_LABELS, type Axis } from "@/lib/agents";
import { supabase } from "@/lib/supabase";
import { apiFetch } from "@/lib/api-fetch";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { WeeklyScheduler } from "@/components/weekly-scheduler";
import { QuickNote } from "@/components/quick-note";
import { EisenhowerMatrix } from "@/components/eisenhower-matrix";
import { FloatingQuickNote } from "@/components/floating-quicknote";

/* ── Types ── */

interface AgentHeartbeat {
  id: string;
  agent_name: string;
  agent_layer: number;
  axis: string;
  status: string;
  last_commit_hash: string | null;
  last_commit_at: string | null;
  last_commit_msg: string | null;
  error_message: string | null;
}

interface Task {
  id: string;
  title: string;
  axis: string;
  status: string;
  priority: string;
  assigned_to: string | null;
  created_at: string;
}

interface Commit {
  hash: string;
  message: string;
  agent: string;
  date: string;
}

interface VaultData {
  total_notes: number;
  last_full_scan: string | null;
  last_commit_hash: string | null;
  stats: {
    by_folder?: Record<string, number>;
    by_status?: Record<string, number>;
  };
}

/* ── Helpers ── */

function StatusLed({ status }: { status: string }) {
  const color =
    status === "active"
      ? "bg-green-400"
      : status === "error"
        ? "bg-red-400"
        : "bg-muted-foreground";
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

const PRIORITY_COLORS: Record<string, string> = {
  P0: "bg-red-500/20 text-red-300 border-red-500/30",
  P1: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  P2: "bg-primary/20 text-primary border-primary/30",
  P3: "bg-muted/50 text-foreground/80 border-border",
};

const KANBAN_COLUMNS = ["backlog", "in_progress", "done", "blocked"] as const;
const COLUMN_LABELS: Record<string, string> = {
  backlog: "Backlog",
  in_progress: "In Progress",
  done: "Done",
  blocked: "Blocked",
};

const AGENT_BADGE: Record<string, string> = {
  Alpha: "bg-primary/20 text-primary",
  Beta: "bg-green-400/20 text-green-300",
  Gamma: "bg-purple-400/20 text-purple-300",
  "RT Slot 1": "bg-emerald-400/20 text-emerald-300",
  "RT Slot 2": "bg-cyan-400/20 text-cyan-300",
  "RT Slot 3": "bg-amber-400/20 text-amber-300",
  Manual: "bg-muted/50 text-foreground/80",
};

const STATUS_OPTIONS = [
  "seed",
  "growing",
  "mature",
  "published",
  "active",
  "archived",
] as const;

import { MONTHLY_COST_USD, ADMIN_POLL_MS } from "@/lib/constants";
const MONTHLY_TOTAL = MONTHLY_COST_USD;

/* ── Heartbeat Monitor ── */

function HeartbeatMonitor({
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

/* ── Cost Tracker (Spec §4 L122) ── */

function CostTracker({ commits }: { commits: Commit[] }) {
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
        estimated: total > 0 ? Math.round((count / total) * MONTHLY_TOTAL) : 0,
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
            Monthly: <span className="text-foreground font-medium">${MONTHLY_TOTAL}</span>{" "}
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

/* ── Vault Explorer (Spec §4 L123) ── */

function VaultExplorer({ vault }: { vault: VaultData | null }) {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );

  if (!vault) {
    return (
      <Card className="border-border">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-semibold">Vault Explorer</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-xs text-muted-foreground/50 text-center py-4">
            Loading vault index...
          </p>
        </CardContent>
      </Card>
    );
  }

  const byFolder = vault.stats.by_folder || {};
  const byStatus = vault.stats.by_status || {};

  const toggleFolder = (folder: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folder)) next.delete(folder);
      else next.add(folder);
      return next;
    });
  };

  // Group folders into parent/child for tree view
  const folderEntries = Object.entries(byFolder).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  // Build tree: top-level = 3-digit prefix folders, children = subfolders
  const topLevel: Record<string, { count: number; children: [string, number][] }> = {};
  for (const [folder, count] of folderEntries) {
    const parts = folder.split("/");
    const root = parts[0];
    if (parts.length === 1) {
      if (!topLevel[root]) topLevel[root] = { count: 0, children: [] };
      topLevel[root].count += count;
    } else {
      if (!topLevel[root]) topLevel[root] = { count: 0, children: [] };
      topLevel[root].children.push([folder, count]);
      topLevel[root].count += count;
    }
  }

  return (
    <Card className="border-border">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">Vault Explorer</CardTitle>
          <span className="text-xs text-muted-foreground">
            {vault.total_notes} notes
          </span>
        </div>
        <CardDescription className="text-xs">
          vault_index.json browser{" "}
          {vault.last_commit_hash && (
            <code className="text-muted-foreground/50">@{vault.last_commit_hash?.slice(0, 7)}</code>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3">
        {/* Status filter buttons */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setStatusFilter("")}
            className={`rounded px-2 py-0.5 text-xs border transition-colors ${
              !statusFilter
                ? "border-primary text-primary"
                : "border-border text-muted-foreground hover:text-foreground/80"
            }`}
          >
            All
          </button>
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(statusFilter === s ? "" : s)}
              className={`rounded px-2 py-0.5 text-xs border transition-colors ${
                statusFilter === s
                  ? "border-primary text-primary"
                  : "border-border text-muted-foreground hover:text-foreground/80"
              }`}
            >
              {s}{" "}
              {byStatus[s] != null && (
                <span className="text-muted-foreground/50">({byStatus[s]})</span>
              )}
            </button>
          ))}
        </div>

        {/* Status bar (when a specific status is selected) */}
        {statusFilter && byStatus[statusFilter] != null && (
          <div className="rounded border border-border bg-card/50 px-3 py-2">
            <p className="text-xs text-foreground/80">
              <span className="font-medium">{statusFilter}</span>: {byStatus[statusFilter]} notes
            </p>
          </div>
        )}

        {/* Folder tree */}
        <div className="space-y-0.5 max-h-[300px] overflow-y-auto">
          {Object.entries(topLevel).map(([root, data]) => (
            <div key={root}>
              <button
                onClick={() => toggleFolder(root)}
                className="flex items-center gap-1.5 w-full text-left rounded px-2 py-1 hover:bg-muted/50 transition-colors"
              >
                <span className="text-xs text-muted-foreground/50 w-3">
                  {data.children.length > 0
                    ? expandedFolders.has(root)
                      ? "v"
                      : ">"
                    : " "}
                </span>
                <span className="text-xs text-foreground/80 font-mono">
                  {root}
                </span>
                <span className="text-xs text-muted-foreground/50 ml-auto">
                  {data.count}
                </span>
              </button>
              {expandedFolders.has(root) &&
                data.children.map(([child, cnt]) => (
                  <div
                    key={child}
                    className="flex items-center gap-1.5 pl-7 pr-2 py-0.5"
                  >
                    <span className="text-xs text-muted-foreground font-mono">
                      {child.split("/").slice(1).join("/")}
                    </span>
                    <span className="text-xs text-muted-foreground/50 ml-auto">
                      {cnt}
                    </span>
                  </div>
                ))}
            </div>
          ))}
        </div>

        {/* Last scan info */}
        {vault.last_full_scan && (
          <p className="text-xs text-muted-foreground/50 text-right">
            Last scan: {timeAgo(vault.last_full_scan)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

/* ── Task Kanban (refactored to use /api/tasks REST) ── */

function TaskKanban({
  tasks,
  onMove,
  onDelete,
}: {
  tasks: Task[];
  onMove: (id: string, newStatus: string) => void;
  onDelete: (id: string) => void;
}) {
  function handleDragEnd(result: DropResult) {
    if (!result.destination) return;
    const taskId = result.draggableId;
    const newStatus = result.destination.droppableId;
    onMove(taskId, newStatus);
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {KANBAN_COLUMNS.map((col) => (
          <Droppable droppableId={col} key={col}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`rounded-lg border p-2 min-h-[200px] ${
                  snapshot.isDraggingOver
                    ? "border-primary/50 bg-primary/5"
                    : "border-border bg-card/30"
                }`}
              >
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">
                  {COLUMN_LABELS[col]}{" "}
                  <span className="text-muted-foreground/50">
                    ({tasks.filter((t) => t.status === col).length})
                  </span>
                </h3>
                {tasks
                  .filter((t) => t.status === col)
                  .map((task, idx) => (
                    <Draggable
                      key={task.id}
                      draggableId={task.id}
                      index={idx}
                    >
                      {(prov) => (
                        <div
                          ref={prov.innerRef}
                          {...prov.draggableProps}
                          {...prov.dragHandleProps}
                          className="rounded border border-border bg-background p-2 mb-2 space-y-1"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <p className="text-xs text-foreground leading-tight">
                              {task.title}
                            </p>
                            <button
                              onClick={() => onDelete(task.id)}
                              className="text-muted-foreground/50 hover:text-red-400 text-xs shrink-0"
                            >
                              x
                            </button>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`rounded px-1 py-0.5 text-xs border ${PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.P2}`}
                            >
                              {task.priority}
                            </span>
                            <Badge
                              variant="outline"
                              className="text-xs px-1 py-0"
                            >
                              {AXIS_LABELS[task.axis as Axis] || task.axis}
                            </Badge>
                            {task.assigned_to && (
                              <span className="text-xs text-muted-foreground/50">
                                @{task.assigned_to}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}

/* ── System Log (enhanced with error highlighting + webhook health) ── */

function SystemLog({
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

  // Webhook health: check if any agents have recent heartbeats (within 15 min)
  const webhookHealthy = useMemo(() => {
    const fifteenMin = 15 * 60 * 1000;
    return agents.some(
      (a) =>
        a.last_commit_at &&
        Date.now() - new Date(a.last_commit_at).getTime() < fifteenMin
    );
  }, [agents]);

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

/* ── Publish Queue (Spec §8 L216) ── */

function PublishQueue({
  vault,
  onPublish,
}: {
  vault: VaultData | null;
  onPublish: (slug: string) => void;
}) {
  const matureCount = vault?.stats.by_status?.mature ?? 0;
  const [publishing, setPublishing] = useState<string | null>(null);

  async function handlePublish(noteTitle: string) {
    setPublishing(noteTitle);
    onPublish(noteTitle);
    // Simulated — actual publish would PATCH vault note status
    setTimeout(() => setPublishing(null), 2000);
  }

  return (
    <Card className="border-border">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">Publish Queue</CardTitle>
          <Badge
            variant="outline"
            className="text-xs border-border text-muted-foreground"
          >
            {matureCount} mature
          </Badge>
        </div>
        <CardDescription className="text-xs">
          Mature notes ready for publication
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {matureCount === 0 ? (
          <p className="text-xs text-muted-foreground/50 text-center py-4">
            수렴 파이프라인이 mature 노트를 생성하면 여기 표시됩니다
          </p>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              {matureCount} notes with{" "}
              <code className="text-amber-400">status: mature</code> detected.
            </p>
            <div className="rounded border border-border bg-card/30 p-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {matureCount} notes awaiting review
                </span>
                <Button
                  variant="outline"
                  size="xs"
                  className="text-xs h-5 border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                  onClick={() => handlePublish("batch")}
                  disabled={publishing !== null}
                >
                  {publishing ? "Processing..." : "Review & Publish"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground/50">
                Gamma(편집장)가 콘텐츠 재구성 후 /blog에 발행합니다
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ── Create Task Form ── */

function CreateTaskForm({ onCreated }: { onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [axis, setAxis] = useState("convergence");
  const [priority, setPriority] = useState("P2");
  const [assignedTo, setAssignedTo] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await apiFetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          axis,
          priority,
          assigned_to: assignedTo || null,
        }),
      });
    } catch {
      // 401 redirects; other failures are surfaced via the next reload
    }

    setTitle("");
    onCreated();
  }

  return (
    <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-2">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="New task title..."
        required
        className="flex-1 min-w-[200px] rounded border border-border bg-card px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
      />
      <select
        value={axis}
        onChange={(e) => setAxis(e.target.value)}
        className="rounded border border-border bg-card px-2 py-1.5 text-xs text-foreground/80"
      >
        <option value="acquisition">수집</option>
        <option value="convergence">수렴</option>
        <option value="amplification">확산</option>
      </select>
      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
        className="rounded border border-border bg-card px-2 py-1.5 text-xs text-foreground/80"
      >
        <option value="P0">P0</option>
        <option value="P1">P1</option>
        <option value="P2">P2</option>
        <option value="P3">P3</option>
      </select>
      <select
        value={assignedTo}
        onChange={(e) => setAssignedTo(e.target.value)}
        className="rounded border border-border bg-card px-2 py-1.5 text-xs text-foreground/80"
      >
        <option value="">Unassigned</option>
        {AGENTS.map((a) => (
          <option key={a.name} value={a.name}>
            {a.label}
          </option>
        ))}
      </select>
      <Button type="submit" size="sm" className="text-xs h-7">
        Add
      </Button>
    </form>
  );
}

/* ── Admin Page ── */

export default function AdminDashboard() {
  const router = useRouter();
  const [agents, setAgents] = useState<AgentHeartbeat[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [vault, setVault] = useState<VaultData | null>(null);
  const [logFilter, setLogFilter] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "eisenhower" | "schedule" | "quicknote">("dashboard");

  // Phase F-2-RLS: agent_heartbeats now has RLS enabled with no policies,
  // so the browser anon client can no longer read it directly. Route the
  // poll through /api/heartbeat (server-side service-role admin client).
  // redirectOn401: false so a background poll near session-expiry doesn't
  // yank the user off the page mid-task.
  const loadAgents = useCallback(async () => {
    try {
      const d = await apiFetch<{ agents?: AgentHeartbeat[] }>("/api/heartbeat", { redirectOn401: false });
      if (d?.agents) setAgents(d.agents);
    } catch {
      // background poll — silent on failure
    }
  }, []);

  const loadTasks = useCallback(async () => {
    try {
      const d = await apiFetch<{ tasks?: Task[] }>("/api/tasks");
      if (d?.tasks) setTasks(d.tasks);
    } catch {
      // 401 redirects via apiFetch
    }
  }, []);

  const loadCommits = useCallback(async () => {
    try {
      const d = await apiFetch<{ commits?: Commit[] }>("/api/activity", { redirectOn401: false });
      setCommits(d?.commits ?? []);
    } catch {
      // /api/activity is intentionally public; only network errors land here
    }
  }, []);

  const loadVault = useCallback(async () => {
    try {
      const d = await apiFetch<VaultData>("/api/vault", { redirectOn401: false });
      if (d) setVault(d);
    } catch {
      // vault fetch is optional
    }
  }, []);

  useEffect(() => {
    // setState happens asynchronously inside each loader (after the
    // await), not synchronously in this effect body — same precedent
    // as weekly-calendar.tsx#fetchData. Suppress the rule.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAgents();
    loadTasks();
    loadCommits();
    loadVault();

    // Poll heartbeats every 10s
    const interval = setInterval(loadAgents, ADMIN_POLL_MS);
    return () => clearInterval(interval);
  }, [loadAgents, loadTasks, loadCommits, loadVault]);

  async function moveTask(id: string, newStatus: string) {
    try {
      await apiFetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
    } catch {
      // 401 redirects; other failures fall through to loadTasks() refresh
    }
    loadTasks();
  }

  async function deleteTask(id: string) {
    try {
      await apiFetch(`/api/tasks?id=${id}`, { method: "DELETE" });
    } catch {
      // 401 redirects; other failures fall through to loadTasks() refresh
    }
    loadTasks();
  }

  async function handleLogout() {
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.push("/login");
  }

  const SIDEBAR_ITEMS = [
    { key: "dashboard" as const, label: "Dashboard", icon: "▦" },
    { key: "eisenhower" as const, label: "Eisenhower", icon: "◈" },
    { key: "schedule" as const, label: "Schedule", icon: "▤" },
    { key: "quicknote" as const, label: "Quick Note", icon: "✎" },
  ];

  return (
    <div className="flex min-h-[calc(100vh-100px)]">
      {/* Sidebar */}
      <aside className="w-14 sm:w-48 shrink-0 border-r border-border bg-background flex flex-col">
        <div className="p-3 border-b border-border hidden sm:block">
          <h1 className="text-base font-bold tracking-tight">Admin</h1>
        </div>
        <nav className="flex-1 py-2 space-y-0.5">
          {SIDEBAR_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-colors ${
                activeTab === item.key
                  ? "bg-primary/10 text-primary border-r-2 border-primary"
                  : "text-muted-foreground hover:text-foreground/80 hover:bg-muted/50"
              }`}
            >
              <span className="text-sm shrink-0">{item.icon}</span>
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-border space-y-2">
          <Badge variant="outline" className="text-xs text-green-400 border-green-400/30 hidden sm:inline-flex">
            Authenticated
          </Badge>
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs h-7 border-border text-muted-foreground hover:text-red-400 hover:border-red-400/30"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? "..." : "Logout"}
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 px-4 sm:px-6 py-6 space-y-8 overflow-auto">

      {/* Tab: Dashboard */}
      {activeTab === "dashboard" && (
        <div className="space-y-8">
          {/* Heartbeat Monitor */}
          <section className="space-y-3">
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Heartbeat Monitor
            </h2>
            <HeartbeatMonitor agents={agents} commits={commits} />
          </section>

          <Separator />

          {/* Cost Tracker + Vault Explorer side by side */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Cost Tracker
              </h2>
              <CostTracker commits={commits} />
            </div>
            <div className="space-y-3">
              <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Vault Explorer
              </h2>
              <VaultExplorer vault={vault} />
            </div>
          </section>

          <Separator />

          {/* Task Kanban */}
          <section className="space-y-3">
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Task Kanban
            </h2>
            <CreateTaskForm onCreated={loadTasks} />
            <TaskKanban tasks={tasks} onMove={moveTask} onDelete={deleteTask} />
          </section>

          <Separator />

          {/* Publish Queue + System Log side by side */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1 space-y-3">
              <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Publish Queue
              </h2>
              <PublishQueue
                vault={vault}
                onPublish={(slug) => {
                  console.log("Publish requested:", slug);
                }}
              />
            </div>
            <div className="lg:col-span-2 space-y-3">
              <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                System Log
              </h2>
              <SystemLog
                commits={commits}
                filter={logFilter}
                onFilterChange={setLogFilter}
                agents={agents}
              />
            </div>
          </section>
        </div>
      )}

      {/* Tab: Eisenhower Matrix */}
      {activeTab === "eisenhower" && (
        <EisenhowerMatrix
          tasks={tasks}
          onMove={async (id, priority) => {
            try {
              await apiFetch("/api/vault-sync/task", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, priority }),
              });
            } catch {
              // 401 redirects; other failures fall through to loadTasks() refresh
            }
            loadTasks();
          }}
          onDelete={deleteTask}
          onCreate={async (title, priority) => {
            try {
              await apiFetch("/api/vault-sync/task", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, axis: "convergence", priority }),
              });
            } catch {
              // 401 redirects; other failures fall through to loadTasks() refresh
            }
            loadTasks();
          }}
        />
      )}

      {/* Tab: Schedule */}
      {activeTab === "schedule" && (
        <WeeklyScheduler />
      )}

      {/* Tab: Quick Note */}
      {activeTab === "quicknote" && (
        <QuickNote />
      )}

      {/* Floating Quick Note (always visible) */}
      <FloatingQuickNote />
      </div>
    </div>
  );
}
