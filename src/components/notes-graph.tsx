"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { BlogPostMeta } from "@/lib/blog";

/**
 * NotesGraph — a constellation map of the studio's notes.
 *
 * Public nodes are blog posts (src/content/posts/*): clickable, coloured
 * by primary category, positioned in a radial layout where each category
 * owns an angular sector and recency sets the radius (newest closer to
 * the centre).
 *
 * Private nodes are five labelled "shadow" categories at the centre —
 * label only, no title/count/date, satisfying brand-tenets-v2 §4
 * (Privacy first) while still signalling the studio has work off-surface.
 *
 * Interaction:
 *   - Idle breathing (per-node seeded sin/cos)
 *   - Cursor proximity pull on public nodes (gentle spring)
 *   - Hover a public node → shared-tag neighbours fade in, others dim
 *   - Click a public node → router.push(`/blog/${slug}`)
 *   - prefers-reduced-motion → no rAF loop, static constellation
 *
 * Positions are deterministic (seeded from slug hash) so SSR and CSR
 * hydrate identically.
 */

const VB_W = 1400;
const VB_H = 720;
const CX = VB_W / 2;
const CY = VB_H / 2;

const CATEGORY_ORDER = [
  "AI",
  "VFX",
  "Research",
  "Creative Technology",
  "General",
] as const;

type CategoryKey = (typeof CATEGORY_ORDER)[number];

const CATEGORY_STYLE: Record<
  CategoryKey,
  { color: string; label: string }
> = {
  AI:                    { color: "var(--chart-1)", label: "AI" },
  VFX:                   { color: "var(--chart-2)", label: "VFX" },
  Research:              { color: "var(--chart-3)", label: "Research" },
  "Creative Technology": { color: "var(--chart-4)", label: "Creative" },
  General:               { color: "var(--chart-5)", label: "General" },
};

const PRIVATE_CATEGORIES = [
  { id: "priv-daily",   label: "일지",        color: "var(--muted-foreground)" },
  { id: "priv-archive", label: "아카이브",    color: "var(--muted-foreground)" },
  { id: "priv-wip",     label: "작업 중",     color: "var(--muted-foreground)" },
  { id: "priv-finance", label: "재무",        color: "var(--muted-foreground)" },
  { id: "priv-raw",     label: "리서치 원본", color: "var(--muted-foreground)" },
];

// ── Types ────────────────────────────────────────────────────────────

interface PublicNode {
  kind: "public";
  id: string;
  title: string;
  slug: string;
  tags: string[];
  category: CategoryKey;
  color: string;
  seed: number;
  bx: number;
  by: number;
  r: number;
}

interface PrivateNode {
  kind: "private";
  id: string;
  label: string;
  color: string;
  seed: number;
  bx: number;
  by: number;
  r: number;
}

type GraphNode = PublicNode | PrivateNode;

interface NotesGraphProps {
  posts: BlogPostMeta[];
}

// ── Layout ───────────────────────────────────────────────────────────

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 0xffffffff;
}

function resolveCategory(post: BlogPostMeta): CategoryKey {
  for (const cat of post.categories) {
    if ((CATEGORY_ORDER as readonly string[]).includes(cat)) {
      return cat as CategoryKey;
    }
  }
  return "General";
}

function computeNodes(posts: BlogPostMeta[]): GraphNode[] {
  const byCat = new Map<CategoryKey, BlogPostMeta[]>();
  for (const cat of CATEGORY_ORDER) byCat.set(cat, []);
  for (const p of posts) byCat.get(resolveCategory(p))!.push(p);

  const totalCats = CATEGORY_ORDER.length;
  const sectorWidth = (2 * Math.PI) / totalCats;
  const nodes: GraphNode[] = [];
  const innerR = Math.min(VB_W, VB_H) * 0.14;
  const outerR = Math.min(VB_W, VB_H) * 0.44;

  CATEGORY_ORDER.forEach((cat, catIdx) => {
    const catPosts = byCat.get(cat) ?? [];
    const sectorStart = catIdx * sectorWidth - Math.PI / 2;
    catPosts.forEach((post, i) => {
      const seed = hashString(post.slug);
      const jitter = (seed - 0.5) * sectorWidth * 0.78;
      const angle = sectorStart + sectorWidth / 2 + jitter;
      const ageRatio = catPosts.length <= 1 ? 0.3 : i / (catPosts.length - 1);
      const radiusJitter = ((seed * 97) % 1) * 20 - 10;
      const radius =
        innerR + (outerR - innerR) * (0.15 + 0.85 * ageRatio) + radiusJitter;

      nodes.push({
        kind: "public",
        id: post.slug,
        title: post.title,
        slug: post.slug,
        tags: post.tags,
        category: cat,
        color: CATEGORY_STYLE[cat].color,
        seed,
        bx: CX + Math.cos(angle) * radius,
        by: CY + Math.sin(angle) * radius,
        r: 3.5,
      });
    });
  });

  PRIVATE_CATEGORIES.forEach((p, i) => {
    const angle =
      (i / PRIVATE_CATEGORIES.length) * 2 * Math.PI - Math.PI / 2;
    const radius = innerR * 0.42;
    nodes.push({
      kind: "private",
      id: p.id,
      label: p.label,
      color: p.color,
      seed: hashString(p.id),
      bx: CX + Math.cos(angle) * radius,
      by: CY + Math.sin(angle) * radius,
      r: 4.5,
    });
  });

  return nodes;
}

// ── Component ────────────────────────────────────────────────────────

export function NotesGraph({ posts }: NotesGraphProps) {
  const router = useRouter();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const nodeRefs = useRef<Map<string, SVGGElement>>(new Map());
  const mouseRef = useRef<{ x: number; y: number } | null>(null);
  const positionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const nodes = useMemo(() => computeNodes(posts), [posts]);

  // Tag → set of public-node ids (for shared-tag neighbour edges).
  const tagIndex = useMemo(() => {
    const m = new Map<string, Set<string>>();
    for (const n of nodes) {
      if (n.kind !== "public") continue;
      for (const t of n.tags) {
        if (!m.has(t)) m.set(t, new Set());
        m.get(t)!.add(n.id);
      }
    }
    return m;
  }, [nodes]);

  const neighbours = useMemo(() => {
    if (!hoveredId) return null;
    const node = nodes.find((n) => n.id === hoveredId);
    if (!node || node.kind !== "public") return null;
    const set = new Set<string>();
    for (const t of node.tags) {
      const tagSet = tagIndex.get(t);
      if (!tagSet) continue;
      for (const id of tagSet) if (id !== hoveredId) set.add(id);
    }
    return set;
  }, [hoveredId, nodes, tagIndex]);

  useEffect(() => {
    for (const n of nodes) {
      positionsRef.current.set(n.id, { x: n.bx, y: n.by });
    }

    const prefersReduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduce) {
      applyTransforms();
      return;
    }

    let raf = 0;
    let lastT = performance.now();

    function frame(t: number) {
      const dt = Math.min(32, t - lastT);
      lastT = t;
      const phase = t * 0.0004;
      const mouse = mouseRef.current;

      for (const n of nodes) {
        const amp = n.kind === "private" ? 2.2 : 3.5;
        const floatX = Math.sin(phase + n.seed * 6.28) * amp;
        const floatY = Math.cos(phase * 0.72 + n.seed * 4.1) * (amp * 0.75);

        let attractX = 0;
        let attractY = 0;
        if (mouse && n.kind === "public") {
          const dx = mouse.x - n.bx;
          const dy = mouse.y - n.by;
          const dist = Math.hypot(dx, dy) || 1;
          const radius = 280;
          if (dist < radius) {
            const pull = (1 - dist / radius) * 0.16;
            attractX = dx * pull;
            attractY = dy * pull;
          }
        }

        const prev = positionsRef.current.get(n.id)!;
        const targetX = n.bx + floatX + attractX;
        const targetY = n.by + floatY + attractY;
        const lerp = 1 - Math.exp(-dt / 140);
        prev.x += (targetX - prev.x) * lerp;
        prev.y += (targetY - prev.y) * lerp;
      }

      applyTransforms();
      raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [nodes]);

  function applyTransforms() {
    for (const n of nodes) {
      const p = positionsRef.current.get(n.id);
      const g = nodeRefs.current.get(n.id);
      if (p && g) g.setAttribute("transform", `translate(${p.x} ${p.y})`);
    }
  }

  function onPointerMove(ev: React.PointerEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    const pt = svg.createSVGPoint();
    pt.x = ev.clientX;
    pt.y = ev.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const { x, y } = pt.matrixTransform(ctm.inverse());
    mouseRef.current = { x, y };
  }
  function onPointerLeave() {
    mouseRef.current = null;
  }

  function onNodeClick(node: GraphNode) {
    if (node.kind !== "public") return;
    router.push(`/blog/${node.slug}`);
  }

  const hovered = hoveredId
    ? nodes.find((n) => n.id === hoveredId) ?? null
    : null;

  return (
    <figure
      className="relative w-full"
      aria-label="스튜디오 노트 네트워크 — 공개 글과 비공개 카테고리"
      role="img"
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="xMidYMid meet"
        className="block h-[70vh] max-h-[720px] w-full"
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
      >
        <defs>
          <radialGradient id="ng2-bg" cx="50%" cy="50%" r="58%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.08" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect x={0} y={0} width={VB_W} height={VB_H} fill="url(#ng2-bg)" />

        {/* Edges — shown only for hovered public node's shared-tag
            neighbours. Default state is edgeless (constellation). */}
        {hovered && hovered.kind === "public" && neighbours && (
          <g>
            {nodes
              .filter((n) => n.kind === "public" && neighbours.has(n.id))
              .map((n) => {
                const a = positionsRef.current.get(hovered.id);
                const b = positionsRef.current.get(n.id);
                if (!a || !b) return null;
                return (
                  <line
                    key={hovered.id + "→" + n.id}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke={hovered.color}
                    strokeOpacity={0.5}
                    strokeWidth={0.8}
                  />
                );
              })}
          </g>
        )}

        {/* Nodes */}
        <g>
          {nodes.map((n) => {
            const isHovered = n.id === hoveredId;
            const isNeighbour = neighbours?.has(n.id) ?? false;
            const dim = hoveredId
              ? !isHovered && !isNeighbour && n.kind === "public"
              : false;
            const rEff = isHovered
              ? n.r * 2
              : isNeighbour
              ? n.r * 1.35
              : n.r;
            const isPrivate = n.kind === "private";

            return (
              <g
                key={n.id}
                ref={(el) => {
                  if (el) nodeRefs.current.set(n.id, el);
                }}
                onPointerEnter={() => setHoveredId(n.id)}
                onPointerLeave={() => setHoveredId(null)}
                onClick={() => onNodeClick(n)}
                style={{
                  cursor: isPrivate ? "default" : "pointer",
                  opacity: dim ? 0.22 : 1,
                  transition: "opacity 280ms ease",
                }}
              >
                <title>
                  {n.kind === "public"
                    ? `${n.title} · ${CATEGORY_STYLE[n.category].label}`
                    : `비공개 · ${n.label}`}
                </title>
                {isHovered && n.kind === "public" && (
                  <circle
                    r={rEff + 10}
                    fill={n.color}
                    fillOpacity={0.18}
                  />
                )}
                {isPrivate && (
                  <circle
                    r={rEff + 3}
                    fill="none"
                    stroke={n.color}
                    strokeOpacity={0.4}
                    strokeWidth={0.8}
                    strokeDasharray="2 2"
                  />
                )}
                <circle
                  r={rEff}
                  fill={n.color}
                  fillOpacity={
                    isPrivate ? 0.35 : isHovered ? 1 : 0.78
                  }
                  style={{
                    transition:
                      "r 240ms cubic-bezier(0.34,1.56,0.64,1), fill-opacity 240ms ease",
                  }}
                />
              </g>
            );
          })}
        </g>
      </svg>

      {/* Floating tooltip */}
      <div
        className="font-technical pointer-events-none absolute left-1/2 top-3 w-max max-w-[86%] -translate-x-1/2 rounded-sm bg-[var(--card)]/85 px-3 py-1.5 text-[12px] text-foreground backdrop-blur-sm transition-opacity duration-200"
        style={{
          opacity: hovered ? 1 : 0,
          border: "1px solid var(--hairline)",
        }}
      >
        {hovered?.kind === "public" && (
          <span>
            <span
              className="mr-2 inline-block h-[6px] w-[6px] rounded-full align-middle"
              style={{ background: hovered.color }}
            />
            {hovered.title}
            <span className="ml-2 text-muted-foreground">
              · {CATEGORY_STYLE[hovered.category].label} · 클릭하여 열기
            </span>
          </span>
        )}
        {hovered?.kind === "private" && (
          <span className="text-muted-foreground">
            비공개 · {hovered.label}
          </span>
        )}
      </div>

      {/* Legend */}
      <figcaption className="font-technical absolute bottom-3 left-4 flex flex-wrap gap-x-5 gap-y-1.5 text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground sm:bottom-5 sm:left-6 sm:gap-x-7">
        {CATEGORY_ORDER.map((cat) => (
          <span key={cat} className="flex items-center gap-1.5">
            <span
              className="inline-block h-[6px] w-[6px] rounded-full"
              style={{ background: CATEGORY_STYLE[cat].color }}
            />
            {CATEGORY_STYLE[cat].label}
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-[6px] w-[6px] rounded-full border border-dashed border-muted-foreground/60" />
          비공개
        </span>
      </figcaption>
    </figure>
  );
}
