"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Copy } from "lucide-react";
import { duplicateWeekEntries } from "@/lib/actions/time";
import { shiftWeek } from "@/lib/time/week";

interface Props {
  weekStartIso: string;
  /** Block count in the current week — if > 0 we confirm before copy. */
  currentWeekCount: number;
}

/**
 * Copies the previous Sunday-anchored week's blocks into the current
 * week (same category / intensity / duration / note, offset by 7 days).
 * If the current week already has blocks, prompts for confirm.
 */
export function DuplicateWeekButton({ weekStartIso, currentWeekCount }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const prevWeekIso = shiftWeek(new Date(weekStartIso), -1).toISOString();

  function onClick() {
    if (currentWeekCount > 0) {
      const yes = window.confirm(
        `이번 주에 이미 ${currentWeekCount}개 블록이 있습니다. 지난 주 블록을 추가로 복사하시겠습니까?\n(기존 블록은 유지되고 중복될 수 있습니다.)`
      );
      if (!yes) return;
    }
    setError(null);
    startTransition(async () => {
      try {
        const { inserted } = await duplicateWeekEntries(prevWeekIso, weekStartIso);
        if (inserted === 0) {
          setError("지난 주에 복사할 블록이 없습니다.");
          return;
        }
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "복사 실패");
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className="font-technical inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
        title="지난 주 블록을 이번 주로 복사"
      >
        <Copy className="h-3.5 w-3.5" aria-hidden />
        {pending ? "복사 중…" : "지난 주 복제"}
      </button>
      {error && <p className="text-[10.5px] text-destructive">{error}</p>}
    </div>
  );
}
