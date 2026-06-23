import { getActiveConnections } from "@/client/lib/connection-store"
import { buildConnectionView } from "@/client/lib/connection-system"
import { getGlobalAtmosphere, type GlobalAtmosphereTokens } from "@/client/lib/world/global-atmosphere"

export type EmotionalWorldState = {
  energy: number
  pulse: number
  connectionCount: number
  atmosphere: GlobalAtmosphereTokens
  liveMotion: number
}

export function computeEmotionalWorldState(hour?: number): EmotionalWorldState {
  const atmosphere = getGlobalAtmosphere(hour)
  const connections = getActiveConnections()
  let energy = 0.14
  let pulse = 0.2

  if (connections.length > 0) {
    const scores = connections.map((c) => {
      const v = buildConnectionView(c)
      return v.streakScore + v.streakDays * 6 + (v.isStable ? 14 : 0) + (v.isFading ? -10 : 0)
    })
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length
    energy = Math.min(0.62, 0.14 + avg / 110)
    pulse = Math.min(1, 0.25 + energy * 0.9)
  }

  const liveMotion = Math.min(1.15, atmosphere.motionScale * (0.85 + pulse * 0.2))

  return {
    energy,
    pulse,
    connectionCount: connections.length,
    atmosphere,
    liveMotion,
  }
}
