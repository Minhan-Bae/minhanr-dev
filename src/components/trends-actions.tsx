"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api-fetch";

export function BoostButton({ target, label }: { target: string; label: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleBoost() {
    setStatus("loading");
    try {
      const data = await apiFetch<{ ok?: boolean }>("/api/trends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "boost", target, value: 1.5 }),
      });
      setStatus(data?.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") return <span className="text-xs text-green-500">강화됨</span>;
  if (status === "error") return <span className="text-xs text-red-500">실패</span>;

  return (
    <Button size="sm" variant="outline" className="h-6 text-xs" disabled={status === "loading"} onClick={handleBoost}>
      {status === "loading" ? "..." : label}
    </Button>
  );
}

export function SuppressButton({ target }: { target: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSuppress() {
    setStatus("loading");
    try {
      const data = await apiFetch<{ ok?: boolean }>("/api/trends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "suppress", target }),
      });
      setStatus(data?.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") return <span className="text-xs text-yellow-500">억제됨 (7일)</span>;
  if (status === "error") return <span className="text-xs text-red-500">실패</span>;

  return (
    <Button size="sm" variant="ghost" className="h-6 text-xs text-muted-foreground" disabled={status === "loading"} onClick={handleSuppress}>
      {status === "loading" ? "..." : "억제"}
    </Button>
  );
}
