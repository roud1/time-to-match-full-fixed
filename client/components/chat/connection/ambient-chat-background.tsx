"use client"

import { useMemo } from "react"
import { motion, useReducedMotion } from "motion/react"
import type { ChatExperience } from "@/client/lib/chat-emotional-experience"
import type { SyncMetrics } from "@/client/lib/sync-system"
import { AnimatedConnectionBackground } from "@/client/components/sync/animated-connection-background"
import { SyncAmbientField } from "@/client/components/sync/sync-ambient-field"
import { cn } from "@/client/lib/utils"

type AmbientChatBackgroundProps = {
  experience: ChatExperience
  syncMetrics: SyncMetrics
  className?: string
}

function particlePositions(count: number, seed: number) {
  const out: { left: string; top: string; delay: number; duration: number }[] = []
  for (let i = 0; i < count; i++) {
    const a = (seed + i * 17) % 100
    const b = (seed + i * 31) % 100
    out.push({
      left: `${8 + a * 0.84}%`,
      top: `${6 + b * 0.78}%`,
      delay: (i * 0.7) % 5,
      duration: 12 + (i % 6),
    })
  }
  return out
}

export function AmbientChatBackground({
  experience,
  syncMetrics,
  className,
}: AmbientChatBackgroundProps) {
  const reduce = useReducedMotion()
  const glow = syncMetrics.atmosphereGlow ?? experience.intensity
  const motionScale = syncMetrics.atmosphereMotion ?? experience.motionScale
  const particleMul = syncMetrics.atmosphereParticles ?? experience.particleDensity
  const intensity = syncMetrics.isFading ? 0.12 : Math.min(1, glow * 0.95)
  const highSync = syncMetrics.syncPercent >= 50 && !syncMetrics.isFading
  const particleCount = reduce ? 0 : Math.round(particleMul * 12)

  const particles = useMemo(
    () => particlePositions(particleCount, Math.round(syncMetrics.syncPercent)),
    [particleCount, syncMetrics.syncPercent]
  )

  return (
    <div
      className={cn(
        "ambient-chat-bg",
        highSync && "ambient-chat-bg--high",
        syncMetrics.aiEnhanced && "ambient-chat-bg--ai",
        className
      )}
      style={
        {
          ["--chat-atmosphere-glow" as string]: glow,
          ["--chat-atmosphere-motion" as string]: motionScale,
        } as React.CSSProperties
      }
      aria-hidden
    >
      <SyncAmbientField
        tier={experience.tier}
        intensity={intensity * motionScale}
        layered
        heartbeat={highSync && syncMetrics.syncPercent >= 50}
        className="z-0"
      />
      <AnimatedConnectionBackground
        tier={experience.tier}
        intensity={
          syncMetrics.isFading
            ? 0.14
            : Math.min(0.82, 0.22 + glow * 0.55 + syncMetrics.syncPercent / 220)
        }
        emotionalGlow={!syncMetrics.isFading}
      />
      <motion.div
        className="ambient-chat-bg__veil absolute inset-0"
        animate={
          reduce || !highSync
            ? undefined
            : {
                opacity: [
                  0.35 * intensity,
                  0.7 * intensity * (1 + motionScale * 0.15),
                  0.35 * intensity,
                ],
              }
        }
        transition={{
          duration: 8 / Math.max(0.5, motionScale),
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      {particles.map((p, i) => (
        <span
          key={i}
          className="ambient-chat-bg__particle"
          style={{
            left: p.left,
            top: p.top,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration / Math.max(0.6, motionScale)}s`,
            opacity: 0.12 + glow * 0.4,
          }}
        />
      ))}
    </div>
  )
}
