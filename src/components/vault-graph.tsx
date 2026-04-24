"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { vaultPathToHref } from "@/lib/vault-note";

export interface GraphNode {
  path: string;
  title: string;
  status?: string;
  lifecycle?: string;          // vault_schema v2.0
  degree: number;
  folder: string;
  clusterId?: string;          // tag cluster id (vfx_pipeline, ai_systems, ...)
  clusterColor?: string;       // hex color from cluster
  clusterLabel?: string;
}

export interface GraphEdge {
  from: string;
  to: string;
}

interface VaultGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

const FOLDER_HUE: Record<string, number> = {
  "020_Projects": 200,         // cyan
  "030_Areas": 25,             // coral
  "040_Resources": 170,        // foam green
  "050_Archive": 280,          // muted purple
  "010_Daily": 215,            // blue
};

const STATUS_OPACITY: Record<string, number> = {
  mature: 1,
  published: 1,
  evergreen: 1,
  growing: 0.8,
  seed: 0.55,
  archived: 0.35,
};

function lifecycleOpacity(node: GraphNode): number {
  // lifecycle 우선, status 폴백
  const key = node.lifecycle ?? node.status ?? "";
  return STATUS_OPACITY[key] ?? 0.7;
}

/**
 * Cluster-aware radial layout (vault_schema v2.0).
 *
 * 1) 노드를 clusterId 기준으로 그룹화 → 각 클러스터에 원의 섹터(각도 범위) 할당
 * 2) 섹터 크기는 클러스터 노드 수에 비례 (큰 클러스터 = 넓은 섹터)
 * 3) 각 섹터 내부에서 degree 높은 노드는 중심 가까이, 낮은 노드는 바깥쪽
 * 4) 같은 섹터 내 노드끼리 시각적으로 모여 보임 → 군집 식별 직관화
 *
 * SSR-safe (deterministic, 랜덤 X).
 */
function layout(nodes: GraphNode[], width: number, height: number) {
  const cx = width / 2;
  const cy = height / 2;
  const maxR = Math.min(width, height) / 2 - 40;
  const minR = 60;

  // 1. 클러스터별 그룹화. clusterId 없는 노드는 'other' 버킷.
  const clusterMap = new Map<string, GraphNode[]>();
  for (const n of nodes) {
    const cid = n.clusterId || "other";
    if (!clusterMap.has(cid)) clusterMap.set(cid, []);
    clusterMap.get(cid)!.push(n);
  }

  // 2. 클러스터 ID 정렬 — 큰 것부터 (안정된 순서 위해 id 알파벳)
  const clusterIds = [...clusterMap.keys()].sort((a, b) => {
    const sizeDiff = clusterMap.get(b)!.length - clusterMap.get(a)!.length;
    return sizeDiff !== 0 ? sizeDiff : a.localeCompare(b);
  });

  const totalNodes = nodes.length || 1;
  const allDegrees = nodes.map((n) => n.degree);
  const maxDeg = Math.max(1, ...allDegrees);
  const minDeg = Math.min(...allDegrees, 0);
  const degRange = Math.max(1, maxDeg - minDeg);

  const positions = new Map<string, { x: number; y: number; r: number }>();

  // 3. 각 클러스터에 섹터 할당 (start angle ~ end angle).
  //    클러스터 사이에 작은 gap(GAP_RAD) 둠 → 군집 경계 가시화.
  const GAP_RAD = 0.06; // ~3.4도
  const totalGaps = clusterIds.length * GAP_RAD;
  const usableArc = Math.PI * 2 - totalGaps;
  let cursorAngle = -Math.PI / 2; // 12시 방향에서 시작

  for (const cid of clusterIds) {
    const clusterNodes = clusterMap.get(cid)!;
    const sectorArc = usableArc * (clusterNodes.length / totalNodes);
    const startAngle = cursorAngle;
    const endAngle = startAngle + sectorArc;
    cursorAngle = endAngle + GAP_RAD;

    // 섹터 내부 노드: degree desc 정렬 → 중심부터 채움
    const sorted = [...clusterNodes].sort((a, b) => b.degree - a.degree);

    sorted.forEach((n, i) => {
      // 섹터 내 각도: i 기반 균등 분배 (양 끝에 약간 padding)
      const segPad = sectorArc * 0.04;
      const segUsable = sectorArc - 2 * segPad;
      const segDenom = Math.max(1, sorted.length - 1);
      const theta = startAngle + segPad + (i / segDenom) * segUsable;

      // 반지름: degree 높을수록 중심에 가까이
      const t = 1 - (n.degree - minDeg) / degRange; // 0 = 중심, 1 = 바깥
      // 클러스터 안에서도 약간의 jitter (순서 i 기반 deterministic)
      const jitter = ((i % 3) - 1) * 8;
      const r = minR + t * (maxR - minR) + jitter;

      const x = cx + r * Math.cos(theta);
      const y = cy + r * Math.sin(theta);

      const nr = 3 + 7 * ((n.degree - minDeg) / degRange);
      positions.set(n.path, { x, y, r: nr });
    });
  }

  return positions;
}

export function VaultGraph({ nodes, edges }: VaultGraphProps) {
  const width = 960;
  const height = 640;
  const [hovered, setHovered] = useState<string | null>(null);

  const positions = useMemo(() => layout(nodes, width, height), [nodes]);

  // hover된 노드와 연결된 노드/엣지 집합
  const highlight = useMemo(() => {
    if (!hovered) return { nodes: new Set<string>(), edges: new Set<number>() };
    const hn = new Set<string>([hovered]);
    const he = new Set<number>();
    edges.forEach((e, i) => {
      if (e.from === hovered || e.to === hovered) {
        hn.add(e.from);
        hn.add(e.to);
        he.add(i);
      }
    });
    return { nodes: hn, edges: he };
  }, [hovered, edges]);

  if (nodes.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
        backlink 데이터가 없습니다. related 필드가 있는 노트가 필요합니다.
      </div>
    );
  }

  const hoveredNode = hovered ? nodes.find((n) => n.path === hovered) ?? null : null;

  return (
    <div className="space-y-3">
      <div className="relative rounded-lg border border-border bg-[var(--surface-1)] overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto"
          role="img"
          aria-label="Vault backlink graph"
        >
          {/* Edges */}
          <g stroke="currentColor" strokeWidth="0.6" className="text-muted-foreground/30">
            {edges.map((e, i) => {
              const a = positions.get(e.from);
              const b = positions.get(e.to);
              if (!a || !b) return null;
              const isHi = highlight.edges.has(i);
              return (
                <line
                  key={`${e.from}->${e.to}-${i}`}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={isHi ? "oklch(var(--primary-l, 0.78) 0.165 195)" : undefined}
                  strokeOpacity={hovered ? (isHi ? 0.85 : 0.08) : 0.35}
                  strokeWidth={isHi ? 1.4 : 0.6}
                />
              );
            })}
          </g>

          {/* Nodes */}
          <g>
            {nodes.map((n) => {
              const p = positions.get(n.path);
              if (!p) return null;
              const hue = FOLDER_HUE[n.folder] ?? 210;
              const opacity = (hovered && !highlight.nodes.has(n.path) ? 0.15 : 1) *
                lifecycleOpacity(n);
              // 클러스터 색이 있으면 사용, 없으면 폴더 hue
              const fill = n.clusterColor ?? `oklch(0.72 0.15 ${hue})`;
              const isHovered = hovered === n.path;
              return (
                <g
                  key={n.path}
                  transform={`translate(${p.x}, ${p.y})`}
                  className="cursor-pointer"
                  onMouseEnter={() => setHovered(n.path)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {isHovered && (
                    <circle
                      r={p.r + 6}
                      fill="none"
                      stroke={fill}
                      strokeWidth={1}
                      opacity={0.5}
                    />
                  )}
                  <Link href={vaultPathToHref(n.path)}>
                    <circle
                      r={p.r}
                      fill={fill}
                      opacity={opacity}
                      className="transition-opacity"
                    />
                  </Link>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Hover tooltip */}
        {hoveredNode && (
          <div className="absolute top-3 left-3 rounded-md border border-border bg-background/90 backdrop-blur-sm px-3 py-2 text-xs shadow-sm max-w-[320px]">
            <div className="font-medium truncate">{hoveredNode.title}</div>
            <div className="text-muted-foreground/80 text-[10px] font-mono truncate mt-0.5">
              {hoveredNode.path}
            </div>
            <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground flex-wrap">
              <span>{hoveredNode.folder}</span>
              {hoveredNode.lifecycle && <span>· {hoveredNode.lifecycle}</span>}
              {!hoveredNode.lifecycle && hoveredNode.status && <span>· {hoveredNode.status}</span>}
              {hoveredNode.clusterLabel && <span>· {hoveredNode.clusterLabel}</span>}
              <span>· {hoveredNode.degree} links</span>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-medium text-foreground/80">Clusters:</span>
          {[...new Set(nodes.map((n) => n.clusterId).filter(Boolean))].map((id) => {
            const node = nodes.find((n) => n.clusterId === id);
            if (!node?.clusterColor) return null;
            return (
              <span key={id} className="inline-flex items-center gap-1.5">
                <span
                  className="inline-block size-2.5 rounded-full"
                  style={{ background: node.clusterColor }}
                />
                {node.clusterLabel ?? id}
              </span>
            );
          })}
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-medium text-foreground/80">Folders (fallback):</span>
          {Object.entries(FOLDER_HUE).map(([folder, hue]) => (
            <span key={folder} className="inline-flex items-center gap-1.5">
              <span
                className="inline-block size-2.5 rounded-full"
                style={{ background: `oklch(0.72 0.15 ${hue})` }}
              />
              {folder}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
