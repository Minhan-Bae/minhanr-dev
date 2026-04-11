"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { apiFetch } from "@/lib/api-fetch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { WeeklyScheduler } from "@/components/weekly-scheduler";
import { EisenhowerMatrix } from "@/components/eisenhower-matrix";
import { FloatingQuickNote } from "@/components/floating-quicknote";
import { ADMIN_POLL_MS } from "@/lib/constants";

import { HeartbeatMonitor } from "@/components/admin/heartbeat-monitor";
import { CostTracker } from "@/components/admin/cost-tracker";
import { VaultExplorer } from "@/components/admin/vault-explorer";
import { TaskKanban } from "@/components/admin/task-kanban";
import { SystemLog } from "@/components/admin/system-log";
import { CreateTaskForm } from "@/components/admin/create-task-form";
import type {
  AgentHeartbeat,
  Task,
  Commit,
  VaultData,
} from "@/components/admin/types";

/**
 * Admin page — single workspace surface for the autonomous-agent system.
 *
 * Phase Admin-Cleanup (2026-04-11): scattered 4-tab layout consolidated to
 * 2 tabs (Dashboard / Planning). PublishQueue stub removed. QuickNote tab
 * removed (FloatingQuickNote covers it). Eisenhower folded into Planning
 * alongside WeeklyScheduler so the "what should I work on" surfaces live
 * in one place. The 8 sub-components were extracted to src/components/admin/
 * to make this file a thin orchestration shell.
 */

export default function AdminDashboard() {
  const router = useRouter();
  const [agents, setAgents] = useState<AgentHeartbeat[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [vault, setVault] = useState<VaultData | null>(null);
  const [logFilter, setLogFilter] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "planning">(
    "dashboard"
  );

  // Phase F-2-RLS: agent_heartbeats has RLS enabled with no policies, so the
  // browser anon client can no longer read it directly. Route the poll
  // through /api/heartbeat (server-side service-role admin client).
  // redirectOn401: false so a background poll near session-expiry doesn't
  // yank the user off the page mid-task.
  const loadAgents = useCallback(async () => {
    try {
      const d = await apiFetch<{ agents?: AgentHeartbeat[] }>(
        "/api/heartbeat",
        { redirectOn401: false }
      );
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
      const d = await apiFetch<{ commits?: Commit[] }>("/api/activity", {
        redirectOn401: false,
      });
      setCommits(d?.commits ?? []);
    } catch {
      // /api/activity is intentionally public; only network errors land here
    }
  }, []);

  const loadVault = useCallback(async () => {
    try {
      const d = await apiFetch<VaultData>("/api/vault", {
        redirectOn401: false,
      });
      if (d) setVault(d);
    } catch {
      // vault fetch is optional
    }
  }, []);

  useEffect(() => {
    // setState happens asynchronously inside each loader (after the await),
    // not synchronously in this effect body — same precedent as
    // weekly-calendar.tsx#fetchData. Suppress the rule.
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
    { key: "planning" as const, label: "Planning", icon: "▤" },
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
          <Badge
            variant="outline"
            className="text-xs text-green-400 border-green-400/30 hidden sm:inline-flex"
          >
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
              <TaskKanban
                tasks={tasks}
                onMove={moveTask}
                onDelete={deleteTask}
              />
            </section>

            <Separator />

            {/* System Log */}
            <section className="space-y-3">
              <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                System Log
              </h2>
              <SystemLog
                commits={commits}
                filter={logFilter}
                onFilterChange={setLogFilter}
                agents={agents}
              />
            </section>
          </div>
        )}

        {/* Tab: Planning (Schedule + Eisenhower) */}
        {activeTab === "planning" && (
          <div className="space-y-8">
            <section className="space-y-3">
              <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Weekly Schedule
              </h2>
              <WeeklyScheduler />
            </section>

            <Separator />

            <section className="space-y-3">
              <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Eisenhower Matrix
              </h2>
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
                      body: JSON.stringify({
                        title,
                        axis: "convergence",
                        priority,
                      }),
                    });
                  } catch {
                    // 401 redirects; other failures fall through to loadTasks() refresh
                  }
                  loadTasks();
                }}
              />
            </section>
          </div>
        )}

        {/* Floating Quick Note (always visible) */}
        <FloatingQuickNote />
      </div>
    </div>
  );
}
