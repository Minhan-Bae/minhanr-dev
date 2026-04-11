import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAllPosts } from "@/lib/blog";
import { BRAND_IDENTITY } from "@/lib/brand/tokens";
import {
  aggregate,
  getCachedVaultIndex,
  listNotes,
  KB_HUB_HIDDEN_STATUSES,
  type VaultAggregates,
  type VaultNote,
} from "@/lib/vault-index";
import { isTier2Path } from "@/lib/vault-tiers";

// Hero atmosphere — properly licensed stock photo (Unsplash, free license).
// Tenet 4 allows licensed stock as a single concentrated visual moment.
// Subject: ocean waves, matching the brand's ocean / depth identity.
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1920&q=80&auto=format&fit=crop";

/**
 * Home — 8 blocks IA, designed against docs/brand-tenets.md.
 *
 *   1. Identity strip       — name + role + last harvest (Tenet 5)
 *   2. Manifesto            — h1 + tagline (Tenet 5: only large type moment)
 *   3. Live vault signals   — 4 tabular tiles (Tenet 1)
 *   4. Now growing          — recent_growing notes (Tenet 2: garage door open)
 *   5. Wander the garden    — 4 sub-garden entry points (Tenet 3)
 *   6. Recently published   — 3 latest posts (linear feed, demoted)
 *   7. The system           — one paragraph + /colophon link
 *   8. Footer               — owned by (public)/layout.tsx
 *
 * The home is an INDEX, not a landing. No external stock images, no hero
 * larger than the integrated h1 scale. Visual impact comes from data.
 */

interface HomeData {
  /** Aggregated vault index, or null if fetch failed (no token, network, etc.) */
  agg: VaultAggregates | null;
  /** Recent growing notes (from agg.recent_growing if available) */
  recentGrowing: VaultNote[];
  /** Recently modified non-published vault notes (fallback for "Now growing") */
  recentNotes: VaultNote[];
}

async function loadHomeData(): Promise<HomeData> {
  try {
    const index = await getCachedVaultIndex();
    const agg = aggregate(index);
    // CRITICAL: filter by Tier 2 whitelist path before exposing on the
    // public home. The vault index contains EVERYTHING — including
    // 030_Areas/034_Finance/ (insider scans) and 010_Daily/ (private logs)
    // — and `recent_growing` only filters by status, not by path.
    // The middleware at src/lib/supabase-middleware.ts uses the same
    // `isTier2Path` check; this is the same single source of truth.
    const recentGrowing = agg.recent_growing
      .filter((n) => isTier2Path(n.path))
      .slice(0, 4);
    // Fallback pool: most recent non-published notes within Tier 2.
    // Pull more than needed, then filter, then trim — `listNotes` itself
    // doesn't expose a path-prefix-OR matcher beyond a single `folder`.
    const { notes: rawRecent } = listNotes(index, {
      excludeStatus: [...KB_HUB_HIDDEN_STATUSES],
      sort: "created_desc",
      limit: 40,
    });
    const recentNotes = rawRecent
      .filter((n) => isTier2Path(n.path))
      .slice(0, 4);
    return { agg, recentGrowing, recentNotes };
  } catch {
    // Vault index unreachable (no GITHUB_TOKEN, network error, etc.).
    // Render the page without vault signals — Tenet 1 says label the
    // placeholder explicitly rather than committing a lie.
    return { agg: null, recentGrowing: [], recentNotes: [] };
  }
}

function formatRelative(iso: string | null | undefined): string {
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const diffMs = Date.now() - then;
  const hours = Math.floor(diffMs / 3_600_000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function vaultPathToHref(path: string): string {
  // Vault paths are stored without leading slash; /notes/[...path] expects
  // URL-encoded segments.
  return "/notes/" + path.split("/").map(encodeURIComponent).join("/");
}

export default async function Home() {
  const allPosts = getAllPosts();
  const recentPosts = allPosts.slice(0, 3);
  const { agg, recentGrowing, recentNotes } = await loadHomeData();

  // "Now growing" prefers explicit status=growing notes, falls back to most
  // recent non-published notes if the growing pool is empty (Tenet 2).
  const growingDisplay = recentGrowing.length > 0 ? recentGrowing : recentNotes;

  // Vault stat tiles (Tenet 1: live data, no hardcoded counts)
  const vaultNoteCount = agg?.total_notes ?? null;
  const lastHarvest = formatRelative(agg?.last_full_scan ?? null);

  return (
    <>
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. Identity strip — hairline, no hero (Tenet 5)               */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
        <section className="flex items-center justify-between border-b border-[var(--hairline)] py-6 text-xs text-muted-foreground">
          <div className="font-mono tracking-wide">
            {BRAND_IDENTITY.person} · {BRAND_IDENTITY.role}
          </div>
          <div className="font-mono tabular-nums">
            last harvest <span className="text-foreground">{lastHarvest}</span>
          </div>
        </section>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. Manifesto — full-bleed hero, the page's single visual      */}
      {/*    moment per Tenet 5. Stock ocean photo (Tenet 4 licensed)   */}
      {/*    + dark gradient overlays for text legibility + SVG wave    */}
      {/*    parallax for motion. Three layers compose into "ocean      */}
      {/*    photographed once, moving forever".                         */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section className="relative w-full overflow-hidden">
        {/* Optimized hero image (next/image priority + AVIF/WebP) */}
        <Image
          src={HERO_IMAGE}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover -z-10"
        />

        {/* Dark gradient overlays — vertical legibility + horizontal vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background -z-0" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-background/30 to-transparent -z-0" />

        {/* SVG wave parallax — bottom-anchored motion on top of the photo */}
        <OceanWaves />

        <div className="relative z-10 mx-auto w-full max-w-5xl px-4 sm:px-6 py-24 sm:py-36">
          <div className="space-y-6 max-w-2xl">
            <h1
              className="font-bold tracking-tight leading-[1.05] text-white drop-shadow-lg text-gradient"
              style={{ fontSize: "var(--font-size-h1)" }}
            >
              {BRAND_IDENTITY.person}
            </h1>
            <p
              className="text-white/90 leading-relaxed drop-shadow"
              style={{ fontSize: "var(--font-size-body-lg)" }}
            >
              I garden{" "}
              <span className="font-mono text-primary">
                {BRAND_IDENTITY.domain}
              </span>{" "}
              — a public notebook kept live by seven agents, with the door open.
            </p>
            <p className="text-sm text-white/70 leading-relaxed drop-shadow">
              AI 연구자. 수집·수렴·확산을 매일 자동화하며, 중간 과정을 그대로
              흘려보냅니다.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. Live vault signals — 4 tabular tiles (Tenet 1)             */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section className="border-y border-[var(--hairline)] py-8 sm:py-10">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-6">
          Vault signals
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <Signal
            label="Notes"
            value={vaultNoteCount !== null ? String(vaultNoteCount) : "—"}
          />
          <Signal label="Posts" value={String(allPosts.length)} />
          <Signal label="Agents" value="7" />
          <Signal label="Last harvest" value={lastHarvest} />
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 4. Now growing — the heart of PKM-as-brand (Tenet 2)          */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16">
        <div className="flex items-baseline justify-between mb-6">
          <h2
            className="font-semibold tracking-tight"
            style={{ fontSize: "var(--font-size-h3)" }}
          >
            Now growing
          </h2>
          <span className="text-xs text-muted-foreground font-mono">
            garage door open
          </span>
        </div>

        {growingDisplay.length > 0 ? (
          <ul className="space-y-3">
            {growingDisplay.map((note) => (
              <li key={note.path}>
                <Link
                  href={vaultPathToHref(note.path)}
                  className="group flex items-start gap-4 py-3 border-b border-[var(--hairline)] transition-colors hover:border-primary/30"
                >
                  <StateBadge status={note.status ?? null} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                      {note.title}
                    </div>
                    {typeof note.summary === "string" && note.summary && (
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {note.summary}
                      </div>
                    )}
                  </div>
                  <time className="text-xs font-mono text-muted-foreground/70 whitespace-nowrap pt-0.5">
                    {formatRelative(note.created)}
                  </time>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            {agg === null
              ? "vault index unreachable — placeholder until token / data flow restored."
              : "nothing growing right now."}
          </p>
        )}
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 5. Wander the garden — sub-garden entry points (Tenet 3)      */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section className="border-t border-[var(--hairline)] py-12 sm:py-16">
        <div className="flex items-baseline justify-between mb-6">
          <h2
            className="font-semibold tracking-tight"
            style={{ fontSize: "var(--font-size-h3)" }}
          >
            Wander the garden
          </h2>
          <span className="text-xs text-muted-foreground font-mono">
            no chronology, just rooms
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[var(--hairline)]">
          <Entry
            href="/blog"
            label="Blog"
            count={allPosts.length}
            note="recently published"
          />
          <Entry
            href="/papers"
            label="Papers"
            count={agg?.by_research_category ? Object.values(agg.by_research_category).reduce((a, b) => a + b, 0) : null}
            note="research notes"
          />
          <Entry
            href="/projects"
            label="Projects"
            count={null}
            note="R&D logs"
          />
          <Entry
            href="/colophon"
            label="Colophon"
            count={null}
            note="how this is built"
          />
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 6. Recently published — linear feed, demoted to 2nd class     */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16">
        <div className="flex items-baseline justify-between mb-6">
          <h2
            className="font-semibold tracking-tight"
            style={{ fontSize: "var(--font-size-h3)" }}
          >
            Recently published
          </h2>
          <Link
            href="/blog"
            className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 group font-mono"
          >
            wander all posts
            <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
        <ul className="space-y-3">
          {recentPosts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="group flex items-start gap-4 py-3 border-b border-[var(--hairline)] transition-colors hover:border-primary/30"
              >
                <time className="text-xs font-mono text-muted-foreground/70 tabular-nums pt-0.5 whitespace-nowrap">
                  {post.date}
                </time>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {post.title}
                  </div>
                  {post.summary && (
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {post.summary}
                    </div>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 7. The system — one paragraph, links to /colophon             */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section className="border-t border-[var(--hairline)] py-12 sm:py-16">
        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
          How this site is gardened — seven agents on three axes (acquisition,
          convergence, amplification), publishing through GitHub Actions into a
          Next.js public surface. The system is named OIKBAS internally; the
          full story is in the{" "}
          <Link href="/colophon" className="text-primary hover:underline">
            colophon
          </Link>
          .
        </p>
      </section>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────

/**
 * OceanWaves — 3 parallax SVG wave layers anchored to the bottom of the
 * parent. Each layer is a 2× wide SVG path that translates by -50% to loop.
 *
 * Why SVG and not a video file:
 *   - Self-made, no asset payload (a few KB inline vs 500KB-3MB MP4/GIF)
 *   - Theme-aware: fills come from CSS variables (--primary, --accent),
 *     so dark/light/gray themes get coherent colors automatically
 *   - Scales to any viewport without quality loss
 *   - prefers-reduced-motion respected (animation: none in globals.css)
 *
 * If a literal video file is wanted later, swap this component for a
 * <video autoplay loop muted playsinline poster="..."> in /public.
 */
function OceanWaves() {
  // Path is 2400 wide (2× viewBox cycle). 4 cubic curves form 2 full waves;
  // start and end Y both = 100, so translate -50% loops seamlessly.
  const wavePath =
    "M0,100 C200,40 400,40 600,100 C800,160 1000,160 1200,100 " +
    "C1400,40 1600,40 1800,100 C2000,160 2200,160 2400,100 " +
    "L2400,200 L0,200 Z";

  return (
    <div
      aria-hidden
      className="absolute inset-x-0 bottom-0 h-40 sm:h-56 pointer-events-none"
    >
      {/* Each layer is a wide SVG that translates horizontally to loop.
          width 200% so the -50% translate cycles one full path width. */}
      <svg
        className="ocean-wave-back absolute inset-0 h-full"
        width="200%"
        viewBox="0 0 2400 200"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d={wavePath} fill="var(--primary)" opacity={0.18} />
      </svg>
      <svg
        className="ocean-wave-mid absolute inset-x-0 bottom-0 h-[80%]"
        width="200%"
        viewBox="0 0 2400 200"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d={wavePath} fill="var(--primary)" opacity={0.24} />
      </svg>
      <svg
        className="ocean-wave-front absolute inset-x-0 bottom-0 h-[60%]"
        width="200%"
        viewBox="0 0 2400 200"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d={wavePath} fill="var(--accent)" opacity={0.20} />
      </svg>
    </div>
  );
}

function Signal({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div
        className="font-mono font-semibold text-foreground tabular-nums tracking-tight"
        style={{ fontSize: "var(--font-size-h3)" }}
      >
        {value}
      </div>
      <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mt-1">
        {label}
      </div>
    </div>
  );
}

function Entry({
  href,
  label,
  count,
  note,
}: {
  href: string;
  label: string;
  count: number | null;
  note: string;
}) {
  return (
    <Link
      href={href}
      className="group bg-background hover:bg-[var(--surface-1)] p-6 transition-colors flex flex-col gap-2"
    >
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
          {label}
        </span>
        {count !== null && (
          <span className="text-xs font-mono tabular-nums text-muted-foreground">
            {count}
          </span>
        )}
      </div>
      <span className="text-xs text-muted-foreground/70">{note}</span>
    </Link>
  );
}

function StateBadge({ status }: { status: string | null }) {
  // Color resolver mirrors the OG route's stateColor() — keeps state visual
  // consistency across home and OG. State tokens defined in globals.css.
  let colorVar = "var(--muted-foreground)";
  let label = status ?? "note";
  switch (status) {
    case "growing":
    case "draft":
    case "seedling":
      colorVar = "var(--state-growing)";
      label = status ?? "growing";
      break;
    case "mature":
    case "evergreen":
      colorVar = "var(--state-mature)";
      label = status ?? "mature";
      break;
    case "published":
    case "archived":
      colorVar = "var(--state-published)";
      label = status ?? "published";
      break;
  }
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border whitespace-nowrap mt-0.5"
      style={{ borderColor: colorVar, color: colorVar }}
    >
      <span
        className="inline-block w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: colorVar }}
      />
      {label}
    </span>
  );
}
