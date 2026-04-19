import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { StateBadge } from "@/components/state-badge";
import { GITHUB_REPO } from "@/lib/constants";
import {
  markdownBodyToHtml,
  deriveNoteTitle,
  deriveNoteSurface,
  vaultPathToHref,
  type VaultNoteFrontmatter,
} from "@/lib/vault-note";
import { isTier2Path } from "@/lib/vault-tiers";
import { createSupabaseServer } from "@/lib/supabase-server";
import { NoteEditor } from "@/components/note-editor";
import {
  getNoteFromSupabase,
  getBacklinks,
  type BacklinkRow,
} from "@/lib/notes-supabase";

/**
 * /notes/[...path] — Sprint 3. Supabase-first detail view.
 *
 * 이전: GitHub raw fetch + in-process vault-index aggregation 기반.
 * 지금: Supabase `vault_notes` + `vault_note_backlinks` 단일 소스.
 *   • body_md → markdownBodyToHtml() (재사용)
 *   • frontmatter_raw → 기존 VaultNoteFrontmatter 형태
 *   • backlinks는 path 기반 (확장자 포함/미포함 둘 다 매칭)
 *
 * Edit 모드는 여전히 fetch → NoteEditor 경로 (Supabase에서 body_md 조회
 * 후 원본 md 재조립 — frontmatter_raw를 gray-matter로 직렬화).
 */

export const revalidate = 60;
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ path: string[] }>;
  searchParams?: Promise<{ edit?: string }>;
}

function joinPath(segments: string[]): string {
  return segments.map(decodeURIComponent).join("/");
}

function buildBreadcrumb(path: string): string[] {
  const parts = path.split("/");
  return parts.slice(0, -1);
}

/**
 * Supabase row → 원본 md 재조립 (frontmatter + body).
 * 편집기는 raw md 전체를 받아서 YAML을 직접 수정할 수 있어야 한다.
 * frontmatter_raw가 비었으면 body만 반환.
 */
function rebuildRawMarkdown(
  frontmatter: Record<string, unknown>,
  body: string
): string {
  if (!frontmatter || Object.keys(frontmatter).length === 0) return body;
  // gray-matter stringify를 안 쓰는 이유: gray-matter는 빈 본문에 개행
  // 처리 시 YAML 순서를 보장 안 함. 수동 YAML 직렬화 대신 JSON 유사.
  // 간단 직렬화 — 원본 키 순서 어느 정도 보존.
  const lines: string[] = ["---"];
  for (const [k, v] of Object.entries(frontmatter)) {
    if (v === null || v === undefined) continue;
    if (Array.isArray(v)) {
      if (v.length === 0) {
        lines.push(`${k}: []`);
      } else {
        lines.push(`${k}:`);
        for (const item of v) lines.push(`  - ${JSON.stringify(item)}`);
      }
    } else if (typeof v === "object") {
      lines.push(`${k}: ${JSON.stringify(v)}`);
    } else if (typeof v === "string" && /[:#\-?{}\[\]&*!|><'"%@`]/.test(v)) {
      lines.push(`${k}: ${JSON.stringify(v)}`);
    } else {
      lines.push(`${k}: ${v}`);
    }
  }
  lines.push("---", "", body);
  return lines.join("\n");
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { path: segments } = await params;
  const path = joinPath(segments);
  const note = await getNoteFromSupabase(path).catch(() => null);

  if (!note) {
    return {
      title: "Note Not Found | minhanr.dev",
      robots: { index: false, follow: false },
    };
  }

  const title = note.title ?? deriveNoteTitle(path);
  const summary = note.summary ?? `vault note · ${path}`;

  return {
    title: `${title} | minhanr.dev`,
    description: summary,
    robots: { index: false, follow: false },
    openGraph: {
      title,
      description: summary,
      type: "article",
    },
  };
}

export default async function NoteDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { path: segments } = await params;
  const sp = (await searchParams) ?? {};
  const path = joinPath(segments);
  const isEdit = sp.edit === "1";

  if (!path.endsWith(".md")) {
    notFound();
  }

  // Tier 3 + edit 모드 인증 필수.
  if (!isTier2Path(path) || isEdit) {
    const supabase = await createSupabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      notFound();
    }
  }

  const note = await getNoteFromSupabase(path);
  if (!note) notFound();

  const frontmatter = (note.frontmatter_raw ?? {}) as VaultNoteFrontmatter;

  // Edit mode — 원본 md 재조립 후 에디터로.
  if (isEdit) {
    const raw = rebuildRawMarkdown(frontmatter, note.body_md ?? "");
    return <NoteEditor path={path} initialContent={raw} />;
  }

  // View mode — HTML + backlinks
  const [contentHtml, backlinkRows] = await Promise.all([
    markdownBodyToHtml(note.body_md ?? ""),
    getBacklinks(path),
  ]);

  const title = note.title ?? deriveNoteTitle(path, frontmatter);
  const surface = deriveNoteSurface(path);
  const breadcrumb = buildBreadcrumb(path);
  const githubUrl = `https://github.com/${GITHUB_REPO}/blob/main/${segments
    .map(encodeURIComponent)
    .join("/")}`;

  const status =
    note.maturity ?? note.workflow ?? note.publish ?? note.type ?? null;
  const created = note.created ?? null;
  const tags = note.tags ?? [];
  const summary = note.summary ?? null;

  const editHref =
    "/notes/" + segments.map(encodeURIComponent).join("/") + "?edit=1";

  // backlinks 매핑 — 타이틀 조회 (src_path에서 파생)
  const uniqSrc = new Map<string, BacklinkRow>();
  for (const b of backlinkRows) {
    if (!uniqSrc.has(b.src_path)) uniqSrc.set(b.src_path, b);
  }
  const backlinks = [...uniqSrc.values()];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <div className="mb-8 flex items-center justify-between gap-4">
        <Link
          href={surface.backHref}
          className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground/80 transition-colors"
        >
          &larr; Back to {surface.label}
        </Link>
        <Link
          href={editHref}
          className="font-technical rounded-sm border border-[var(--hairline)] px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
        >
          편집
        </Link>
      </div>

      <article>
        <header className="mb-8 space-y-3">
          <nav className="text-xs text-muted-foreground/50 truncate">
            {breadcrumb.join(" / ")}
          </nav>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
            {title}
          </h1>

          {summary && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {summary}
            </p>
          )}

          <div className="flex items-center gap-2 flex-wrap text-xs">
            {status && (
              <Badge
                variant="outline"
                className="font-normal text-muted-foreground border-border"
              >
                {status}
              </Badge>
            )}
            {created && (
              <time className="text-muted-foreground tabular-nums">{created}</time>
            )}
            {tags.length > 0 &&
              tags.slice(0, 8).map((tag) => (
                <span
                  key={tag}
                  className="text-muted-foreground bg-muted/50 rounded px-1.5 py-0.5"
                >
                  #{tag}
                </span>
              ))}
          </div>
        </header>

        <div
          className="prose dark:prose-invert prose-sm max-w-none
            prose-headings:font-semibold prose-headings:tracking-tight
            prose-h2:text-lg prose-h2:mt-8 prose-h2:mb-3
            prose-h3:text-base prose-h3:mt-6 prose-h3:mb-2
            prose-p:text-foreground/80 prose-p:leading-relaxed
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-strong:text-foreground
            prose-code:text-sm prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-foreground/80
            prose-pre:bg-card prose-pre:border prose-pre:border-border prose-pre:rounded-lg
            prose-img:rounded-lg prose-img:border prose-img:border-border
            prose-table:text-sm
            prose-th:text-foreground/80 prose-th:border-border
            prose-td:border-border
            prose-li:text-foreground/80
            prose-blockquote:border-border prose-blockquote:text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      </article>

      {/* Backlinks */}
      {backlinks.length > 0 && (
        <section className="mt-16 pt-8 border-t border-[var(--hairline)]">
          <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-6">
            Links to this note · {backlinks.length}
          </h2>
          <ul className="space-y-1">
            {backlinks.map((b) => {
              const p = b.src_path.endsWith(".md") ? b.src_path : `${b.src_path}.md`;
              const srcTitle =
                b.src_path.split("/").pop()?.replace(/\.md$/, "") ?? b.src_path;
              return (
                <li key={b.src_path}>
                  <Link
                    href={vaultPathToHref(p)}
                    className="group flex items-start gap-4 py-3 border-b border-[var(--hairline)] transition-colors hover:border-primary/30"
                  >
                    <StateBadge status={null} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        {srcTitle}
                      </div>
                      <div className="text-xs text-muted-foreground/70 mt-0.5 truncate font-mono">
                        {b.src_path}
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <div className="mt-12 pt-6 border-t border-border flex items-center justify-between">
        <Link
          href={surface.backHref}
          className="text-xs text-muted-foreground hover:text-foreground/80 transition-colors"
        >
          &larr; Back to {surface.label}
        </Link>
        <a
          href={githubUrl}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
        >
          View source on GitHub ↗
        </a>
      </div>
    </div>
  );
}
