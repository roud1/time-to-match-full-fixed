"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence, useReducedMotion } from "motion/react"
import { useI18n } from "@/lib/i18n"
import { getMatchProfiles, getProfileById } from "@/lib/social-store"
import { hasUnreadThread } from "@/lib/chat-thread-seen"
import type { ChatThread } from "@/lib/social-store"
import { cn } from "@/lib/utils"
export function ActivityHubSheet({
  open,
  onClose,
  counts,
  threads,
  reconnectThreads,
}: {
  open: boolean
  onClose: () => void
  counts: { likesUnread: number; chatsUnread: number; matchCount: number; chatThreadCount: number }
  threads: ChatThread[]
  reconnectThreads: ChatThread[]
}) {
  const { t, locale, location } = useI18n()
  const router = useRouter()
  const reduce = useReducedMotion()
  const matches = getMatchProfiles(locale, location.position)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) return
    const prev = document.documentElement.style.overflow
    document.documentElement.style.overflow = "hidden"
    return () => {
      document.documentElement.style.overflow = prev
    }
  }, [open])

  const go = (href: string) => {
    onClose()
    router.push(href)
  }

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close"
            className="fixed inset-0 z-[110] bg-black/55 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal
            initial={reduce ? { opacity: 0 } : { x: "100%" }}
            animate={reduce ? { opacity: 1, x: 0 } : { x: 0 }}
            exit={reduce ? { opacity: 0 } : { x: "100%" }}
            transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 400, damping: 36 }}
            className="activity-hub fixed z-[111] flex flex-col bg-[#08080c]/97 backdrop-blur-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="activity-hub__head">
              <div className="activity-hub__head-text">
                <h2 className="activity-hub__title">{t("activityHubTitle")}</h2>
                <p className="activity-hub__subtitle">{t("activityHubSubtitle")}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="activity-hub__dismiss"
                aria-label={t("activityClose")}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </header>

            <div className="activity-hub__body ttm-chat-scroll">
              <div className="activity-hub__urgency">
                <p className="activity-hub__urgency-label">{t("activityUrgencyStrip")}</p>
                <p className="activity-hub__urgency-text">{t("activityUrgencyBody")}</p>
              </div>

              {reconnectThreads.length > 0 && (
                <section>
                  <h3 className="activity-hub__section-title">{t("activitySectionUrgent")}</h3>
                  <ul className="activity-hub__list">
                    {reconnectThreads.map((th) => {
                      const p = getProfileById(th.profileId, locale, location.position)
                      if (!p) return null
                      return (
                        <li key={th.profileId}>
                          <button
                            type="button"
                            onClick={() => go("/app?tab=chat")}
                            className="activity-hub__row activity-hub__row--urgent"
                          >
                            <div className={cn("activity-hub__avatar", "activity-hub__avatar--ring")}>
                              <Image src={p.image} alt="" fill className="object-cover" sizes="32px" />
                            </div>
                            <div className="activity-hub__row-main">
                              <p className="activity-hub__row-name">{p.name}</p>
                              <p className="activity-hub__row-preview">{t("activityReconnectChat")}</p>
                            </div>
                            <span className="activity-hub__row-meta">{p.timeLeft}</span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </section>
              )}

              <section>
                <h3 className="activity-hub__section-title">{t("activitySectionLikes")}</h3>
                <button type="button" onClick={() => go("/app?tab=likes")} className="activity-hub__likes-row">
                  <span>{t("tabLikes")}</span>
                  {counts.likesUnread > 0 ? (
                    <span className="activity-hub__badge">
                      {counts.likesUnread > 9 ? "9+" : counts.likesUnread}
                    </span>
                  ) : (
                    <span className="activity-hub__row-meta">—</span>
                  )}
                </button>
              </section>

              <section>
                <h3 className="activity-hub__section-title">{t("activitySectionChats")}</h3>
                {threads.length === 0 ? (
                  <p className="activity-hub__empty">{t("activityEmptyChats")}</p>
                ) : (
                  <div className="activity-hub__list">
                    {threads.slice(0, 6).map((th) => {
                      const p = getProfileById(th.profileId, locale, location.position)
                      if (!p) return null
                      const last = th.messages[th.messages.length - 1]
                      const unread = hasUnreadThread(th.profileId, th.updatedAt, last?.from === "them")
                      return (
                        <button
                          key={th.profileId}
                          type="button"
                          onClick={() => go("/app?tab=chat")}
                          className={cn("activity-hub__row", unread && "activity-hub__row--unread")}
                        >
                          <div className="activity-hub__avatar">
                            <Image src={p.image} alt="" fill className="object-cover" sizes="32px" />
                          </div>
                          <div className="activity-hub__row-main">
                            <p className="activity-hub__row-name">{p.name}</p>
                            <p className="activity-hub__row-preview">{last?.text}</p>
                          </div>
                          {unread && <span className="activity-hub__dot" aria-hidden />}
                        </button>
                      )
                    })}
                  </div>
                )}
                <p className="activity-hub__hint">{t("activityTypingHint")}</p>
              </section>

              <section>
                <h3 className="activity-hub__section-title">{t("activitySectionMatches")}</h3>
                {matches.length === 0 ? (
                  <p className="activity-hub__empty">{t("activityEmptyMatches")}</p>
                ) : (
                  <ul className="activity-hub__matches">
                    {matches.slice(0, 6).map((p) => (
                      <li key={p.id}>
                        <Link href="/app?tab=chat" onClick={onClose} className="activity-hub__match-pill">
                          <span className="activity-hub__match-avatar">
                            <Image src={p.image} alt="" fill className="object-cover" sizes="24px" />
                          </span>
                          {p.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>

            <footer className="activity-hub__foot">
              <button type="button" onClick={onClose} className="activity-hub__close">
                {t("activityClose")}
              </button>
            </footer>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
