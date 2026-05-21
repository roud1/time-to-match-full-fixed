import type { ConsciousnessReading } from "@/lib/emotional-consciousness/consciousness-engine"
import type { SilenceUnderstanding } from "@/lib/emotional-consciousness/silence-understanding"
import type { RelationshipTension } from "@/lib/emotional-consciousness/relationship-tension"
import type { EmotionalReflectionV2 } from "@/lib/emotional-consciousness/reflections-v2"
import type { SpaceEvolution } from "@/lib/emotional-consciousness/space-evolution"
import type { AtmosphericConsciousness } from "@/lib/emotional-consciousness/atmospheric-ai"
import type { MemoryEchoField } from "@/lib/emotional-consciousness/memory-echoes"

/** Phase 22 — Emotional Consciousness Layer. */
export type EmotionalConsciousness = {
  reading: ConsciousnessReading
  silence: SilenceUnderstanding
  tension: RelationshipTension
  reflection: EmotionalReflectionV2 | null
  space: SpaceEvolution | null
  atmosphere: AtmosphericConsciousness
  echoes: MemoryEchoField
  style: Record<string, string>
  attrs: Record<string, string>
}
