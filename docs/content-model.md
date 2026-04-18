# Content model — public / studio boundary

This document is the single reference for **what a note is** and **what
parts of it are allowed to leak into the public surface**. The code-level
enforcement lives at [src/lib/content-policy.ts](../src/lib/content-policy.ts);
every public surface that touches frontmatter MUST route through it.

## The two surfaces

| Surface | Routes | Source of truth |
|---|---|---|
| **Public** | `/`, `/work`, `/work/[slug]`, `/blog`, `/blog/[slug]`, `/about` | `src/content/posts/*.md` + `src/lib/work.ts` |
| **Studio** | `/dashboard`, `/notes`, `/notes/[...path]`, `/review`, `/finance`, `/trends`, `/admin`, `/graph`, … | Vault index + supabase; authenticated middleware |

The studio is the place where notes are written, planned, and staged.
The public surface is what the studio chooses to show the world. The
border is one-way: edits flow **studio → public**, never the other way.

## Frontmatter fields

### Public fields — rendered on public pages

```yaml
title:        Required. Used in listings, OG, and the post heading.
summary:      One-line lede; shown on cards, RSS, search results.
date:         YYYY-MM-DD — publication date (not file mtime).
categories:   Array; first match in PUBLIC_CATEGORIES drives colour.
tags:         Array; free-form. Used for the graph + tag cloud.
author:       Defaults to "minhanr" if absent.
cover:        { image, alt } — optional hero image on /blog/[slug].
slug:         Optional override for the URL segment.
```

### Studio-only fields — never rendered publicly

```yaml
status:            growing | mature | published | paused | completed | archived
workflow:          free-form pipeline state
priority:          P0 | P1 | P2
deadline:          YYYY-MM-DD — drives the dashboard commitments card
lifecycle_state:   archived; used by /api/vault-sync/transition
archived_at:       YYYY-MM-DD (KST)
archived_reason:   manual | automated | …
created:           ISO — auto-managed, do not edit
updated:           ISO — auto-managed, do not edit
source_url:        internal reference (harvested links, etc.)
related:           array of vault paths for backlink wiring
research_category: internal research taxonomy
axis:              acquisition | convergence | amplification
harvested_at:      ISO — when an agent captured this note
notes_about:       self-reference metadata
feedback_signals:  studio-only signal matrix
agent:             agent that last modified
```

### What the boundary buys us

- Any future studio field is opt-out by default — it cannot accidentally
  reach a public card just because a component switched from
  `frontmatter.title` to `...frontmatter`.
- The public OG image, RSS feed, and NotesGraph share the same filter
  pass, so rewrites stay consistent.
- Makes the eventual "studio as Obsidian replacement" phase tractable:
  the editor UI can show public/studio fields as two visually distinct
  sections using these lists as its schema.

## Path-based publication

Not every file under `src/content/` is automatically public:

- `src/content/posts/*.md` — public iff `draft: true` is absent.
- `src/lib/work.ts` — static, curator-ordered. Always public.
- Vault repo (companion repo checked out as `content/vault/`) — never
  public. Tier 2 folders are readable on authenticated studio surfaces
  only; the public NotesGraph surfaces their *category labels* in the
  centre cluster (no titles, no counts, no dates) as a deliberate
  signal that the studio has work off-surface.

## Rule of thumb

If you're writing a public component and you find yourself reading a
field that is not in [`PUBLIC_FRONTMATTER_FIELDS`](../src/lib/content-policy.ts):

1. If the field belongs on public surfaces, add it to the list (and to
   this document), then commit.
2. Otherwise, re-shape the data so you don't need it — or move the
   component to `(private)`.

Never cherry-pick a studio field into a public page on a one-off basis.
