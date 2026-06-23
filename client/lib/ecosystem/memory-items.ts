import type { RelationshipEcosystemStage } from "@/client/lib/ecosystem/relationship-stages"
import {
  resolveEcosystemStage,
  stageFromConnectionStage,
} from "@/client/lib/ecosystem/relationship-stages"
import { getAIMemories } from "@/client/lib/ai-connection-memory-store"
import { extractAIConnectionSignals } from "@/client/lib/ai-connection-engine"
import { analyzeConnection } from "@/client/lib/connection-engine"
import {
  buildConnectionView,
  type ConnectionMemory,
} from "@/client/lib/connection-system"
import {
  getActiveConnections,
  getConnection,
  getConnectionMemories,
} from "@/client/lib/connection-store"
import { getChatMessagesForProfile } from "@/client/lib/social-store"
import { buildRelationshipMoments } from "@/client/lib/relationship-identity/moments"
import { getRelationshipIdentity } from "@/client/lib/relationship-identity"
import type { RelationshipMomentId } from "@/client/lib/relationship-identity/types"
import type { TranslationKey } from "@/client/lib/i18n"

export type EcosystemMemoryItem = {
  id: string
  title: string
  body: string
  at: number
  stage?: RelationshipEcosystemStage
  featured?: boolean
  kind: "archived" | "ai" | "moment"
}

const MOMENT_STAGE: Partial<Record<RelationshipMomentId, RelationshipEcosystemStage>> = {
  first_message: "new_connection",
  first_deep_talk: "growing_energy",
  fast_reply_streak: "growing_energy",
  three_night_talks: "deep_chemistry",
  long_night: "deep_chemistry",
  strong_chemistry_period: "deep_chemistry",
  emotional_peak: "emotional_resonance",
  high_sync_week: "high_sync",
}

function stageForActiveProfile(profileId: number): RelationshipEcosystemStage | undefined {
  const record = getConnection(profileId)
  if (!record) return undefined
  const view = buildConnectionView(record)
  const messages = getChatMessagesForProfile(profileId)
  const analysis = analyzeConnection(view, messages, record)
  const evolution = getRelationshipIdentity(profileId)?.evolutionStage ?? "forming"
  return resolveEcosystemStage(view, analysis, evolution)
}

function stageForArchived(memory: ConnectionMemory): RelationshipEcosystemStage {
  if (memory.reason === "faded") return "growing_energy"
  return "stable_bond"
}

function stageForMoment(momentId: RelationshipMomentId, profileId: number): RelationshipEcosystemStage {
  return MOMENT_STAGE[momentId] ?? stageForActiveProfile(profileId) ?? "growing_energy"
}

export function buildEcosystemMemoryItems(
  t: (key: TranslationKey) => string,
  options?: { profileId?: number; limit?: number }
): EcosystemMemoryItem[] {
  const { profileId, limit = 12 } = options ?? {}
  const archived = getConnectionMemories()
  const cards: EcosystemMemoryItem[] = []

  for (const m of archived) {
    if (profileId != null && m.profileId !== profileId) continue
    cards.push({
      id: `arch-${m.profileId}-${m.endedAt}`,
      title: m.profileName || t("trustBlockedUser"),
      body: m.reason === "faded" ? t("connectionMemoryFaded") : t("connectionMemoryExpired"),
      at: m.endedAt,
      stage: stageForArchived(m),
      kind: "archived",
    })
  }

  const profileIds =
    profileId != null
      ? [profileId]
      : [...new Set([...getActiveConnections().map((c) => c.profileId), ...archived.map((m) => m.profileId)])]

  for (const pid of profileIds) {
    const record = getConnection(pid)
    const messages = getChatMessagesForProfile(pid)
    if (!record) continue
    const view = buildConnectionView(record)
    const signals = extractAIConnectionSignals(messages, record)
    const analysis = analyzeConnection(view, messages, record)
    const defaultStage = resolveEcosystemStage(
      view,
      analysis,
      getRelationshipIdentity(pid)?.evolutionStage ?? "forming"
    )

    const moments = buildRelationshipMoments(messages, record, signals, analysis.syncPercent, t)
    for (const mom of moments.filter((x) => x.reached)) {
      cards.push({
        id: `mom-${pid}-${mom.id}`,
        title: mom.title,
        body: mom.subtitle ?? "",
        at: mom.at,
        stage: stageForMoment(mom.id, pid),
        featured: mom.importance >= 0.85,
        kind: "moment",
      })
    }

    for (const ai of getAIMemories(pid)) {
      const aiStage =
        ai.id === "high_interaction" || ai.id === "strong_chemistry"
          ? stageFromConnectionStage(view.stage, analysis.syncPercent)
          : ai.id === "long_night"
            ? "deep_chemistry"
            : defaultStage
      cards.push({
        id: `ai-${pid}-${ai.id}`,
        title: ai.label,
        body: t("memoryAiPeak"),
        at: ai.at,
        stage: aiStage,
        featured: ai.importance >= 0.85,
        kind: "ai",
      })
    }
  }

  return cards.sort((a, b) => b.at - a.at).slice(0, limit)
}
