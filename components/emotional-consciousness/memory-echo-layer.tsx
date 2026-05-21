"use client"

import type { MemoryEchoField } from "@/lib/emotional-consciousness"
import { cn } from "@/lib/utils"

type MemoryEchoLayerProps = {
  echoes: MemoryEchoField
  className?: string
}

/** Phase 22 — memory atmosphere remnants and glow echoes. */
export function MemoryEchoLayer({ echoes, className }: MemoryEchoLayerProps) {
  if (echoes.traceStrength < 0.12) return null

  return (
    <div
      className={cn("ec-memory-echo-layer", className)}
      aria-hidden
      data-ec-memory-echo="true"
      style={{
        ["--ec-echo-trace" as string]: String(echoes.traceStrength),
        ["--ec-echo-glow" as string]: String(echoes.glowEcho),
        ["--ec-echo-aura" as string]: String(echoes.auraFragment),
      }}
    />
  )
}
