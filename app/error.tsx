"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main
      style={{
        minHeight: "100dvh",
        background: "#060509",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        fontFamily: "system-ui,-apple-system,sans-serif",
        textAlign: "center",
      }}
    >
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{
          fontFamily: "Georgia,'Times New Roman',serif",
          fontSize: "clamp(60px,15vw,120px)",
          fontWeight: 700,
          lineHeight: 0.9,
          letterSpacing: "-0.05em",
          color: "rgba(247,37,133,0.4)",
          marginBottom: "1.5rem",
        }}>500</div>

        <p style={{ fontSize: "1.1rem", fontWeight: 600, color: "#f5f5f7", marginBottom: "0.75rem" }}>
          Что-то пошло не так.
        </p>
        <p style={{
          fontSize: "0.875rem",
          color: "rgba(245,245,247,0.45)",
          marginBottom: "2rem",
          fontStyle: "italic",
          fontFamily: "Georgia,serif",
        }}>
          Мы уже чиним. Попробуй ещё раз.
        </p>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={reset}
            style={{
              padding: "12px 28px",
              background: "linear-gradient(135deg,#f72585,#b5179e,#7209b7)",
              color: "#fff",
              borderRadius: "9999px",
              fontWeight: 600,
              fontSize: "0.875rem",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(247,37,133,0.35)",
            }}
          >
            Попробовать снова
          </button>
          <Link
            href="/"
            style={{
              display: "inline-block",
              padding: "12px 28px",
              background: "rgba(255,255,255,0.05)",
              color: "rgba(245,245,247,0.7)",
              borderRadius: "9999px",
              fontWeight: 500,
              fontSize: "0.875rem",
              textDecoration: "none",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            На главную
          </Link>
        </div>
      </div>
    </main>
  )
}
