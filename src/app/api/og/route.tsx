import { ImageResponse } from "@vercel/og";
import { BRAND_TOKENS, BRAND_IDENTITY } from "@/lib/brand/tokens";

export const runtime = "edge";

/**
 * OG image — Editorial Cinematic.
 *
 *   Variant A (site):  large wordmark + role + accent bar.
 *   Variant B (note):  eyebrow + title + date.
 *
 * Colors from BRAND_TOKENS only (single source of truth mirroring the
 * dark theme in globals.css).
 *
 *   /api/og                 → site
 *   /api/og?title=Foo       → note (title=Foo)
 *   /api/og?variant=note    → note (empty fallback)
 */

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const explicitVariant = searchParams.get("variant");
  const title = searchParams.get("title");

  const isNote =
    explicitVariant === "note" || (explicitVariant !== "site" && !!title);

  if (isNote) {
    return renderNoteOG({
      title: title ?? "Untitled",
      category: searchParams.get("category"),
      date: searchParams.get("date") ?? searchParams.get("updated"),
    });
  }
  return renderSiteOG();
}

// ── Variant A ──────────────────────────────────────────────────────
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
          padding: "88px 96px",
          fontFamily: "serif",
          position: "relative",
        }}
      >
        {/* Vermilion accent bar — brand signature */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 96,
            width: 4,
            height: 160,
            backgroundColor: BRAND_TOKENS.primary,
          }}
        />

        {/* Top eyebrow */}
        <div
          style={{
            display: "flex",
            fontSize: 22,
            fontFamily: "monospace",
            color: BRAND_TOKENS.mutedForeground,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
          }}
        >
          {BRAND_IDENTITY.domain}
        </div>

        {/* Wordmark */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          <div
            style={{
              fontSize: 148,
              fontWeight: 400,
              letterSpacing: "-0.03em",
              lineHeight: 0.95,
              color: BRAND_TOKENS.foreground,
            }}
          >
            {BRAND_IDENTITY.personLatin}
          </div>
          <div
            style={{
              fontSize: 28,
              fontFamily: "sans-serif",
              color: BRAND_TOKENS.mutedForeground,
              letterSpacing: "0.04em",
            }}
          >
            {BRAND_IDENTITY.role}
          </div>
        </div>

        {/* Manifesto */}
        <div
          style={{
            display: "flex",
            fontSize: 28,
            fontFamily: "sans-serif",
            color: BRAND_TOKENS.foreground,
            opacity: 0.85,
            lineHeight: 1.35,
            maxWidth: 820,
          }}
        >
          {BRAND_IDENTITY.manifestoEn}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

// ── Variant B ──────────────────────────────────────────────────────
function renderNoteOG({
  title,
  category,
  date,
}: {
  title: string;
  category: string | null;
  date: string | null;
}) {
  const truncated = title.length > 110 ? title.slice(0, 107) + "..." : title;

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
          padding: "72px 96px",
          fontFamily: "serif",
          position: "relative",
        }}
      >
        {/* Vermilion accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 96,
            width: 4,
            height: 120,
            backgroundColor: BRAND_TOKENS.primary,
          }}
        />

        {/* Eyebrow: domain + category */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            fontSize: 20,
            fontFamily: "monospace",
            color: BRAND_TOKENS.mutedForeground,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          <span>{BRAND_IDENTITY.domain}</span>
          {category && (
            <>
              <span style={{ color: BRAND_TOKENS.primary }}>·</span>
              <span>{category}</span>
            </>
          )}
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            fontSize: 68,
            fontWeight: 400,
            color: BRAND_TOKENS.foreground,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            maxWidth: 1020,
          }}
        >
          {truncated}
        </div>

        {/* Footer: author + date */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 22,
            fontFamily: "sans-serif",
            color: BRAND_TOKENS.mutedForeground,
          }}
        >
          <span>{BRAND_IDENTITY.personLatin}</span>
          {date && (
            <span style={{ fontFamily: "monospace", letterSpacing: "0.04em" }}>
              {date}
            </span>
          )}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
