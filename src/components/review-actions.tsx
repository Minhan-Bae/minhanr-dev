"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ReviewActions({ path, isPublished }: { path: string; isPublished: boolean }) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [result, setResult] = useState("");

  if (isPublished) {
    return <span className="text-xs text-green-500">발행됨</span>;
  }

  async function handleAction(action: "approve" | "reject") {
    setStatus("loading");
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path, action }),
      });
      const data = await res.json();
      if (data.ok) {
        setStatus("done");
        setResult(action === "approve" ? "승인됨" : "거부됨");
      } else {
        setStatus("error");
        setResult(data.error || "실패");
      }
    } catch (e) {
      setStatus("error");
      setResult("네트워크 오류");
    }
  }

  if (status === "done") return <span className="text-xs text-green-500">{result}</span>;
  if (status === "error") return <span className="text-xs text-red-500">{result}</span>;

  return (
    <div className="flex gap-1.5 shrink-0">
      <Button
        size="sm"
        variant="default"
        className="h-7 text-xs"
        disabled={status === "loading"}
        onClick={() => handleAction("approve")}
      >
        {status === "loading" ? "..." : "승인"}
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="h-7 text-xs"
        disabled={status === "loading"}
        onClick={() => handleAction("reject")}
      >
        거부
      </Button>
    </div>
  );
}
