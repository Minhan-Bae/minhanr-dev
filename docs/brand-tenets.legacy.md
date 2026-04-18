# Brand Tenets — minhanr.dev

These five tenets are the constitution of minhanr.dev as a brand. Every PR
that touches a public surface (home, blog, papers, projects, notes, OG,
manifest, metadata) should be measurable against them. If a change violates
a tenet, either the change is wrong or the tenet needs an explicit revision
in this file.

The paradigm: **PKM as brand**. Andy Matuschak / Maggie Appleton model. The
public surfaces are not a marketing site separate from the working PKM —
they are the working PKM, viewed from the outside, with the door left open.

---

## 1. Live from the vault

All surface data is a shallow projection of the real state of the
Obsidian → GitHub → Next.js pipeline. Numbers, lists, status badges, last
updated times — all are read at build/render time from the actual vault
index, not hand-coded.

**Why**: A PKM-as-brand site that lies about its own state is not a PKM. It
is a marketing site pretending to be one.

**How to apply**:
- No hardcoded counts ("980+ notes"). Pull from `getCachedVaultIndex()`.
- OG image numbers come from the same source as the page numbers.
- "Last harvest" timestamps are real, not literal strings.
- When a real number cannot be obtained at build time, label the placeholder
  explicitly (`mock` badge in dev) rather than committing a lie.

---

## 2. Garage door open

Unfinished, in-progress, and half-thought-through notes are visible by
default. Polished publication is a special case, not the norm.

**Why**: Andy Matuschak's "working with the garage door open" — the most
useful and most honest knowledge sharing happens before the work is done.
Hiding everything until it is "ready" defeats the purpose of a public
notebook.

**How to apply**:
- Home has a "Now growing" section that surfaces vault notes with non-published
  status, sorted by recent modification.
- Status badges (`growing`, `mature`, `published`) are first-class visual
  citizens, not buried metadata.
- Drafts are not redirected to a 404. They render with a `draft` badge.
- Never invent a "Coming soon" placeholder. Either the note exists or it
  does not.

---

## 3. Gardener, not publisher

Visitors are invited to wander, not to consume a feed. The site favors
exploration (backlinks, tags, related notes, entry points to multiple
sub-gardens) over a chronological list of "latest posts".

**Why**: Maggie Appleton's digital garden manifesto. A blog is a stream; a
garden is a place. PKM-as-brand is a place.

**How to apply**:
- CTA copy uses exploratory verbs: `Wander`, `Look around`, `Follow a thread`.
  Avoid `Read more`, `Latest posts`, `Subscribe`.
- The linear "Recent posts" feed is a 2nd-class element, never the heart of
  the home page.
- Backlinks, tag clouds, and "Notes that link here" deserve as much real
  estate as full-text article cards.
- The home is a wayfinding page, not a destination.

---

## 4. Instruments first, atmosphere allowed

Visual *substance* comes from rendered data — vault statistics, hairline
arcs showing the 3-axis flux, status badges, tabular numerals. Visual
*atmosphere* (ocean photography, animated waves, ambient gradients) is
allowed when it embodies the brand identity and is concentrated in one
place per Tenet 5.

**Why**: A site run by an engineer who operates seven autonomous agents
should not be a stock-photo brochure — but it also should not be an
entirely text-only sheet that reads as indifferent to its own ocean /
depth metaphor. The OKLCH palette, the `mesh-aurora` class, and the
`OceanWaves` component all already encode that identity. The home page's
manifesto section is the place where that atmosphere can be felt.

**How to apply**:
- **Allowed**: Properly licensed stock photography (Unsplash, Pexels,
  CC0 / CC-BY, paid stock) used as a single hero / atmosphere anchor.
  Prefer ocean / depth / cloud subjects that match the brand palette.
- **Allowed**: Self-recorded or self-generated `<video>` elements owned
  by the user. Same one-concentrated-moment rule applies.
- **Allowed**: Self-made CSS / SVG visual anchors (the `mesh-aurora`
  atmosphere, the `OceanWaves` SVG component, the 3-axis hairline arc in
  the OG image).
- **Allowed**: Self-made illustrations that DO encode data (e.g., a wave
  amplitude that reflects daily vault activity). These are instruments in
  disguise and should be encouraged — they grow the brand more than
  any static asset.
- **Forbidden**: Random low-quality animated GIFs (Giphy / Tenor scrapes),
  unlicensed images, hotlinked clipart, screenshots used as decoration.
- **One concentrated visual moment per page** (Tenet 5). The home page's
  manifesto block is that moment; sub-pages get hairlines and data only.
- **Text legibility is non-negotiable**: any image background must carry
  a gradient overlay so text never falls below WCAG AA contrast.
- **Effective opacity ≤ 0.25** for any decorative layer that sits *over*
  text content (not the background image itself, which is below the text).
- Wave / overlay fills should use CSS variables when possible, so they
  re-color across dark / light / gray themes automatically.
- Iconography stays monochrome lucide, used sparingly.
- The brand's signature *moment* may be visual; the brand's signature
  *substance* is still a tabular number in Geist Mono.

---

## 5. One surface, many entries

The home page is an index, not a landing. Its job is to deliver the visitor
to the right sub-garden in one click, not to "convert" them with a hero.

**Why**: Andy Matuschak's site has no hero. Maggie Appleton's hero is
illustration-as-content, not marketing copy. PKM-as-brand should not borrow
the IA of a SaaS landing page.

**How to apply**:
- Hero h1 stays at the integrated typography scale (`--font-size-h1`,
  48.8px) — never larger. The site has exactly one h1 per page.
- Wayfinding cards (entry points to Papers / Projects / Notes / Blog /
  Colophon / Tags) get more weight than any single piece of content.
- The home page should have at least 6 distinct entry points visible
  without scrolling on a desktop viewport.
- "Featured" content is allowed, but never larger than 2× any wayfinding
  card.

---

## How to use these tenets in code review

When reviewing a PR that touches a public surface, ask:

1. Does this change pull data from the vault, or hardcode it? *(Tenet 1)*
2. Does this change make work-in-progress more visible, or less? *(Tenet 2)*
3. Does this change favor exploration, or consumption? *(Tenet 3)*
4. Does this change add data, or add decoration? *(Tenet 4)*
5. Does this change deliver visitors to a sub-garden, or hold them on a
   landing? *(Tenet 5)*

Three or more "violation" answers means the change is wrong-shaped, not
just wrong-detailed.
