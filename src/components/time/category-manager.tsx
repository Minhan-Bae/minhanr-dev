"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
import type { TimeCategory } from "@/lib/database.types";
import { Button } from "@/components/ui/button";
import { ColorPicker } from "@/components/time/color-picker";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/lib/actions/time";

/**
 * CategoryManager — inline editor for time_categories.
 *
 * Rows render read-only by default; clicking Pencil switches that row
 * into edit mode with label + color + display_order fields. Saving
 * commits via updateCategory. A separate "새 카테고리" button opens
 * a create form at the bottom of the list.
 *
 * Delete flow asks for confirm — the SQL schema's ON DELETE SET NULL
 * on time_entries.category_id means blocks survive the delete but
 * become uncategorised; the confirm copy is explicit about that.
 */

interface Props {
  categories: TimeCategory[];
}

type EditingState =
  | { kind: "none" }
  | { kind: "edit"; id: string; label: string; color_hex: string; display_order: number }
  | { kind: "create"; label: string; color_hex: string };

const FALLBACK_NEW_COLOR = "#5CB089";

export function CategoryManager({ categories }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState<EditingState>({ kind: "none" });
  const [error, setError] = useState<string | null>(null);

  function run<T>(task: () => Promise<T>, done?: (r: T) => void) {
    setError(null);
    startTransition(async () => {
      try {
        const r = await task();
        done?.(r);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed");
      }
    });
  }

  function startEdit(c: TimeCategory) {
    setEditing({
      kind: "edit",
      id: c.id,
      label: c.label,
      color_hex: c.color_hex,
      display_order: c.display_order,
    });
  }

  function saveEdit() {
    if (editing.kind !== "edit") return;
    const { id, label, color_hex, display_order } = editing;
    if (!label.trim()) {
      setError("카테고리 이름은 비울 수 없습니다.");
      return;
    }
    run(
      () => updateCategory(id, { label: label.trim(), color_hex, display_order }),
      () => setEditing({ kind: "none" })
    );
  }

  function saveCreate() {
    if (editing.kind !== "create") return;
    if (!editing.label.trim()) {
      setError("카테고리 이름은 비울 수 없습니다.");
      return;
    }
    const nextOrder = Math.max(0, ...categories.map((c) => c.display_order)) + 1;
    run(
      () =>
        createCategory({
          label: editing.label.trim(),
          color_hex: editing.color_hex,
          display_order: nextOrder,
        }),
      () => setEditing({ kind: "none" })
    );
  }

  function confirmAndDelete(c: TimeCategory) {
    const yes = window.confirm(
      `"${c.label}" 카테고리를 삭제하시겠습니까?\n이 카테고리가 붙은 타임블록은 uncategorised 상태로 남습니다(삭제되지 않음).`
    );
    if (!yes) return;
    run(() => deleteCategory(c.id));
  }

  const sorted = [...categories].sort(
    (a, b) => a.display_order - b.display_order || a.label.localeCompare(b.label)
  );

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-md border border-border">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-left">
              <th className="font-technical px-3 py-2 text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
                색
              </th>
              <th className="font-technical px-3 py-2 text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
                이름
              </th>
              <th className="font-technical px-3 py-2 text-right text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
                순서
              </th>
              <th className="w-24 px-3 py-2" aria-hidden />
            </tr>
          </thead>
          <tbody>
            {sorted.map((c) => {
              const isEditing = editing.kind === "edit" && editing.id === c.id;
              if (isEditing) {
                return (
                  <tr key={c.id} className="border-b border-border bg-muted/10">
                    <td className="px-3 py-3 align-top" colSpan={4}>
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <input
                            type="text"
                            value={editing.label}
                            onChange={(e) =>
                              setEditing({ ...editing, label: e.target.value })
                            }
                            className="flex-1 min-w-[160px] rounded-sm border border-border bg-background px-2 py-1 text-[13px] outline-none focus:border-primary"
                            placeholder="카테고리 이름"
                            aria-label="카테고리 이름"
                            autoFocus
                          />
                          <label className="font-technical flex items-center gap-2 text-[11px] text-muted-foreground">
                            순서
                            <input
                              type="number"
                              value={editing.display_order}
                              onChange={(e) =>
                                setEditing({
                                  ...editing,
                                  display_order: parseInt(e.target.value, 10) || 0,
                                })
                              }
                              className="w-16 rounded-sm border border-border bg-background px-2 py-1 text-[13px] outline-none focus:border-primary"
                              aria-label="정렬 순서"
                            />
                          </label>
                        </div>
                        <ColorPicker
                          value={editing.color_hex}
                          onChange={(h) => setEditing({ ...editing, color_hex: h })}
                          disabled={pending}
                        />
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={pending}
                            onClick={() => setEditing({ kind: "none" })}
                          >
                            <X className="mr-1.5 h-3.5 w-3.5" /> 취소
                          </Button>
                          <Button size="sm" disabled={pending} onClick={saveEdit}>
                            <Check className="mr-1.5 h-3.5 w-3.5" /> 저장
                          </Button>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              }
              return (
                <tr key={c.id} className="border-b border-border last:border-b-0">
                  <td className="px-3 py-2.5">
                    <span
                      className="inline-block h-5 w-5 rounded-sm border border-black/10"
                      style={{ background: c.color_hex }}
                      aria-label={c.color_hex}
                      title={c.color_hex}
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground">{c.label}</span>
                      {c.is_default && (
                        <span className="font-technical rounded-sm bg-muted px-1.5 py-0.5 text-[9.5px] uppercase tracking-[0.12em] text-muted-foreground">
                          default
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="font-technical px-3 py-2.5 text-right tabular-nums text-[12px] text-muted-foreground">
                    {c.display_order}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => startEdit(c)}
                        disabled={pending}
                        aria-label="Edit"
                        className="rounded-sm p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => confirmAndDelete(c)}
                        disabled={pending}
                        aria-label="Delete"
                        className="rounded-sm p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {/* Create row */}
            {editing.kind === "create" ? (
              <tr className="bg-muted/10">
                <td className="px-3 py-3 align-top" colSpan={4}>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editing.label}
                      onChange={(e) => setEditing({ ...editing, label: e.target.value })}
                      placeholder="카테고리 이름 (예: 독서, 식사…)"
                      className="w-full rounded-sm border border-border bg-background px-2 py-1 text-[13px] outline-none focus:border-primary"
                      aria-label="새 카테고리 이름"
                      autoFocus
                    />
                    <ColorPicker
                      value={editing.color_hex}
                      onChange={(h) => setEditing({ ...editing, color_hex: h })}
                      disabled={pending}
                    />
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={pending}
                        onClick={() => setEditing({ kind: "none" })}
                      >
                        <X className="mr-1.5 h-3.5 w-3.5" /> 취소
                      </Button>
                      <Button size="sm" disabled={pending} onClick={saveCreate}>
                        <Check className="mr-1.5 h-3.5 w-3.5" /> 추가
                      </Button>
                    </div>
                  </div>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {editing.kind !== "create" && (
        <Button
          variant="secondary"
          disabled={pending}
          onClick={() =>
            setEditing({ kind: "create", label: "", color_hex: FALLBACK_NEW_COLOR })
          }
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" /> 새 카테고리
        </Button>
      )}
    </div>
  );
}
