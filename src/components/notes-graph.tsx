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
const REPEL_STRENGTH = 1000; // Coulomb constant (higher = more spread)
const REPEL_CUTOFF   = 560;  // ignore pairs beyond this distance
const SPRING_REST    = 230;
const SPRING_K       = 0.014;
const GRAVITY        = 0.0008; // very weak pull toward (CX, CY)
const DAMPING        = 0.82;
const MAX_STEP       = 16;     // clamp per-tick displacement per axis

// Soft boundary: margin on each edge of the viewBox. Nodes outside
// get pushed back in proportional to how far they've strayed. Small
// margin (~6%) because the vivid node colours need room to breathe
// — the graph should fill almost the entire frame.
const BOUND_MARGIN_X = VB_W * 0.06;
const BOUND_MARGIN_Y = VB_H * 0.06;
const BOUND_STRENGTH = 0.04;

/**
 * AREAs — the studio's practice split, not the blog's legacy
 * `categories` field. These are the buckets a knowledge-worker
 * reading this site actually cares about; classification lives in
 * `classifyArea()` and reads the whole meta (title + tags + summary)
 * with keyword heuristics in priority order.
 *
 * Each AREA owns a vivid OKLCH hue (chroma 0.20 — primary-colour
 * territory) plus a ±range for per-node variation. Result: six clearly
 * distinguishable families on screen, each one still a family (not a
 * flat block colour).
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
  { label: string; kr: string; baseHue: number; hueRange: number }
> = {
  research: { label: "Research", kr: "리서치",  baseHue: 220, hueRange: 24 }, // 파랑
  systems:  { label: "Systems",  kr: "시스템",  baseHue: 165, hueRange: 22 }, // 청록
  visual:   { label: "Visual",   kr: "비주얼",  baseHue: 340, hueRange: 22 }, // 마젠타
  studio:   { label: "Studio",   kr: "스튜디오", baseHue: 40,  hueRange: 20 }, // 앰버
  industry: { label: "Industry", kr: "산업",    baseHue: 285, hueRange: 22 }, // 바이올렛
  journal:  { label: "Journal",  kr: "저널",    baseHue: 105, hueRange: 22 }, // 옐로우그린
};

/** Primary-colour OKLCH: higher chroma than the previous band. */
function nodeColor(area: AreaKey, seed: number): string {
  const { baseHue, hueRange } = AREA_STYLE[area];
  const hue = baseHue + (seed - 0.5) * hueRange;
  return `oklch(0.68 0.20 ${hue.toFixed(1)})`;
}
function legendColor(area: AreaKey): string {
  return `oklch(0.68 0.20 ${AREA_STYLE[area].baseHue})`;
}

/**
 * Classify a post into an AREA from its free-text metadata.
 *
 * Priority order matters: VFX / visual tokens beat "research" when both
 * appear; journaling beats everything because daily notes often mention
 * research topics in passing. This is a studio-opinionated taxonomy,
 * deliberately narrower than the blog's public `categories` list.
 */
function classifyArea(post: BlogPostMeta): AreaKey {
  const blob = [
    post.title,
    post.summary ?? "",
    ...(post.tags ?? []),
    ...(post.categories ?? []),
  ]
    .join(" ")
    .toLowerCase();

  // Journal-first: daily / weekly retrospectives take precedence.
  if (/일지|다이어리|diary|daily note|weekly review|주간회고|회고|journal/i.test(blob))
    return "journal";

  // Visual computing: VFX pipelines, generative imagery, video.
  if (
    /vfx|render|nuke|houdini|diffusion|generative|visual|image|video|3d|animation|frame|pixel|holotron|runway|ltx|stable diffusion|midjourney|pika|luma|sora|veo/i.test(
      blob
    )
  )
    return "visual";

  // Systems: agents, orchestration, pipelines, PKM.
  if (
    /agent|orchestr|workflow|mcp\b|claude code|pipeline|pkm|obsidian|vault|oikbas|automation|scraper|webhook|cron|sync|에이전트|자동화|파이프라인/i.test(
      blob
    )
  )
    return "systems";

  // Studio self-ops: the site, tooling, brand.
  if (
    /minhanr|portfolio|editorial|design system|brand|typography|ui\/ux|figma|shadcn|tailwind|next\.js|vercel|스튜디오 운영|포트폴리오/i.test(
      blob
    )
  )
    return "studio";

  // Industry: companies, deals, layoffs, macro signals.
  if (
    /morgan stanley|meta ai|apple|google|market|industry|layoff|acquisition|경영|전략|감원|파트너|deal|funding|ipo|인수|발표|출시/i.test(
      blob
    )
  )
    return "industry";

  // Default: research — this is an AI research-leaning blog, so the
  // unclassified majority ends up here.
  return "research";
}

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
  area: AreaKey;
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

  // Public nodes — scatter on an initial ring so repulsion has room
  // to start pushing immediately. Wider ring than before so the graph
  // doesn't open from a tight cluster.
  posts.forEach((post, i) => {
    const seed = hashString(post.slug);
    const angle = seed * Math.PI * 2;
    const r0 =
      Math.min(VB_W, VB_H) * 0.4 + (i % 5) * 14;
    const area = classifyArea(post);
    nodes.push({
      kind: "public",
      id: post.slug,
      label: post.title,
      slug: post.slug,
      tags: post.tags,
      area,
      color: nodeColor(area, seed),
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
  // Drag-velocity tracker: exponential moving average of pointer
  // displacement per 60fps frame, in viewBox units. On pointer-up we
  // inject this into the node's vx/vy so a flung drag carries through
  // the spring network instead of stopping dead at the release point.
  const dragVelRef = useRef<{
    vx: number;
    vy: number;
    lastX: number;
    lastY: number;
    lastT: number;
  }>({ vx: 0, vy: 0, lastX: 0, lastY: 0, lastT: 0 });

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

    // Pre-settle the layout so the opening moments are already calm
    // instead of a visible "gathering" animation. 80 ticks gets the
    // spread 90% of the way there; the live simulation handles the
    // last 10% and any subsequent interaction. Reduced-motion users
    // get a heavier pre-settle (160) and a gentler cadence after.
    const preSettle = prefersReduce ? 160 : 80;
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

    // 3. Gravity + per-node anchor + soft boundary
    for (const node of nodes) {
      // Weak pull toward centre so the graph doesn't drift off screen.
      node.vx += (CX - node.x) * GRAVITY;
      node.vy += (CY - node.y) * GRAVITY;
      // Shadow nodes (private) have an extra anchor at their slot.
      if (node.anchor) {
        node.vx += (node.anchor.x - node.x) * node.anchor.k;
        node.vy += (node.anchor.y - node.y) * node.anchor.k;
      }
      // Soft boundary: push back into the inner 75% of the viewBox
      // when a node drifts past the margin. Proportional force so
      // nearby nodes feel a gentle nudge and far-out ones get yanked.
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
    // Reset drag velocity tracker — the next pointer-move will seed it
    // from the pointer's initial viewBox position.
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

    // Track drag velocity so a flung release carries inertia. We
    // normalise per-ms and rescale to per-frame (16ms ≈ 60fps) so
    // the inertia feels the same regardless of how often pointermove
    // fires. EMA blends in the latest sample at 0.4 weight — low
    // enough that a jittery pointer doesn't produce wild kicks.
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
    // Keep vx/vy at zero while pinned — inertia is injected only at
    // the moment of release.
    node.vx = 0;
    node.vy = 0;
  }

  function onNodePointerUp(ev: React.PointerEvent, node: NodeData) {
    if (draggingRef.current === node.id) {
      draggingRef.current = null;
      node.fixed = false;
      // Inject tracked drag velocity as initial inertia. MAX_STEP's
      // per-axis clamp in step() keeps genuinely wild flings bounded.
      const dv = dragVelRef.current;
      // Scale factor: drag feels naturally "heavier" than free
      // simulation, so we give it a small boost rather than
      // 1:1 transfer.
      node.vx = dv.vx * 1.15;
      node.vy = dv.vy * 1.15;
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
                strokeWidth={isHot ? 1.6 : 1}
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
                    ? `${n.label} · ${AREA_STYLE[n.area].label}`
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
        className="font-technical pointer-events-none fixed z-50 w-max max-w-[360px] rounded-sm bg-[var(--card)]/92 px-3 py-1.5 text-[12px] leading-snug text-foreground backdrop-blur-sm transition-opacity duration-75"
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
        {AREA_ORDER.map((a) => (
          <span key={a} className="flex items-center gap-1.5">
            <span
              className="inline-block h-[6px] w-[6px] rounded-full"
              style={{ background: legendColor(a) }}
            />
            {AREA_STYLE[a].kr}
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
