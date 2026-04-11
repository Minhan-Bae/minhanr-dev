import { ImageResponse } from "@vercel/og";
import { AGENTS } from "@/lib/agents";

export const runtime = "edge";

/* Palette matching globals.css OKLCH dark theme (approximate hex) */
const BG = "#0f0e1a";
const PRIMARY = "#7c6ef0";
const FG = "#eae9ed";
const MUTED = "#6a6780";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title");

  if (title) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            backgroundColor: BG,
            fontFamily: "sans-serif",
            padding: "60px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  border: `2px solid ${PRIMARY}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: PRIMARY,
                  fontSize: "18px",
                  fontWeight: "bold",
                }}
              >
                O
              </div>
              <span style={{ fontSize: "20px", color: PRIMARY, fontWeight: "600" }}>
                OIKBAS Blog
              </span>
            </div>
            <span
              style={{
                fontSize: "48px",
                fontWeight: "bold",
                color: FG,
                lineHeight: "1.2",
                maxWidth: "900px",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {title.length > 60 ? title.slice(0, 57) + "..." : title}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span style={{ fontSize: "16px", color: MUTED }}>minhanr.dev/blog</span>
            <span style={{ fontSize: "16px", color: MUTED }}>·</span>
            <span style={{ fontSize: "16px", color: MUTED }}>AI · VFX · Creative Technology</span>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: BG,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              border: `3px solid ${PRIMARY}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: PRIMARY,
              fontSize: "24px",
              fontWeight: "bold",
            }}
          >
            O
          </div>
          <span style={{ fontSize: "48px", fontWeight: "bold", color: FG }}>OIKBAS</span>
        </div>
        <span style={{ fontSize: "24px", color: PRIMARY, marginBottom: "32px" }}>
          Knowledge Hub
        </span>
        <div style={{ display: "flex", gap: "32px", marginBottom: "24px" }}>
          {[
            { label: "수집", color: "#5ba8d9" },
            { label: "수렴", color: "#d06cb0" },
            { label: "확산", color: "#d18a4e" },
          ].map((axis) => (
            <div
              key={axis.label}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}
            >
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  border: `4px solid ${axis.color}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ color: axis.color, fontSize: "14px", fontWeight: "bold" }}>--</span>
              </div>
              <span style={{ color: axis.color, fontSize: "14px" }}>{axis.label}</span>
            </div>
          ))}
        </div>
        <span style={{ fontSize: "16px", color: MUTED }}>
          {AGENTS.length} AI Agents · 3-Axis Orchestration · minhanr.dev
        </span>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
