/**
 * Content policy — the frontier between public surfaces and the studio.
 *
 * Every note in the vault or under `src/content/` carries frontmatter.
 * Some fields are meant to be rendered on public pages (`/`, `/work`,
 * `/blog`, `/about`); others live only in the studio (`/dashboard` and
 * descendants) to drive workflow and lifecycle state.
 *
 * This module is the single source of truth for that split. Anywhere
 * the public surface touches a frontmatter object, it MUST run the
 * result through `pickPublicFrontmatter()` so new internal fields can
 * be added to the policy without touching N call sites.
 *
 * See `docs/content-model.md` for the rationale + full examples.
 */

/** Frontmatter keys that public pages may render. */
export const PUBLIC_FRONTMATTER_FIELDS = [
  "title",
  "summary",
  "date",
  "categories",
  "tags",
  "author",
  "cover",
  "slug",
] as const;
export type PublicField = (typeof PUBLIC_FRONTMATTER_FIELDS)[number];

/**
 * Frontmatter keys that are studio-only — lifecycle, priority, private
 * references, automation hints. These MUST NOT be rendered publicly.
 */
export const STUDIO_FRONTMATTER_FIELDS = [
  "status",
  "workflow",
  "priority",
  "deadline",
  "lifecycle_state",
  "archived_at",
  "archived_reason",
  "created",
  "updated",
  "source_url",
  "related",
  "research_category",
  "axis",
  "harvested_at",
  "notes_about",
  "feedback_signals",
  "agent",
] as const;
export type StudioField = (typeof STUDIO_FRONTMATTER_FIELDS)[number];

/**
 * The category set that is safe to surface publicly. A note whose
 * category is not in this list renders under the "General" bucket or
 * is omitted entirely depending on the surface.
 */
export const PUBLIC_CATEGORIES = [
  "AI",
  "VFX",
  "Research",
  "Creative Technology",
  "General",
] as const;
export type PublicCategory = (typeof PUBLIC_CATEGORIES)[number];

/** True iff `cat` is a public category (used by filter UIs). */
export function isPublicCategory(cat: string): cat is PublicCategory {
  return (PUBLIC_CATEGORIES as readonly string[]).includes(cat);
}

/**
 * Pick the slice of a frontmatter object that's safe to render on
 * public surfaces. Unknown / studio-only fields are dropped entirely —
 * this is the structural guarantee behind brand-tenets v2 §4 (Privacy
 * first).
 */
export function pickPublicFrontmatter<T extends Record<string, unknown>>(
  fm: T
): Partial<Pick<T, PublicField & keyof T>> {
  const out: Record<string, unknown> = {};
  for (const key of PUBLIC_FRONTMATTER_FIELDS) {
    if (key in fm) out[key] = fm[key];
  }
  return out as Partial<Pick<T, PublicField & keyof T>>;
}

/**
 * Path-based publication policy.
 *
 * Not every note under `src/content/` is automatically public: a file
 * under `src/content/posts/` is public iff `draft !== true`. Vault paths
 * (those committed to the companion vault repo) are governed by the
 * `Tier 2` whitelist in `vault-tiers.ts` for authenticated surfaces only
 * and are never surfaced publicly from `(public)` routes.
 */
export const PUBLIC_CONTENT_ROOTS = [
  "src/content/posts/",
  "src/lib/work.ts",
] as const;

/** Vault folders whose existence may be hinted at in the NotesGraph
 * as private shadow clusters — label-only, no counts or titles. */
export const PRIVATE_CATEGORY_LABELS = [
  "일지",
  "아카이브",
  "작업 중",
  "재무",
  "리서치 원본",
] as const;
