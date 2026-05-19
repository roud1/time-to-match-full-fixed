"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
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

  const refresh = () => setThreads(getChats(locale, location.position))

  useEffect(() => {
    refresh()
  }, [locale, location.position])

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
        <div className="px-4 py-3 flex items-center gap-3 border-b border-foreground/10">
          <button
            type="button"
            onClick={() => setActiveId(null)}
            className="w-9 h-9 rounded-full glass flex items-center justify-center"
            aria-label={t("profileCancel")}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0">
            <Image src={activeProfile.image} alt="" fill className="object-cover" unoptimized />
          </div>
          <div className="min-w-0">
            <p className="font-light truncate">{activeProfile.name}</p>
            <p className="text-xs text-muted-foreground font-light">{activeProfile.location}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {activeThread.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm font-light ${
                  msg.from === "me"
                    ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-br-md"
                    : "glass border border-foreground/10 rounded-bl-md"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-foreground/10 flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={t("chatPlaceholder")}
            className="flex-1 rounded-full bg-foreground/5 border border-foreground/10 px-4 py-2.5 text-sm font-light outline-none focus:border-pink-500/40"
          />
          <button
            type="button"
            onClick={handleSend}
            className="px-4 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-light"
          >
            {t("chatSend")}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 pt-4 pb-6 max-w-lg mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-extralight tracking-tight">{t("tabChat")}</h1>
        <p className="text-sm text-muted-foreground font-light mt-1">{t("chatSubtitle")}</p>
      </div>

      {threads.length === 0 ? (
        <div className="glass-card rounded-3xl p-10 text-center">
          <p className="text-muted-foreground font-light">{t("chatEmpty")}</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {threads.map((thread) => {
            const profile = getProfileById(thread.profileId, locale, location.position)
            if (!profile) return null
            const last = thread.messages[thread.messages.length - 1]
            return (
              <li key={thread.profileId}>
                <button
                  type="button"
                  onClick={() => setActiveId(thread.profileId)}
                  className="w-full glass-card rounded-2xl p-3 flex items-center gap-3 border border-foreground/10 text-left hover:bg-foreground/5 transition-colors"
                >
                  <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0">
                    <Image src={profile.image} alt="" fill className="object-cover" unoptimized />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-light truncate">{profile.name}</p>
                    <p className="text-xs text-muted-foreground font-light truncate">{last?.text}</p>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
