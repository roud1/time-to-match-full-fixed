import type { TranslationKey } from "@/lib/i18n"
import type { NotificationInboxItem } from "@/lib/server/notifications/types"

function profileNotifKey(leadHours: number): TranslationKey {
  if (leadHours === 12) return "expiryNotifProfile12"
  if (leadHours === 6) return "expiryNotifProfile6"
  if (leadHours === 1) return "expiryNotifProfile1"
  return "expiryNotifProfile"
}

function matchNotifKey(leadHours: number): TranslationKey {
  if (leadHours === 6) return "expiryNotifMatch6"
  if (leadHours === 1) return "expiryNotifMatch1"
  return "expiryNotifMatch"
}

export function formatNotificationMessage(
  item: NotificationInboxItem,
  t: (key: TranslationKey) => string
): string {
  const hours = String(item.leadHours)
  if (item.type === "profile_expiring") {
    const key = profileNotifKey(item.leadHours)
    if (key === "expiryNotifProfile") {
      return t(key).replace("{hours}", hours)
    }
    return t(key)
  }
  const name = item.peerName ?? t("expiryNotifMatchFallback")
  const key = matchNotifKey(item.leadHours)
  if (key === "expiryNotifMatch") {
    return t(key).replace("{hours}", hours).replace("{name}", name)
  }
  return t(key).replace("{name}", name)
}
