"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AXIS_LABELS, type Axis } from "@/lib/agents";

interface Task {
  id: string;
  title: string;
  axis: string;
  status: string;
  priority: string;
  assigned_to: string | null;
}

interface Quadrant {
  priority: string;
  label: string;
  sublabel: string;
  color: string;
  borderColor: string;
  bgColor: string;
}

const QUADRANTS: Quadrant[] = [
  { priority: "P0", label: "DO NOW", sublabel: "긴급 + 중요", color: "text-red-400", borderColor: "border-red-500/40", bgColor: "bg-red-500/5" },
  { priority: "P1", label: "SCHEDULE", sublabel: "비긴급 + 중요", color: "text-primary", borderColor: "border-primary/40", bgColor: "bg-primary/5" },
  { priority: "P2", label: "DELEGATE", sublabel: "긴급 + 비중요", color: "text-amber-400", borderColor: "border-amber-500/40", bgColor: "bg-amber-500/5" },
  { priority: "P3", label: "ELIMINATE", sublabel: "비긴급 + 비중요", color: "text-neutral-400", borderColor: "border-neutral-500/40", bgColor: "bg-neutral-500/5" },
];

const AXIS_BADGE: Record<string, string> = {
  acquisition: "bg-green-400/20 text-green-300",
  convergence: "bg-primary/20 text-primary",
  amplification: "bg-purple-400/20 text-purple-300",
};

export function EisenhowerMatrix({
  tasks,
  onMove,
  onDelete,
  onCreate,
}: {
  tasks: Task[];
  onMove: (id: string, priority: string) => void;
  onDelete: (id: string) => void;
  onCreate: (title: string, priority: string) => void;
}) {
  const [dragOverQuadrant, setDragOverQuadrant] = useState<string | null>(null);
  const [inlineCreate, setInlineCreate] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");

  // Filter out done tasks
  const activeTasks = tasks.filter((t) => t.status !== "done");

  function handleDragStart(e: React.DragEvent, taskId: string) {
    e.dataTransfer.setData("text/plain", taskId);
  }

  function handleDragOver(e: React.DragEvent, priority: string) {
    e.preventDefault();
    setDragOverQuadrant(priority);
  }

  function handleDrop(e: React.DragEvent, priority: string) {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    if (taskId) onMove(taskId, priority);
    setDragOverQuadrant(null);
  }

  function handleInlineCreate(priority: string) {
    if (!newTitle.trim()) return;
    onCreate(newTitle.trim(), priority);
    setNewTitle("");
    setInlineCreate(null);
  }

  return (
    <Card className="border-neutral-800">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">Eisenhower Matrix</CardTitle>
          <span className="text-[10px] text-neutral-500">{activeTasks.length} active</span>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        {/* Axis labels */}
        <div className="grid grid-cols-[20px_1fr_1fr] grid-rows-[20px_1fr_1fr] gap-2" style={{ minHeight: 360 }}>
          {/* Corner */}
          <div />
          {/* Column headers */}
          <div className="flex items-center justify-center text-[9px] font-medium text-neutral-500">Urgent</div>
          <div className="flex items-center justify-center text-[9px] font-medium text-neutral-500">Not Urgent</div>

          {/* Row header: Important */}
          <div className="flex items-center justify-center text-[9px] font-medium text-neutral-500" style={{ writingMode: "vertical-lr", transform: "rotate(180deg)" }}>Important</div>

          {/* Q1: P0 DO NOW */}
          {renderQuadrant(QUADRANTS[0], activeTasks)}

          {/* Q2: P1 SCHEDULE */}
          {renderQuadrant(QUADRANTS[1], activeTasks)}

          {/* Row header: Not Important */}
          <div className="flex items-center justify-center text-[9px] font-medium text-neutral-500" style={{ writingMode: "vertical-lr", transform: "rotate(180deg)" }}>Not Important</div>

          {/* Q3: P2 DELEGATE */}
          {renderQuadrant(QUADRANTS[2], activeTasks)}

          {/* Q4: P3 ELIMINATE */}
          {renderQuadrant(QUADRANTS[3], activeTasks)}
        </div>
      </CardContent>
    </Card>
  );

  function renderQuadrant(q: Quadrant, allTasks: Task[]) {
    const qTasks = allTasks.filter((t) => t.priority === q.priority);
    const isOver = dragOverQuadrant === q.priority;

    return (
      <div
        className={`rounded-lg border p-2 min-h-[140px] transition-colors ${q.borderColor} ${q.bgColor} ${
          isOver ? "ring-1 ring-primary/50 brightness-110" : ""
        }`}
        onDragOver={(e) => handleDragOver(e, q.priority)}
        onDragLeave={() => setDragOverQuadrant(null)}
        onDrop={(e) => handleDrop(e, q.priority)}
      >
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className={`text-[10px] font-bold ${q.color}`}>{q.priority}: {q.label}</span>
            <span className="text-[8px] text-neutral-600 ml-1.5">{q.sublabel}</span>
          </div>
          <button
            onClick={() => { setInlineCreate(inlineCreate === q.priority ? null : q.priority); setNewTitle(""); }}
            className="text-neutral-600 hover:text-neutral-400 text-xs"
          >
            +
          </button>
        </div>

        {/* Inline create */}
        {inlineCreate === q.priority && (
          <div className="mb-2">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleInlineCreate(q.priority); if (e.key === "Escape") setInlineCreate(null); }}
              placeholder="Task title..."
              autoFocus
              className="w-full rounded border border-neutral-700 bg-neutral-950 px-1.5 py-1 text-[10px] text-neutral-200 placeholder:text-neutral-600 focus:border-primary focus:outline-none"
            />
          </div>
        )}

        {/* Tasks */}
        <div className="space-y-1">
          {qTasks.map((t) => (
            <div
              key={t.id}
              draggable
              onDragStart={(e) => handleDragStart(e, t.id)}
              className="rounded border border-neutral-800 bg-neutral-950/80 px-2 py-1.5 cursor-grab active:cursor-grabbing hover:border-neutral-600 transition-colors"
            >
              <div className="flex items-start justify-between gap-1">
                <span className="text-[10px] text-neutral-200 leading-tight">{t.title}</span>
                <button
                  onClick={() => onDelete(t.id)}
                  className="text-neutral-700 hover:text-red-400 text-[9px] shrink-0"
                >
                  &times;
                </button>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className={`rounded px-1 py-0 text-[8px] ${AXIS_BADGE[t.axis] || "bg-neutral-400/20 text-neutral-300"}`}>
                  {AXIS_LABELS[t.axis as Axis] || t.axis}
                </span>
                {t.assigned_to && (
                  <span className="text-[8px] text-neutral-600">@{t.assigned_to}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
}
