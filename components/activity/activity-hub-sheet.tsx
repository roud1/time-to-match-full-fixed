"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
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

  const go = (href: string) => {
    onClose()
    router.push(href)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close"
            className="fixed inset-0 z-[70] bg-black/55 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 380, damping: 38 }}
            className="fixed z-[71] inset-x-0 bottom-0 max-h-[min(88dvh,640px)] rounded-t-[1.75rem] border border-white/12 bg-[#08080c]/95 backdrop-blur-2xl shadow-[0_-32px_100px_-20px_rgba(0,0,0,0.85)] flex flex-col"
          >
            <div className="shrink-0 pt-3 pb-2 px-5 border-b border-white/10">
              <div className="mx-auto h-1 w-10 rounded-full bg-white/20 mb-4" />
              <h2 className="text-lg font-extralight tracking-tight text-center">{t("activityHubTitle")}</h2>
              <p className="text-xs text-muted-foreground font-light text-center mt-1">{t("activityHubSubtitle")}</p>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-5 ttm-chat-scroll">
              <div className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.06] px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-amber-200/90 font-light mb-1">{t("activityUrgencyStrip")}</p>
                <p className="text-xs text-amber-100/85 font-light leading-relaxed">{t("activityUrgencyBody")}</p>
              </div>

              {reconnectThreads.length > 0 && (
                <section>
                  <h3 className="text-[10px] uppercase tracking-[0.18em] text-white/80/80 font-light mb-2">{t("activitySectionUrgent")}</h3>
                  <ul className="space-y-2">
                    {reconnectThreads.map((th) => {
                      const p = getProfileById(th.profileId, locale, location.position)
                      if (!p) return null
                      return (
                        <li key={th.profileId}>
                          <button
                            type="button"
                            onClick={() => go(`/app?tab=chat`)}
                            className="w-full flex items-center gap-3 rounded-2xl border border-white/14 bg-white/06 px-3 py-2.5 text-left touch-manipulation"
                          >
                            <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 ring-2 ring-white/15">
                              <Image src={p.image} alt="" fill className="object-cover" sizes="40px" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-light truncate">{p.name}</p>
                              <p className="text-[11px] text-white/80/80 font-light">{t("activityReconnectChat")}</p>
                            </div>
                            <span className="text-[10px] text-white/75 tabular-nums shrink-0">{p.timeLeft}</span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </section>
              )}

              <section>
                <h3 className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-light mb-2">{t("activitySectionLikes")}</h3>
                <button
                  type="button"
                  onClick={() => go("/app?tab=likes")}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 flex items-center justify-between touch-manipulation"
                >
                  <span className="text-sm font-light">{t("tabLikes")}</span>
                  {counts.likesUnread > 0 ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/12 text-white/80 border border-white/14">
                      {counts.likesUnread > 9 ? "9+" : counts.likesUnread}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </button>
              </section>

              <section>
                <h3 className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-light mb-2">{t("activitySectionChats")}</h3>
                <div className="space-y-2">
                  {threads.length === 0 ? (
                    <p className="text-xs text-muted-foreground font-light py-2">{t("activityEmptyChats")}</p>
                  ) : (
                    threads.slice(0, 6).map((th) => {
                      const p = getProfileById(th.profileId, locale, location.position)
                      if (!p) return null
                      const last = th.messages[th.messages.length - 1]
                      const unread = hasUnreadThread(th.profileId, th.updatedAt, last?.from === "them")
                      return (
                        <button
                          key={th.profileId}
                          type="button"
                          onClick={() => go("/app?tab=chat")}
                          className={cn(
                            "w-full flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-left touch-manipulation transition-colors",
                            unread ? "border-sky-400/35 bg-sky-500/10" : "border-white/10 bg-white/[0.03]"
                          )}
                        >
                          <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0">
                            <Image src={p.image} alt="" fill className="object-cover" sizes="40px" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-light truncate">{p.name}</p>
                            <p className="text-[11px] text-muted-foreground font-light truncate">{last?.text}</p>
                          </div>
                          {unread && <span className="h-2 w-2 rounded-full bg-sky-400 shrink-0 ttm-presence-glow-sky" />}
                        </button>
                      )
                    })
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground/70 font-light mt-2">{t("activityTypingHint")}</p>
              </section>

              <section>
                <h3 className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-light mb-2">{t("activitySectionMatches")}</h3>
                {matches.length === 0 ? (
                  <p className="text-xs text-muted-foreground font-light py-2">{t("activityEmptyMatches")}</p>
                ) : (
                  <ul className="flex flex-wrap gap-2">
                    {matches.slice(0, 8).map((p) => (
                      <li key={p.id}>
                        <Link
                          href="/app?tab=chat"
                          onClick={onClose}
                          className="inline-flex items-center gap-2 rounded-full border border-purple-500/25 bg-purple-500/10 pl-1 pr-3 py-1 text-xs font-light text-purple-100"
                        >
                          <span className="relative w-7 h-7 rounded-full overflow-hidden shrink-0">
                            <Image src={p.image} alt="" fill className="object-cover" sizes="40px" />
                          </span>
                          {p.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
            <div className="shrink-0 p-3 border-t border-white/10 safe-area-pb">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-2xl border border-white/12 text-sm font-light text-foreground/85 hover:bg-white/[0.05] touch-manipulation"
              >
                {t("activityClose")}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
