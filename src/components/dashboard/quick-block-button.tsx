"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Play } from "lucide-react";
import type { TimeCategory } from "@/lib/database.types";
import { createEntry } from "@/lib/actions/time";

/**
 * QuickBlockButton — one-click entry for "start doing X now".
 *
 * The most common friction in timeboxing is remembering to log the
 * block once you've already started. This button side-steps that: it
 * finds the nearest 30-min slot boundary <= now, and creates a block
 * there with your chosen category.
 *
 * Math: Asia/Seoul wall-clock, round DOWN to :00 or :30. Creating at
 * 14:23 snaps to the 14:00 slot; 14:47 snaps to 14:30.
 *
 * Keyboard: digit 1–9 picks the Nth category instantly (same
 * convention as the calendar modal).
 */
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

function roundDownToHalfHourKst(now: Date): Date {
  const kstMs = now.getTime() + KST_OFFSET_MS;
  const kst = new Date(kstMs);
  const mins = kst.getUTCMinutes();
  const roundedMin = mins < 30 ? 0 : 30;
  const slotKstUtc = Date.UTC(
    kst.getUTCFullYear(),
    kst.getUTCMonth(),
    kst.getUTCDate(),
    kst.getUTCHours(),
    roundedMin,
    0,
    0
  );
  return new Date(slotKstUtc - KST_OFFSET_MS);
}

function formatHM(d: Date): string {
  const kst = new Date(d.getTime() + KST_OFFSET_MS);
  return `${kst.getUTCHours().toString().padStart(2, "0")}:${kst
    .getUTCMinutes()
    .toString()
    .padStart(2, "0")}`;
}

interface Props {
  categories: TimeCategory[];
}

export function QuickBlockButton({ categories }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Slot preview updates when modal opens.
  const [slotPreview, setSlotPreview] = useState<string>("");
  useEffect(() => {
    if (!open) return;
    const slot = roundDownToHalfHourKst(new Date());
    const end = new Date(slot.getTime() + 30 * 60 * 1000);
    setSlotPreview(`${formatHM(slot)}–${formatHM(end)}`);
  }, [open]);

  function start(catId: string) {
    const slot = roundDownToHalfHourKst(new Date());
    setError(null);
    startTransition(async () => {
      try {
        await createEntry({
          slot_start: slot.toISOString(),
          category_id: catId,
          intensity: "main",
        });
        setOpen(false);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Create failed");
      }
    });
  }

  // Modal keyboard: Esc close, digit pick.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (/^[1-9]$/.test(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        const cat = categories[idx];
        if (cat) {
          e.preventDefault();
          start(cat.id);
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, categories]);

  if (categories.length === 0) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="font-technical inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-foreground transition-colors hover:border-primary hover:bg-primary/20"
      >
        <Play className="h-3 w-3 fill-current" aria-hidden />
        Start block
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm space-y-4 rounded-md border border-border bg-card p-5 shadow-xl"
          >
            <header>
              <p className="font-technical text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
                Quick 30-min block
              </p>
              <p className="mt-0.5 text-sm text-foreground">
                {slotPreview} — 카테고리 선택하면 바로 기록됩니다
              </p>
            </header>

            {error && (
              <p className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </p>
            )}

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="font-technical text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
                  카테고리
                </p>
                <p className="font-technical text-[9.5px] uppercase tracking-[0.12em] text-muted-foreground opacity-70">
                  1-9 단축
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((c, i) => {
                  const digit = i < 9 ? i + 1 : null;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      disabled={pending}
                      onClick={() => start(c.id)}
                      className="flex items-center gap-2 rounded-md border border-border px-2.5 py-2 text-left text-[12.5px] transition-colors hover:border-primary/50 hover:bg-muted disabled:opacity-50"
                    >
                      <span
                        className="inline-block h-3 w-3 rounded-[3px] border border-black/10"
                        style={{ background: c.color_hex }}
                      />
                      <span className="flex-1 truncate">{c.label}</span>
                      {digit !== null && (
                        <kbd className="font-technical shrink-0 rounded-sm border border-border/80 bg-muted/60 px-1 py-0.5 text-[9.5px] text-muted-foreground">
                          {digit}
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <footer className="flex justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={pending}
                className="font-technical text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
              >
                닫기 (esc)
              </button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}
