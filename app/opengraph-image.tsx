import { ImageResponse } from "next/og"

export const runtime = "edge"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OgImage() {
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
          background: "#060509",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Rose ambient glow top */}
        <div style={{
          position: "absolute", top: -100, left: "50%", transform: "translateX(-50%)",
          width: 800, height: 500,
          background: "radial-gradient(ellipse, rgba(247,37,133,0.18) 0%, transparent 70%)",
        }} />
        {/* Purple glow bottom */}
        <div style={{
          position: "absolute", bottom: -100, right: 0,
          width: 600, height: 400,
          background: "radial-gradient(ellipse, rgba(114,9,183,0.14) 0%, transparent 70%)",
        }} />

        {/* 24 signature — background */}
        <div style={{
          position: "absolute",
          right: -40,
          top: "50%",
          transform: "translateY(-52%)",
          fontSize: 420,
          fontWeight: 700,
          lineHeight: 0.85,
          color: "rgba(247,37,133,0.07)",
          letterSpacing: "-0.06em",
          fontFamily: "serif",
          userSelect: "none",
        }}>24</div>

        {/* Logo */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12, marginBottom: 32,
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: "50%",
            background: "linear-gradient(135deg,#f72585,#7209b7)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{ width: 20, height: 20, background: "#fff", borderRadius: "50%" }} />
          </div>
          <span style={{
            fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em",
            background: "linear-gradient(135deg,#f72585,#b5179e,#7209b7)",
            backgroundClip: "text",
            color: "transparent",
          }}>Time to Match</span>
        </div>

        {/* Main headline */}
        <div style={{
          fontSize: 72, fontWeight: 800, letterSpacing: "-0.04em",
          lineHeight: 1.05, textAlign: "center",
          color: "#f5f5f7", maxWidth: 800,
          fontFamily: "serif",
        }}>
          Match.{" "}
          <span style={{
            background: "linear-gradient(135deg,#f72585,#b5179e)",
            backgroundClip: "text",
            color: "transparent",
          }}>24 Hours.</span>
          {" "}Or Gone.
        </div>

        {/* Subline */}
        <div style={{
          fontSize: 26, color: "rgba(245,245,247,0.55)",
          marginTop: 24, textAlign: "center",
          maxWidth: 680, lineHeight: 1.4,
        }}>
          No ghosting. No &ldquo;I&apos;ll reply tomorrow.&rdquo; Just one real day.
        </div>

        {/* Stats row */}
        <div style={{
          display: "flex", gap: 40, marginTop: 48,
        }}>
          {[["No ghosting", "possible"], ["Only real", "conversations"], ["Every moment", "counts"]].map(([a, b], i) => (
            <div key={i} style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              padding: "12px 20px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 14,
            }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: "rgba(247,37,133,0.9)" }}>{a}</span>
              <span style={{ fontSize: 13, color: "rgba(245,245,247,0.4)" }}>{b}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  )
}
