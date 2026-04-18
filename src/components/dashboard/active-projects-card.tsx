"use client";

/**
 * Dashboard "진행 중 프로젝트" 카드 — useOptimistic + Server Action.
 *
 * 사용자가 퀵 액션(대기/완료/삭제)을 클릭하면:
 *   1. useOptimistic이 즉시 해당 path를 hidden set에 추가 → row 사라짐 (체감 즉시)
 *   2. transitionNoteAction Server Action 백그라운드 실행 (vault 커밋)
 *   3. 성공: revalidatePath로 다음 fetch에 반영 (현 row는 이미 사라진 상태 유지)
 *   4. 실패: useOptimistic 자동 롤백 → row 다시 등장 + 에러 토스트
 */

import Link from "next/link";
import { useOptimistic, useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NoteQuickActions, type Action } from "@/components/note-quick-actions";
import { vaultPathToHref } from "@/lib/vault-note";
import { transitionNoteAction } from "@/lib/actions/vault";

export interface ActiveProject {
  path: string;
  title: string;
  status?: string;
  priority?: string;
  created?: string;
}

interface ActiveProjectsCardProps {
  projects: ActiveProject[];
}

export function ActiveProjectsCard({ projects }: ActiveProjectsCardProps) {
  const [hidden, hide] = useOptimistic<Set<string>, string>(
    new Set(),
    (set, path) => {
      const next = new Set(set);
      next.add(path);
      return next;
    },
  );
  const [, startTransition] = useTransition();

  function handleAction(path: string, action: Action) {
    startTransition(async () => {
      hide(path);
      const result = await transitionNoteAction(path, action);
      if (!result.ok) {
        // 실패 시 transition 종료 → useOptimistic 자동 롤백 (hidden 사라짐)
        console.warn(`[active-projects] ${path} ${action} failed:`, result.error);
      }
    });
  }

  const visible = projects.filter((p) => !hidden.has(p.path));

  return (
    <Card className="col-span-12 lg:col-span-7 hover-lift relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-60" />
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">진행 중 프로젝트</CardTitle>
            <CardDescription className="text-xs">Active — 최근 편집순</CardDescription>
          </div>
          <Link href="/projects" className="text-xs text-muted-foreground hover:text-primary transition-colors">
            전체 →
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {visible.length === 0 ? (
          <p className="text-xs text-muted-foreground">없음</p>
        ) : (
          <ul className="space-y-3">
            {visible.map((p) => (
              <li
                key={p.path}
                className="group space-y-1 p-2 -mx-2 rounded-md transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center justify-between gap-2">
                  <Link
                    href={vaultPathToHref(p.path)}
                    className="text-base font-semibold truncate group-hover:text-primary transition-colors flex-1 min-w-0"
                  >
                    {p.title}
                  </Link>
                  <NoteQuickActions
                    path={p.path}
                    onAction={(action) => handleAction(p.path, action)}
                  />
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {p.priority && (
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {p.priority}
                    </Badge>
                  )}
                  {p.status && <span className="capitalize">{p.status}</span>}
                  {p.created && (
                    <span className="tabular-nums opacity-70">· {p.created}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
