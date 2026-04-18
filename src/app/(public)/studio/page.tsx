import type { Metadata } from "next";
import Link from "next/link";
import { BRAND_CONTACT, BRAND_IDENTITY } from "@/lib/brand/tokens";
import { TypewriterLoop } from "@/components/typewriter-loop";
import { SlideDeck } from "@/components/slide-deck";

export const metadata: Metadata = {
  title: "Studio",
  description: `${BRAND_IDENTITY.studio} — studio profile, practice areas, stack, process, and engagement.`,
  openGraph: {
    title: `Studio — ${BRAND_IDENTITY.studio}`,
    description: BRAND_IDENTITY.manifestoEn,
    images: [{ url: "/api/og?title=Studio&category=studio", width: 1200, height: 630 }],
  },
};

/**
 * /studio — five-slide public studio profile.
 *
 *   1. Masthead   — kicker `Studio № 01` + wordmark + role line
 *   2. Practice   — four practice areas (kicker + dl)
 *   3. Stack      — grouped tool grid (Language · Frameworks · Infra · Craft)
 *   4. Process    — four-step loop with numbered dl, mirroring TrinityX
 *                    (Acquisition → Convergence → Shipping → Reflection)
 *   5. Engagement — contact + what the studio takes on (and skips)
 *
 * Every slide reserves `pb-[clamp(140px,18vh,200px)]` so the four-
 * corner chrome (dock, colophon, stats, theme toggle) never covers
 * content. This matches the home / about vocabulary exactly so the
 * two surfaces feel like pages from the same publication.
 */
const SLIDE_PB = "pb-[clamp(140px,18vh,200px)]";

export default function StudioPage() {
  return (
    <SlideDeck>
      <MastheadSlide />
      <PracticeSlide />
      <StackSlide />
      <ProcessSlide />
      <EngagementSlide />
    </SlideDeck>
  );
}

// ─────────────────────────────────────────────────────────────────

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
        <p className="kicker mb-5 animate-fade-up" style={{ animationDelay: "0ms" }}>
          Studio № 01
        </p>
        <TypewriterLoop
          as="h1"
          lang="en"
          text={BRAND_IDENTITY.studio}
          typeDelay={140}
          eraseDelay={70}
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
          {BRAND_CONTACT.location} · Est. {BRAND_CONTACT.est} · {BRAND_IDENTITY.role}
        </p>
        <p
          className="mt-10 max-w-[620px] text-[15px] leading-[1.8] text-foreground/85 sm:text-[17px] sm:leading-[1.85] animate-fade-up"
          style={{ animationDelay: "480ms" }}
        >
          한 사람이 운영하는 스튜디오. 연구와 제작과 배포를 하나의 루프로 돌리는
          작업 단위. AI 에이전트, 비주얼 시스템, 지식 인프라가 한 작업자의 손
          안에서 서로를 조형한다.
        </p>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────

const PRACTICE: Array<{ dt: string; dtEn: string; dd: string }> = [
  {
    dt: "AI · 에이전트 시스템",
    dtEn: "Agent Systems",
    dd: "Claude / MCP 기반 다축 오케스트레이션. TrinityX (RT-1/2/3) · OIKBAS 커맨드 센터 · LLM 워크플로우 거버넌스.",
  },
  {
    dt: "시각 · 디퓨전 파이프라인",
    dtEn: "Diffusion & VFX",
    dd: "실사 · 3DGS · 인페인팅 · 렌더링 · 비디오 생성. 프로덕션 툴과 연구 프로토타입이 같은 파이프라인에 붙는 구조.",
  },
  {
    dt: "지식 · 자동화 인프라",
    dtEn: "Knowledge OS",
    dd: "Obsidian(PARA) 위 에이전틱 운용 시스템. 스케줄 + 웹훅 + Git + Telegram + Cloudflare로 연결된 1인 R&D 쿼시-조직.",
  },
  {
    dt: "편집 · 브랜드 서피스",
    dtEn: "Editorial Surfaces",
    dd: "minhanr.dev 같은 단일-작업자 브랜드 면. 연구 결과물을 읽히는 페이지로 바꿔 배포하는 뒤쪽 작업.",
  },
];

function PracticeSlide() {
  return (
    <section
      data-slide
      className={`slide hairline-t relative mx-auto flex w-full max-w-[1100px] flex-col justify-center px-6 sm:px-10 ${SLIDE_PB}`}
    >
      <p className="kicker mb-10">Practice · 02</p>
      <h2 className="font-display text-[32px] italic leading-[1.15] tracking-[-0.02em] text-foreground sm:text-[40px] lg:text-[48px]">
        Four threads, one loop.
      </h2>
      <dl className="mt-10 grid gap-x-10 gap-y-8 sm:mt-12 sm:grid-cols-2">
        {PRACTICE.map((p) => (
          <div key={p.dtEn} className="space-y-2">
            <dt className="font-technical flex items-baseline gap-3 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              <span className="text-foreground">{p.dtEn}</span>
              <span className="opacity-60">· {p.dt}</span>
            </dt>
            <dd className="text-[14.5px] leading-[1.75] text-foreground/85 sm:text-[15.5px]">
              {p.dd}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────

const STACK: Array<{ label: string; items: string[] }> = [
  {
    label: "Language",
    items: ["TypeScript", "Python", "Go", "Rust (probe)"],
  },
  {
    label: "Frameworks",
    items: ["Next.js 16", "React 19", "Tailwind v4", "shadcn/ui"],
  },
  {
    label: "Infra · Delivery",
    items: ["Cloudflare Workers + R2", "Vercel", "Supabase", "GitHub Actions"],
  },
  {
    label: "Craft · DCC",
    items: ["Houdini", "Nuke", "Blender", "DaVinci Resolve"],
  },
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
      <p className="kicker mb-10">Stack · 03</p>
      <h2 className="font-display text-[30px] italic leading-[1.15] tracking-[-0.02em] text-foreground sm:text-[36px] lg:text-[42px]">
        Tools chosen for end-to-end control.
      </h2>
      <div className="mt-10 grid gap-x-10 gap-y-8 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3">
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

// ─────────────────────────────────────────────────────────────────

const PROCESS: Array<{ n: string; dt: string; dtEn: string; dd: string }> = [
  {
    n: "01",
    dt: "수집",
    dtEn: "Acquisition",
    dd: "논문 · 트렌드 · 현장 신호를 6개 도메인에 걸쳐 매일 수집. RT-1이 Opus 품질로 일 13회.",
  },
  {
    n: "02",
    dt: "수렴",
    dtEn: "Convergence",
    dd: "수집한 raw 신호를 주간/분기 단위로 합성. 클러스터 ≥ 5 → mature → 프로젝트 제안 또는 블로그 초안.",
  },
  {
    n: "03",
    dt: "배포",
    dtEn: "Shipping",
    dd: "코드는 GitHub → Vercel/Cloudflare, 글은 vault → GHA → minhanr.dev. 배포 자체를 에이전트가 담당.",
  },
  {
    n: "04",
    dt: "회고",
    dtEn: "Reflection",
    dd: "매주 내 판단 · 피드백 · git 신호를 다음 사이클의 가중치로 주입. 피드백 루프가 디자인의 일부.",
  },
];

function ProcessSlide() {
  return (
    <section
      data-slide
      className={`slide hairline-t relative mx-auto flex w-full max-w-[1100px] flex-col justify-center px-6 sm:px-10 ${SLIDE_PB}`}
    >
      <p className="kicker mb-10">Process · 04</p>
      <h2 className="font-display text-[32px] italic leading-[1.15] tracking-[-0.02em] text-foreground sm:text-[40px] lg:text-[48px]">
        Acquisition → Convergence → Shipping → Reflection.
      </h2>
      <dl className="mt-10 grid gap-x-10 gap-y-8 sm:mt-12 sm:grid-cols-2">
        {PROCESS.map((p) => (
          <div key={p.n} className="flex gap-5">
            <span className="font-display shrink-0 text-[28px] italic leading-none text-primary sm:text-[32px]">
              {p.n}
            </span>
            <div className="space-y-1.5">
              <dt className="font-technical flex items-baseline gap-3 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                <span className="text-foreground">{p.dtEn}</span>
                <span className="opacity-60">· {p.dt}</span>
              </dt>
              <dd className="text-[14.5px] leading-[1.7] text-foreground/85 sm:text-[15.5px]">
                {p.dd}
              </dd>
            </div>
          </div>
        ))}
      </dl>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────

const TAKES: Array<{ yes: string; detail: string }> = [
  {
    yes: "AI 에이전트 시스템 설계",
    detail: "멀티-에이전트 오케스트레이션, MCP 서버, 거버넌스 레이어.",
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
  "단순 쇼핑몰/CRUD 웹",
  "NDA로 블랙박스가 되는 프로젝트",
];

function EngagementSlide() {
  return (
    <section
      data-slide
      className={`slide hairline-t relative mx-auto flex w-full max-w-[1100px] flex-col justify-center px-6 sm:px-10 ${SLIDE_PB}`}
    >
      <p className="kicker mb-10">Engagement · 05</p>
      <h2 className="font-display text-[32px] italic leading-[1.15] tracking-[-0.02em] text-foreground sm:text-[40px] lg:text-[48px]">
        Open to collaboration.
      </h2>

      <div className="mt-10 grid gap-x-12 gap-y-10 sm:mt-12 lg:grid-cols-[1.2fr_1fr]">
        {/* Left — takes / skips */}
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

        {/* Right — contact card */}
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
            협업 문의는 이메일로. 프로젝트 개요 · 기간 · 예상 예산 한 줄씩이면
            48시간 내 답장.
          </p>
        </aside>
      </div>
    </section>
  );
}
