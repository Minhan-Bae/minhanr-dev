"use client";

import { useState } from "react";
import { apiFetch, ApiFetchError } from "@/lib/api-fetch";

export function FloatingQuickNote() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  async function handleSave() {
    if (!text.trim() || saving) return;
    setSaving(true);

    try {
      await apiFetch("/api/vault-sync/note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      });
      setText("");
      setOpen(false);
      setToast("Saved to vault");
    } catch (e) {
      // 401 has already redirected to /login at this point.
      const msg =
        e instanceof ApiFetchError &&
        typeof (e.data as { error?: string } | null)?.error === "string"
          ? (e.data as { error: string }).error
          : "Save failed";
      setToast(msg);
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 2500);
    }
  }

  return (
    <>
      {/* Toast */}
      {toast && (
        <div className="fixed top-16 right-4 z-50 rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground/80 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          {toast}
        </div>
      )}

      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-primary hover:bg-primary/80 text-white shadow-lg flex items-center justify-center text-lg transition-colors"
          title="Quick Note → Vault"
        >
          ✎
        </button>
      )}

      {/* Expanded input */}
      {open && (
        <div className="fixed bottom-6 right-6 z-40 w-80 rounded-lg border border-border bg-card shadow-xl p-3 space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">
              Quick Note → Vault Inbox
            </span>
            <button onClick={() => setOpen(false)} className="text-muted-foreground/50 hover:text-muted-foreground text-sm">&times;</button>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Capture a thought..."
            rows={3}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSave();
              }
            }}
            className="w-full rounded border border-border bg-background px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none resize-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground/50">Enter to save · Shift+Enter for newline</span>
            <button
              onClick={handleSave}
              disabled={!text.trim() || saving}
              className="rounded bg-primary hover:bg-primary/80 disabled:bg-muted px-2.5 py-1 text-xs text-white font-medium transition-colors"
            >
              {saving ? "..." : "Save"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
