export type NotificationType =
  | "profile_expiring"
  | "match_expiring"
  | "match_urgency_warning"
  | "achievement_unlocked"

export type DbNotificationRow = {
  id: string
  user_id: string
  type: NotificationType
  reference_id: string | null
  lead_hours: number
  scheduled_for: Date
  sent: boolean
  read: boolean
  sent_at: Date | null
  created_at: Date
}

export type NotificationInboxItem = {
  id: string
  type: NotificationType
  referenceId: string | null
  leadHours: number
  peerName: string | null
  scheduledFor: string
  sentAt: string | null
  createdAt: string
  href: string
}

export type NotificationDeliveryContent = {
  title: string
  body: string
  html: string
  href: string
  tag: string
}
