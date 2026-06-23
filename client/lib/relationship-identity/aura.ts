import type { ConnectionAuraProfile, RelationshipPersonality } from "@/client/lib/relationship-identity/types"
import type { ConnectionEvolutionStage } from "@/client/lib/relationship-identity/types"

const AURA: Record<RelationshipPersonality, Omit<ConnectionAuraProfile, "personality" | "intensity">> = {
  slow_burn: {
    glow: "rgba(220, 170, 120, 0.22)",
    gradientFrom: "rgba(180, 130, 90, 0.12)",
    gradientTo: "rgba(40, 35, 50, 0.04)",
    ringHue: "32 55% 68%",
    motion: "breathe",
    particles: "soft",
    warmth: 0.72,
    chaos: 0,
  },
  deep_sync: {
    glow: "rgba(180, 200, 255, 0.28)",
    gradientFrom: "rgba(140, 160, 230, 0.14)",
    gradientTo: "rgba(60, 50, 120, 0.06)",
    ringHue: "230 45% 78%",
    motion: "flow",
    particles: "cinematic",
    warmth: 0.65,
    chaos: 0,
  },
  emotional_chaos: {
    glow: "rgba(200, 140, 160, 0.2)",
    gradientFrom: "rgba(160, 90, 120, 0.1)",
    gradientTo: "rgba(80, 40, 60, 0.08)",
    ringHue: "340 40% 62%",
    motion: "flicker",
    particles: "ember",
    warmth: 0.45,
    chaos: 0.75,
  },
  calm_connection: {
    glow: "rgba(160, 190, 210, 0.18)",
    gradientFrom: "rgba(120, 150, 180, 0.08)",
    gradientTo: "rgba(30, 40, 55, 0.04)",
    ringHue: "200 30% 72%",
    motion: "calm",
    particles: "none",
    warmth: 0.5,
    chaos: 0,
  },
  magnetic_chemistry: {
    glow: "rgba(200, 170, 255, 0.35)",
    gradientFrom: "rgba(160, 120, 255, 0.18)",
    gradientTo: "rgba(80, 60, 140, 0.08)",
    ringHue: "265 55% 72%",
    motion: "pulse",
    particles: "cinematic",
    warmth: 0.85,
    chaos: 0.15,
  },
  night_energy: {
    glow: "rgba(100, 130, 220, 0.3)",
    gradientFrom: "rgba(60, 80, 180, 0.16)",
    gradientTo: "rgba(20, 25, 60, 0.1)",
    ringHue: "235 50% 58%",
    motion: "breathe",
    particles: "soft",
    warmth: 0.55,
    chaos: 0.1,
  },
  stable_bond: {
    glow: "rgba(170, 210, 190, 0.22)",
    gradientFrom: "rgba(130, 180, 160, 0.1)",
    gradientTo: "rgba(40, 55, 50, 0.05)",
    ringHue: "155 35% 68%",
    motion: "calm",
    particles: "soft",
    warmth: 0.58,
    chaos: 0,
  },
  intense_attraction: {
    glow: "rgba(255, 200, 220, 0.38)",
    gradientFrom: "rgba(255, 140, 180, 0.2)",
    gradientTo: "rgba(120, 60, 100, 0.1)",
    ringHue: "350 60% 72%",
    motion: "pulse",
    particles: "cinematic",
    warmth: 0.95,
    chaos: 0.2,
  },
}

const STAGE_INTENSITY: Record<ConnectionEvolutionStage, number> = {
  forming: 0.35,
  growing: 0.55,
  deepening: 0.78,
  peak: 1,
  fading: 0.25,
}

export function buildConnectionAura(
  personality: RelationshipPersonality,
  evolutionStage: ConnectionEvolutionStage,
  syncPercent: number,
  atmosphereGlow?: number
): ConnectionAuraProfile {
  const base = AURA[personality]
  const stageMul = STAGE_INTENSITY[evolutionStage]
  const syncMul = 0.4 + (syncPercent / 100) * 0.6
  const intensity = Math.min(
    1,
    stageMul * syncMul * (atmosphereGlow != null ? 0.7 + atmosphereGlow * 0.35 : 1)
  )

  return {
    personality,
    ...base,
    intensity,
  }
}

export function auraCssVars(aura: ConnectionAuraProfile): Record<string, string> {
  return {
    "--rel-aura-glow": aura.glow,
    "--rel-aura-from": aura.gradientFrom,
    "--rel-aura-to": aura.gradientTo,
    "--rel-aura-ring": aura.ringHue,
    "--rel-aura-warmth": String(aura.warmth),
    "--rel-aura-intensity": String(aura.intensity),
    "--rel-aura-chaos": String(aura.chaos),
  }
}

export function auraDataAttributes(aura: ConnectionAuraProfile): Record<string, string> {
  return {
    "data-rel-personality": aura.personality,
    "data-rel-motion": aura.motion,
    "data-rel-particles": aura.particles,
    "data-rel-evolution": String(Math.round(aura.intensity * 100)),
  }
}
