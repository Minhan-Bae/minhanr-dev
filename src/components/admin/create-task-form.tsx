"use client";

import { useState } from "react";
import { AGENTS } from "@/lib/agents";
import { apiFetch } from "@/lib/api-fetch";
import { Button } from "@/components/ui/button";

export function CreateTaskForm({ onCreated }: { onCreated: () => void }) {
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
