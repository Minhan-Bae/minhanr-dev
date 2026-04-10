"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function WatchlistAdd() {
  const [symbol, setSymbol] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleAdd() {
    if (!symbol.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", symbol: symbol.trim() }),
      });
      const data = await res.json();
      if (data.ok) {
        setStatus("done");
        setMessage(`${symbol.toUpperCase()} 추가됨`);
        setSymbol("");
        setTimeout(() => setStatus("idle"), 2000);
      } else {
        setStatus("error");
        setMessage(data.error || "실패");
      }
    } catch {
      setStatus("error");
      setMessage("네트워크 오류");
    }
  }

  return (
    <div className="flex gap-2 items-center">
      <Input
        placeholder="AAPL"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
        className="h-8 w-24 text-sm"
        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
      />
      <Button size="sm" className="h-8 text-xs" disabled={status === "loading"} onClick={handleAdd}>
        {status === "loading" ? "..." : "추가"}
      </Button>
      {status === "done" && <span className="text-xs text-green-500">{message}</span>}
      {status === "error" && <span className="text-xs text-red-500">{message}</span>}
    </div>
  );
}
