"use client"

import { motion, useReducedMotion } from "motion/react"

const orbs = [
  {
    className: "top-[-12%] left-[8%] w-[min(90vw,520px)] h-[min(90vw,520px)] bg-pink-500/25",
    animate: { x: [0, 40, -20, 0], y: [0, 30, 50, 0], scale: [1, 1.08, 0.95, 1] },
    duration: 22,
  },
  {
    className: "top-[35%] right-[-10%] w-[min(85vw,480px)] h-[min(85vw,480px)] bg-purple-600/20",
    animate: { x: [0, -50, -20, 0], y: [0, -40, 20, 0], scale: [1.05, 0.92, 1.1, 1.05] },
    duration: 26,
  },
  {
    className: "bottom-[-15%] left-[20%] w-[min(95vw,560px)] h-[min(95vw,560px)] bg-rose-500/15",
    animate: { x: [0, 30, 60, 0], y: [0, -30, -10, 0], scale: [0.95, 1.05, 1, 0.95] },
    duration: 28,
  },
  {
    className: "top-[55%] left-[-8%] w-[min(70vw,380px)] h-[min(70vw,380px)] bg-fuchsia-600/12",
    animate: { x: [0, 25, -15, 0], y: [0, 20, -25, 0], scale: [1, 1.12, 0.98, 1] },
    duration: 24,
  },
] as const

export function SiteBackground() {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
      aria-hidden
    >
      {/* Base mesh gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 100% 70% at 50% -15%, rgba(236, 72, 153, 0.22) 0%, transparent 55%),
            radial-gradient(ellipse 60% 50% at 95% 40%, rgba(168, 85, 247, 0.16) 0%, transparent 50%),
            radial-gradient(ellipse 55% 45% at 5% 75%, rgba(244, 114, 182, 0.12) 0%, transparent 45%),
            linear-gradient(165deg, #050508 0%, #0a0a10 35%, #08080e 65%, #06060a 100%)
          `,
        }}
      />

      {/* Slow rotating aurora */}
      <motion.div
        className={`absolute inset-[-50%] opacity-40 ${reduceMotion ? "" : "site-bg-aurora"}`}
        style={{
          background:
            "conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(236,72,153,0.15) 60deg, transparent 120deg, rgba(168,85,247,0.12) 200deg, transparent 280deg)",
        }}
      ></motion.div>

      {/* Floating orbs */}
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full blur-[100px] ${orb.className}`}
          animate={reduceMotion ? undefined : orb.animate}
          transition={
            reduceMotion
              ? undefined
              : { duration: orb.duration, repeat: Infinity, ease: "easeInOut" }
          }
        />
      ))}

      {/* Perspective grid */}
      <div className="absolute inset-0 site-bg-grid" />

      {/* Sparkles */}
      <div className="absolute inset-0 site-bg-stars" />

      {/* Vignette + film grain */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_85%_75%_at_50%_45%,transparent_0%,rgba(5,5,8,0.35)_65%,rgba(5,5,8,0.9)_100%)]" />
      <div className="absolute inset-0 site-bg-noise" />
    </motion.div>
  )
}
