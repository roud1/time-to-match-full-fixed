"use client"

import { motion, useReducedMotion } from "motion/react"
import { useEffect, useState, type CSSProperties } from "react"
import { cn } from "@/client/lib/utils"

/** Code-only hero demo: breathing sync rings at different intensities. */
export function SyncHeroRing({ className }: { className?: string }) {
  const reduce = useReducedMotion()
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    if (reduce) return
    const id = setInterval(() => setPhase((p) => (p + 1) % 4), 4200)
    return () => clearInterval(id)
  }, [reduce])

  const demos = [
    { label: "12%", tier: "cold" as const, p: 12 },
    { label: "47%", tier: "active" as const, p: 47 },
    { label: "83%", tier: "vibrant" as const, p: 83 },
    { label: "100%", tier: "synced" as const, p: 100 },
  ]
  const active = demos[phase]

  return (
    <div className={cn("relative flex flex-col items-center", className)}>
      <div
        className={cn(
          "sync-ring sync-ring--lg w-[min(72vw,280px)] h-[min(72vw,280px)]",
          `sync-ring--${active.tier}`
        )}
        style={{ "--sync-p": active.p } as CSSProperties}
      >
        <span className="sync-ring__halo" aria-hidden />
        <span className="sync-ring__track" aria-hidden />
        <span className="sync-ring__pulse" aria-hidden />
        <div className="sync-ring__inner flex h-full w-full items-center justify-center rounded-full bg-[#050506]">
          <div
            className="w-[72%] h-[72%] rounded-full border border-white/[0.08]"
            style={{
              background:
                "radial-gradient(circle at 40% 35%, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.02) 55%, transparent 70%)",
              boxShadow: "inset 0 0 40px rgba(255,255,255,0.04)",
            }}
          />
        </div>
      </div>
      <motion.p
        key={active.label}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 text-[11px] uppercase tracking-[0.28em] text-white/45 font-extralight"
      >
        SYNC {active.label}
      </motion.p>
    </div>
  )
}
