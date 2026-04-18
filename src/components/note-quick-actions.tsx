"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Pause, Archive } from "lucide-react";
import { apiFetch } from "@/lib/api-fetch";

type Action = "pause" | "complete" | "archive";

interface NoteQuickActionsProps {
  path: string;
  /** hover 시에만 보이는지 / 항상 보이는지 */
  alwaysVisible?: boolean;
  /** 성공 후 호출. 기본은 router.refresh() — optimistic 미적용 시 단순 리로드 */
  onAfter?: () => void;
}

const LABEL: Record<Action, string> = {
  pause: "대기",
  complete: "완료",
  archive: "삭제",
};

export function NoteQuickActions({ path, alwaysVisible, onAfter }: NoteQuickActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState<Action | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function run(action: Action) {
    setMessage(null);
    startTransition(async () => {
      try {
        await apiFetch("/api/vault-sync/transition", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path, action }),
        });
        setMessage(`✓ ${LABEL[action]}`);
        if (onAfter) {
          onAfter();
        } else {
          router.refresh();
        }
        window.setTimeout(() => setMessage(null), 2000);
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

  return (
    <div
      className={`flex items-center gap-1 transition-opacity duration-[var(--duration-quick)] ${visibilityClass}`}
      onClick={(e) => e.stopPropagation()}
    >
      {message && (
        <span className="text-[10px] text-primary mr-1" aria-live="polite">
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
