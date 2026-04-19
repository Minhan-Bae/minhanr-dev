"use client";

/**
 * Inbox Quick Capture — Server Action + useActionState + useFormStatus + useOptimistic.
 *
 * 사용자가 텍스트 입력 후 Enter 또는 저장 클릭:
 *   - useFormStatus가 자동 pending 상태 (input/button disabled)
 *   - useOptimistic이 즉시 카운터 +1 (체감 즉시 저장됨 표시)
 *   - Server Action이 백그라운드에서 vault 000_Inbox/ 커밋
 *   - 성공: 토스트 표시, 폼 클리어. 실패: 카운터 자동 롤백.
 *
 * 이전에 있던 FloatingQuickNote (Admin Cleanup part-2에서 제거)의 정신적 후속작.
 * 차이: floating overlay 대신 dashboard 카드 inline.
 */

import { useActionState, useOptimistic, useTransition, useRef } from "react";
import { useFormStatus } from "react-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Inbox } from "lucide-react";
import { createInboxNoteAction } from "@/lib/actions/vault";
import { initialQuickCaptureState } from "@/lib/actions/vault-types";

export function QuickCapture() {
  const [state, formAction] = useActionState(createInboxNoteAction, initialQuickCaptureState);
  const [optimisticCount, addOptimistic] = useOptimistic<number, void>(
    0,
    (count) => count + 1,
  );
  const [, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <Card className="hover-lift">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm flex items-center gap-2">
              <Inbox className="size-4 text-primary" />
              Quick Capture
            </CardTitle>
            <CardDescription className="text-xs">
              빠른 메모 → 000_Inbox 커밋
              {optimisticCount > 0 && (
                <span className="ml-2 text-primary tabular-nums">+{optimisticCount}</span>
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form
          ref={formRef}
          action={(fd) => {
            startTransition(() => {
              addOptimistic();
              formAction(fd);
              formRef.current?.reset();
            });
          }}
          className="space-y-2"
        >
          <textarea
            name="text"
            rows={2}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all resize-none"
            placeholder="떠오른 생각, 지금 즉시 ⌘+Enter"
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
          />
          <div className="flex items-center justify-between gap-2">
            <span
              className={`text-xs ${state.ok ? "text-primary" : "text-destructive"}`}
              aria-live="polite"
            >
              {state.message}
            </span>
            <SubmitButton />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? "저장 중…" : "저장"}
    </Button>
  );
}
