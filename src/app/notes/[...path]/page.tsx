import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { GITHUB_REPO } from "@/lib/constants";
import {
  getVaultNote,
  deriveNoteTitle,
  deriveNoteSurface,
} from "@/lib/vault-note";
import { isTier2Path } from "@/lib/vault-tiers";
import { createSupabaseServer } from "@/lib/supabase-server";

// ISR: Generate on first visit, cache for vault TTL.
export const revalidate = 300;
// Allow any catch-all path to be generated on demand.
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ path: string[] }>;
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
      title: "Note Not Found | OIKBAS",
      robots: { index: false, follow: false },
    };
  }

  const title = deriveNoteTitle(path, note.frontmatter);
  const summary =
    typeof note.frontmatter.summary === "string"
      ? note.frontmatter.summary
      : `OIKBAS vault note · ${path}`;

  // K-2 정책: Knowledge Hub의 모든 노트 페이지는 검색엔진 인덱스에서 제외.
  return {
    title: `${title} | OIKBAS Notes`,
    description: summary,
    robots: { index: false, follow: false },
    openGraph: {
      title,
      description: summary,
      type: "article",
    },
  };
}

export default async function NoteDetailPage({ params }: PageProps) {
  const { path: segments } = await params;
  const path = joinPath(segments);

  // 안전성 체크: .md 파일만 허용
  if (!path.endsWith(".md")) {
    notFound();
  }

  // 이중 방어: Tier 3 경로(010_Daily, 030_Areas/032_*, 034_Finance 등)는
  // 미들웨어가 먼저 /login으로 redirect하지만, 만에 하나 우회되더라도
  // 라우트 자체에서 비인증 사용자에게는 존재 자체를 노출하지 않는다 (404).
  if (!isTier2Path(path)) {
    const supabase = await createSupabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      notFound();
    }
  }

  const note = await getVaultNote(path);
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

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <Link
        href={surface.backHref}
        className="inline-flex items-center text-xs text-neutral-500 hover:text-neutral-300 transition-colors mb-8"
      >
        &larr; Back to {surface.label}
      </Link>

      <article>
        <header className="mb-8 space-y-3">
          {/* breadcrumb */}
          <nav className="text-[10px] text-neutral-600 truncate">
            {breadcrumb.join(" / ")}
          </nav>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
            {title}
          </h1>

          {summary && (
            <p className="text-sm text-neutral-400 leading-relaxed">{summary}</p>
          )}

          <div className="flex items-center gap-2 flex-wrap text-[10px]">
            {status && (
              <Badge variant="outline" className="font-normal text-neutral-400 border-neutral-700">
                {status}
              </Badge>
            )}
            {created && (
              <time className="text-neutral-500 tabular-nums">{created}</time>
            )}
            {tags.length > 0 &&
              tags.slice(0, 8).map((tag) => (
                <span
                  key={tag}
                  className="text-neutral-500 bg-neutral-800/50 rounded px-1.5 py-0.5"
                >
                  #{tag}
                </span>
              ))}
          </div>
        </header>

        <div
          className="prose prose-invert prose-sm max-w-none
            prose-headings:font-semibold prose-headings:tracking-tight
            prose-h2:text-lg prose-h2:mt-8 prose-h2:mb-3
            prose-h3:text-base prose-h3:mt-6 prose-h3:mb-2
            prose-p:text-neutral-300 prose-p:leading-relaxed
            prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-neutral-200
            prose-code:text-sm prose-code:bg-neutral-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-neutral-300
            prose-pre:bg-neutral-900 prose-pre:border prose-pre:border-neutral-800 prose-pre:rounded-lg
            prose-img:rounded-lg prose-img:border prose-img:border-neutral-800
            prose-table:text-sm
            prose-th:text-neutral-300 prose-th:border-neutral-700
            prose-td:border-neutral-800
            prose-li:text-neutral-300
            prose-blockquote:border-neutral-700 prose-blockquote:text-neutral-400"
          dangerouslySetInnerHTML={{ __html: note.contentHtml }}
        />
      </article>

      <div className="mt-12 pt-6 border-t border-neutral-800 flex items-center justify-between">
        <Link
          href={surface.backHref}
          className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
        >
          &larr; Back to {surface.label}
        </Link>
        <a
          href={githubUrl}
          target="_blank"
          rel="noreferrer"
          className="text-[10px] text-neutral-600 hover:text-neutral-400 transition-colors"
        >
          View source on GitHub ↗
        </a>
      </div>
    </div>
  );
}
