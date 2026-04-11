/**
 * /now — Derek Sivers convention. A single page that says "this is what
 * I'm focused on right now". Updated whenever the vault is updated, no
 * separate maintenance ritual required.
 *
 * Brand tenets:
 *  - Tenet 1 (Live from the vault): every section reads from the vault
 *    index. No hardcoded "currently learning Rust" lies. If the vault
 *    is unreachable, render the public placeholder.
 *  - Tenet 2 (Garage door open): the centerpiece is "right now growing"
 *    — non-published vault notes that have moved recently.
 *  - Tenet 3 (Gardener, not publisher): wayfinding verbs and a final
 *    "wander the rest" CTA back to the home index.
 *  - Tenet 4 (Instruments first): no hero, no atmospheric image.
 *    Hairlines + tabular numbers + state badges.
 *  - Tenet 5 (One surface, many entries): single h1 at --font-size-h1.
 */

import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { BRAND_IDENTITY } from "@/lib/brand/tokens";
import { StateBadge } from "@/components/state-badge";
import { VaultUnreachablePublic } from "@/components/vault-unreachable";
import {
  aggregate,
  getCachedVaultIndex,
  KB_HUB_HIDDEN_STATUSES,
  listNotes,
  type VaultNote,
} from "@/lib/vault-index";
import { isTier2Path } from "@/lib/vault-tiers";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Now",
  description: `What ${BRAND_IDENTITY.person} is focused on right now — live from the vault.`,
  openGraph: {
    title: "Now",
    description: `What ${BRAND_IDENTITY.person} is focused on right now — live from the vault.`,
    type: "website",
    images: [{ url: "/api/og?title=Now", width: 1200, height: 630 }],
  },
};

export const revalidate = 300; // 5 min ISR — same cadence as the vault

const NOW_GROWING_TARGET = 5;

function vaultPathToHref(path: string): string {
  return "/notes/" + path.split("/").map(encodeURIComponent).join("/");
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

export default async function NowPage() {
  // Blog posts come from the filesystem and never throw — fetch first.
  const recentPosts = getAllPosts().slice(0, 3);

  // Vault data is the optional dependency. Wrap in try/catch and fall
  // back to a placeholder so a vault outage doesn't break the page.
  const growingDisplay: VaultNote[] = [];
  let lastHarvestIso: string | null = null;
  try {
    const index = await getCachedVaultIndex();
    const agg = aggregate(index);
    const growingTier2 = agg.recent_growing.filter((n) => isTier2Path(n.path));
    const { notes: rawRecent } = listNotes(index, {
      excludeStatus: [...KB_HUB_HIDDEN_STATUSES],
      sort: "created_desc",
      limit: 80,
    });
    const recentTier2 = rawRecent.filter((n) => isTier2Path(n.path));

    // Same merge strategy as the home page (loadHomeData) — growing
    // first, then top up from recent non-published, dedupe by path.
    const seen = new Set<string>();
    for (const note of [...growingTier2, ...recentTier2]) {
      if (seen.has(note.path)) continue;
      seen.add(note.path);
      growingDisplay.push(note);
      if (growingDisplay.length >= NOW_GROWING_TARGET) break;
    }

    lastHarvestIso =
      index._meta.last_delta_update ?? index._meta.last_full_scan ?? null;
  } catch {
    return <VaultUnreachablePublic label="Now" />;
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-16 sm:py-20 space-y-16">
      {/* ── Header ── */}
      <header className="space-y-4 border-b border-[var(--hairline)] pb-10">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          Now
        </p>
        <h1
          className="font-bold tracking-tight leading-[1.1]"
          style={{ fontSize: "var(--font-size-h1)" }}
        >
          What I&rsquo;m focused on
        </h1>
        <p
          className="text-foreground/85 leading-relaxed max-w-2xl"
          style={{ fontSize: "var(--font-size-body-lg)" }}
        >
          A live slice of the vault — updated whenever the agents touch
          something, no separate maintenance ritual.
        </p>
        <p className="text-xs font-mono text-muted-foreground tabular-nums">
          last harvest <span className="text-foreground">{formatRelative(lastHarvestIso)}</span>
        </p>
      </header>

      {/* ── Growing right now ── */}
      <section className="space-y-6">
        <div className="flex items-baseline justify-between">
          <h2
            className="font-semibold tracking-tight"
            style={{ fontSize: "var(--font-size-h3)" }}
          >
            Growing right now
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
            nothing growing right now.
          </p>
        )}
      </section>

      {/* ── Recently shipped ── */}
      <section className="space-y-6">
        <div className="flex items-baseline justify-between">
          <h2
            className="font-semibold tracking-tight"
            style={{ fontSize: "var(--font-size-h3)" }}
          >
            Recently shipped
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

      {/* ── Touch the rest ── */}
      <section className="border-t border-[var(--hairline)] pt-10 space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Past the focused slice, the rest of the garden has its own rhythm.{" "}
          <Link href="/" className="text-primary hover:underline">
            Wander the home index
          </Link>{" "}
          for the wayfinding map, or read the{" "}
          <Link href="/colophon" className="text-primary hover:underline">
            colophon
          </Link>{" "}
          for how it&rsquo;s gardened.
        </p>
      </section>
    </div>
  );
}
