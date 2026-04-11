"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { STATUS_OPTIONS, timeAgo } from "./utils";
import type { VaultData } from "./types";

export function VaultExplorer({ vault }: { vault: VaultData | null }) {
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
