import type { NotificationInboxItem } from "@/server/notifications/types"

export type NotificationsInboxResponse = {
  notifications: NotificationInboxItem[]
  unreadCount: number
}

export async function fetchNotificationsInbox(): Promise<NotificationsInboxResponse | null> {
  try {
    const res = await fetch("/api/notifications", { credentials: "include", cache: "no-store" })
    if (!res.ok) return null
    return (await res.json()) as NotificationsInboxResponse
  } catch {
    return null
  }
}

export async function markAllNotificationsRead(): Promise<boolean> {
  try {
    const res = await fetch("/api/notifications/read-all", {
      method: "POST",
      credentials: "include",
    })
    return res.ok
  } catch {
    return false
  }
}
