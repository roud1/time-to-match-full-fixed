"use client"

import { useReducedMotion } from "motion/react"
import type { ConnectionEnergyProfile } from "@/lib/reality"
import { cn } from "@/lib/utils"

type ConnectionEnergyFieldProps = {
  energy: ConnectionEnergyProfile
  surge?: boolean
  className?: string
}

export function ConnectionEnergyField({ energy, surge, className }: ConnectionEnergyFieldProps) {
  const reduce = useReducedMotion()

  if (reduce) return null

  return (
    <div
      className={cn("p16-energy-field", surge && "p16-energy-field--surge", className)}
      aria-hidden
      style={{
        ["--real-wave-amp" as string]: String(energy.waveAmplitude),
        ["--real-wave-speed" as string]: String(energy.waveSpeed),
        ["--real-trail" as string]: String(energy.trailOpacity),
        ["--real-particle-rate" as string]: String(energy.particleRate),
        ["--real-resonance" as string]: String(energy.resonanceMotion),
        ["--real-sync" as string]: String(energy.syncPercent),
      }}
    >
      <div className="p16-energy-field__wave p16-energy-field__wave--a" />
      <div className="p16-energy-field__wave p16-energy-field__wave--b" />
      <div className="p16-energy-field__trail" />
      <div className="p16-energy-field__particles" />
      <div className="p16-energy-field__resonance" />
    </div>
  )
}
