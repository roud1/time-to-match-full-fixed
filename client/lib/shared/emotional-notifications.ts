import { buildConnectionView, type ConnectionRecord } from "@/client/lib/connection-system"
import type { TranslationKey } from "@/client/lib/i18n"
import type { DailyReturnInsight } from "@/client/lib/shared/daily-return"
import type { LucideIcon } from "lucide-react"
import { Heart, MessageCircle, Sparkles, Zap, Moon, AlertCircle } from "lucide-react"

export type EmotionalNotificationKind =
  | "waiting"
  | "chemistry"
  | "sync"
  | "missed"
  | "fading"
  | "evolved"
  | "memory"

export type EmotionalNotification = {
  id: string
  kind: EmotionalNotificationKind
  titleKey: TranslationKey
  bodyKey: TranslationKey
  timeKey: TranslationKey
  profileId?: number
  important?: boolean
  unread?: boolean
  icon: LucideIcon
}

function timeKeyForIdle(idleMs: number): TranslationKey {
  if (idleMs < 30 * 60 * 1000) return "notifTime2m"
  if (idleMs < 2 * 60 * 60 * 1000) return "notifTime12m"
  if (idleMs < 8 * 60 * 60 * 1000) return "notifTime1h"
  return "notifTimeTonight"
}

export function buildEmotionalNotifications(
  connections: ConnectionRecord[],
  dailyInsights: DailyReturnInsight[],
  now = Date.now()
): EmotionalNotification[] {
  const out: EmotionalNotification[] = []

  for (const insight of dailyInsights) {
    const kind =
      insight.kind === "fading"
        ? "fading"
        : insight.kind === "evolved"
          ? "evolved"
          : insight.kind === "waiting"
            ? "waiting"
            : insight.kind === "chemistry"
              ? "chemistry"
              : "sync"
    out.push({
      id: `daily-${insight.id}`,
      kind,
      titleKey: insight.titleKey,
      bodyKey: insight.bodyKey,
      timeKey: "notifTimeTonight",
      profileId: insight.profileId,
      important: insight.priority >= 85,
      unread: true,
      icon: kind === "fading" ? AlertCircle : kind === "chemistry" ? Sparkles : Zap,
    })
  }

  for (const record of connections) {
    if (record.status === "archived") continue
    const view = buildConnectionView(record, now)
    const idle = now - record.lastInteractionAt

    if (view.isFading) {
      out.push({
        id: `fade-live-${record.profileId}`,
        kind: "fading",
        titleKey: "emNotifFadingTitle",
        bodyKey: "emNotifFadingBody",
        timeKey: timeKeyForIdle(idle),
        profileId: record.profileId,
        important: true,
        unread: true,
        icon: AlertCircle,
      })
    } else if (record.theirMessages > record.myMessages && idle < 4 * 60 * 60 * 1000) {
      out.push({
        id: `wait-${record.profileId}`,
        kind: "waiting",
        titleKey: "emNotifWaitingTitle",
        bodyKey: "emNotifWaitingBody",
        timeKey: timeKeyForIdle(idle),
        profileId: record.profileId,
        unread: true,
        icon: MessageCircle,
      })
    } else if (view.stage === "rare" || view.stage === "strong") {
      out.push({
        id: `chem-${record.profileId}`,
        kind: "chemistry",
        titleKey: "emNotifChemistryTitle",
        bodyKey: "emNotifChemistryBody",
        timeKey: timeKeyForIdle(idle),
        profileId: record.profileId,
        icon: Sparkles,
      })
    } else if (view.streakDays >= 2) {
      out.push({
        id: `sync-${record.profileId}`,
        kind: "sync",
        titleKey: "notifSyncTitle",
        bodyKey: "notifSyncBody",
        timeKey: timeKeyForIdle(idle),
        profileId: record.profileId,
        icon: Zap,
      })
    }

    if (record.messagesExchanged >= 8 && view.bothParticipated) {
      out.push({
        id: `missed-${record.profileId}`,
        kind: "missed",
        titleKey: "notifMissedTitle",
        bodyKey: "notifMissedBody",
        timeKey: timeKeyForIdle(idle),
        profileId: record.profileId,
        unread: idle > 2 * 60 * 60 * 1000,
        icon: Heart,
      })
    }
  }

  if (out.length === 0) {
    out.push({
      id: "calm",
      kind: "memory",
      titleKey: "emNotifCalmTitle",
      bodyKey: "emNotifCalmBody",
      timeKey: "notifTimeTonight",
      icon: Moon,
    })
  }

  const seen = new Set<string>()
  return out
    .filter((n) => {
      if (seen.has(n.id)) return false
      seen.add(n.id)
      return true
    })
    .slice(0, 12)
}
