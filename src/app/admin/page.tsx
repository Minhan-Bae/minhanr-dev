"use client";

import { useEffect, useState, useCallback } from "react";
import { AGENTS, AXIS_LABELS, type Axis } from "@/lib/agents";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";

/* ── Types ── */

interface AgentHeartbeat {
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

interface Task {
  id: string;
  title: string;
  axis: string;
  status: string;
  priority: string;
  assigned_to: string | null;
  created_at: string;
}

interface Commit {
  hash: string;
  message: string;
  agent: string;
  date: string;
}

/* ── Helpers ── */

function StatusLed({ status }: { status: string }) {
  const color =
    status === "active"
      ? "bg-green-400"
      : status === "error"
        ? "bg-red-400"
        : "bg-neutral-600";
  return (
    <span className="relative flex h-2.5 w-2.5">
      {status === "active" && (
        <span
          className={`absolute inline-flex h-full w-full animate-ping rounded-full ${color} opacity-75`}
        />
      )}
      <span
        className={`relative inline-flex h-2.5 w-2.5 rounded-full ${color}`}
      />
    </span>
  );
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "never";
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

const PRIORITY_COLORS: Record<string, string> = {
  P0: "bg-red-500/20 text-red-300 border-red-500/30",
  P1: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  P2: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  P3: "bg-neutral-500/20 text-neutral-300 border-neutral-500/30",
};

const KANBAN_COLUMNS = ["backlog", "in_progress", "done", "blocked"] as const;
const COLUMN_LABELS: Record<string, string> = {
  backlog: "Backlog",
  in_progress: "In Progress",
  done: "Done",
  blocked: "Blocked",
};

const AGENT_BADGE: Record<string, string> = {
  Alpha: "bg-blue-400/20 text-blue-300",
  Beta: "bg-green-400/20 text-green-300",
  Gamma: "bg-purple-400/20 text-purple-300",
  "RT Slot 1": "bg-emerald-400/20 text-emerald-300",
  "RT Slot 2": "bg-cyan-400/20 text-cyan-300",
  "RT Slot 3": "bg-amber-400/20 text-amber-300",
  Manual: "bg-neutral-400/20 text-neutral-300",
};

/* ── Heartbeat Monitor ── */

function HeartbeatMonitor({ agents }: { agents: AgentHeartbeat[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {AGENTS.map((def) => {
        const hb = agents.find((h) => h.agent_name === def.name);
        return (
          <Card
            key={def.name}
            className={`${def.bgColor} ${def.borderColor} border`}
          >
            <CardHeader className="p-3 pb-1">
              <div className="flex items-center justify-between">
                <CardTitle className={`text-xs font-semibold ${def.color}`}>
                  {def.label}
                </CardTitle>
                <StatusLed status={hb?.status || "idle"} />
              </div>
              <CardDescription className="text-[10px]">
                {def.role}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-1">
              <p className="text-[10px] text-neutral-400 truncate">
                {hb?.last_commit_msg?.slice(0, 50) || "—"}
              </p>
              <p className="text-[10px] text-neutral-600">
                {hb?.last_commit_hash && (
                  <code className="text-neutral-500 mr-1">
                    {hb.last_commit_hash}
                  </code>
                )}
                {timeAgo(hb?.last_commit_at ?? null)}
              </p>
              {hb?.error_message && (
                <p className="text-[10px] text-red-400 truncate">
                  {hb.error_message}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

/* ── Task Kanban ── */

function TaskKanban({
  tasks,
  onMove,
  onDelete,
}: {
  tasks: Task[];
  onMove: (id: string, newStatus: string) => void;
  onDelete: (id: string) => void;
}) {
  function handleDragEnd(result: DropResult) {
    if (!result.destination) return;
    const taskId = result.draggableId;
    const newStatus = result.destination.droppableId;
    onMove(taskId, newStatus);
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {KANBAN_COLUMNS.map((col) => (
          <Droppable droppableId={col} key={col}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`rounded-lg border p-2 min-h-[200px] ${
                  snapshot.isDraggingOver
                    ? "border-blue-500/50 bg-blue-500/5"
                    : "border-neutral-800 bg-neutral-900/30"
                }`}
              >
                <h3 className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider mb-2 px-1">
                  {COLUMN_LABELS[col]}{" "}
                  <span className="text-neutral-600">
                    ({tasks.filter((t) => t.status === col).length})
                  </span>
                </h3>
                {tasks
                  .filter((t) => t.status === col)
                  .map((task, idx) => (
                    <Draggable
                      key={task.id}
                      draggableId={task.id}
                      index={idx}
                    >
                      {(prov) => (
                        <div
                          ref={prov.innerRef}
                          {...prov.draggableProps}
                          {...prov.dragHandleProps}
                          className="rounded border border-neutral-800 bg-neutral-950 p-2 mb-2 space-y-1"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <p className="text-[11px] text-neutral-200 leading-tight">
                              {task.title}
                            </p>
                            <button
                              onClick={() => onDelete(task.id)}
                              className="text-neutral-700 hover:text-red-400 text-[10px] shrink-0"
                            >
                              x
                            </button>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`rounded px-1 py-0.5 text-[9px] border ${PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.P2}`}
                            >
                              {task.priority}
                            </span>
                            <Badge
                              variant="outline"
                              className="text-[9px] px-1 py-0"
                            >
                              {AXIS_LABELS[task.axis as Axis] || task.axis}
                            </Badge>
                            {task.assigned_to && (
                              <span className="text-[9px] text-neutral-600">
                                @{task.assigned_to}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}

/* ── System Log ── */

function SystemLog({
  commits,
  filter,
  onFilterChange,
}: {
  commits: Commit[];
  filter: string;
  onFilterChange: (f: string) => void;
}) {
  const filtered = filter
    ? commits.filter((c) => c.agent === filter)
    : commits;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => onFilterChange("")}
          className={`rounded px-2 py-0.5 text-[10px] border transition-colors ${
            !filter
              ? "border-blue-500 text-blue-300"
              : "border-neutral-700 text-neutral-500 hover:text-neutral-300"
          }`}
        >
          All
        </button>
        {Object.keys(AGENT_BADGE).map((name) => (
          <button
            key={name}
            onClick={() => onFilterChange(name)}
            className={`rounded px-2 py-0.5 text-[10px] border transition-colors ${
              filter === name
                ? "border-blue-500 text-blue-300"
                : "border-neutral-700 text-neutral-500 hover:text-neutral-300"
            }`}
          >
            {name}
          </button>
        ))}
      </div>
      <div className="space-y-1 max-h-[400px] overflow-y-auto">
        {filtered.slice(0, 20).map((c) => (
          <div
            key={c.hash + c.date}
            className="flex items-start gap-2 rounded border border-neutral-800 bg-neutral-900/30 px-3 py-2"
          >
            <span
              className={`mt-0.5 shrink-0 rounded px-1 py-0.5 text-[9px] font-medium ${AGENT_BADGE[c.agent] || AGENT_BADGE.Manual}`}
            >
              {c.agent}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-neutral-300 truncate">
                {c.message}
              </p>
              <p className="text-[10px] text-neutral-600">
                <code className="text-neutral-500">{c.hash}</code> ·{" "}
                {timeAgo(c.date)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Create Task Modal (inline) ── */

function CreateTaskForm({ onCreated }: { onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [axis, setAxis] = useState("convergence");
  const [priority, setPriority] = useState("P2");
  const [assignedTo, setAssignedTo] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    await supabase.from("tasks").insert({
      title: title.trim(),
      axis,
      priority,
      assigned_to: assignedTo || null,
      status: "backlog",
    });

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
        className="flex-1 min-w-[200px] rounded border border-neutral-700 bg-neutral-900 px-2 py-1.5 text-xs text-neutral-100 placeholder:text-neutral-600 focus:border-blue-500 focus:outline-none"
      />
      <select
        value={axis}
        onChange={(e) => setAxis(e.target.value)}
        className="rounded border border-neutral-700 bg-neutral-900 px-2 py-1.5 text-xs text-neutral-300"
      >
        <option value="acquisition">수집</option>
        <option value="convergence">수렴</option>
        <option value="amplification">확산</option>
      </select>
      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
        className="rounded border border-neutral-700 bg-neutral-900 px-2 py-1.5 text-xs text-neutral-300"
      >
        <option value="P0">P0</option>
        <option value="P1">P1</option>
        <option value="P2">P2</option>
        <option value="P3">P3</option>
      </select>
      <select
        value={assignedTo}
        onChange={(e) => setAssignedTo(e.target.value)}
        className="rounded border border-neutral-700 bg-neutral-900 px-2 py-1.5 text-xs text-neutral-300"
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

/* ── Admin Page ── */

export default function AdminDashboard() {
  const [agents, setAgents] = useState<AgentHeartbeat[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [logFilter, setLogFilter] = useState("");

  const loadAgents = useCallback(async () => {
    const { data } = await supabase
      .from("agent_heartbeats")
      .select("*")
      .order("agent_layer")
      .order("agent_name");
    if (data) setAgents(data);
  }, []);

  const loadTasks = useCallback(async () => {
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setTasks(data);
  }, []);

  const loadCommits = useCallback(async () => {
    const res = await fetch("/api/activity");
    const d = await res.json();
    setCommits(d.commits || []);
  }, []);

  useEffect(() => {
    loadAgents();
    loadTasks();
    loadCommits();

    // Poll heartbeats every 10s
    const interval = setInterval(loadAgents, 10000);
    return () => clearInterval(interval);
  }, [loadAgents, loadTasks, loadCommits]);

  async function moveTask(id: string, newStatus: string) {
    await supabase
      .from("tasks")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
        ...(newStatus === "done"
          ? { completed_at: new Date().toISOString() }
          : {}),
      })
      .eq("id", id);
    loadTasks();
  }

  async function deleteTask(id: string) {
    await supabase.from("tasks").delete().eq("id", id);
    loadTasks();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">
          Admin Dashboard
        </h1>
        <Badge variant="outline" className="text-[10px] text-green-400 border-green-400/30">
          Authenticated
        </Badge>
      </div>

      {/* Heartbeat Monitor */}
      <section className="space-y-3">
        <h2 className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
          Heartbeat Monitor
        </h2>
        <HeartbeatMonitor agents={agents} />
      </section>

      <Separator className="bg-neutral-800" />

      {/* Task Kanban */}
      <section className="space-y-3">
        <h2 className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
          Task Kanban
        </h2>
        <CreateTaskForm onCreated={loadTasks} />
        <TaskKanban tasks={tasks} onMove={moveTask} onDelete={deleteTask} />
      </section>

      <Separator className="bg-neutral-800" />

      {/* System Log */}
      <section className="space-y-3">
        <h2 className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
          System Log
        </h2>
        <SystemLog
          commits={commits}
          filter={logFilter}
          onFilterChange={setLogFilter}
        />
      </section>
    </div>
  );
}
