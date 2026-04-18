"use client";

/**
 * Deadlines bucket(overdue/today/this_week/later) — useOptimistic + Server Action.
 * /deadlines 페이지의 각 그룹 카드 client wrapper.
 */

import Link from "next/link";
import { useOptimistic, useTransition } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NoteQuickActions, type Action } from "@/components/note-quick-actions";
import { vaultPathToHref } from "@/lib/vault-note";
import { transitionNoteAction } from "@/lib/actions/vault";

export interface DeadlineRow {
  path: string;
  title: string;
  deadline: string;
  status?: string;
  priority?: string;
}

interface DeadlinesBucketProps {
  label: string;
  tone: string;
  items: DeadlineRow[];
}

export function DeadlinesBucket({ label, tone, items }: DeadlinesBucketProps) {
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
      const r = await transitionNoteAction(path, action);
      if (!r.ok) console.warn(`[deadlines] ${path} ${action} failed:`, r.error);
    });
  }

  const visible = items.filter((it) => !hidden.has(it.path));
  if (visible.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className={`text-sm ${tone}`}>{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {visible.map((it) => (
            <li
              key={it.path}
              className="group flex items-start justify-between gap-3 text-sm py-1.5 px-2 -mx-2 rounded hover:bg-muted/50 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <Link
                  href={vaultPathToHref(it.path)}
                  className="font-medium hover:underline"
                >
                  {it.title}
                </Link>
                <p className="text-[10px] text-muted-foreground/70 truncate font-mono">
                  {it.path}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5 text-xs">
                <NoteQuickActions
                  path={it.path}
                  onAction={(action) => handleAction(it.path, action)}
                />
                {it.priority && (
                  <Badge variant="outline" className="font-normal">
                    {it.priority}
                  </Badge>
                )}
                {it.status && (
                  <Badge variant="outline" className="font-normal">
                    {it.status}
                  </Badge>
                )}
                <span className="tabular-nums text-muted-foreground">{it.deadline}</span>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
