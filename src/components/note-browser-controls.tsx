"use client";

import { useQueryStates, parseAsString, parseAsInteger } from "nuqs";
import { Input } from "@/components/ui/input";

export interface NoteBrowserControlsProps {
  statusOptions: string[];
  tagOptions: string[];
}

export function NoteBrowserControls({ statusOptions, tagOptions }: NoteBrowserControlsProps) {
  const [{ q, status, tag, sort }, setQuery] = useQueryStates(
    {
      q: parseAsString.withDefault(""),
      status: parseAsString.withDefault(""),
      tag: parseAsString.withDefault(""),
      sort: parseAsString.withDefault("created_desc"),
      page: parseAsInteger.withDefault(1),
    },
    { shallow: false }
  );

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Input
        placeholder="제목·경로 검색"
        value={q}
        onChange={(e) => setQuery({ q: e.target.value || null, page: 1 })}
        className="sm:max-w-xs"
      />
      <select
        value={status}
        onChange={(e) => setQuery({ status: e.target.value || null, page: 1 })}
        className="h-8 rounded-md border border-input bg-background px-2 text-sm"
      >
        <option value="">모든 status</option>
        {statusOptions.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <select
        value={tag}
        onChange={(e) => setQuery({ tag: e.target.value || null, page: 1 })}
        className="h-8 rounded-md border border-input bg-background px-2 text-sm"
      >
        <option value="">모든 tag</option>
        {tagOptions.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <select
        value={sort}
        onChange={(e) => setQuery({ sort: e.target.value || null })}
        className="h-8 rounded-md border border-input bg-background px-2 text-sm"
      >
        <option value="created_desc">최신순</option>
        <option value="created_asc">오래된순</option>
        <option value="title_asc">제목순</option>
      </select>
    </div>
  );
}
