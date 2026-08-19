"use client"

import Link from "next/link"
import { motion } from "motion/react"

export default function NotFound() {
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
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient glow */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 60% 40% at 50% 30%, rgba(247,37,133,0.08), transparent 65%)",
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ position: "relative", zIndex: 1 }}
      >
        {/* 404 in serif */}
        <div style={{
          fontFamily: "Georgia,'Times New Roman',serif",
          fontSize: "clamp(80px,20vw,160px)",
          fontWeight: 700,
          lineHeight: 0.9,
          letterSpacing: "-0.05em",
          background: "linear-gradient(135deg,#f72585,#b5179e,#7209b7)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          marginBottom: "1.5rem",
        }}>404</div>

        <p style={{
          fontSize: "1.1rem",
          fontWeight: 600,
          color: "#f5f5f7",
          marginBottom: "0.75rem",
          letterSpacing: "-0.02em",
        }}>
          Эта страница истекла.
        </p>
        <p style={{
          fontSize: "0.875rem",
          color: "rgba(245,245,247,0.45)",
          marginBottom: "2rem",
          fontStyle: "italic",
          fontFamily: "Georgia,serif",
        }}>
          Как и все хорошие вещи.
        </p>

        <Link
          href="/"
          style={{
            display: "inline-block",
            padding: "12px 28px",
            background: "linear-gradient(135deg,#f72585,#b5179e,#7209b7)",
            color: "#fff",
            borderRadius: "9999px",
            fontWeight: 600,
            fontSize: "0.875rem",
            textDecoration: "none",
            boxShadow: "0 4px 20px rgba(247,37,133,0.35)",
          }}
        >
          На главную
        </Link>
      </motion.div>
    </main>
  )
}
