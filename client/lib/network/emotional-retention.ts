import type { TranslationKey } from "@/client/lib/i18n"
import { getActiveConnections, getConnection } from "@/client/lib/connection-store"
import { buildConnectionView } from "@/client/lib/connection-system"
import { getGlobalAtmosphere } from "@/client/lib/world/global-atmosphere"

export type RetentionAnticipationKind =
  | "evolving_tonight"
  | "resonance_near"
  | "bond_maturing"
  | "return_to_connection"

export type RetentionAnticipation = {
  id: string
  kind: RetentionAnticipationKind
  titleKey: TranslationKey
  bodyKey: TranslationKey
  profileId?: number
  priority: number
}

export function buildRetentionAnticipations(): RetentionAnticipation[] {
  const items: RetentionAnticipation[] = []
  const connections = getActiveConnections()
  const atmosphere = getGlobalAtmosphere()

  if (connections.length === 0) {
    items.push({
      id: "return-empty",
      kind: "return_to_connection",
      titleKey: "netRetainReturnTitle",
      bodyKey: "netRetainReturnBody",
      priority: 30,
    })
    return items
  }

  if (atmosphere.period === "evening" || atmosphere.period === "night") {
    items.push({
      id: "evolving-tonight",
      kind: "evolving_tonight",
      titleKey: "netRetainTonightTitle",
      bodyKey: "netRetainTonightBody",
      priority: 70,
    })
  }

  for (const record of connections) {
    const view = buildConnectionView(record)
    if (view.isFading) continue
    if (view.streakDays >= 3 && view.streakDays < 7) {
      items.push({
        id: `bond-${record.profileId}`,
        kind: "bond_maturing",
        titleKey: "netRetainBondTitle",
        bodyKey: "netRetainBondBody",
        profileId: record.profileId,
        priority: 55,
      })
    }
    if (view.streakScore >= 80 && !view.isStable) {
      items.push({
        id: `resonance-${record.profileId}`,
        kind: "resonance_near",
        titleKey: "netRetainResonanceTitle",
        bodyKey: "netRetainResonanceBody",
        profileId: record.profileId,
        priority: 65,
      })
    }
  }

  return items.sort((a, b) => b.priority - a.priority).slice(0, 2)
}
