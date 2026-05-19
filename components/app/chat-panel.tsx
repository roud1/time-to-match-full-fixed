"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { useI18n } from "@/lib/i18n"
import {
  getChats,
  getProfileById,
  sendMessage,
  type ChatThread,
} from "@/lib/social-store"
import type { SwipeProfile } from "@/lib/demo-profiles"

export function ChatPanel() {
  const { t, locale, location } = useI18n()
  const [threads, setThreads] = useState<ChatThread[]>([])
  const [activeId, setActiveId] = useState<number | null>(null)
  const [draft, setDraft] = useState("")
  const [typing, setTyping] = useState(false)

  const refresh = () => setThreads(getChats(locale, location.position))

  useEffect(() => {
    refresh()
  }, [locale, location.position])

  useEffect(() => {
    if (activeId == null) return
    setTyping(true)
    const id = setTimeout(() => setTyping(false), 2200)
    return () => clearTimeout(id)
  }, [activeId])

  const activeProfile: SwipeProfile | undefined =
    activeId != null ? getProfileById(activeId, locale, location.position) : undefined

  const activeThread = threads.find((th) => th.profileId === activeId)

  const handleSend = () => {
    if (activeId == null || !draft.trim()) return
    sendMessage(activeId, draft, locale, location.position)
    setDraft("")
    refresh()
  }

  if (activeId != null && activeProfile && activeThread) {
    return (
      <div className="flex flex-col h-[calc(100dvh-8rem)] max-w-lg mx-auto w-full">
        <div className="px-4 py-3 flex items-center gap-3 border-b border-foreground/10 glass sticky top-0 z-10">
          <button
            type="button"
            onClick={() => setActiveId(null)}
            className="w-10 h-10 min-h-[44px] min-w-[44px] rounded-full glass flex items-center justify-center touch-manipulation"
            aria-label={t("profileCancel")}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 ring-2 ring-pink-500/30">
            <Image src={activeProfile.image} alt="" fill className="object-cover" unoptimized />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-light truncate">{activeProfile.name}</p>
            <p className="text-xs text-emerald-400/90 font-light flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {typing ? t("chatTyping") : t("chatOnline")}
            </p>
          </div>
        </div>

        <div className="px-4 py-2 border-b border-amber-500/15 bg-amber-500/5">
          <p className="text-[10px] text-center text-amber-200/80 font-light uppercase tracking-widest">
            {t("chatExpires")} {activeProfile.timeLeft}
          </p>
        </div>

        <motion.div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          <AnimatePresence initial={false}>
            {activeThread.messages.map((msg, i) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.35, delay: i * 0.02 }}
                className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}
              >
                <motion.div
                  className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm font-light ${
                    msg.from === "me"
                      ? "chat-bubble-me text-white rounded-br-md"
                      : "chat-bubble-them rounded-bl-md"
                  }`}
                >
                  {msg.text}
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
          {typing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="chat-bubble-them px-4 py-3 rounded-2xl rounded-bl-md flex gap-1">
                {[0, 1, 2].map((d) => (
                  <motion.span
                    key={d}
                    className="w-1.5 h-1.5 rounded-full bg-foreground/40"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: d * 0.2 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>

        <div className="p-3 md:p-4 border-t border-foreground/10 glass safe-area-pb">
          <motion.div className="flex gap-2 items-end">
            <button
              type="button"
              aria-label={t("chatVoiceHint")}
              className="shrink-0 w-10 h-10 rounded-full glass border border-foreground/10 flex items-center justify-center text-muted-foreground touch-manipulation"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 013-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={t("chatPlaceholder")}
              className="flex-1 rounded-2xl bg-foreground/5 border border-foreground/10 px-4 py-3 text-sm font-light outline-none focus:border-pink-500/40 min-h-[44px]"
            />
            <button
              type="button"
              onClick={handleSend}
              className="shrink-0 px-4 py-3 min-h-[44px] rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-light touch-manipulation"
            >
              {t("chatSend")}
            </button>
          </motion.div>
          <p className="text-[9px] text-center text-muted-foreground/50 mt-2 font-light">
            {t("chatReact")} · demo
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 pt-4 pb-6 max-w-lg mx-auto w-full">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{t("tabChat")}</h1>
        <p className="text-sm text-muted-foreground font-extralight mt-1">{t("chatSubtitle")}</p>
      </motion.div>

      {threads.length === 0 ? (
        <div className="glass-card rounded-3xl p-10 text-center border border-foreground/10">
          <p className="text-muted-foreground font-extralight">{t("chatEmpty")}</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {threads.map((thread, index) => {
            const profile = getProfileById(thread.profileId, locale, location.position)
            if (!profile) return null
            const last = thread.messages[thread.messages.length - 1]
            return (
              <motion.li
                key={thread.profileId}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <button
                  type="button"
                  onClick={() => setActiveId(thread.profileId)}
                  className="w-full premium-profile-card rounded-2xl p-3 flex items-center gap-3 text-left hover:border-pink-500/20 transition-colors touch-manipulation min-h-[72px]"
                >
                  <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0 ring-2 ring-pink-500/20">
                    <Image src={profile.image} alt="" fill className="object-cover" unoptimized />
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-background" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-light truncate">{profile.name}</p>
                    <p className="text-xs text-muted-foreground font-extralight truncate">{last?.text}</p>
                  </div>
                  <span className="text-[10px] text-pink-400/80 tabular-nums shrink-0">{profile.timeLeft}</span>
                </button>
              </motion.li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
