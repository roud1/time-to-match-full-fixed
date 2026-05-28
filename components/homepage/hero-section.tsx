"use client"

import { motion, useMotionValue, useSpring, useTransform } from "motion/react"
import { useEffect, useMemo, useState } from "react"

export function HeroSection() {
  const [secondsLeft, setSecondsLeft] = useState(23 * 3600 + 41 * 60 + 28)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 160, damping: 18 })
  const springY = useSpring(mouseY, { stiffness: 160, damping: 18 })
  const rotateX = useTransform(springY, [-0.5, 0.5], [8, -8])
  const rotateY = useTransform(springX, [-0.5, 0.5], [-10, 10])

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setSecondsLeft((value) => (value > 0 ? value - 1 : 23 * 3600 + 41 * 60 + 28))
    }, 1000)
    return () => window.clearInterval(intervalId)
  }, [])

  const formattedCountdown = useMemo(() => {
    const hours = String(Math.floor(secondsLeft / 3600)).padStart(2, "0")
    const minutes = String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, "0")
    const seconds = String(secondsLeft % 60).padStart(2, "0")
    return `${hours}:${minutes}:${seconds}`
  }, [secondsLeft])

  return (
    <section className="relative mx-auto w-full max-w-6xl px-5 pb-20 pt-24 md:px-8 lg:pt-28">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
        className="mx-auto flex max-w-4xl flex-col items-center"
      >
        <div className="mb-6 flex flex-wrap items-center justify-center gap-3 text-sm">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-400/10 px-4 py-1.5 text-emerald-200">
            <span className="h-2 w-2 rounded-full bg-emerald-300" />
            Live matching now
          </span>
          <span className="rounded-full border border-white/12 bg-white/5 px-4 py-1.5 text-zinc-200">
            1,284 active users
          </span>
        </div>

        <motion.article
          onMouseMove={(event) => {
            const { currentTarget, clientX, clientY } = event
            const rect = currentTarget.getBoundingClientRect()
            const px = (clientX - rect.left) / rect.width - 0.5
            const py = (clientY - rect.top) / rect.height - 0.5
            mouseX.set(px)
            mouseY.set(py)
          }}
          onMouseLeave={() => {
            mouseX.set(0)
            mouseY.set(0)
          }}
          animate={{ y: [0, -6, 0], scale: [1, 1.02, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="w-full max-w-lg rounded-[2rem] border border-white/15 bg-white/[0.07] p-5 shadow-[0_30px_80px_rgba(8,8,18,0.65)] backdrop-blur-2xl sm:p-6"
        >
          <div className="rounded-[1.5rem] border border-white/12 bg-black/20 p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 shrink-0 rounded-2xl bg-gradient-to-br from-fuchsia-400 via-pink-400 to-violet-500 p-[1px]">
                <div className="flex h-full w-full items-center justify-center rounded-2xl bg-zinc-900 text-xs font-semibold text-zinc-200">
                  AVATAR
                </div>
              </div>

              <div className="min-w-0">
                <p className="text-lg font-semibold text-white">Emma, 27</p>
                <p className="mt-1 inline-flex items-center rounded-full border border-emerald-300/25 bg-emerald-400/10 px-2.5 py-0.5 text-xs font-medium tracking-wide text-emerald-200">
                  ACTIVE MATCH
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {["Hiking", "Coffee", "Art", "Travel"].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-xs text-zinc-200"
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-fuchsia-300/25 bg-fuchsia-400/10 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.14em] text-fuchsia-200/90">Match expires in</p>
              <p className="mt-1 font-mono text-2xl font-semibold text-white">{formattedCountdown}</p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-white/15 bg-white/[0.05] text-sm font-semibold text-zinc-100 transition-transform duration-200 hover:scale-[1.02]"
              >
                Pass ✕
              </button>
              <button
                type="button"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-[#FF3D71] to-[#E954FF] text-sm font-semibold text-white shadow-[0_0_28px_rgba(255,61,113,0.35)] transition-transform duration-200 hover:scale-[1.02]"
              >
                Like ♥
              </button>
            </div>
          </div>
        </motion.article>

        <div className="mt-6 text-center">
          <p className="text-base font-medium text-zinc-100 sm:text-lg">No endless swiping</p>
          <p className="mt-1 text-sm text-zinc-300 sm:text-base">Real decisions in 24 hours</p>
        </div>
      </motion.div>
    </section>
  )
}
