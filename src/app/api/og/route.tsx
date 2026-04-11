import { ImageResponse } from "@vercel/og";
import { BRAND_TOKENS, BRAND_IDENTITY } from "@/lib/brand/tokens";

export const runtime = "edge";

/**
 * OG image generator — two variants:
 *
 *   Variant A (site, default): Minhan Bae + manifesto + vault signals + 3-axis arc.
 *     Used by /, /blog index, and any page that does not pass ?title=.
 *
 *   Variant B (note): title + category + status badge + updated date.
 *     Used by /blog/[slug] and any page that passes ?title=.
 *
 * Branching:
 *   - Explicit:  /api/og?variant=site   or  /api/og?variant=note
 *   - Implicit (back-compat): presence of ?title= → variant=note
 *
 * All colors come from BRAND_TOKENS (src/lib/brand/tokens.ts), the single
 * source of truth that mirrors globals.css `.dark` theme. No hardcoded hex
 * in this file — drift between OG and the live site is the bug this is
 * structured to prevent.
 *
 * Vault stat numbers below are mock placeholders. Live vault index access
 * is impossible at edge runtime; replacing them with build-injected values
 * is a planned follow-up (data/vault-stats.json automation in CI).
 * See docs/brand-tenets.md "Tenet 1: Live from the vault".
 */

// ── Mock stats (TODO: replace with build-injected data/vault-stats.json) ──
const MOCK_VAULT_NOTES = "980+";
const MOCK_BLOG_POSTS = "80+";
const MOCK_LAST_HARVEST = "today";

// State badge color resolver (Tenet 2: Garage door open)
function stateColor(status: string | null): string {
  switch (status) {
    case "growing":
    case "draft":
    case "seedling":
      return BRAND_TOKENS.stateGrowing;
    case "mature":
    case "evergreen":
      return BRAND_TOKENS.stateMature;
    case "published":
    case "archived":
      return BRAND_TOKENS.statePublished;
    default:
      return BRAND_TOKENS.mutedForeground;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const explicitVariant = searchParams.get("variant");
  const title = searchParams.get("title");

  // Branching: explicit variant takes precedence; else fall back to title presence.
  const isNoteVariant =
    explicitVariant === "note" || (explicitVariant !== "site" && !!title);

  if (isNoteVariant) {
    return renderNoteOG({
      title: title ?? "Untitled note",
      category: searchParams.get("category"),
      status: searchParams.get("status"),
      updated: searchParams.get("updated"),
    });
  }

  return renderSiteOG();
}

// ─────────────────────────────────────────────────────────────────────────
// Variant A — Site OG
// ─────────────────────────────────────────────────────────────────────────

function renderSiteOG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: BRAND_TOKENS.background,
          fontFamily: "sans-serif",
          padding: "72px 80px",
        }}
      >
        {/* ── Top: identity ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div
            style={{
              fontSize: "72px",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              lineHeight: 1,
              backgroundImage: `linear-gradient(135deg, ${BRAND_TOKENS.gradientStart}, ${BRAND_TOKENS.gradientEnd})`,
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {BRAND_IDENTITY.person}
          </div>
          <div
            style={{
              fontSize: "22px",
              fontFamily: "monospace",
              color: BRAND_TOKENS.mutedForeground,
              letterSpacing: "0.02em",
            }}
          >
            {BRAND_IDENTITY.domain}
          </div>
        </div>

        {/* ── Middle: manifesto ── */}
        <div
          style={{
            display: "flex",
            fontSize: "32px",
            color: BRAND_TOKENS.foreground,
            lineHeight: 1.35,
            maxWidth: "880px",
            fontWeight: 400,
          }}
        >
          {BRAND_IDENTITY.manifesto}
        </div>

        {/* ── Bottom: vault signals + 3-axis arc ── */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: "32px",
          }}
        >
          {/* Vault signals (3 tiles) */}
          <div style={{ display: "flex", gap: "48px" }}>
            <Stat label="Notes" value={MOCK_VAULT_NOTES} />
            <Stat label="Posts" value={MOCK_BLOG_POSTS} />
            <Stat label="Last harvest" value={MOCK_LAST_HARVEST} />
          </div>

          {/* 3-axis hairline arc (no labels — Tenet 4: Instruments over decorations) */}
          <ThreeAxisArc />
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <div
        style={{
          fontSize: "36px",
          fontFamily: "monospace",
          fontWeight: 600,
          color: BRAND_TOKENS.foreground,
          letterSpacing: "-0.01em",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: "16px",
          color: BRAND_TOKENS.mutedForeground,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
    </div>
  );
}

function ThreeAxisArc() {
  // Three concentric arc segments at 120° offsets — visualizes the 3 axes
  // (Acquisition, Convergence, Amplification) without labels. The shape
  // alone carries the meaning; words live in /colophon.
  const cx = 80;
  const cy = 80;
  const r = 64;
  const stroke = 3;

  // Helper: build an SVG arc path for a segment from startAngle to endAngle (degrees)
  function arcPath(startDeg: number, endDeg: number) {
    const startRad = (startDeg * Math.PI) / 180;
    const endRad = (endDeg * Math.PI) / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const largeArc = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
  }

  return (
    <div style={{ display: "flex" }}>
      <svg width={160} height={160} viewBox="0 0 160 160">
        {/* Acquisition — primary */}
        <path
          d={arcPath(-90, 30)}
          fill="none"
          stroke={BRAND_TOKENS.primary}
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        {/* Convergence — accent */}
        <path
          d={arcPath(30, 150)}
          fill="none"
          stroke={BRAND_TOKENS.accent}
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        {/* Amplification — published state */}
        <path
          d={arcPath(150, 270)}
          fill="none"
          stroke={BRAND_TOKENS.statePublished}
          strokeWidth={stroke}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Variant B — Note OG
// ─────────────────────────────────────────────────────────────────────────

function renderNoteOG({
  title,
  category,
  status,
  updated,
}: {
  title: string;
  category: string | null;
  status: string | null;
  updated: string | null;
}) {
  const truncatedTitle =
    title.length > 100 ? title.slice(0, 97) + "..." : title;
  const badgeColor = stateColor(status);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: BRAND_TOKENS.background,
          fontFamily: "sans-serif",
          padding: "72px 80px",
        }}
      >
        {/* ── Top: small wordmark ── */}
        <div
          style={{
            display: "flex",
            fontSize: "20px",
            fontFamily: "monospace",
            color: BRAND_TOKENS.mutedForeground,
            letterSpacing: "0.02em",
          }}
        >
          {BRAND_IDENTITY.domain}
        </div>

        {/* ── Middle: title ── */}
        <div
          style={{
            display: "flex",
            fontSize: "60px",
            fontWeight: 700,
            color: BRAND_TOKENS.foreground,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            maxWidth: "1040px",
          }}
        >
          {truncatedTitle}
        </div>

        {/* ── Bottom: status badge + category + date ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            fontSize: "20px",
          }}
        >
          {status && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 16px",
                borderRadius: "999px",
                border: `1px solid ${badgeColor}`,
                color: badgeColor,
                fontFamily: "monospace",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                fontSize: "14px",
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: badgeColor,
                }}
              />
              {status}
            </div>
          )}
          {category && (
            <div style={{ color: BRAND_TOKENS.mutedForeground }}>
              {category}
            </div>
          )}
          {updated && (
            <div
              style={{
                color: BRAND_TOKENS.mutedForeground,
                fontFamily: "monospace",
              }}
            >
              {updated}
            </div>
          )}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
