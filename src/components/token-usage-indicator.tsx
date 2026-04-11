"use client";

import { useEffect, useState } from "react";
import { Zap } from "lucide-react";
import { apiFetch } from "@/lib/api-fetch";

interface UsageBucket {
  input: number;
  output: number;
  cache_create: number;
  cache_read: number;
  total: number;
}

interface UsageData {
  today: UsageBucket;
  week: UsageBucket;
}

function formatTokens(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums">{formatTokens(value)}</span>
    </div>
  );
}

export function TokenUsageIndicator() {
  const [data, setData] = useState<UsageData | null>(null);

  useEffect(() => {
    // Background poll — fail silently on 401 (don't redirect away from
    // whatever surface the user is on for an indicator widget).
    apiFetch<UsageData>("/api/claude-usage", { redirectOn401: false })
      .then((d) => setData(d))
      .catch(() => {});
  }, []);

  if (!data) return null;

  return (
    <div className="relative group">
      <button className="flex items-center gap-1.5 text-muted-foreground hover:text-amber-400 transition-colors">
        <Zap size={14} />
        <span className="text-xs tabular-nums">{formatTokens(data.today.total)}</span>
      </button>

      <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-border bg-card p-3 text-xs shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50">
        <div className="mb-2 font-semibold text-foreground/80 flex items-center gap-1.5">
          <Zap size={12} className="text-amber-400" />
          Claude Token Usage
        </div>

        <div className="mb-2">
          <div className="text-xs uppercase tracking-wider text-muted-foreground/50 mb-1">
            Today
          </div>
          <Row label="Input" value={data.today.input} />
          <Row label="Output" value={data.today.output} />
          <Row label="Cache Write" value={data.today.cache_create} />
          <Row label="Cache Read" value={data.today.cache_read} />
          <div className="border-t border-border mt-1 pt-1 flex justify-between font-medium text-foreground">
            <span>Total</span>
            <span className="tabular-nums">{formatTokens(data.today.total)}</span>
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground/50 mb-1">
            Last 7 Days
          </div>
          <Row label="Input" value={data.week.input} />
          <Row label="Output" value={data.week.output} />
          <Row label="Cache Write" value={data.week.cache_create} />
          <Row label="Cache Read" value={data.week.cache_read} />
          <div className="border-t border-border mt-1 pt-1 flex justify-between font-medium text-foreground">
            <span>Total</span>
            <span className="tabular-nums">{formatTokens(data.week.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
