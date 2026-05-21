"use client"

import { useEffect, useMemo, useState } from "react"
import {
  atmosphereDataAttrs,
  getGlobalAtmosphere,
  type GlobalAtmosphereTokens,
} from "@/lib/world"

export function useGlobalAtmosphere(): {
  tokens: GlobalAtmosphereTokens
  attrs: Record<string, string>
  style: React.CSSProperties
} {
  const [hour, setHour] = useState(() => new Date().getHours())

  useEffect(() => {
    const id = window.setInterval(() => setHour(new Date().getHours()), 60_000)
    return () => clearInterval(id)
  }, [])

  const tokens = useMemo(() => getGlobalAtmosphere(hour), [hour])

  const style = useMemo(
    () =>
      ({
        ["--world-motion-scale" as string]: String(tokens.motionScale),
        ["--world-glow-warmth" as string]: String(tokens.glowWarmth),
        ["--world-depth-level" as string]: String(tokens.depthLevel),
        ["--world-wave-speed" as string]: String(tokens.waveSpeed),
        ["--world-particle-density" as string]: String(tokens.particleDensity),
      }) as React.CSSProperties,
    [tokens]
  )

  return {
    tokens,
    attrs: atmosphereDataAttrs(tokens),
    style,
  }
}
