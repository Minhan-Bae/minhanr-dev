import { ImageResponse } from "@vercel/og";

export const runtime = "edge";

export async function GET() {
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
          6 AI Agents · 3-Axis Orchestration · minhanr.dev
        </span>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
