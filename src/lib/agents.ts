export const AGENTS = [
  {
    name: "alpha",
    label: "Alpha",
    role: "Builder",
    layer: 2,
    axis: "acquisition" as const,
    description: "수집 인프라 · 사이트 구축 · 스킬 개발",
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
    borderColor: "border-blue-400/30",
  },
  {
    name: "beta",
    label: "Beta",
    role: "Analyst",
    layer: 2,
    axis: "convergence" as const,
    description: "볼트 수렴 · 프론트매터 정규화 · 인덱스 관리",
    color: "text-green-400",
    bgColor: "bg-green-400/10",
    borderColor: "border-green-400/30",
  },
  {
    name: "gamma",
    label: "Gamma",
    role: "Creator",
    layer: 2,
    axis: "amplification" as const,
    description: "블로그 발행 · 브리핑 · 콘텐츠 확산",
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
    borderColor: "border-purple-400/30",
  },
  {
    name: "rt_slot1",
    label: "RT Slot 1",
    role: "Collector",
    layer: 3,
    axis: "acquisition" as const,
    description: "AI 논문 · 트렌드 · 매크로 자동 수집 (3h 주기)",
    color: "text-emerald-400",
    bgColor: "bg-emerald-400/10",
    borderColor: "border-emerald-400/30",
  },
  {
    name: "rt_slot2",
    label: "RT Slot 2",
    role: "Converger",
    layer: 3,
    axis: "convergence" as const,
    description: "수집 노트 수렴 · 블로그 후보 큐레이션",
    color: "text-cyan-400",
    bgColor: "bg-cyan-400/10",
    borderColor: "border-cyan-400/30",
  },
  {
    name: "rt_slot3",
    label: "RT Slot 3",
    role: "Synthesizer",
    layer: 3,
    axis: "amplification" as const,
    description: "모닝 브리핑 · 일일 종합 · 블로그 발행",
    color: "text-amber-400",
    bgColor: "bg-amber-400/10",
    borderColor: "border-amber-400/30",
  },
] as const;

export type AgentName = (typeof AGENTS)[number]["name"];
export type Axis = "acquisition" | "convergence" | "amplification";

export const AXIS_LABELS: Record<Axis, string> = {
  acquisition: "수집",
  convergence: "수렴",
  amplification: "확산",
};

export const AXIS_COLORS: Record<Axis, string> = {
  acquisition: "text-green-400",
  convergence: "text-blue-400",
  amplification: "text-purple-400",
};
