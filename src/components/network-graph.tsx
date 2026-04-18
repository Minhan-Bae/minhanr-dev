"use client";

import { useEffect, useRef, useState } from "react";

/**
 * NetworkGraph — a 7-node, 3-layer agent network that idles with gentle
 * breathing motion and attracts toward the cursor. The topology is the
 * author's studio system (orchestration → refinement → harvest), but
 * deliberately unlabelled on the surface; the shape carries the meaning
 * and the legend below decodes the three axes only.
 *
 * Rendering: a single <svg> with a fixed viewBox; nodes and edges are
 * DOM refs, repositioned via requestAnimationFrame every frame so React
 * state stays out of the hot path (60 FPS on mid-range laptops).
 * Cursor pull is computed in viewBox space using getScreenCTM so it
 * tracks correctly under any container size / resolution.
 *
 * Accessibility:
 *   - `role="img"` + aria-label describes the system
 *   - every motion is disabled when `prefers-reduced-motion: reduce`
 *     (nodes snap to their base positions, no rAF loop registered)
 */

type Layer = 1 | 2 | 3;

interface NodeSpec {
  id: string;
  bx: number;          // base x in normalised viewBox [0,1]
  by: number;          // base y in normalised viewBox [0,1]
  layer: Layer;
  seed: number;        // phase offset for float
  label: string;       // used as <title> for accessibility
}

interface EdgeSpec {
  from: string;
  to: string;
  weight: number;      // stroke opacity hint [0,1]
}

const VB_W = 1200;
const VB_H = 560;

const NODES: NodeSpec[] = [
  { id: "core",    bx: 0.50, by: 0.22, layer: 1, seed: 0.0, label: "오케스트레이션" },
  { id: "refineL", bx: 0.27, by: 0.52, layer: 2, seed: 0.9, label: "수렴 · 좌" },
  { id: "refineR", bx: 0.73, by: 0.52, layer: 2, seed: 1.8, label: "수렴 · 우" },
  { id: "harv1",   bx: 0.12, by: 0.82, layer: 3, seed: 2.6, label: "수집 01" },
  { id: "harv2",   bx: 0.36, by: 0.86, layer: 3, seed: 3.5, label: "수집 02" },
  { id: "harv3",   bx: 0.64, by: 0.86, layer: 3, seed: 4.3, label: "수집 03" },
  { id: "harv4",   bx: 0.88, by: 0.82, layer: 3, seed: 5.2, label: "수집 04" },
];

const EDGES: EdgeSpec[] = [
  // Strong orchestration→refinement
  { from: "core",    to: "refineL", weight: 1.0 },
  { from: "core",    to: "refineR", weight: 1.0 },
  // Strong refinement→harvest
  { from: "refineL", to: "harv1",   weight: 0.85 },
  { from: "refineL", to: "harv2",   weight: 0.85 },
  { from: "refineR", to: "harv3",   weight: 0.85 },
  { from: "refineR", to: "harv4",   weight: 0.85 },
  // Faint orchestration↔harvest observers
  { from: "core",    to: "harv1",   weight: 0.22 },
  { from: "core",    to: "harv2",   weight: 0.22 },
  { from: "core",    to: "harv3",   weight: 0.22 },
  { from: "core",    to: "harv4",   weight: 0.22 },
];

const RADIUS_BY_LAYER: Record<Layer, number> = { 1: 11, 2: 7, 3: 5 };

export function NetworkGraph() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const groupRefs = useRef<Map<string, SVGGElement>>(new Map());
  const edgeRefs  = useRef<Map<string, SVGLineElement>>(new Map());
  const mouseRef = useRef<{ x: number; y: number } | null>(null);
  const positionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    // Initialise every node at its base position so the first paint is
    // correct even if the rAF loop hasn't fired yet.
    for (const n of NODES) {
      positionsRef.current.set(n.id, { x: n.bx * VB_W, y: n.by * VB_H });
    }

    const prefersReduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduce) {
      applyAll();
      return;
    }

    let raf = 0;
    let lastT = performance.now();

    function frame(t: number) {
      const dt = Math.min(32, t - lastT); // clamp at 30fps to avoid jumps
      lastT = t;
      const phase = t * 0.0005;
      const mouse = mouseRef.current;

      for (const n of NODES) {
        const floatX = Math.sin(phase + n.seed) * 5;
        const floatY = Math.cos(phase * 0.73 + n.seed * 1.17) * 3.5;

        let attractX = 0;
        let attractY = 0;
        if (mouse) {
          const nx = n.bx * VB_W;
          const ny = n.by * VB_H;
          const dx = mouse.x - nx;
          const dy = mouse.y - ny;
          const dist = Math.hypot(dx, dy) || 1;
          const radius = 320;
          if (dist < radius) {
            const pull = (1 - dist / radius) * 0.22;
            attractX = dx * pull;
            attractY = dy * pull;
          }
        }

        // Smooth the attract a little so mouse flicks don't snap.
        const prev = positionsRef.current.get(n.id)!;
        const targetX = n.bx * VB_W + floatX + attractX;
        const targetY = n.by * VB_H + floatY + attractY;
        const lerp = 1 - Math.exp(-dt / 120);
        prev.x += (targetX - prev.x) * lerp;
        prev.y += (targetY - prev.y) * lerp;
      }

      applyAll();
      raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  /**
   * Push the current positionsRef values into the DOM. Used both by the
   * rAF loop and by the reduced-motion code path (where it runs once).
   */
  function applyAll() {
    for (const n of NODES) {
      const p = positionsRef.current.get(n.id);
      const g = groupRefs.current.get(n.id);
      if (p && g) {
        g.setAttribute("transform", `translate(${p.x} ${p.y})`);
      }
    }
    for (const e of EDGES) {
      const a = positionsRef.current.get(e.from);
      const b = positionsRef.current.get(e.to);
      const line = edgeRefs.current.get(e.from + "→" + e.to);
      if (a && b && line) {
        line.setAttribute("x1", String(a.x));
        line.setAttribute("y1", String(a.y));
        line.setAttribute("x2", String(b.x));
        line.setAttribute("y2", String(b.y));
      }
    }
  }

  function onPointerMove(ev: React.PointerEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    // Convert client coords → viewBox coords using the inverse CTM.
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

  // Which edges connect to the currently-hovered node?
  const hoveredEdgeIds = new Set<string>();
  if (hoveredId) {
    for (const e of EDGES) {
      if (e.from === hoveredId || e.to === hoveredId) {
        hoveredEdgeIds.add(e.from + "→" + e.to);
      }
    }
  }

  return (
    <figure
      className="relative w-full"
      aria-label="3층 에이전트 시스템 네트워크 다이어그램"
      role="img"
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="xMidYMid meet"
        className="block h-[60vh] max-h-[560px] w-full"
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
      >
        {/* Subtle radial backdrop — lives inside the SVG so it scales. */}
        <defs>
          <radialGradient id="ng-bg" cx="50%" cy="32%" r="55%">
            <stop
              offset="0%"
              stopColor="var(--primary)"
              stopOpacity="0.10"
            />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="ng-core" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.95" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.4" />
          </radialGradient>
        </defs>
        <rect x={0} y={0} width={VB_W} height={VB_H} fill="url(#ng-bg)" />

        {/* Edges first so they sit behind nodes */}
        <g>
          {EDGES.map((e) => {
            const key = e.from + "→" + e.to;
            const isHot = hoveredEdgeIds.has(key);
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
                stroke="var(--primary)"
                strokeWidth={isHot ? 1.6 : 1}
                strokeOpacity={isHot ? 0.9 : 0.18 + e.weight * 0.25}
                style={{
                  transition:
                    "stroke-opacity 240ms ease, stroke-width 240ms ease",
                }}
              />
            );
          })}
        </g>

        {/* Nodes */}
        <g>
          {NODES.map((n) => {
            const r = RADIUS_BY_LAYER[n.layer];
            const isHovered = hoveredId === n.id;
            const rEff = isHovered ? r * 1.4 : r;
            const isCore = n.layer === 1;
            return (
              <g
                key={n.id}
                ref={(el) => {
                  if (el) groupRefs.current.set(n.id, el);
                }}
                onPointerEnter={() => setHoveredId(n.id)}
                onPointerLeave={() => setHoveredId(null)}
                style={{ cursor: "default" }}
              >
                <title>{n.label}</title>
                {/* Hover halo */}
                {isHovered && (
                  <circle
                    r={rEff + 10}
                    fill="var(--primary)"
                    fillOpacity={0.12}
                  />
                )}
                {/* Outer ring */}
                <circle
                  r={rEff + (isCore ? 4 : 2.5)}
                  fill="none"
                  stroke="var(--primary)"
                  strokeOpacity={isHovered ? 0.7 : 0.32}
                  strokeWidth={1}
                  style={{
                    transition:
                      "stroke-opacity 240ms ease, r 240ms cubic-bezier(0.34,1.56,0.64,1)",
                  }}
                />
                {/* Fill */}
                <circle
                  r={rEff}
                  fill={isCore ? "url(#ng-core)" : "var(--primary)"}
                  fillOpacity={isCore ? 1 : n.layer === 2 ? 0.85 : 0.6}
                  style={{
                    transition:
                      "r 240ms cubic-bezier(0.34,1.56,0.64,1), fill-opacity 240ms ease",
                  }}
                />
                {/* Core accent dot — vermilion-free signature of the studio */}
                {isCore && (
                  <circle r={2.4} fill="var(--accent)" fillOpacity={0.9} />
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Legend — decodes the three axes without naming the system */}
      <figcaption className="font-technical pointer-events-none absolute bottom-3 left-4 flex gap-5 text-[11px] uppercase tracking-[0.16em] text-muted-foreground sm:bottom-5 sm:left-6 sm:gap-8">
        <span className="flex items-center gap-2">
          <span className="inline-block h-[6px] w-[6px] rounded-full bg-primary" />
          오케스트레이션
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-[6px] w-[6px] rounded-full bg-primary opacity-70" />
          수렴
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-[6px] w-[6px] rounded-full bg-primary opacity-45" />
          수집
        </span>
      </figcaption>
    </figure>
  );
}
