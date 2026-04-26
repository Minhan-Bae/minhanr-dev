"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { apiFetch } from "@/lib/api-fetch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ADMIN_POLL_MS } from "@/lib/constants";
import { WeeklyCalendar } from "@/components/weekly-calendar";

import { HeartbeatMonitor } from "@/components/admin/heartbeat-monitor";
import { CostTracker } from "@/components/admin/cost-tracker";
import { VaultExplorer } from "@/components/admin/vault-explorer";
import { SystemLog } from "@/components/admin/system-log";
import type {
  AgentHeartbeat,
  Commit,
  VaultData,
} from "@/components/admin/types";

/**
 * Admin page — single workspace surface for the autonomous-agent system.
 * Thin orchestration shell over src/components/admin/ subcomponents.
 */

export default function AdminDashboard() {
  const router = useRouter();
  const [agents, setAgents] = useState<AgentHeartbeat[]>([]);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [vault, setVault] = useState<VaultData | null>(null);
  const [logFilter, setLogFilter] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  // agent_heartbeats has RLS enabled with no policies, so the browser anon
  // client cannot read it directly — the poll goes through /api/heartbeat
  // (server-side service-role). redirectOn401: false so a background poll
  // near session-expiry doesn't yank the user off the page mid-task.
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
    loadAgents();
    loadCommits();
    loadVault();

    // Poll heartbeats every 10s, pause when tab is hidden
    let interval = setInterval(loadAgents, ADMIN_POLL_MS);
    function onVisibility() {
      if (document.hidden) {
        clearInterval(interval);
      } else {
        loadAgents();
        interval = setInterval(loadAgents, ADMIN_POLL_MS);
      }
    }
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [loadAgents, loadCommits, loadVault]);

  async function handleLogout() {
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Admin</h1>
        <Button
          variant="outline"
          size="sm"
          className="text-xs h-7 border-border text-muted-foreground hover:text-red-400 hover:border-red-400/30"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? "..." : "Logout"}
        </Button>
      </div>

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

      <Separator />

      {/* Calendar */}
      <section className="space-y-3">
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Calendar
        </h2>
        <WeeklyCalendar />
      </section>
    </div>
  );
}
