"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { BlogPostMeta } from "@/lib/blog";

/**
 * NotesGraph — live force-directed constellation of the studio's notes.
 *
 * Every frame:
 *   1. Coulomb-like repulsion between every pair within REPEL_CUTOFF.
 *   2. Spring attraction along each edge (Hooke, rest length = SPRING_REST).
 *   3. Weak gravity toward the viewBox centre so the graph doesn't drift.
 *   4. Velocity integration with damping; positions written straight to
 *      SVG transform attributes (React state stays out of the hot path).
 *
 * Interactions:
 *   - Pointer-drag a node: it's pinned to the cursor and drags its
 *     neighbours through the spring network (Obsidian-style).
 *   - Pointer-up without movement = click: navigate to `/blog/${slug}`
 *     for public nodes. Private nodes never navigate.
 *   - Hover a public node: same-tag neighbours + their edges are
 *     highlighted, everything else dims.
 *
 * Accessibility / motion:
 *   - `role="img"` + aria-label on the figure.
 *   - `prefers-reduced-motion`: the simulation still runs but the
 *     initial placement is settled immediately (many sub-steps) so the
 *     reader sees a stable layout without ongoing jiggle.
 *
 * Public nodes are blog posts. Private nodes are five labelled shadow
 * categories held near the centre by an extra-strong gravity anchor.
 */

// ── Palette / layout constants ──────────────────────────────────────

const VB_W = 1400;
const VB_H = 760;
const CX = VB_W / 2;
const CY = VB_H / 2;

// Physics — tuned against ~116 public nodes + 5 shadows
const REPEL_STRENGTH = 340;  // Coulomb constant
const REPEL_CUTOFF   = 260;  // ignore pairs beyond this distance
const SPRING_REST    = 90;
const SPRING_K       = 0.018;
const GRAVITY        = 0.006; // pull toward (CX, CY)
const DAMPING        = 0.82;
const MAX_STEP       = 12;    // clamp per-tick displacement per axis

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
  { id: "priv-daily",   label: "일지" },
  { id: "priv-archive", label: "아카이브" },
  { id: "priv-wip",     label: "작업 중" },
  { id: "priv-finance", label: "재무" },
  { id: "priv-raw",     label: "리서치 원본" },
];

// ── Types ───────────────────────────────────────────────────────────

interface BaseNode {
  id: string;
  label: string;
  color: string;
  r: number;
  /** physics state */
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** pinned by drag */
  fixed: boolean;
  /** extra gravity anchor (for shadow/private nodes) */
  anchor?: { x: number; y: number; k: number };
}
interface PublicNodeData extends BaseNode {
  kind: "public";
  slug: string;
  tags: string[];
  category: CategoryKey;
}
interface PrivateNodeData extends BaseNode {
  kind: "private";
}
type NodeData = PublicNodeData | PrivateNodeData;

interface EdgeData {
  from: string;
  to: string;
  /** number of shared tags (or 0 for same-category fallback) */
  weight: number;
}

interface NotesGraphProps {
  posts: BlogPostMeta[];
}

// ── Utilities ───────────────────────────────────────────────────────

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

/**
 * Build nodes and edges.
 *   - Edges exist when two public posts share ≥ 1 tag; weight = count.
 *   - To avoid a hairball, each node keeps only its top K strongest edges.
 */
function buildGraph(posts: BlogPostMeta[]): {
  nodes: NodeData[];
  edges: EdgeData[];
} {
  const MAX_EDGES_PER_NODE = 4;
  const nodes: NodeData[] = [];

  // Public nodes — scatter on an initial circle so repulsion has room
  // to start pushing immediately.
  posts.forEach((post, i) => {
    const seed = hashString(post.slug);
    const angle = seed * Math.PI * 2;
    const r0 =
      Math.min(VB_W, VB_H) * 0.28 + (i % 5) * 14; // mild jitter band
    const cat = resolveCategory(post);
    nodes.push({
      kind: "public",
      id: post.slug,
      label: post.title,
      slug: post.slug,
      tags: post.tags,
      category: cat,
      color: CATEGORY_STYLE[cat].color,
      r: 6,
      x: CX + Math.cos(angle) * r0,
      y: CY + Math.sin(angle) * r0,
      vx: (seed - 0.5) * 2,
      vy: ((seed * 7) % 1 - 0.5) * 2,
      fixed: false,
    });
  });

  // Private shadow nodes — clamped near the centre via an anchor.
  PRIVATE_CATEGORIES.forEach((p, i) => {
    const angle = (i / PRIVATE_CATEGORIES.length) * Math.PI * 2 - Math.PI / 2;
    const r0 = 60;
    const ax = CX + Math.cos(angle) * r0;
    const ay = CY + Math.sin(angle) * r0;
    nodes.push({
      kind: "private",
      id: p.id,
      label: p.label,
      color: "var(--muted-foreground)",
      r: 8,
      x: ax,
      y: ay,
      vx: 0,
      vy: 0,
      fixed: false,
      anchor: { x: ax, y: ay, k: 0.08 },
    });
  });

  // Build edges from tag overlap among public nodes.
  const pub = nodes.filter((n): n is PublicNodeData => n.kind === "public");
  const pairs: Array<{ from: string; to: string; weight: number }> = [];
  for (let i = 0; i < pub.length; i++) {
    const a = pub[i];
    if (a.tags.length === 0) continue;
    const aTags = new Set(a.tags);
    for (let j = i + 1; j < pub.length; j++) {
      const b = pub[j];
      if (b.tags.length === 0) continue;
      let shared = 0;
      for (const t of b.tags) if (aTags.has(t)) shared++;
      if (shared > 0) pairs.push({ from: a.id, to: b.id, weight: shared });
    }
  }

  // Keep only the top-K edges per node (by weight).
  const perNode = new Map<string, Array<{ to: string; weight: number }>>();
  for (const n of pub) perNode.set(n.id, []);
  // Sort pairs by weight desc to prefer high-overlap edges.
  pairs.sort((a, b) => b.weight - a.weight);
  const accepted = new Set<string>();
  for (const p of pairs) {
    const key = p.from + "|" + p.to;
    const a = perNode.get(p.from)!;
    const b = perNode.get(p.to)!;
    if (a.length < MAX_EDGES_PER_NODE && b.length < MAX_EDGES_PER_NODE) {
      a.push({ to: p.to, weight: p.weight });
      b.push({ to: p.from, weight: p.weight });
      accepted.add(key);
    }
  }
  const edges: EdgeData[] = pairs
    .filter((p) => accepted.has(p.from + "|" + p.to))
    .map((p) => ({ from: p.from, to: p.to, weight: p.weight }));

  return { nodes, edges };
}

// ── Component ───────────────────────────────────────────────────────

export function NotesGraph({ posts }: NotesGraphProps) {
  const router = useRouter();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const nodeRefs = useRef<Map<string, SVGGElement>>(new Map());
  const edgeRefs = useRef<Map<string, SVGLineElement>>(new Map());
  // Cursor-following tooltip. We position it by directly setting
  // left/top on the DOM element instead of state, so the mouse can
  // drag it around without re-rendering the graph on every frame.
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const draggingRef = useRef<string | null>(null);
  const dragMovedRef = useRef(false);

  // ─────────────────────────────────────────────────────────────────
  // Graph data lives in a ref, not in useMemo, for a very specific
  // reason: React Compiler (active here — see next.config.ts
  // reactCompiler: true) treats useMemo return values as read-only and
  // may refuse in-place mutation on subsequent renders. The physics
  // simulation mutates node.x / .y / .vx / .vy on every frame, so the
  // graph must sit somewhere React Compiler doesn't reach. Refs are
  // safe by design.
  //
  // The ref is initialised once on first render and reused for the
  // lifetime of the component.
  // ─────────────────────────────────────────────────────────────────
  const graphRef = useRef<{ nodes: NodeData[]; edges: EdgeData[] } | null>(
    null
  );
  if (graphRef.current === null) {
    graphRef.current = buildGraph(posts);
  }
  const nodes = graphRef.current.nodes;
  const edges = graphRef.current.edges;

  // These derived structures don't mutate, so useMemo is fine; React
  // Compiler can freeze them all it wants.
  const nodeById = useMemo(() => {
    const m = new Map<string, NodeData>();
    for (const n of nodes) m.set(n.id, n);
    return m;
  }, [nodes]);

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
    const node = nodeById.get(hoveredId);
    if (!node || node.kind !== "public") return null;
    const set = new Set<string>();
    for (const t of node.tags) {
      const tagSet = tagIndex.get(t);
      if (!tagSet) continue;
      for (const id of tagSet) if (id !== hoveredId) set.add(id);
    }
    return set;
  }, [hoveredId, nodeById, tagIndex]);

  // Physics + render loop — mount-once. All inner closures read through
  // graphRef so they always see the current state.
  useEffect(() => {
    const prefersReduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Initial paint so the graph is never a pile of dots at (0,0) in
    // the moment between hydration and the first rAF frame. Nodes
    // already have seeded bx/by positions from buildGraph().
    paint();

    // For reduced-motion users we still want a "living" graph — just
    // slower. Pre-settle 120 ticks so it starts relaxed, then continue
    // the simulation at a gentler cadence.
    if (prefersReduce) {
      for (let i = 0; i < 120; i++) step();
      paint();
    }

    let raf = 0;
    let lastT = 0;
    // Interval gate for reduced-motion (~30fps equivalent)
    const minDt = prefersReduce ? 33 : 0;
    function frame(t: number) {
      if (t - lastT >= minDt) {
        step();
        paint();
        lastT = t;
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * One physics tick. Mutates node.x/y/vx/vy in place on the ref'd
   * graph. Drag-fixed nodes are moved directly to the cursor in
   * `onSvgPointerMove`; here we zero their velocity so they don't
   * drift when released.
   */
  function step() {
    const graph = graphRef.current;
    if (!graph) return;
    const { nodes, edges } = graph;
    const n = nodes.length;

    // 1. Repulsion — O(n^2) but n ~ 121, cheap.
    for (let i = 0; i < n; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < n; j++) {
        const b = nodes[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dsq = dx * dx + dy * dy;
        if (dsq > REPEL_CUTOFF * REPEL_CUTOFF) continue;
        const dist = Math.sqrt(dsq) || 0.01;
        const force = REPEL_STRENGTH / (dist * dist);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        a.vx -= fx;
        a.vy -= fy;
        b.vx += fx;
        b.vy += fy;
      }
    }

    // 2. Springs
    for (const e of edges) {
      const a = nodeById.get(e.from)!;
      const b = nodeById.get(e.to)!;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.hypot(dx, dy) || 0.01;
      const force = SPRING_K * (dist - SPRING_REST);
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      a.vx += fx;
      a.vy += fy;
      b.vx -= fx;
      b.vy -= fy;
    }

    // 3. Gravity toward (CX, CY) + per-node anchor (shadow nodes)
    for (const node of nodes) {
      node.vx += (CX - node.x) * GRAVITY;
      node.vy += (CY - node.y) * GRAVITY;
      if (node.anchor) {
        node.vx += (node.anchor.x - node.x) * node.anchor.k;
        node.vy += (node.anchor.y - node.y) * node.anchor.k;
      }
    }

    // 4. Integrate + damping + optional drag fixation
    const drag = draggingRef.current;
    for (const node of nodes) {
      if (node.id === drag) {
        node.vx = 0;
        node.vy = 0;
        continue;
      }
      node.vx *= DAMPING;
      node.vy *= DAMPING;
      // Clamp step size for stability
      if (node.vx > MAX_STEP) node.vx = MAX_STEP;
      if (node.vx < -MAX_STEP) node.vx = -MAX_STEP;
      if (node.vy > MAX_STEP) node.vy = MAX_STEP;
      if (node.vy < -MAX_STEP) node.vy = -MAX_STEP;
      node.x += node.vx;
      node.y += node.vy;
    }
  }

  function paint() {
    const graph = graphRef.current;
    if (!graph) return;
    const { nodes, edges } = graph;
    for (const node of nodes) {
      const g = nodeRefs.current.get(node.id);
      if (g) g.setAttribute("transform", `translate(${node.x} ${node.y})`);
    }
    for (const e of edges) {
      const a = nodeById.get(e.from);
      const b = nodeById.get(e.to);
      if (!a || !b) continue;
      const line = edgeRefs.current.get(e.from + "→" + e.to);
      if (line) {
        line.setAttribute("x1", String(a.x));
        line.setAttribute("y1", String(a.y));
        line.setAttribute("x2", String(b.x));
        line.setAttribute("y2", String(b.y));
      }
    }
  }

  /** Convert a client-space pointer to viewBox coords. */
  function pointerToSvg(ev: React.PointerEvent) {
    const svg = svgRef.current;
    if (!svg) return null;
    const pt = svg.createSVGPoint();
    pt.x = ev.clientX;
    pt.y = ev.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    return pt.matrixTransform(ctm.inverse());
  }

  function onNodePointerDown(ev: React.PointerEvent, node: NodeData) {
    ev.stopPropagation();
    (ev.currentTarget as Element).setPointerCapture(ev.pointerId);
    draggingRef.current = node.id;
    dragMovedRef.current = false;
    node.fixed = true;
  }

  function onSvgPointerMove(ev: React.PointerEvent<SVGSVGElement>) {
    // Tooltip tracks the cursor regardless of drag state. Writing
    // directly to the DOM (not state) keeps re-render cost at zero.
    const tt = tooltipRef.current;
    if (tt) {
      tt.style.left = `${ev.clientX + 14}px`;
      tt.style.top = `${ev.clientY + 14}px`;
    }

    const drag = draggingRef.current;
    if (!drag) return;
    const p = pointerToSvg(ev);
    if (!p) return;
    const node = nodeById.get(drag);
    if (!node) return;
    const dx = p.x - node.x;
    const dy = p.y - node.y;
    if (Math.hypot(dx, dy) > 3) dragMovedRef.current = true;
    node.x = p.x;
    node.y = p.y;
    node.vx = 0;
    node.vy = 0;
  }

  function onNodePointerUp(ev: React.PointerEvent, node: NodeData) {
    if (draggingRef.current === node.id) {
      draggingRef.current = null;
      node.fixed = false;
    }
    // Treat a no-movement pointerup as a click.
    if (!dragMovedRef.current && node.kind === "public") {
      router.push(`/blog/${node.slug}`);
    }
    dragMovedRef.current = false;
  }

  const hovered = hoveredId ? nodeById.get(hoveredId) ?? null : null;

  return (
    <figure
      className="relative w-full"
      aria-label="스튜디오 노트 네트워크 — force-directed 그래프"
      role="img"
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="xMidYMid meet"
        className="block h-[70vh] max-h-[760px] w-full touch-none select-none"
        onPointerMove={onSvgPointerMove}
      >
        <defs>
          <radialGradient id="ng2-bg" cx="50%" cy="50%" r="58%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.08" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect x={0} y={0} width={VB_W} height={VB_H} fill="url(#ng2-bg)" />

        {/* Edges — always visible but quiet; the hovered node's edges
            get a brief boost in opacity/stroke. */}
        <g>
          {edges.map((e) => {
            const key = e.from + "→" + e.to;
            const isHot =
              hovered?.id === e.from || hovered?.id === e.to;
            return (
              <line
                key={key}
                ref={(el) => {
                  if (el) edgeRefs.current.set(key, el);
                }}
                x1={0}
                y1={0}
                x2={0}
                y2={0}
                stroke={
                  isHot && hovered?.kind === "public"
                    ? hovered.color
                    : "var(--muted-foreground)"
                }
                strokeOpacity={isHot ? 0.55 : 0.12}
                strokeWidth={isHot ? 1.2 : 0.6}
                style={{
                  transition:
                    "stroke-opacity 220ms ease, stroke-width 220ms ease",
                }}
              />
            );
          })}
        </g>

        {/* Nodes */}
        <g>
          {nodes.map((n) => {
            const isHovered = n.id === hoveredId;
            const isNeighbour = neighbours?.has(n.id) ?? false;
            const dim = hoveredId
              ? !isHovered && !isNeighbour && n.kind === "public"
              : false;
            const rEff = isHovered
              ? n.r * 1.9
              : isNeighbour
              ? n.r * 1.3
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
                onPointerDown={(ev) => onNodePointerDown(ev, n)}
                onPointerUp={(ev) => onNodePointerUp(ev, n)}
                style={{
                  cursor: isPrivate ? "grab" : "pointer",
                  opacity: dim ? 0.22 : 1,
                  transition: "opacity 280ms ease",
                }}
              >
                <title>
                  {n.kind === "public"
                    ? `${n.label} · ${CATEGORY_STYLE[n.category].label}`
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

      {/* Cursor-following tooltip. Position is set imperatively on
          pointer-move; only the hovered-id state drives the content. */}
      <div
        ref={tooltipRef}
        className="font-technical pointer-events-none fixed z-50 w-max max-w-[360px] rounded-sm bg-[var(--card)]/92 px-3 py-1.5 text-[12px] leading-snug text-foreground backdrop-blur-sm transition-opacity duration-150"
        style={{
          left: 0,
          top: 0,
          opacity: hovered ? 1 : 0,
          visibility: hovered ? "visible" : "hidden",
          border: "1px solid var(--hairline)",
          boxShadow: "0 6px 24px oklch(0 0 0 / 0.25)",
        }}
      >
        {hovered?.kind === "public" && (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-[6px] w-[6px] rounded-full"
                style={{ background: hovered.color }}
              />
              <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                {CATEGORY_STYLE[hovered.category].label}
              </span>
            </div>
            <div className="line-clamp-2 text-foreground">
              {hovered.label}
            </div>
            <div className="text-[10.5px] text-muted-foreground">
              클릭 열기 · 드래그 이동
            </div>
          </div>
        )}
        {hovered?.kind === "private" && (
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              비공개 카테고리
            </span>
            <span className="text-foreground">{hovered.label}</span>
          </div>
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
