/**
 * Work — selected case studies.
 *
 * Hand-curated list, order is the order the author wants visitors to
 * encounter the work (brand-tenets v2 §3: "Selected, not streamed").
 * Private vault-sourced projects never appear here; everything is lifted
 * into this file deliberately.
 *
 * Cover images live at `/public/work/{slug}/cover.jpg` and are generated
 * via `scripts/generate-work-images.mjs` (Vertex AI / Imagen 3 → Gemini
 * fallback). The `coverImage` field is resolved at request time — if the
 * file exists on disk, it's wired up; if not, the `WorkCover` component
 * renders a typographic placeholder so the layout never breaks.
 */

import { existsSync } from "node:fs";
import path from "node:path";

export interface WorkItem {
  slug: string;
  /** Short title shown in grid and case-study heading */
  title: string;
  /** One-line practice descriptor — "AI research system", "VFX R&D", etc. */
  discipline: string;
  /** Two-to-three-word subject used under the title in the case study */
  subject: string;
  /** Year shown as a small meta */
  year: string;
  /** Role (authored, directed, co-authored, etc.) */
  role: string;
  /** One-sentence editorial summary used in the grid */
  summary: string;
  /** Long-form body for the case study. Markdown-ish plain text. */
  body: string;
  /** Key facts rendered as small tabular rows on the case study */
  facts?: { label: string; value: string }[];
  /** Cover image path (inside /public). If missing, a gradient placeholder renders. */
  coverImage?: string;
  /** Alt text for the cover */
  coverAlt?: string;
  /** Optional external link (live site, paper, repo). Never a vault URL. */
  link?: { label: string; href: string };
  /** true = surface on home "Selected" strip */
  selected?: boolean;
  /** Manual order for the "Selected" strip. Lower first. */
  order?: number;
}

const WORK: WorkItem[] = [
  {
    slug: "oikbas-ecosystem",
    title: "OIKBAS",
    discipline: "Knowledge automation",
    subject: "An AI system that gardens itself",
    year: "2026",
    role: "Architect, engineer",
    summary:
      "A seven-agent system that keeps a living knowledge base — researching, converging, amplifying — around a single practitioner.",
    body: `A studio practice built as a system. Seven autonomous agents on three axes — acquisition, convergence, amplification — keep a long-running knowledge base honest, fresh, and publishable. The public surface you are reading is one thin projection of it; the rest runs in the background.`,
    facts: [
      { label: "Agents", value: "7" },
      { label: "Axes", value: "Acquisition / Convergence / Amplification" },
      { label: "Languages", value: "TypeScript · Python" },
      { label: "Deployed", value: "2026" },
    ],
    coverAlt: "Abstract diagram of the OIKBAS seven-agent system",
    selected: true,
    order: 1,
  },
  {
    slug: "vfx-research-pipeline",
    title: "VFX Research Pipeline",
    discipline: "VFX R&D",
    subject: "Production tools for generative rendering",
    year: "2025",
    role: "Lead engineer",
    summary:
      "A production-grade pipeline that lets artists iterate on generative models with the familiarity of a traditional compositing graph.",
    body: `Shipping research into a studio is mostly a compatibility problem. This project wrapped latent-space models as DCC nodes, gave artists a caching layer with deterministic seeds, and turned review rounds from "send me a Drive link" into a first-class review surface with version history.`,
    facts: [
      { label: "Platform", value: "Nuke · Houdini · Python" },
      { label: "Adoption", value: "Studio-wide" },
      { label: "Status", value: "Shipped" },
    ],
    coverAlt: "Still from a generative VFX shot — soft volumetric light on a figure",
    selected: true,
    order: 2,
  },
  {
    slug: "minhanr-dev",
    title: "minhanr.dev",
    discipline: "Editorial system",
    subject: "The site you are on",
    year: "2026",
    role: "Designer, engineer",
    summary:
      "An editorial portfolio built on top of the same agents that maintain the work it showcases.",
    body: `Designed as a quiet magazine. One serif display face, one sans, and a 2026 palette — Phthalo Green ground, Cloud Dancer text, Transformative Teal keyline, Divine Damson accent. The content model is deliberate: every piece is hand-lifted into version control — no live database renders on the public surface.`,
    facts: [
      { label: "Stack", value: "Next.js 16 · React 19 · OKLCH tokens" },
      { label: "Hosting", value: "Vercel Edge" },
      { label: "Type", value: "Instrument Serif · Geist · Geist Mono" },
    ],
    coverAlt: "Editorial grid mockup of the minhanr.dev site",
    selected: true,
    order: 3,
  },
];

/**
 * If a generated cover image exists for this slug under
 * /public/work/<slug>/cover.jpg, attach its web path. Otherwise leave
 * `coverImage` untouched so WorkCover renders the typographic
 * placeholder instead of a broken <Image>.
 *
 * Kept as a Node-only fs check — safe from RSC / Node runtime, not from
 * the edge. /work and / currently render on the Node runtime, so this is
 * fine; if a public route ever moves to edge, refactor to a build-time
 * manifest file instead.
 */
function attachCoverImage(item: WorkItem): WorkItem {
  if (item.coverImage) return item;
  const filePath = path.join(
    process.cwd(),
    "public",
    "work",
    item.slug,
    "cover.jpg"
  );
  if (existsSync(filePath)) {
    return { ...item, coverImage: `/work/${item.slug}/cover.jpg` };
  }
  return item;
}

export function getAllWork(): WorkItem[] {
  return [...WORK]
    .map(attachCoverImage)
    .sort((a, b) => {
      const ao = a.order ?? 999;
      const bo = b.order ?? 999;
      return ao - bo;
    });
}

export function getSelectedWork(): WorkItem[] {
  return getAllWork().filter((w) => w.selected);
}

export function getWorkBySlug(slug: string): WorkItem | undefined {
  const hit = WORK.find((w) => w.slug === slug);
  return hit ? attachCoverImage(hit) : undefined;
}
