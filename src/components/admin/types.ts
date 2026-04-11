/**
 * Shared types for admin/* components.
 *
 * Phase Admin-Cleanup (2026-04-11): extracted from the 1167-line
 * src/app/(private)/admin/page.tsx so each sub-component can live in
 * its own file without re-declaring shapes.
 */

export interface AgentHeartbeat {
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

export interface Task {
  id: string;
  title: string;
  axis: string;
  status: string;
  priority: string;
  assigned_to: string | null;
  created_at: string;
}

export interface Commit {
  hash: string;
  message: string;
  agent: string;
  date: string;
}

export interface VaultData {
  total_notes: number;
  last_full_scan: string | null;
  last_commit_hash: string | null;
  stats: {
    by_folder?: Record<string, number>;
    by_status?: Record<string, number>;
  };
}
