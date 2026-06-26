"use client"

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react"
import { useRef } from "react"

export function AmbientLayer() {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] })
  const y1 = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 120])
  const y2 = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -80])
  const y3 = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 60])

  return (
    <div ref={ref} className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[var(--xp-base)]" />
      <motion.div
        style={{ y: y1 }}
        className="absolute -left-[20%] top-[8%] h-[55vh] w-[55vh] rounded-full bg-[radial-gradient(circle,rgba(108,92,231,0.22)_0%,transparent_68%)] blur-3xl"
      />
      <motion.div
        style={{ y: y2 }}
        className="absolute -right-[15%] top-[35%] h-[48vh] w-[48vh] rounded-full bg-[radial-gradient(circle,rgba(255,46,99,0.18)_0%,transparent_70%)] blur-3xl"
      />
      <motion.div
        style={{ y: y3 }}
        className="absolute bottom-[5%] left-[25%] h-[40vh] w-[40vh] rounded-full bg-[radial-gradient(circle,rgba(0,255,163,0.12)_0%,transparent_72%)] blur-3xl"
      />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 40%, black, transparent)",
        }}
      />
    </div>
  )
}
