import type { TranslationKey } from "@/client/lib/i18n"
import { getConnectionMemories, getActiveConnections, getConnection } from "@/client/lib/connection-store"
import { buildConnectionView } from "@/client/lib/connection-system"
import { getEvolutionEvents } from "@/client/lib/network/connection-evolution-events"
import { buildEcosystemMemoryItems } from "@/client/lib/ecosystem/memory-items"

export type LegacyTimelineEntry = {
  id: string
  at: number
  title: string
  body: string
  kind: "memory" | "event" | "milestone" | "archived"
  stageLabelKey?: TranslationKey
}

export function buildConnectionLegacyTimeline(
  t: (key: TranslationKey) => string,
  profileId?: number
): LegacyTimelineEntry[] {
  const entries: LegacyTimelineEntry[] = []

  for (const m of getConnectionMemories()) {
    if (profileId != null && m.profileId !== profileId) continue
    entries.push({
      id: `arch-${m.profileId}-${m.endedAt}`,
      at: m.endedAt,
      title: m.profileName || t("trustBlockedUser"),
      body: m.reason === "faded" ? t("connectionMemoryFaded") : t("connectionMemoryExpired"),
      kind: "archived",
    })
  }

  const events = getEvolutionEvents()
  for (const e of events) {
    if (profileId != null && e.profileId !== profileId) continue
    entries.push({
      id: e.id,
      at: e.at,
      title: t(e.titleKey),
      body: t(e.bodyKey),
      kind: "event",
    })
  }

  const memories = buildEcosystemMemoryItems(t, { profileId, limit: 20 })
  for (const mem of memories) {
    entries.push({
      id: mem.id,
      at: mem.at,
      title: mem.title,
      body: mem.body,
      kind: mem.featured ? "milestone" : "memory",
    })
  }

  for (const record of getActiveConnections()) {
    if (profileId != null && record.profileId !== profileId) continue
    const view = buildConnectionView(record)
    if (view.isStable) {
      entries.push({
        id: `stable-${record.profileId}`,
        at: record.stabilizedAt ?? record.lastInteractionAt,
        title: t("netLegacyStableTitle"),
        body: t("netLegacyStableBody"),
        kind: "milestone",
      })
    }
  }

  return entries.sort((a, b) => b.at - a.at).slice(0, 32)
}

export function getStrongestConnectionPeriod(
  t: (key: TranslationKey) => string
): LegacyTimelineEntry | null {
  const timeline = buildConnectionLegacyTimeline(t)
  const milestone = timeline.find((e) => e.kind === "milestone" || e.kind === "event")
  return milestone ?? timeline[0] ?? null
}
