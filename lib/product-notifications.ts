import type { TranslationKey } from "@/lib/i18n"
import { Heart, MessageCircle, Zap, Sparkles, Clock } from "lucide-react"
import type { LucideIcon } from "lucide-react"

export type ProductNotificationKind = "sync" | "match" | "message" | "chemistry" | "missed" | "timer"

export type ProductNotification = {
  id: string
  kind: ProductNotificationKind
  titleKey: TranslationKey
  bodyKey: TranslationKey
  timeKey: TranslationKey
  important?: boolean
  unread?: boolean
  icon: LucideIcon
}

export const PRODUCT_NOTIFICATIONS: ProductNotification[] = [
  {
    id: "1",
    kind: "match",
    titleKey: "notifMatchTitle",
    bodyKey: "notifMatchBody",
    timeKey: "notifTime2m",
    important: true,
    unread: true,
    icon: Heart,
  },
  {
    id: "2",
    kind: "message",
    titleKey: "notifMessageTitle",
    bodyKey: "notifMessageBody",
    timeKey: "notifTime12m",
    unread: true,
    icon: MessageCircle,
  },
  {
    id: "3",
    kind: "sync",
    titleKey: "notifSyncTitle",
    bodyKey: "notifSyncBody",
    timeKey: "notifTime1h",
    icon: Zap,
  },
  {
    id: "4",
    kind: "chemistry",
    titleKey: "notifChemistryTitle",
    bodyKey: "notifChemistryBody",
    timeKey: "notifTimeTonight",
    important: true,
    icon: Sparkles,
  },
  {
    id: "5",
    kind: "missed",
    titleKey: "notifMissedTitle",
    bodyKey: "notifMissedBody",
    timeKey: "notifTime3h",
    unread: true,
    icon: Heart,
  },
  {
    id: "6",
    kind: "timer",
    titleKey: "notifTimerTitle",
    bodyKey: "notifTimerBody",
    timeKey: "notifTime3h",
    icon: Clock,
  },
]
