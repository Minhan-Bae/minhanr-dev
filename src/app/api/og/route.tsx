import { ImageResponse } from "@vercel/og";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title");

  // Dynamic mode: blog post OG with title
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
            backgroundColor: "#0a0a0a",
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
                  border: "2px solid #60a5fa",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#60a5fa",
                  fontSize: "18px",
                  fontWeight: "bold",
                }}
              >
                O
              </div>
              <span style={{ fontSize: "20px", color: "#60a5fa", fontWeight: "600" }}>
                OIKBAS Blog
              </span>
            </div>
            <span
              style={{
                fontSize: "48px",
                fontWeight: "bold",
                color: "#ffffff",
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
            <span style={{ fontSize: "16px", color: "#737373" }}>
              minhanr.dev/blog
            </span>
            <span style={{ fontSize: "16px", color: "#525252" }}>·</span>
            <span style={{ fontSize: "16px", color: "#737373" }}>
              AI · VFX · Creative Technology
            </span>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  // Default mode: OIKBAS Command Center
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
          backgroundColor: "#0a0a0a",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              border: "3px solid #60a5fa",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#60a5fa",
              fontSize: "24px",
              fontWeight: "bold",
            }}
          >
            O
          </div>
          <span
            style={{
              fontSize: "48px",
              fontWeight: "bold",
              color: "#ffffff",
            }}
          >
            OIKBAS
          </span>
        </div>
        <span
          style={{
            fontSize: "24px",
            color: "#60a5fa",
            marginBottom: "32px",
          }}
        >
          Command Center
        </span>
        <div
          style={{
            display: "flex",
            gap: "32px",
            marginBottom: "24px",
          }}
        >
          {[
            { label: "수집", color: "#4ade80" },
            { label: "수렴", color: "#60a5fa" },
            { label: "확산", color: "#a78bfa" },
          ].map((axis) => (
            <div
              key={axis.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
              }}
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
                <span style={{ color: axis.color, fontSize: "14px", fontWeight: "bold" }}>
                  --
                </span>
              </div>
              <span style={{ color: axis.color, fontSize: "14px" }}>
                {axis.label}
              </span>
            </div>
          ))}
        </div>
        <span
          style={{
            fontSize: "16px",
            color: "#737373",
          }}
        >
          7 AI Agents · 3-Axis Orchestration · minhanr.dev
        </span>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
