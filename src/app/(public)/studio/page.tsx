import type { Metadata } from "next";
import Link from "next/link";
import { BRAND_CONTACT, BRAND_IDENTITY } from "@/lib/brand/tokens";
import { TypewriterLoop } from "@/components/typewriter-loop";
import { SlideDeck } from "@/components/slide-deck";

export const metadata: Metadata = {
  title: "Studio",
  description: `${BRAND_IDENTITY.studio} — how the studio works: capabilities, stack, process, engagement.`,
  openGraph: {
    title: `Studio — ${BRAND_IDENTITY.studio}`,
    description: "Studio of record. Capabilities · Stack · Process · Engagement.",
    images: [{ url: "/api/og?title=Studio&category=studio", width: 1200, height: 630 }],
  },
};

/**
 * /studio — the fourth public surface, answering *how* the studio
 * works (alongside Home=what, Writing=thought, About=who).
 *
 * Five slides, same editorial vocabulary as Home / Writing / About:
 *   1. Masthead     — keyline + TypewriterLoop "Studio of record."
 *   2. Capabilities — 6 practice areas in a dt/dd grid
 *   3. Stack        — 6 tool groups in a 2-col label/content layout
 *   4. Process      — numbered 01–04 loop (TrinityX acquisition→
 *                    convergence→shipping→reflection)
 *   5. Engagement   — take/skip scope + contact card, no generic
 *                    marketing manifesto (author's preference)
 *
 * Every slide reserves pb-[clamp(140px,18vh,200px)] so the four-
 * corner chrome (dock / colophon / stats / theme toggle) never
 * overlaps content. Matches /about exactly.
 */
const SLIDE_PB = "pb-[clamp(140px,18vh,200px)]";

export default function StudioPage() {
  return (
    <SlideDeck>
      <MastheadSlide />
      <CapabilitiesSlide />
      <StackSlide />
      <ProcessSlide />
      <EngagementSlide />
    </SlideDeck>
  );
}

// ─── 01 Masthead ─────────────────────────────────────────────────

function MastheadSlide() {
  return (
    <section
      data-slide
      className={`slide relative mx-auto flex w-full max-w-[1440px] flex-col justify-center px-6 sm:px-10 ${SLIDE_PB}`}
    >
      <div
        aria-hidden
        className="animate-fade-in absolute left-6 top-[38%] h-24 w-[3px] bg-primary sm:left-10"
        style={{ animationDelay: "360ms" }}
      />
      <div className="ml-8 sm:ml-12">
        <p
          className="kicker mb-5 animate-fade-up"
          style={{ animationDelay: "0ms" }}
        >
          How · 04
        </p>
        <TypewriterLoop
          as="h1"
          lang="en"
          text="Studio of record."
          typeDelay={90}
          eraseDelay={45}
          holdMs={5000}
          pauseMs={900}
          sfx
          className="font-display italic leading-[1.05] tracking-[-0.03em] block"
          style={{ fontSize: "var(--font-size-display)" }}
        />
        <p
          className="mt-6 font-technical text-[15px] text-muted-foreground sm:text-base animate-fade-up"
          style={{ animationDelay: "240ms" }}
        >
          {BRAND_CONTACT.location} · Est. {BRAND_CONTACT.est} · Solo practice
        </p>
      </div>
    </section>
  );
}

// ─── 02 Capabilities ─────────────────────────────────────────────

const CAPABILITIES: Array<{ en: string; ko: string; dd: string }> = [
  {
    en: "Agent systems",
    ko: "에이전트 시스템",
    dd: "Claude + MCP 기반 다축 오케스트레이션. TrinityX RT×3 운영, 워크플로우 거버넌스, LLM 런타임 가드레일.",
  },
  {
    en: "Diffusion & VFX",
    ko: "디퓨전 · VFX",
    dd: "실사 · 3DGS · 인페인팅 · 렌더링 · 비디오 생성. 연구 프로토타입과 제작 파이프라인이 같은 레이어에 붙는 구조.",
  },
  {
    en: "Rendering pipelines",
    ko: "렌더링 파이프라인",
    dd: "프로덕션 R&D. 연구 결과를 실제 제작 현장의 툴체인(Houdini · Nuke)에 통합하는 뒤쪽 작업.",
  },
  {
    en: "Knowledge OS",
    ko: "지식 운영 시스템",
    dd: "Obsidian(PARA) 기반 에이전틱 운용 시스템. 스케줄 + 웹훅 + Git + Telegram + Cloudflare로 엮은 1인 R&D 쿼시-조직.",
  },
  {
    en: "Editorial surfaces",
    ko: "편집 · 브랜드 서피스",
    dd: "minhanr.dev 같은 단일-작업자 브랜드 면. 연구 결과물을 읽히는 페이지로 바꿔 배포하는 뒤쪽 작업.",
  },
  {
    en: "Research & Reports",
    ko: "리서치 · 리포트",
    dd: "주간 동향 합성 · 공개 글. 실무에서 뽑은 신호를 구조화해 재사용 가능한 형태로 정리.",
  },
];

function CapabilitiesSlide() {
  return (
    <section
      data-slide
      className={`slide hairline-t relative mx-auto flex w-full max-w-[1100px] flex-col justify-center px-6 sm:px-10 ${SLIDE_PB}`}
    >
      <header className="mb-10 flex flex-col gap-3 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="kicker mb-3">Capabilities · 02</p>
          <h2
            className="font-display italic leading-[1.05] tracking-[-0.025em] text-foreground"
            style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)" }}
          >
            Six threads, one operator.
          </h2>
        </div>
        <p className="font-technical max-w-xs text-[11.5px] uppercase tracking-[0.18em] text-muted-foreground sm:text-right">
          서로 다른 분야가 한 사람의 손 안에서 서로를 조형한다.
        </p>
      </header>
      <dl className="hairline-t hairline-b divide-y divide-[var(--hairline)]">
        {CAPABILITIES.map((c) => (
          <div
            key={c.en}
            className="grid gap-2 py-5 sm:grid-cols-[200px_1fr] sm:gap-10 sm:py-6"
          >
            <dt className="space-y-1">
              <div className="text-[14.5px] text-foreground">{c.en}</div>
              <div className="font-technical text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
                {c.ko}
              </div>
            </dt>
            <dd className="text-[14.5px] leading-[1.75] text-foreground/85 sm:text-[15.5px]">
              {c.dd}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

// ─── 03 Stack ────────────────────────────────────────────────────

const STACK: Array<{ label: string; items: string[] }> = [
  { label: "Language", items: ["TypeScript", "Python", "Go", "Rust (probe)"] },
  { label: "Frameworks", items: ["Next.js 16", "React 19", "Tailwind v4", "shadcn/ui"] },
  {
    label: "Infra · Delivery",
    items: ["Cloudflare Workers + R2", "Vercel", "Supabase", "GitHub Actions"],
  },
  { label: "Craft · DCC", items: ["Houdini", "Nuke", "Blender", "DaVinci Resolve"] },
  {
    label: "AI · Research",
    items: ["Claude (Opus / Haiku)", "MCP servers", "CUDA · PyTorch", "3DGS · Diffusion"],
  },
  {
    label: "Knowledge",
    items: ["Obsidian (PARA)", "TrinityX (RT×3)", "Telegram 3-bot", "OIKBAS Vault"],
  },
];

function StackSlide() {
  return (
    <section
      data-slide
      className={`slide hairline-t relative mx-auto flex w-full max-w-[1200px] flex-col justify-center px-6 sm:px-10 ${SLIDE_PB}`}
    >
      <header className="mb-10 flex flex-col gap-3 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="kicker mb-3">Stack · 03</p>
          <h2
            className="font-display italic leading-[1.05] tracking-[-0.025em] text-foreground"
            style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)" }}
          >
            Tools chosen for end-to-end control.
          </h2>
        </div>
        <p className="font-technical max-w-xs text-[11.5px] uppercase tracking-[0.18em] text-muted-foreground sm:text-right">
          연구 → 제작 → 배포를 한 생산자 안에서 일관되게.
        </p>
      </header>
      <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
        {STACK.map((group) => (
          <div key={group.label}>
            <p className="font-technical mb-3 text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">
              {group.label}
            </p>
            <ul className="space-y-1.5 text-[14px] leading-[1.65] text-foreground/85 sm:text-[15px]">
              {group.items.map((tool) => (
                <li key={tool} className="before:mr-2 before:text-primary before:content-['·']">
                  {tool}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── 04 Process ──────────────────────────────────────────────────

const PROCESS: Array<{ n: string; en: string; ko: string; dd: string }> = [
  {
    n: "01",
    en: "Acquisition",
    ko: "수집",
    dd: "논문 · 트렌드 · 현장 신호를 6개 도메인에 걸쳐 매일. RT-1 슬롯이 Opus 품질로 일 13회.",
  },
  {
    n: "02",
    en: "Convergence",
    ko: "수렴",
    dd: "수집한 raw 신호를 주 · 분기 단위로 합성. 클러스터 ≥ 5 → mature → 프로젝트 제안 또는 블로그 초안.",
  },
  {
    n: "03",
    en: "Shipping",
    ko: "배포",
    dd: "코드는 GitHub → Vercel · Cloudflare, 글은 vault → GHA → minhanr.dev. 배포 자체를 에이전트가 담당.",
  },
  {
    n: "04",
    en: "Reflection",
    ko: "회고",
    dd: "매주 내 판단 · 피드백 · git 신호를 다음 사이클의 가중치로 주입. 피드백 루프가 설계의 일부.",
  },
];

function ProcessSlide() {
  return (
    <section
      data-slide
      className={`slide hairline-t relative mx-auto flex w-full max-w-[1100px] flex-col justify-center px-6 sm:px-10 ${SLIDE_PB}`}
    >
      <header className="mb-10 flex flex-col gap-3 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="kicker mb-3">Process · 04</p>
          <h2
            className="font-display italic leading-[1.05] tracking-[-0.025em] text-foreground"
            style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)" }}
          >
            Acquisition → Convergence → Shipping → Reflection.
          </h2>
        </div>
        <p className="font-technical max-w-xs text-[11.5px] uppercase tracking-[0.18em] text-muted-foreground sm:text-right">
          TrinityX 루프 — 매주 돌아가는 4-step.
        </p>
      </header>
      <ol className="hairline-t hairline-b divide-y divide-[var(--hairline)]">
        {PROCESS.map((p) => (
          <li
            key={p.n}
            className="grid grid-cols-[auto_1fr] gap-5 py-6 sm:grid-cols-[auto_200px_1fr] sm:gap-10"
          >
            <span className="font-display shrink-0 text-[32px] italic leading-none tabular-nums text-primary sm:text-[40px]">
              {p.n}
            </span>
            <div className="space-y-1 sm:contents">
              <div className="space-y-1">
                <div className="text-[14.5px] text-foreground">{p.en}</div>
                <div className="font-technical text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
                  {p.ko}
                </div>
              </div>
              <p className="text-[14.5px] leading-[1.75] text-foreground/85 sm:text-[15.5px]">
                {p.dd}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

// ─── 05 Engagement ───────────────────────────────────────────────

const TAKES: Array<{ yes: string; detail: string }> = [
  {
    yes: "AI 에이전트 시스템 설계",
    detail: "멀티-에이전트 오케스트레이션 · MCP 서버 · 거버넌스 레이어.",
  },
  {
    yes: "VFX · 디퓨전 R&D",
    detail: "연구 결과를 제작 파이프라인에 결합하는 프로토타입.",
  },
  {
    yes: "에디토리얼 · 브랜드 서피스",
    detail: "출판에 가까운 작업자 개인 사이트. 이 페이지 같은 것.",
  },
];
const SKIPS = [
  "마케팅 카피 · SEO 대행",
  "단순 쇼핑몰 · CRUD 웹",
  "NDA로 블랙박스가 되는 프로젝트",
];

function EngagementSlide() {
  return (
    <section
      data-slide
      className={`slide hairline-t relative mx-auto flex w-full max-w-[1100px] flex-col justify-center px-6 sm:px-10 ${SLIDE_PB}`}
    >
      <header className="mb-10">
        <p className="kicker mb-3">Engagement · 05</p>
        <h2
          className="font-display italic leading-[1.05] tracking-[-0.025em] text-foreground"
          style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)" }}
        >
          Scope first, conversation after.
        </h2>
      </header>

      <div className="grid gap-x-12 gap-y-10 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-8">
          <div>
            <p className="font-technical mb-4 text-[10.5px] uppercase tracking-[0.18em] text-primary">
              What I take on
            </p>
            <dl className="space-y-4">
              {TAKES.map((t) => (
                <div key={t.yes}>
                  <dt className="text-[15px] text-foreground sm:text-[16.5px]">{t.yes}</dt>
                  <dd className="mt-0.5 text-[13.5px] leading-[1.6] text-muted-foreground sm:text-[14.5px]">
                    {t.detail}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <p className="font-technical mb-3 text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">
              Not a fit
            </p>
            <ul className="space-y-1 text-[13.5px] text-muted-foreground sm:text-[14.5px]">
              {SKIPS.map((s) => (
                <li key={s} className="before:mr-2 before:content-['×']">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <aside className="self-start rounded-sm border border-[var(--hairline)] bg-[var(--card)]/50 p-6 backdrop-blur-sm sm:p-8">
          <p className="font-technical mb-4 text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">
            Get in touch
          </p>
          <div className="space-y-3 text-[14.5px] sm:text-[15.5px]">
            <div>
              <span className="font-technical mr-3 inline-block w-[64px] text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
                Email
              </span>
              <a
                href={`mailto:${BRAND_CONTACT.email}`}
                className="text-foreground underline decoration-[var(--hairline)] underline-offset-4 hover:decoration-primary"
              >
                {BRAND_CONTACT.email}
              </a>
            </div>
            <div>
              <span className="font-technical mr-3 inline-block w-[64px] text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
                GitHub
              </span>
              <a
                href={BRAND_CONTACT.github}
                target="_blank"
                rel="noreferrer"
                className="text-foreground underline decoration-[var(--hairline)] underline-offset-4 hover:decoration-primary"
              >
                {BRAND_CONTACT.github.replace(/^https?:\/\//, "")}
              </a>
            </div>
            <div>
              <span className="font-technical mr-3 inline-block w-[64px] text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
                Writing
              </span>
              <Link
                href="/blog"
                className="text-foreground underline decoration-[var(--hairline)] underline-offset-4 hover:decoration-primary"
              >
                /blog
              </Link>
            </div>
          </div>
          <p className="mt-6 text-[12.5px] leading-[1.65] text-muted-foreground">
            협업 문의는 이메일로. 프로젝트 개요 · 기간 · 예상 예산 한 줄씩이면 48시간 내 답장.
          </p>
        </aside>
      </div>
    </section>
  );
}
