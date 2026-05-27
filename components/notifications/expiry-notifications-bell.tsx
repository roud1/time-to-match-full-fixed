"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Bell } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import {
  fetchNotificationsInbox,
  markAllNotificationsRead,
  type NotificationsInboxResponse,
} from "@/lib/notifications-client"
import { formatNotificationMessage } from "@/lib/notification-inbox-copy"
import type { NotificationInboxItem } from "@/lib/server/notifications/types"
import { EmptyState } from "@/components/ui/empty-state"
import { SkeletonList } from "@/components/ui/skeleton-list"
import { NotifyBadge } from "@/components/ui/notify-badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const POLL_MS = 60_000

export function ExpiryNotificationsBell() {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [data, setData] = useState<NotificationsInboxResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const next = await fetchNotificationsInbox()
    setData(next)
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
    const id = setInterval(() => void load(), POLL_MS)
    return () => clearInterval(id)
  }, [load])

  const unread = data?.unreadCount ?? 0
  const items = data?.notifications ?? []

  const handleOpenChange = async (next: boolean) => {
    setOpen(next)
    if (next) await load()
  }

  const handleMarkAllRead = async () => {
    const ok = await markAllNotificationsRead()
    if (ok) await load()
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "ttm-header-icon-btn relative",
          )}
          aria-label={t("expiryNotifBellAria")}
        >
          <Bell className="w-5 h-5 text-foreground/85" strokeWidth={1.5} aria-hidden />
          <NotifyBadge count={unread} className="ttm-notify-badge--header" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={10}
        className="w-[min(92vw,22rem)] p-0 border-white/12 bg-[#0a0a0c]/95 backdrop-blur-xl"
      >
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between gap-2">
          <p className="text-sm font-extralight text-white/90">{t("expiryNotifTitle")}</p>
          {unread > 0 && (
            <button
              type="button"
              onClick={() => void handleMarkAllRead()}
              className="text-[10px] uppercase tracking-wider text-indigo-200/80 hover:text-indigo-100"
            >
              {t("expiryNotifMarkAll")}
            </button>
          )}
        </div>
        <ul className="max-h-[min(60vh,320px)] overflow-y-auto py-1">
          {loading ? (
            <li className="px-3 py-2">
              <SkeletonList rows={3} rowClassName="h-14 rounded-xl" />
            </li>
          ) : items.length === 0 ? (
            <li className="px-3 py-2">
              <EmptyState
                title={t("expiryNotifEmpty")}
                className="py-6 px-4 border-0 bg-transparent"
              />
            </li>
          ) : (
            items.map((item) => (
              <NotificationRow key={item.id} item={item} onNavigate={() => setOpen(false)} />
            ))
          )}
        </ul>
        <div className="px-4 py-2 border-t border-white/10">
          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="text-xs font-light text-indigo-200/80 hover:text-indigo-100"
          >
            {t("expiryNotifViewAll")}
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function NotificationRow({
  item,
  onNavigate,
}: {
  item: NotificationInboxItem
  onNavigate: () => void
}) {
  const { t } = useI18n()
  const message = formatNotificationMessage(item, t)

  return (
    <li>
      <Link
        href={item.href}
        onClick={onNavigate}
        className="block px-4 py-3 hover:bg-white/[0.04] transition-colors"
      >
        <p className="text-sm font-light text-white/88 leading-snug">{message}</p>
        <p className="text-[10px] text-white/35 mt-1 font-extralight">
          {item.type === "profile_expiring" ? t("expiryNotifGoProfile") : t("expiryNotifGoChat")}
        </p>
      </Link>
    </li>
  )
}
