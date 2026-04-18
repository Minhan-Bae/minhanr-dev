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
    discipline: "지식 자동화 · R&D",
    subject: "스스로 정원을 가꾸는 AI 시스템",
    year: "2026",
    role: "아키텍트 · 엔지니어 · 유일한 사용자",
    summary:
      "수집·수렴·확산 세 축 위에서 일곱 개의 자율 에이전트가 한 명의 실무자를 위해 지식 베이스를 유지·갱신·발행하는 시스템.",
    body: `시스템으로 구축한 스튜디오의 일상. 수집(Acquisition)·수렴(Convergence)·확산(Amplification) 세 축 위에서 일곱 개의 자율 에이전트가 장기간 운영되는 지식 베이스를 정직하고 최신 상태로, 그리고 언제든 공개 가능한 상태로 유지한다. 지금 보고 계신 공개 페이지는 그 시스템의 얇은 투영 한 장이며, 나머지 대부분은 뒤에서 돈다.

Layer 1(오케스트레이션)이 하루의 큰 흐름을 잡고, Layer 2(수렴)가 수집된 재료를 묶어 태그·요약·연결을 붙이고, Layer 3(수집)가 논문·뉴스·레포지토리·회의록을 실시간으로 가져온다. 볼트의 모든 변경은 GitHub commit으로 기록되고, 공개 가능한 노트는 빌드 파이프라인을 타고 이 사이트 위에 내려앉는다.

장기 비전은 Obsidian을 대체해 이 시스템을 본 사이트에서 직접 입출력하는 것. "공개 페이지"와 그 뒤의 "스튜디오"를 같은 리포 안에서 하나의 루프로 닫는 작업이 2026년의 북극성이다.`,
    facts: [
      { label: "에이전트", value: "7 · Layer 1·2·3" },
      { label: "축", value: "수집 · 수렴 · 확산" },
      { label: "스택", value: "TypeScript · Python · Supabase · GitHub Actions" },
      { label: "저장소", value: "5개 리포 + 볼트" },
      { label: "가동", value: "2026 · 운영 중" },
    ],
    link: {
      label: "GitHub",
      href: "https://github.com/Minhan-Bae",
    },
    coverAlt:
      "OIKBAS 시스템의 추상적 다이어그램 — 수집·수렴·확산 세 축 위의 일곱 노드",
    selected: true,
    order: 1,
  },
  {
    slug: "vfx-research-pipeline",
    title: "VFX Research Pipeline",
    discipline: "VFX 연구·개발",
    subject: "생성형 렌더링을 위한 프로덕션 도구",
    year: "2025",
    role: "리드 엔지니어 · 파이프라인 TD",
    summary:
      "아티스트가 생성형 모델을 기존 컴포지팅 그래프 감각 그대로 반복할 수 있게 하는 스튜디오급 파이프라인. 리뷰 라운드를 '드라이브 링크'에서 버전 이력이 있는 일급 서페이스로 옮겼다.",
    body: `연구를 스튜디오에 얹는 건 결국 호환성 문제다. 이 프로젝트는 latent-space 모델을 DCC(디지털 콘텐츠 제작 툴) 노드로 감싸고, 결정적 시드 기반 캐싱 레이어를 추가했고, 리뷰 라운드를 "드라이브 링크 보내 주세요"에서 버전 이력이 살아 있는 일급 리뷰 서페이스로 바꿨다.

핵심은 세 가지. 첫째, 생성형 모델을 블랙박스로 두지 않고 노드 그래프의 한 셀로 격하한다 — 다른 패스와 똑같이 cache·retime·branch 된다. 둘째, seed + parameter hash가 같으면 결과도 같다는 결정성 보장. 셋째, 매 렌더 라운드가 리뷰 링크 하나로 정리되어 감독이 프레임 단위로 코멘트를 남길 수 있다.

결과적으로 "보여드릴게요"라는 말이 회의실이 아니라 브라우저에서 완성된다.`,
    facts: [
      { label: "플랫폼", value: "Nuke · Houdini · Python · CUDA" },
      { label: "모델", value: "diffusion · optical flow · neural radiance" },
      { label: "도입", value: "스튜디오 전사" },
      { label: "상태", value: "운영 중 · 확장 중" },
    ],
    coverAlt: "생성형 VFX 샷 스틸 — 볼류메트릭 빛 속의 실루엣",
    selected: true,
    order: 2,
  },
  {
    slug: "minhanr-dev",
    title: "minhanr.dev",
    discipline: "에디토리얼 시스템",
    subject: "지금 보고 있는 이 사이트",
    year: "2026",
    role: "디자이너 · 엔지니어",
    summary:
      "OIKBAS의 공개 얼굴이자, 앞으로 Obsidian을 대체할 지식 입출력 UI의 빌드업. 조용한 매거진 형식의 포트폴리오에서 출발한다.",
    body: `조용한 매거진으로 설계했다. 세리프 디스플레이 하나, 산세리프 하나, 그리고 rain-glass 팔레트 — Prussian Night 바탕, Overcast Mist 텍스트, Signal Cobalt 키라인, Amethyst Shadow 악센트. 캔버스 위에 빗방울 한 겹이 사이트 전체에 날씨를 덧칠한다. 콘텐츠 모델은 의도적으로 단조롭다. 모든 조각은 손으로 집어 버전 관리에 올린다 — 공개 페이지에 라이브 데이터베이스는 붙지 않는다.

지금은 포트폴리오처럼 읽히지만, 목적지는 다르다. 이 사이트는 공개(작업·글·소개)와 그 뒤의 스튜디오(노트 입출력·발행·검토)를 한 리포 안에서 닫는 루프가 된다. 헤더 우측의 "스튜디오"가 그 입구이고, 내부 편집기·그래프·대시보드가 이어지는 단계다.

기술 스택은 Next.js 16 + React 19. 힘 기반 노트 그래프는 순수 SVG + rAF로 구현해 외부 의존성 없이 60fps를 유지한다. 텍스트는 Pretendard Variable(한글)과 Instrument Serif(영문)의 글리프 폴백 조합. 토큰은 OKLCH로 관리되어 다크·라이트·그레이 세 테마에서 동일한 규칙을 따른다.`,
    facts: [
      { label: "스택", value: "Next.js 16 · React 19 · OKLCH 토큰" },
      { label: "호스팅", value: "Vercel Edge · Turbopack" },
      { label: "타입", value: "Instrument Serif · Pretendard Variable · Geist" },
      { label: "그래프", value: "Force-directed SVG · 외부 의존성 0" },
    ],
    link: {
      label: "레포지토리",
      href: "https://github.com/Minhan-Bae/minhanr-dev",
    },
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
