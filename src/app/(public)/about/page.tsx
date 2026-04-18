import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { BRAND_IDENTITY } from "@/lib/brand/tokens";

export const metadata: Metadata = {
  title: "소개",
  description: `${BRAND_IDENTITY.domain} — ${BRAND_IDENTITY.roleKo}.`,
  openGraph: {
    title: `About — ${BRAND_IDENTITY.studio}`,
    description: BRAND_IDENTITY.manifestoEn,
    images: [{ url: "/api/og", width: 1200, height: 630 }],
  },
};

export default function AboutPage() {
  return (
    <>
      {/* ─── Masthead ──────────────────────────────────────────────── */}
      <section className="relative mx-auto w-full max-w-[1440px] px-6 pt-20 pb-12 sm:px-10 sm:pt-28">
        <div
          aria-hidden
          className="absolute left-6 top-20 h-20 w-[3px] bg-primary sm:left-10 sm:top-28"
        />
        <div className="ml-8 sm:ml-12">
          <p className="kicker mb-5">소개 · About</p>
          <h1
            className="font-display leading-[1.05] tracking-[-0.03em]"
            style={{ fontSize: "var(--font-size-display)" }}
          >
            {BRAND_IDENTITY.studio}
            <span className="text-muted-foreground">.dev</span>
          </h1>
          <p className="mt-6 font-technical text-[15px] text-muted-foreground sm:text-base">
            {BRAND_IDENTITY.roleKo}
          </p>
        </div>
      </section>

      {/* ─── Bio ──────────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-[900px] px-6 py-16 sm:px-10 sm:py-20">
        <div className="space-y-8 text-[16px] leading-[1.85] text-foreground/90 sm:text-[17px]">
          <p className="drop-cap">
            {BRAND_IDENTITY.studio}.dev는 AI와 기계 사이에 앉는 도구를
            설계하고 만드는 작은 스튜디오입니다. 인공지능 연구 시스템,
            VFX 파이프라인, 그리고 지금 읽고 계신 이것과 같은 에디토리얼
            서페이스 — 역할 목록이 아니라 한 사람이 운영하는 단일 스튜디오로
            묶여 있습니다.
          </p>
          <p>
            작업은 보통 두 개의 문제를 하나로 접어 놓습니다. 좋은 연구 도구는
            동시에 프로덕션 도구이고, 좋은 프로덕션 도구는 취향을 만들고,
            좋은 취향은 결국 출시까지 갑니다. 그 세 가지가 서로 싸우지 않는
            지점에서 일합니다.
          </p>
          <p>
            글은 다른 누군가에게 구체적으로 쓸 만한 발견이 생겼을 때에만
            올립니다. 과정의 잡음보다 완성된 관점을 고르는 편이
            서로의 시간을 절약한다고 믿습니다.
          </p>
        </div>
      </section>

      {/* ─── Practice ─────────────────────────────────────────────── */}
      <section className="hairline-t mx-auto w-full max-w-[1440px] px-6 py-20 sm:px-10 sm:py-28">
        <div className="grid gap-12 sm:grid-cols-12 sm:gap-16">
          <div className="sm:col-span-4">
            <p className="kicker mb-3">실무 · Practice</p>
            <h2
              className="font-display tracking-[-0.02em]"
              style={{ fontSize: "var(--font-size-h2)" }}
            >
              세 가지 영역.
            </h2>
          </div>
          <div className="sm:col-span-8">
            <dl className="divide-y divide-[var(--hairline)] hairline-t hairline-b">
              {PRACTICE.map((p) => (
                <div
                  key={p.label}
                  className="grid gap-4 py-8 sm:grid-cols-[160px_1fr] sm:gap-10"
                >
                  <dt className="font-technical text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    {p.label}
                  </dt>
                  <dd className="text-[15px] leading-[1.8] text-foreground/90 sm:text-base">
                    {p.body}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ─── Colophon ─────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-[1440px] px-6 py-20 sm:px-10 sm:py-28">
        <div className="grid gap-12 sm:grid-cols-12 sm:gap-16">
          <div className="sm:col-span-4">
            <p className="kicker mb-3">만든 방식 · Colophon</p>
            <h2
              className="font-display tracking-[-0.02em]"
              style={{ fontSize: "var(--font-size-h2)" }}
            >
              이 사이트가 만들어진 방식.
            </h2>
          </div>
          <div className="sm:col-span-8 space-y-6 text-[15px] leading-[1.85] text-foreground/90 sm:text-base">
            <p>
              Next.js와 React로 짓고 Vercel 엣지에서 돌아갑니다. 디스플레이
              영문은 Instrument Serif, 한글은 Noto Serif KR, 본문 산세리프는
              Noto Sans KR과 Geist의 글리프 폴백 조합, 라벨과 타임스탬프는
              Geist Mono입니다.
            </p>
            <p>
              팔레트는 2026 컬러 쿼텟으로 구성했습니다 — Cloud Dancer를
              기반으로, 어두운 면은 Phthalo Green, 키라인은 Transformative
              Teal, 따뜻한 보조는 Divine Damson. 다크·라이트·그레이 테마 모두
              에서 가독성이 유지되도록 OKLCH 기반으로 직접 매핑했습니다.
            </p>
            <p>
              콘텐츠 모델은 의도적으로 보수적입니다. 모든 작업과 글은
              사람이 직접 버전 관리에 올립니다 — 공개 페이지에는 라이브
              데이터베이스가 붙지 않습니다. 드러나는 것만 드러나고, 나머지는
              스튜디오 안에 머무릅니다.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Contact ──────────────────────────────────────────────── */}
      <section className="hairline-t mx-auto w-full max-w-[1440px] px-6 py-20 sm:px-10 sm:py-28">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="kicker mb-3">연결 · Elsewhere</p>
            <p
              className="font-display leading-[1.2] tracking-[-0.02em]"
              style={{ fontSize: "var(--font-size-h2)" }}
            >
              글도 좋고, 아니어도 괜찮습니다 —<br />
              다만 작업은 꼭 봐 주세요.
            </p>
          </div>
          <ul className="font-technical flex flex-wrap gap-x-6 gap-y-3 text-[12px] uppercase tracking-[0.16em] text-muted-foreground">
            {LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noreferrer" : undefined}
                  className="group inline-flex items-center gap-2 transition-colors hover:text-foreground"
                >
                  {link.label}
                  {link.external && (
                    <ArrowUpRight
                      className="h-3.5 w-3.5 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      strokeWidth={1.5}
                    />
                  )}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

const PRACTICE = [
  {
    label: "AI 리서치",
    body:
      "에이전트 시스템, 검색·회수, 그리고 이들을 안정적으로 굴리는 덜 화려한 인프라. 제가 관심 있는 연구는 결국 프로덕션으로 가는 쪽입니다.",
  },
  {
    label: "VFX R&D",
    body:
      "파이프라인, 셰이더, 스튜디오에 투입되는 생성형 모델 통합. 좋은 VFX 도구는 아티스트가 열었을 때 자기 존재감을 지워야 한다고 생각합니다.",
  },
  {
    label: "에디토리얼 시스템",
    body:
      "실무자를 위한 웹사이트, 디자인 시스템, 출판물. 지금 보고 계신 이 사이트도 그중 하나입니다.",
  },
];

const LINKS = [
  { label: "글", href: "/blog", external: false },
  { label: "작업", href: "/work", external: false },
  { label: "GitHub", href: "https://github.com/Minhan-Bae", external: true },
  { label: "RSS", href: "/feed.xml", external: false },
];
