import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { StateBadge } from "@/components/state-badge";
import { GITHUB_REPO } from "@/lib/constants";
import {
  getVaultNote,
  fetchVaultNoteRaw,
  deriveNoteTitle,
  deriveNoteSurface,
  vaultPathToHref,
} from "@/lib/vault-note";
import { getBacklinks } from "@/lib/vault-backlinks";
import { isTier2Path } from "@/lib/vault-tiers";
import { createSupabaseServer } from "@/lib/supabase-server";
import { NoteEditor } from "@/components/note-editor";

// ISR: Generate on first visit, cache for vault TTL.
export const revalidate = 300;
// Allow any catch-all path to be generated on demand.
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
  // Drop the file itself for breadcrumb (last segment)
  return parts.slice(0, -1);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { path: segments } = await params;
  const path = joinPath(segments);
  const note = await getVaultNote(path).catch(() => null);

  if (!note) {
    return {
      title: "Note Not Found | minhanr.dev",
      robots: { index: false, follow: false },
    };
  }

  const title = deriveNoteTitle(path, note.frontmatter);
  const summary =
    typeof note.frontmatter.summary === "string"
      ? note.frontmatter.summary
      : `vault note · ${path}`;

  // K-2 정책: Knowledge Hub의 모든 노트 페이지는 검색엔진 인덱스에서 제외.
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

  // 안전성 체크: .md 파일만 허용
  if (!path.endsWith(".md")) {
    notFound();
  }

  // 이중 방어: Tier 3 경로 + 모든 edit 모드는 인증 필수.
  // (edit은 Tier 2 여부와 상관없이 studio 소유자만)
  if (!isTier2Path(path) || isEdit) {
    const supabase = await createSupabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      notFound();
    }
  }

  // Edit mode — hand off to the client editor.
  if (isEdit) {
    const raw = await fetchVaultNoteRaw(path);
    if (raw === null) notFound();
    return <NoteEditor path={path} initialContent={raw} />;
  }

  // Fetch note body and reverse-link graph in parallel — both touch the
  // vault index cache (5min TTL) and are independent.
  const [note, backlinks] = await Promise.all([
    getVaultNote(path),
    getBacklinks(path),
  ]);
  if (!note) {
    notFound();
  }

  const title = deriveNoteTitle(path, note.frontmatter);
  const surface = deriveNoteSurface(path);
  const breadcrumb = buildBreadcrumb(path);
  const githubUrl = `https://github.com/${GITHUB_REPO}/blob/main/${segments
    .map(encodeURIComponent)
    .join("/")}`;

  const status =
    typeof note.frontmatter.status === "string" ? note.frontmatter.status : null;
  const created =
    typeof note.frontmatter.created === "string" ? note.frontmatter.created : null;
  const tags = Array.isArray(note.frontmatter.tags)
    ? (note.frontmatter.tags.filter((t) => typeof t === "string") as string[])
    : [];
  const summary =
    typeof note.frontmatter.summary === "string" ? note.frontmatter.summary : null;

  const editHref =
    "/notes/" +
    segments.map(encodeURIComponent).join("/") +
    "?edit=1";

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
          {/* breadcrumb */}
          <nav className="text-xs text-muted-foreground/50 truncate">
            {breadcrumb.join(" / ")}
          </nav>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
            {title}
          </h1>

          {summary && (
            <p className="text-sm text-muted-foreground leading-relaxed">{summary}</p>
          )}

          <div className="flex items-center gap-2 flex-wrap text-xs">
            {status && (
              <Badge variant="outline" className="font-normal text-muted-foreground border-border">
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
          dangerouslySetInnerHTML={{ __html: note.contentHtml }}
        />
      </article>

      {/* ── Links to this note ──────────────────────────────────────────
          Andy Matuschak / Maggie Appleton 모델의 시그니처 패턴.
          Reverse-link graph가 vault index의 `related` field로 빌드됨
          (vault-backlinks.ts). Tier 3 source는 자동 차단됨. */}
      {backlinks.length > 0 && (
        <section className="mt-16 pt-8 border-t border-[var(--hairline)]">
          <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-6">
            Links to this note · {backlinks.length}
          </h2>
          <ul className="space-y-1">
            {backlinks.map((ref) => (
              <li key={ref.path}>
                <Link
                  href={vaultPathToHref(ref.path)}
                  className="group flex items-start gap-4 py-3 border-b border-[var(--hairline)] transition-colors hover:border-primary/30"
                >
                  {ref.status && <StateBadge status={ref.status} />}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {ref.title}
                    </div>
                    {ref.excerpt && (
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {ref.excerpt}
                      </div>
                    )}
                  </div>
                  {ref.created && (
                    <time className="text-xs font-mono text-muted-foreground/70 whitespace-nowrap pt-0.5 tabular-nums">
                      {ref.created}
                    </time>
                  )}
                </Link>
              </li>
            ))}
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
