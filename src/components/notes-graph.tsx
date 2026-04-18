"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { BlogPostMeta } from "@/lib/blog";
import type { GraphNoteStub } from "@/lib/notes-graph-data";

/**
 * NotesGraph — live force-directed constellation of the studio's notes.
 *
 * Two populations in one graph:
 *   • Public posts — clickable, full size, title tooltip, tag-overlap
 *     edges to other publics. Node radius scales with degree so hubs
 *     read as centres of gravity.
 *   • Private vault stubs — markers. Tiny dots, dimmer colour, no
 *     click, no tooltip. They participate in physics so the
 *     constellation looks lived-in and category blobs are visually
 *     obvious, but they don't compete with the public nodes for
 *     attention. Private stubs are classified into the same AREAs so
 *     they join their public siblings in each cluster.
 *
 * Physics:
 *   1. Coulomb-like repulsion between every pair within REPEL_CUTOFF.
 *   2. Spring attraction along each edge (Hooke, rest length = SPRING_REST).
 *   3. Per-area cluster force: each node is nudged toward its area's
 *      anchor position so the six families form visible blobs.
 *   4. Weak global gravity toward the viewBox centre.
 *   5. Velocity integration with damping.
 *
 * Interactions:
 *   - Pointer-drag a public node: it's pinned to the cursor and drags
 *     its neighbours through the spring network (Obsidian-style).
 *   - Pointer-up without movement on a public node = click: navigate
 *     to `/blog/${slug}`.
 *   - Private nodes ignore pointer events entirely — pure background.
 *   - Hover a public node: same-tag neighbours + their edges highlight.
 */

// ── Palette / layout constants ──────────────────────────────────────

const VB_W = 1400;
const VB_H = 760;
const CX = VB_W / 2;
const CY = VB_H / 2;

// Physics — tuned for ~400 nodes (120 public + up to 280 private).
const REPEL_STRENGTH = 440;
const REPEL_CUTOFF   = 280;
const SPRING_REST    = 130;
const SPRING_K       = 0.026;
const GRAVITY        = 0.0014;
const CLUSTER_K      = 0.0085; // per-area anchor attraction
const DAMPING        = 0.82;
const MAX_STEP       = 14;

// Soft boundary — keeps drifting nodes inside the frame but doesn't
// clamp hard. Margin ~6% (a little tighter than before so the bigger
// graph still has room to breathe inside the viewBox).
const BOUND_MARGIN_X = VB_W * 0.06;
const BOUND_MARGIN_Y = VB_H * 0.06;
const BOUND_STRENGTH = 0.05;

/**
 * AREAs — the studio's practice split. Each gets a vivid OKLCH hue
 * (chroma 0.20 — primary-colour territory) plus a ±range for per-node
 * variation, AND a fixed anchor position so the force simulation can
 * pull same-area nodes together into a visible cluster.
 */
const AREA_ORDER = [
  "research",
  "systems",
  "visual",
  "studio",
  "industry",
  "journal",
] as const;
type AreaKey = (typeof AREA_ORDER)[number];

const AREA_STYLE: Record<
  AreaKey,
  {
    label: string;
    kr: string;
    baseHue: number;
    hueRange: number;
    /** Cluster anchor in viewBox coords. Six positions on a hexagon
     *  centred on (CX, CY) so every family has equal breathing room. */
    anchor: { x: number; y: number };
  }
> = {
  research: { label: "Research", kr: "리서치",  baseHue: 220, hueRange: 24, anchor: { x: CX,        y: CY - 190 } },
  systems:  { label: "Systems",  kr: "시스템",  baseHue: 165, hueRange: 22, anchor: { x: CX + 260,  y: CY - 95  } },
  visual:   { label: "Visual",   kr: "비주얼",  baseHue: 340, hueRange: 22, anchor: { x: CX + 260,  y: CY + 95  } },
  studio:   { label: "Studio",   kr: "스튜디오", baseHue: 40,  hueRange: 20, anchor: { x: CX,        y: CY + 190 } },
  industry: { label: "Industry", kr: "산업",    baseHue: 285, hueRange: 22, anchor: { x: CX - 260,  y: CY + 95  } },
  journal:  { label: "Journal",  kr: "저널",    baseHue: 105, hueRange: 22, anchor: { x: CX - 260,  y: CY - 95  } },
};

function nodeColor(area: AreaKey, seed: number, isPrivate: boolean): string {
  const { baseHue, hueRange } = AREA_STYLE[area];
  const hue = baseHue + (seed - 0.5) * hueRange;
  // Private notes sit at lower lightness + chroma — a desaturated
  // whisper of the same family, visible but visually recessed.
  return isPrivate
    ? `oklch(0.50 0.09 ${hue.toFixed(1)})`
    : `oklch(0.68 0.20 ${hue.toFixed(1)})`;
}
function legendColor(area: AreaKey): string {
  return `oklch(0.68 0.20 ${AREA_STYLE[area].baseHue})`;
}

/**
 * Classify a note into an AREA from its free-text metadata. Works on
 * both BlogPostMeta (public posts) and GraphNoteStub (private vault
 * entries) — the shape is unified to what the regex actually reads.
 */
function classifyArea(note: {
  title: string;
  summary?: string;
  tags?: string[];
  categories?: string[];
}): AreaKey {
  const blob = [
    note.title,
    note.summary ?? "",
    ...(note.tags ?? []),
    ...(note.categories ?? []),
  ]
    .join(" ")
    .toLowerCase();

  if (/일지|다이어리|diary|daily note|weekly review|주간회고|회고|journal/i.test(blob))
    return "journal";

  if (
    /vfx|render|nuke|houdini|diffusion|generative|visual|image|video|3d|animation|frame|pixel|holotron|runway|ltx|stable diffusion|midjourney|pika|luma|sora|veo/i.test(
      blob
    )
  )
    return "visual";

  if (
    /agent|orchestr|workflow|mcp\b|claude code|pipeline|pkm|obsidian|vault|oikbas|automation|scraper|webhook|cron|sync|에이전트|자동화|파이프라인/i.test(
      blob
    )
  )
    return "systems";

  if (
    /minhanr|portfolio|editorial|design system|brand|typography|ui\/ux|figma|shadcn|tailwind|next\.js|vercel|스튜디오 운영|포트폴리오/i.test(
      blob
    )
  )
    return "studio";

  if (
    /morgan stanley|meta ai|apple|google|market|industry|layoff|acquisition|경영|전략|감원|파트너|deal|funding|ipo|인수|발표|출시/i.test(
      blob
    )
  )
    return "industry";

  return "research";
}

// ── Types ───────────────────────────────────────────────────────────

interface NodeData {
  id: string;
  label: string;
  /** slug for public posts; empty string for private markers. */
  slug: string;
  tags: string[];
  area: AreaKey;
  color: string;
  r: number;
  isPrivate: boolean;
  /** physics state */
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** pinned by drag */
  fixed: boolean;
}

interface EdgeData {
  from: string;
  to: string;
  /** number of shared tags (or 0 for same-category fallback) */
  weight: number;
}

interface NotesGraphProps {
  /** Public blog posts — full-size, clickable, tooltip, tag-edge graph. */
  posts: BlogPostMeta[];
  /** Private vault stubs — marker dots. Pass an empty array (or omit)
   *  to hide the private layer entirely. */
  privateNotes?: GraphNoteStub[];
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

/**
 * Build nodes and edges.
 *   - Public nodes scatter wide, classified into AREA by metadata.
 *   - Private nodes scatter close to their AREA anchor (since they're
 *     unlikely to move much through the spring network, starting them
 *     near their cluster saves simulation time).
 *   - Edges only between public-public pairs with shared tags. Private
 *     markers stay edge-less; they're visual density, not structure.
 *   - Public node radius scales with degree so hubs grow.
 */
function buildGraph(
  posts: BlogPostMeta[],
  privateNotes: GraphNoteStub[]
): {
  nodes: NodeData[];
  edges: EdgeData[];
} {
  const MAX_EDGES_PER_NODE = 4;
  const nodes: NodeData[] = [];

  // Public nodes — scatter on an initial ring so repulsion has room
  // to start pushing immediately.
  posts.forEach((post, i) => {
    const seed = hashString(post.slug);
    const angle = seed * Math.PI * 2;
    const r0 = Math.min(VB_W, VB_H) * 0.38 + (i % 5) * 14;
    const area = classifyArea({
      title: post.title,
      summary: post.summary,
      tags: post.tags,
      categories: post.categories,
    });
    nodes.push({
      id: post.slug,
      label: post.title,
      slug: post.slug,
      tags: post.tags,
      area,
      color: nodeColor(area, seed, false),
      r: 5, // base; degree will boost below
      isPrivate: false,
      x: CX + Math.cos(angle) * r0,
      y: CY + Math.sin(angle) * r0,
      vx: (seed - 0.5) * 2,
      vy: ((seed * 7) % 1 - 0.5) * 2,
      fixed: false,
    });
  });

  // Private nodes — seed each one near its AREA anchor so the cluster
  // force doesn't have to haul it halfway across the viewport.
  privateNotes.forEach((stub) => {
    const seed = hashString(stub.id);
    const area = classifyArea({
      title: stub.title,
      summary: stub.summary,
      tags: stub.tags,
    });
    const anchor = AREA_STYLE[area].anchor;
    const angle = seed * Math.PI * 2;
    const r0 = 30 + seed * 90; // small spread around the anchor
    nodes.push({
      id: stub.id,
      label: stub.title,
      slug: "",
      tags: stub.tags,
      area,
      color: nodeColor(area, seed, true),
      r: 2.1 + seed * 0.9, // 2.1–3.0 — varied but always quieter than public
      isPrivate: true,
      x: anchor.x + Math.cos(angle) * r0,
      y: anchor.y + Math.sin(angle) * r0,
      vx: 0,
      vy: 0,
      fixed: false,
    });
  });

  // Build edges from tag overlap — public-public only.
  const pairs: Array<{ from: string; to: string; weight: number }> = [];
  const publicNodes = nodes.filter((n) => !n.isPrivate);
  for (let i = 0; i < publicNodes.length; i++) {
    const a = publicNodes[i];
    if (a.tags.length === 0) continue;
    const aTags = new Set(a.tags);
    for (let j = i + 1; j < publicNodes.length; j++) {
      const b = publicNodes[j];
      if (b.tags.length === 0) continue;
      let shared = 0;
      for (const t of b.tags) if (aTags.has(t)) shared++;
      if (shared > 0) pairs.push({ from: a.id, to: b.id, weight: shared });
    }
  }

  // Keep only the top-K edges per node (by weight).
  const perNode = new Map<string, Array<{ to: string; weight: number }>>();
  for (const n of publicNodes) perNode.set(n.id, []);
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

  // Degree-based size boost for public hubs. Count each node's kept
  // edges, then map degree → radius with a soft cap.
  const degree = new Map<string, number>();
  for (const e of edges) {
    degree.set(e.from, (degree.get(e.from) ?? 0) + 1);
    degree.set(e.to, (degree.get(e.to) ?? 0) + 1);
  }
  for (const n of publicNodes) {
    const d = degree.get(n.id) ?? 0;
    // Base 5 px, up to +7 px at full MAX_EDGES_PER_NODE. 0-degree nodes
    // stay at the base so they're still clearly public-sized.
    n.r = 5 + Math.min(d, MAX_EDGES_PER_NODE) * 1.75;
  }

  return { nodes, edges };
}

// ── Component ───────────────────────────────────────────────────────

export function NotesGraph({ posts, privateNotes = [] }: NotesGraphProps) {
  const router = useRouter();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const nodeRefs = useRef<Map<string, SVGGElement>>(new Map());
  const edgeRefs = useRef<Map<string, SVGLineElement>>(new Map());
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const draggingRef = useRef<string | null>(null);
  const dragMovedRef = useRef(false);
  const dragVelRef = useRef<{
    vx: number;
    vy: number;
    lastX: number;
    lastY: number;
    lastT: number;
  }>({ vx: 0, vy: 0, lastX: 0, lastY: 0, lastT: 0 });

  // Graph data lives in a ref — see the long comment in the previous
  // revision for why React Compiler + useMemo + in-place mutation don't
  // mix. Summary: refs are the escape hatch for mutable state.
  const graphRef = useRef<{ nodes: NodeData[]; edges: EdgeData[] } | null>(
    null
  );
  if (graphRef.current === null) {
    graphRef.current = buildGraph(posts, privateNotes);
  }
  const nodes = graphRef.current.nodes;
  const edges = graphRef.current.edges;

  const nodeById = useMemo(() => {
    const m = new Map<string, NodeData>();
    for (const n of nodes) m.set(n.id, n);
    return m;
  }, [nodes]);

  const tagIndex = useMemo(() => {
    const m = new Map<string, Set<string>>();
    for (const n of nodes) {
      if (n.isPrivate) continue; // hover highlight is for publics only
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
    if (!node) return null;
    const set = new Set<string>();
    for (const t of node.tags) {
      const tagSet = tagIndex.get(t);
      if (!tagSet) continue;
      for (const id of tagSet) if (id !== hoveredId) set.add(id);
    }
    return set;
  }, [hoveredId, nodeById, tagIndex]);

  useEffect(() => {
    const prefersReduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Pre-settle — with more nodes we need more ticks to reach a calm
    // starting layout.
    const preSettle = prefersReduce ? 240 : 140;
    for (let i = 0; i < preSettle; i++) step();
    paint();

    let raf = 0;
    let lastT = 0;
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
   * One physics tick. Mutates node.x/y/vx/vy in place.
   */
  function step() {
    const graph = graphRef.current;
    if (!graph) return;
    const { nodes, edges } = graph;
    const n = nodes.length;

    // 1. Repulsion — O(n^2). Early-exit when a pair is beyond cutoff
    // so the common case is O(n).
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

    // 2. Springs (public-public only — edges exist only there).
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

    // 3. Cluster + gravity + soft boundary.
    for (const node of nodes) {
      // Cluster: pull toward area anchor. Private notes get a stronger
      // pull since they have no edges to hold their shape.
      const anchor = AREA_STYLE[node.area].anchor;
      const k = node.isPrivate ? CLUSTER_K * 2.2 : CLUSTER_K;
      node.vx += (anchor.x - node.x) * k;
      node.vy += (anchor.y - node.y) * k;

      // Global weak centering.
      node.vx += (CX - node.x) * GRAVITY;
      node.vy += (CY - node.y) * GRAVITY;

      if (node.x < BOUND_MARGIN_X) {
        node.vx += (BOUND_MARGIN_X - node.x) * BOUND_STRENGTH;
      } else if (node.x > VB_W - BOUND_MARGIN_X) {
        node.vx -= (node.x - (VB_W - BOUND_MARGIN_X)) * BOUND_STRENGTH;
      }
      if (node.y < BOUND_MARGIN_Y) {
        node.vy += (BOUND_MARGIN_Y - node.y) * BOUND_STRENGTH;
      } else if (node.y > VB_H - BOUND_MARGIN_Y) {
        node.vy -= (node.y - (VB_H - BOUND_MARGIN_Y)) * BOUND_STRENGTH;
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
    if (node.isPrivate) return; // private notes ignore pointer entirely
    ev.stopPropagation();
    (ev.currentTarget as Element).setPointerCapture(ev.pointerId);
    draggingRef.current = node.id;
    dragMovedRef.current = false;
    node.fixed = true;
    const p = pointerToSvg(ev);
    dragVelRef.current = {
      vx: 0,
      vy: 0,
      lastX: p?.x ?? node.x,
      lastY: p?.y ?? node.y,
      lastT: performance.now(),
    };
  }

  function onSvgPointerMove(ev: React.PointerEvent<SVGSVGElement>) {
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

    const now = performance.now();
    const dragVel = dragVelRef.current;
    const dt = Math.max(1, now - dragVel.lastT);
    const instVx = ((p.x - dragVel.lastX) / dt) * 16;
    const instVy = ((p.y - dragVel.lastY) / dt) * 16;
    dragVel.vx = dragVel.vx * 0.6 + instVx * 0.4;
    dragVel.vy = dragVel.vy * 0.6 + instVy * 0.4;
    dragVel.lastX = p.x;
    dragVel.lastY = p.y;
    dragVel.lastT = now;

    node.x = p.x;
    node.y = p.y;
    node.vx = 0;
    node.vy = 0;
  }

  function onNodePointerUp(ev: React.PointerEvent, node: NodeData) {
    if (node.isPrivate) return;
    if (draggingRef.current === node.id) {
      draggingRef.current = null;
      node.fixed = false;
      const dv = dragVelRef.current;
      node.vx = dv.vx * 1.15;
      node.vy = dv.vy * 1.15;
    }
    if (!dragMovedRef.current) {
      router.push(`/blog/${node.slug}`);
    }
    dragMovedRef.current = false;
  }

  const hovered = hoveredId ? nodeById.get(hoveredId) ?? null : null;

  return (
    <figure
      className="relative w-full overflow-hidden rounded-sm border border-[var(--hairline)]"
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

        {/* Edges */}
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
                stroke={isHot ? hovered!.color : "var(--muted-foreground)"}
                strokeOpacity={isHot ? 0.55 : 0.12}
                strokeWidth={isHot ? 1.6 : 1}
                style={{
                  transition:
                    "stroke-opacity 220ms ease, stroke-width 220ms ease",
                }}
              />
            );
          })}
        </g>

        {/* Nodes — render private first so public draws on top. */}
        <g>
          {nodes.map((n) => {
            const isHovered = !n.isPrivate && n.id === hoveredId;
            const isNeighbour = !n.isPrivate && (neighbours?.has(n.id) ?? false);
            const dim = hoveredId && !isHovered && !isNeighbour;
            const rEff = isHovered
              ? n.r * 1.9
              : isNeighbour
              ? n.r * 1.3
              : n.r;

            return (
              <g
                key={n.id}
                ref={(el) => {
                  if (el) nodeRefs.current.set(n.id, el);
                }}
                onPointerEnter={
                  n.isPrivate ? undefined : () => setHoveredId(n.id)
                }
                onPointerLeave={
                  n.isPrivate ? undefined : () => setHoveredId(null)
                }
                onPointerDown={
                  n.isPrivate ? undefined : (ev) => onNodePointerDown(ev, n)
                }
                onPointerUp={
                  n.isPrivate ? undefined : (ev) => onNodePointerUp(ev, n)
                }
                style={{
                  cursor: n.isPrivate ? "default" : "pointer",
                  pointerEvents: n.isPrivate ? "none" : "auto",
                  opacity: dim ? (n.isPrivate ? 0.25 : 0.22) : n.isPrivate ? 0.62 : 1,
                  transition: "opacity 280ms ease",
                }}
              >
                {!n.isPrivate && (
                  <title>
                    {n.label} · {AREA_STYLE[n.area].label}
                  </title>
                )}
                {isHovered && (
                  <circle
                    r={rEff + 10}
                    fill={n.color}
                    fillOpacity={0.18}
                  />
                )}
                <circle
                  r={rEff}
                  fill={n.color}
                  fillOpacity={
                    n.isPrivate ? 0.55 : isHovered ? 1 : 0.82
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

      {/* Cursor-following tooltip */}
      <div
        ref={tooltipRef}
        className="font-technical pointer-events-none fixed z-50 w-max max-w-[360px] rounded-sm bg-[var(--card)]/92 px-3 py-1.5 text-[12px] leading-snug text-foreground backdrop-blur-sm transition-opacity duration-75"
        style={{
          left: 0,
          top: 0,
          opacity: hovered && !hovered.isPrivate ? 1 : 0,
          visibility: hovered && !hovered.isPrivate ? "visible" : "hidden",
          border: "1px solid var(--hairline)",
          boxShadow: "0 6px 24px oklch(0 0 0 / 0.25)",
        }}
      >
        {hovered && !hovered.isPrivate && (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-[6px] w-[6px] rounded-full"
                style={{ background: hovered.color }}
              />
              <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                {AREA_STYLE[hovered.area].kr} · {AREA_STYLE[hovered.area].label}
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
      </div>

      {/* Legend */}
      <figcaption className="font-technical absolute bottom-3 left-4 flex flex-wrap gap-x-5 gap-y-1.5 text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground sm:bottom-5 sm:left-6 sm:gap-x-7">
        {AREA_ORDER.map((a) => (
          <span key={a} className="flex items-center gap-1.5">
            <span
              className="inline-block h-[6px] w-[6px] rounded-full"
              style={{ background: legendColor(a) }}
            />
            {AREA_STYLE[a].kr}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
