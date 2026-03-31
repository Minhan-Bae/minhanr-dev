"use client";

import { useState } from "react";

export function FloatingQuickNote() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  async function handleSave() {
    if (!text.trim() || saving) return;
    setSaving(true);

    try {
      const res = await fetch("/api/vault-sync/note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      });
      const d = await res.json();

      if (res.ok) {
        setText("");
        setOpen(false);
        setToast("Saved to vault");
      } else {
        setToast(d.error || "Save failed");
      }
    } catch {
      setToast("Network error");
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 2500);
    }
  }

  return (
    <>
      {/* Toast */}
      {toast && (
        <div className="fixed top-16 right-4 z-50 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-[10px] text-neutral-300 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          {toast}
        </div>
      )}

      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg flex items-center justify-center text-lg transition-colors"
          title="Quick Note → Vault"
        >
          ✎
        </button>
      )}

      {/* Expanded input */}
      {open && (
        <div className="fixed bottom-6 right-6 z-40 w-80 rounded-lg border border-neutral-700 bg-neutral-900 shadow-xl p-3 space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-neutral-400 font-medium">
              Quick Note → Vault Inbox
            </span>
            <button onClick={() => setOpen(false)} className="text-neutral-600 hover:text-neutral-400 text-sm">&times;</button>
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
            className="w-full rounded border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-xs text-neutral-100 placeholder:text-neutral-600 focus:border-blue-500 focus:outline-none resize-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-[8px] text-neutral-600">Enter to save · Shift+Enter for newline</span>
            <button
              onClick={handleSave}
              disabled={!text.trim() || saving}
              className="rounded bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-700 px-2.5 py-1 text-[10px] text-white font-medium transition-colors"
            >
              {saving ? "..." : "Save"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
