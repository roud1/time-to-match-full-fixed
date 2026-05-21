"use client"

import { motion, useReducedMotion } from "motion/react"
import type { SyncTier } from "@/lib/sync-system"
import { cn } from "@/lib/utils"

type SyncAmbientFieldProps = {
  tier?: SyncTier
  intensity?: number
  className?: string
  layered?: boolean
  heartbeat?: boolean
}

export function SyncAmbientField({
  tier = "soft",
  intensity = 0.5,
  className,
  layered = false,
  heartbeat = false,
}: SyncAmbientFieldProps) {
  const reduce = useReducedMotion()
  if (reduce) return null

  const opacity = Math.min(1, intensity * 1.15)

  return (
    <div
      className={cn(
        "sync-ambient",
        layered && "sync-ambient--layered",
        `sync-ambient--${tier}`,
        heartbeat && "sync-ambient--heartbeat",
        className
      )}
      aria-hidden
      style={{ opacity }}
    >
      <motion.div
        className={cn("sync-ambient__blob", layered && "sync-ambient__blob--a")}
        animate={
          reduce
            ? undefined
            : {
                x: [0, "3%", 0],
                y: [0, "-2%", 0],
                scale: [1, 1.05, 1],
              }
        }
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background:
            tier === "synced" || tier === "vibrant"
              ? "radial-gradient(ellipse, rgba(200,190,255,0.4) 0%, transparent 70%)"
              : tier === "cold"
                ? "radial-gradient(ellipse, rgba(100,120,160,0.28) 0%, transparent 70%)"
                : "radial-gradient(ellipse, rgba(160,175,220,0.32) 0%, transparent 70%)",
        }}
      />
      {layered && (
        <div
          className="sync-ambient__blob sync-ambient__blob--b"
          style={{
            background:
              tier === "synced"
                ? "radial-gradient(ellipse, rgba(220,210,255,0.25) 0%, transparent 72%)"
                : "radial-gradient(ellipse, rgba(140,160,220,0.2) 0%, transparent 72%)",
          }}
        />
      )}
      {heartbeat && <span className="sync-ambient__heartbeat" />}
    </div>
  )
}
