"use client";

import { AXIS_LABELS, type Axis } from "@/lib/agents";
import { Badge } from "@/components/ui/badge";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { KANBAN_COLUMNS, COLUMN_LABELS, PRIORITY_COLORS } from "./utils";
import type { Task } from "./types";

export function TaskKanban({
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
                    ? "border-primary/50 bg-primary/5"
                    : "border-border bg-card/30"
                }`}
              >
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">
                  {COLUMN_LABELS[col]}{" "}
                  <span className="text-muted-foreground/50">
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
                          className="rounded border border-border bg-background p-2 mb-2 space-y-1"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <p className="text-xs text-foreground leading-tight">
                              {task.title}
                            </p>
                            <button
                              onClick={() => onDelete(task.id)}
                              className="text-muted-foreground/50 hover:text-red-400 text-xs shrink-0"
                            >
                              x
                            </button>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`rounded px-1 py-0.5 text-xs border ${PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.P2}`}
                            >
                              {task.priority}
                            </span>
                            <Badge
                              variant="outline"
                              className="text-xs px-1 py-0"
                            >
                              {AXIS_LABELS[task.axis as Axis] || task.axis}
                            </Badge>
                            {task.assigned_to && (
                              <span className="text-xs text-muted-foreground/50">
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
