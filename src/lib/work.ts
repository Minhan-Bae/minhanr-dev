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
    discipline: "지식 자동화",
    subject: "스스로 정원을 가꾸는 AI 시스템",
    year: "2026",
    role: "아키텍트·엔지니어",
    summary:
      "수집·수렴·확산 세 축 위에서 일곱 개의 에이전트가 살아 있는 지식 베이스를 유지하는 시스템.",
    body: `시스템으로 구축한 스튜디오의 일상. 수집(Acquisition)·수렴(Convergence)·확산(Amplification) 세 축 위에서 일곱 개의 자율 에이전트가 장기간 운영되는 지식 베이스를 정직하고 최신 상태로, 그리고 언제든 공개 가능한 상태로 유지한다. 지금 보고 계신 공개 페이지는 그 시스템의 얇은 투영 한 장이며, 나머지 대부분은 뒤에서 돈다.`,
    facts: [
      { label: "에이전트", value: "7" },
      { label: "축", value: "수집 · 수렴 · 확산" },
      { label: "언어", value: "TypeScript · Python" },
      { label: "가동", value: "2026" },
    ],
    coverAlt: "OIKBAS 7-에이전트 시스템의 추상적 다이어그램",
    selected: true,
    order: 1,
  },
  {
    slug: "vfx-research-pipeline",
    title: "VFX Research Pipeline",
    discipline: "VFX 연구·개발",
    subject: "생성형 렌더링을 위한 프로덕션 도구",
    year: "2025",
    role: "리드 엔지니어",
    summary:
      "아티스트가 생성형 모델을 기존 컴포지팅 그래프 감각 그대로 반복 작업할 수 있게 해 주는 스튜디오급 파이프라인.",
    body: `연구를 스튜디오에 얹는 건 결국 호환성 문제다. 이 프로젝트는 latent-space 모델을 DCC 노드로 감싸고, 결정적 시드 기반 캐싱 레이어를 추가했고, 리뷰 라운드를 "드라이브 링크 보내 주세요"에서 버전 이력이 살아 있는 일급 리뷰 서페이스로 바꿨다.`,
    facts: [
      { label: "플랫폼", value: "Nuke · Houdini · Python" },
      { label: "도입", value: "스튜디오 전사" },
      { label: "상태", value: "운영 중" },
    ],
    coverAlt: "생성형 VFX 샷 스틸 — 볼류메트릭 빛 속의 인물",
    selected: true,
    order: 2,
  },
  {
    slug: "minhanr-dev",
    title: "minhanr.dev",
    discipline: "에디토리얼 시스템",
    subject: "지금 보고 있는 이 사이트",
    year: "2026",
    role: "디자이너·엔지니어",
    summary:
      "작업을 유지해 주는 같은 에이전트 시스템 위에 지은 조용한 매거진 형식의 포트폴리오.",
    body: `조용한 매거진으로 설계했다. 세리프 디스플레이 하나, 산세리프 하나, 그리고 2026 팔레트 — Phthalo Green 바탕, Cloud Dancer 텍스트, Transformative Teal 키라인, Divine Damson 악센트. 콘텐츠 모델은 의도적으로 단조롭다. 모든 조각은 손으로 집어 버전 관리에 올린다 — 공개 페이지에 라이브 데이터베이스는 붙지 않는다.`,
    facts: [
      { label: "스택", value: "Next.js 16 · React 19 · OKLCH 토큰" },
      { label: "호스팅", value: "Vercel Edge" },
      { label: "타입", value: "Instrument Serif · Noto Serif KR · Geist" },
    ],
    coverAlt: "minhanr.dev 에디토리얼 그리드 목업",
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
