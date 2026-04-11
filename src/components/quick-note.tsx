"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Note {
  id: string;
  content: string;
  pinned: boolean;
  created_at: string;
  updated_at: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  return `${Math.floor(hr / 24)}d`;
}

export function QuickNote() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [draft, setDraft] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/quicknotes");
    const d = await res.json();
    if (d.notes) setNotes(d.notes);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    await fetch("/api/quicknotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: draft }),
    });
    setDraft("");
    load();
  }

  async function handlePin(id: string, pinned: boolean) {
    await fetch("/api/quicknotes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, pinned: !pinned }),
    });
    load();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/quicknotes?id=${id}`, { method: "DELETE" });
    load();
  }

  async function handleEdit(id: string) {
    if (!editContent.trim()) return;
    await fetch("/api/quicknotes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, content: editContent.trim() }),
    });
    setEditId(null);
    load();
  }

  return (
    <div className="space-y-4">
      {/* Compose */}
      <Card className="border-border">
        <CardContent className="p-4">
          <form onSubmit={handleCreate} className="space-y-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Quick thought, idea, or note..."
              rows={3}
              className="w-full rounded border border-border bg-card px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  handleCreate(e);
                }
              }}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground/50">Ctrl+Enter to save</span>
              <Button type="submit" size="xs" className="text-xs h-5" disabled={!draft.trim()}>
                Save Note
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Notes list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {notes.map((note) => (
          <Card
            key={note.id}
            className={`border-border ${note.pinned ? "ring-1 ring-amber-500/30" : ""}`}
          >
            <CardHeader className="p-3 pb-1">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs text-muted-foreground">
                  {timeAgo(note.created_at)} ago
                  {note.pinned && <span className="ml-1 text-amber-400">pinned</span>}
                </CardTitle>
                <div className="flex gap-1">
                  <button
                    onClick={() => handlePin(note.id, note.pinned)}
                    className={`text-xs px-1 transition-colors ${note.pinned ? "text-amber-400" : "text-muted-foreground/50 hover:text-amber-400"}`}
                    title={note.pinned ? "Unpin" : "Pin"}
                  >
                    {note.pinned ? "★" : "☆"}
                  </button>
                  <button
                    onClick={() => {
                      setEditId(editId === note.id ? null : note.id);
                      setEditContent(note.content);
                    }}
                    className="text-xs text-muted-foreground/50 hover:text-primary transition-colors px-1"
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="text-xs text-muted-foreground/50 hover:text-red-400 transition-colors px-1"
                  >
                    ×
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              {editId === note.id ? (
                <div className="space-y-1">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                    className="w-full rounded border border-border bg-card px-2 py-1 text-xs text-foreground focus:border-primary focus:outline-none resize-none"
                  />
                  <div className="flex gap-1 justify-end">
                    <Button size="xs" variant="outline" className="text-xs h-4" onClick={() => setEditId(null)}>Cancel</Button>
                    <Button size="xs" className="text-xs h-4" onClick={() => handleEdit(note.id)}>Save</Button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-foreground/80 whitespace-pre-wrap leading-relaxed">
                  {note.content}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {notes.length === 0 && (
        <Card className="border-border">
          <CardContent className="py-8 text-center text-muted-foreground/50 text-xs">
            No notes yet. Write your first quick note above.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
