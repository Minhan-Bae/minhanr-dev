"use client";

import { useState, useTransition } from "react";
import { Check, Pause, Archive } from "lucide-react";
import { apiFetch } from "@/lib/api-fetch";

export type Action = "pause" | "complete" | "archive";

interface NoteQuickActionsProps {
  path: string;
  /** hover 시에만 보이는지 / 항상 보이는지 */
  alwaysVisible?: boolean;
  /** 호출되면 본 컴포넌트의 자체 fetch 흐름을 건너뛰고 onAction에 위임.
   *  ActionableVaultList(useOptimistic + Server Action)가 사용. */
  onAction?: (action: Action) => void;
  /** legacy: 자체 fetch 흐름의 성공 후 콜백. onAction과 병존 시 onAction 우선. */
  onAfter?: () => void;
}

const LABEL: Record<Action, string> = {
  pause: "대기",
  complete: "완료",
  archive: "삭제",
};

export function NoteQuickActions({ path, alwaysVisible, onAction, onAfter }: NoteQuickActionsProps) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState<Action | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function run(action: Action) {
    setMessage(null);

    // onAction이 있으면 부모(useOptimistic 컨테이너)에 위임 — 본 컴포넌트는
    // 더 이상 fetch/transition 책임 없음. 부모가 즉시 row를 숨기므로 done 불필요.
    if (onAction) {
      onAction(action);
      return;
    }

    // Legacy: 자체 fetch 흐름 (REST 엔드포인트 호출)
    startTransition(async () => {
      try {
        await apiFetch("/api/vault-sync/transition", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path, action }),
        });
        setMessage(`✓ ${LABEL[action]}`);
        setDone(true);
        onAfter?.();
      } catch (e) {
        setMessage(e instanceof Error ? e.message : "실패");
      } finally {
        setConfirming(null);
      }
    });
  }

  function onClick(action: Action) {
    if (action === "archive") {
      if (confirming === "archive") {
        void run("archive");
      } else {
        setConfirming("archive");
        window.setTimeout(() => setConfirming((c) => (c === "archive" ? null : c)), 3000);
      }
      return;
    }
    void run(action);
  }

  const visibilityClass = alwaysVisible
    ? "opacity-80 group-hover:opacity-100"
    : "opacity-0 group-hover:opacity-100 focus-within:opacity-100";

  // done 상태: 액션 성공 → 버튼 영역만 fade out + 메시지로 대체.
  // 전체 row 제거는 parent가 onAfter 콜백에서 담당 (기본 없음 = 행 유지).
  if (done) {
    return (
      <div className="flex items-center gap-1 text-[10px] text-primary" aria-live="polite">
        {message}
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-1 transition-opacity duration-[var(--duration-quick)] ${visibilityClass}`}
      onClick={(e) => e.stopPropagation()}
    >
      {message && (
        <span className="text-[10px] text-destructive mr-1" aria-live="polite">
          {message}
        </span>
      )}
      <QuickButton
        label={LABEL.pause}
        icon={<Pause className="size-3" />}
        onClick={() => onClick("pause")}
        disabled={pending}
      />
      <QuickButton
        label={LABEL.complete}
        icon={<Check className="size-3" />}
        onClick={() => onClick("complete")}
        disabled={pending}
      />
      <QuickButton
        label={confirming === "archive" ? "재확인" : LABEL.archive}
        icon={<Archive className="size-3" />}
        onClick={() => onClick("archive")}
        disabled={pending}
        variant={confirming === "archive" ? "danger" : "default"}
      />
    </div>
  );
}

function QuickButton({
  label,
  icon,
  onClick,
  disabled,
  variant = "default",
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "default" | "danger";
}) {
  const danger = variant === "danger";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] transition-colors tap-scale disabled:opacity-40 disabled:cursor-not-allowed ${
        danger
          ? "border-destructive/40 text-destructive hover:bg-destructive/10"
          : "border-border/60 text-muted-foreground hover:text-foreground hover:border-border"
      }`}
      title={label}
      aria-label={label}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
