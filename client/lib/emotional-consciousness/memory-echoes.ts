import type { EmotionalRealityExpansion } from "@/client/lib/reality-expansion/types"
import type { ConsciousnessReading } from "@/client/lib/emotional-consciousness/consciousness-engine"

export type MemoryEchoField = {
  traceStrength: number
  glowEcho: number
  auraFragment: number
  remnantWarmth: number
}

export function analyzeMemoryEchoes(
  expansion: EmotionalRealityExpansion,
  reading: ConsciousnessReading
): MemoryEchoField {
  const mem = expansion.memory
  const count = mem.fragmentCount
  const traceStrength = Math.min(1, count / 6 * 0.5 + mem.atmosphereRemnant * 0.35)
  const glowEcho = Math.min(1, mem.cinematicDepth * 0.6 + traceStrength * 0.25)
  const auraFragment = Math.min(1, mem.atmosphereRemnant * 0.45 + reading.depthSense * 0.2)
  const remnantWarmth = Math.min(1, mem.cinematicDepth * 0.5 + glowEcho * 0.3)

  return { traceStrength, glowEcho, auraFragment, remnantWarmth }
}

export function memoryEchoCss(e: MemoryEchoField): Record<string, string> {
  return {
    "--ec-echo-trace": String(e.traceStrength),
    "--ec-echo-glow": String(e.glowEcho),
    "--ec-echo-aura": String(e.auraFragment),
    "--ec-echo-warmth": String(e.remnantWarmth),
  }
}

export function memoryEchoAttrs(e: MemoryEchoField): Record<string, string> {
  return { "data-ec-memory-echo": e.traceStrength > 0.2 ? "true" : "false" }
}
