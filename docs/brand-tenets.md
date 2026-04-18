# Brand Tenets — minhanr.dev (v2)

These tenets are the constitution of minhanr.dev as a portfolio. Every PR
that touches a public surface should be measurable against them. If a change
violates a tenet, either the change is wrong or the tenet needs an explicit
revision in this file.

The paradigm: **Work as brand**. The site is a curated portfolio of an
AI · VFX R&D practitioner. Visitors meet selected, finished work first —
the working vault, daily logs, and unfinished notes live off-surface.

> This document replaces the prior v1 ("PKM as brand" / garage-door-open
> model). The v1 text is preserved at `brand-tenets.legacy.md` for
> historical reference only. Do not design against it.

---

## 1. Work is the product

Selected projects, papers, and essays lead every surface. Internal vault
notes, half-thoughts, and personal logs do not appear on public pages.

**Why**: A portfolio builds trust by showing finished craft. Exposing
in-progress notes signals "not ready," not "open."

**How to apply**:
- Home leads with Selected Works — curator-ordered, not time-ordered.
- No live vault-index connections on public surfaces. `getCachedVaultIndex()`
  and `listNotes()` are reserved for authenticated internal routes only.
- The blog shows published posts only; drafts do not render on public URLs.
- "Now growing," status badges on public cards, and garage-door metaphors
  are retired.

---

## 2. Cinematic over tabular

Visual substance is editorial and cinematic: large imagery, confident
typography, quiet motion. Tabular numerals and dashboard tiles belong on
authenticated internal surfaces, not on the public front door.

**Why**: An AI · VFX R&D practitioner is judged by visual craft. A wall of
stat tiles communicates "engineer dashboard," not "portfolio."

**How to apply**:
- Hero imagery is allowed and expected. One concentrated visual moment per
  page (see Tenet 5).
- Typography: a single display serif (or neo-grotesque) paired with one
  text sans. Geist Mono remains available but only for metadata (dates,
  versions, technical IDs) — never for body copy.
- Project case studies are image/video-forward. Text supports the visuals,
  not the other way around.
- Stat tiles are removed from the home.

---

## 3. Selected, not streamed

The home is a curated index. The visitor meets 3–5 pieces of work chosen
by the author, in an order the author controls.

**Why**: A portfolio is an editorial statement. A chronological feed is an
RSS reader.

**How to apply**:
- Selected Works ordering is manual (a numbered `selected` field in
  project frontmatter), not `date desc`.
- "Latest posts" lists are demoted to the Writing index page; the home
  shows at most one Writing teaser.
- The home has a clear end. Avoid infinite feed-shaped sections.

---

## 4. Privacy first

Every fact, image, or link on a public surface must come from an
explicitly-published source. The site does not discover content by
scanning a vault or filesystem — content is lifted into `content/`
deliberately.

**Why**: The previous inclusion-by-path-prefix model (Tier 2 whitelist
against a live vault index) is one rename away from leaking personal
finance notes, daily journals, or incomplete thoughts. Structural safety
> procedural care.

**How to apply**:
- Public pages read from `src/content/` and project frontmatter only.
- No `fetch`-from-GitHub-at-render of vault JSON from public routes.
- OG images, sitemap, and feed generators use the same `content/` source.
- Any vault-backed dashboard (tasks, quick-notes, finance) lives under
  an authenticated route group and is never linked from a public surface.
- Analytics, error reports, and logs must not store personal data pulled
  from the vault.

---

## 5. Motion as signature

The brand's visual signature is one piece of restrained motion per page —
a hero video still, a text reveal, a cursor-tracked gradient — owned by
the author and calibrated to `prefers-reduced-motion`.

**Why**: A VFX practitioner's portfolio that moves zero feels inert; a
portfolio that moves everywhere feels like a demo reel with no taste.
One signature moment, calibrated.

**How to apply**:
- One motion moment per page, max. Subsequent sections are still.
- Respect `prefers-reduced-motion: reduce` — swap to a static frame.
- Self-authored assets preferred (own renders, own footage). Licensed
  stock allowed as atmosphere only when subject matches the work.
- Hotlinked GIFs, giphy/tenor, decorative screenshots: forbidden.
- Effective opacity of any decorative layer over text: ≤ 0.25.
- All motion assets live in `/public` (no hotlinks).

---

## How to use these tenets in code review

When reviewing a PR that touches a public surface, ask:

1. Does this put finished work forward, or unfinished process? *(Tenet 1)*
2. Does this page feel editorial, or dashboard-like? *(Tenet 2)*
3. Is the order curated, or chronological-by-default? *(Tenet 3)*
4. Does this pull from `content/` only, or from the live vault? *(Tenet 4)*
5. Is there exactly one motion moment, and does it respect reduced-motion?
   *(Tenet 5)*

Three or more "violation" answers means the change is wrong-shaped, not
just wrong-detailed.
