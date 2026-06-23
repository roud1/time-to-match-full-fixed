"use client"

import { motion, useReducedMotion } from "motion/react"
import type { ConnectionAuraProfile } from "@/client/lib/relationship-identity/types"
import { cn } from "@/client/lib/utils"

type ConnectionAuraProps = {
  aura: ConnectionAuraProfile
  className?: string
}

export function ConnectionAura({ aura, className }: ConnectionAuraProps) {
  const reduce = useReducedMotion()
  const showParticles = aura.particles !== "none" && !reduce

  return (
    <div
      className={cn("connection-aura", className)}
      data-rel-personality={aura.personality}
      data-rel-motion={aura.motion}
      data-rel-particles={aura.particles}
      style={
        {
          ["--rel-aura-intensity" as string]: aura.intensity,
          ["--rel-aura-chaos" as string]: aura.chaos,
        } as React.CSSProperties
      }
      aria-hidden
    >
      <div className="connection-aura__veil" />
      <motion.div
        className="connection-aura__glow"
        animate={
          reduce
            ? undefined
            : aura.motion === "flicker"
              ? { opacity: [0.35, 0.7, 0.4, 0.65, 0.35] }
              : { opacity: [0.4 * aura.intensity, 0.85 * aura.intensity, 0.4 * aura.intensity] }
        }
        transition={{
          duration: aura.motion === "flicker" ? 4 : 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      {showParticles &&
        Array.from({ length: Math.round(aura.intensity * 8) }).map((_, i) => (
          <span
            key={i}
            className="ambient-chat-bg__particle absolute w-[2px] h-[2px] rounded-full bg-white/40"
            style={{
              left: `${10 + ((i * 23) % 80)}%`,
              top: `${8 + ((i * 31) % 70)}%`,
              animationDelay: `${i * 0.6}s`,
              opacity: 0.15 + aura.intensity * 0.35,
            }}
          />
        ))}
    </div>
  )
}
