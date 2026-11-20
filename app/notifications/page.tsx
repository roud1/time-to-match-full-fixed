"use client"

import "../settings/settings-luvia.css"
import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Bell, ChevronRight, Clock, Heart, Sparkles, Trophy } from "lucide-react"
import { Navbar } from "@/client/components/navbar"
import { useI18n } from "@/client/lib/i18n"
import {
  fetchNotificationsInbox,
  markAllNotificationsRead,
  type NotificationsInboxResponse,
} from "@/client/lib/notifications-client"
import { formatNotificationMessage } from "@/client/lib/notification-inbox-copy"
import { formatChatThreadPreviewTime } from "@/client/lib/format-chat-time"
import type { NotificationType } from "@/server/notifications/types"

function iconFor(type: NotificationType) {
  if (type === "new_match") return Sparkles
  if (type === "someone_liked_you") return Heart
  if (type === "achievement_unlocked") return Trophy
  return Clock
}

/** Real server notifications (matches, likes, expiry reminders). Nothing is generated on the client. */
export default function NotificationsPage() {
  const { t, locale } = useI18n()
  const [data, setData] = useState<NotificationsInboxResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)

  const load = useCallback(async () => {
    const next = await fetchNotificationsInbox()
    setData(next)
    setFailed(next === null)
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const items = data?.notifications ?? []

  return (
    <main className="lv-set-page">
      <Navbar />
      <div className="lv-set">
        <div className="lv-set__head">
          <h1 className="lv-set__title">{t("lvNotifTitle")}</h1>
          {items.length > 0 && (
            <button
              type="button"
              className="lv-set__link"
              onClick={() => void markAllNotificationsRead().then((ok) => { if (ok) void load() })}
            >
              {t("expiryNotifMarkAll")}
            </button>
          )}
        </div>

        <div className="lv-set__body">
          {loading ? (
            <div className="lv-set__group" aria-busy>
              {[0, 1, 2].map((i) => (
                <div key={i} className="lv-set__row lv-set__row--skeleton" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="lv-set__empty">
              <span className="lv-set__empty-icon" aria-hidden>
                <Bell strokeWidth={1.6} />
              </span>
              <p className="lv-set__group-title">{failed ? t("lvNotifUnavailable") : t("lvNotifEmpty")}</p>
              {!failed && <p className="lv-set__hint">{t("lvNotifEmptyBody")}</p>}
            </div>
          ) : (
            <ul className="lv-set__group lv-set__list">
              {items.map((item) => {
                const Icon = iconFor(item.type)
                const at = Date.parse(item.sentAt ?? item.createdAt)
                return (
                  <li key={item.id}>
                    <Link href={item.href} className="lv-set__row">
                      <span className="lv-set__icon" aria-hidden>
                        <Icon strokeWidth={1.8} />
                      </span>
                      <span className="lv-set__text">
                        <span className="lv-set__label lv-set__label--wrap">
                          {formatNotificationMessage(item, t)}
                        </span>
                        {Number.isFinite(at) && (
                          <span className="lv-set__hint">{formatChatThreadPreviewTime(at, locale)}</span>
                        )}
                      </span>
                      <ChevronRight className="lv-set__chevron" aria-hidden strokeWidth={1.8} />
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </main>
  )
}
