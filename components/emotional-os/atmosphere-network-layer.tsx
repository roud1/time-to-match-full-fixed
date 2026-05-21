"use client"

import { useReducedMotion } from "motion/react"
import type { AtmosphereNetworkState } from "@/lib/emotional-os"
import { cn } from "@/lib/utils"

type AtmosphereNetworkLayerProps = {
  network: AtmosphereNetworkState
  className?: string
}

/** Platform-wide emotional waves — living ambience. */
export function AtmosphereNetworkLayer({ network, className }: AtmosphereNetworkLayerProps) {
  const reduce = useReducedMotion()

  return (
    <div
      className={cn("eo-network-layer", !reduce && "eo-network-layer--live", className)}
      aria-hidden
      data-eo-network={network.mood}
      style={{
        ["--eo-wave-phase" as string]: String(network.wavePhase),
        ["--eo-wave-amp" as string]: String(network.waveAmplitude),
        ["--eo-sync-ambience" as string]: String(network.syncAmbience),
      }}
    >
      <div className="eo-network-layer__wave eo-network-layer__wave--a" />
      <div className="eo-network-layer__wave eo-network-layer__wave--b" />
      <div className="eo-network-layer__veil" />
    </div>
  )
}
