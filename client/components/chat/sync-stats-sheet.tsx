"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence, useReducedMotion } from "motion/react"
import type { ChatMessage } from "@/client/lib/social-store"
import type { ConnectionView, ConnectionCopyKeys } from "@/client/lib/connection-system"
import type { SyncCopyKeys } from "@/client/lib/sync-copy"
import type { ConnectionAnalysisBundle } from "@/client/components/sync/connection-header"
import { ConnectionHeader } from "@/client/components/sync/connection-header"
import { SyncStatusBar } from "@/client/components/chat/connection"
import type { ConnectionAnalysis } from "@/client/lib/connection-engine"
import type { SyncMetrics } from "@/client/lib/sync-system"
import type { ConnectionAuraProfile, RelationshipIdentity } from "@/client/lib/relationship-identity/types"
import type { RelationshipMoment } from "@/client/lib/relationship-identity/types"
import { useI18n } from "@/client/lib/i18n"
import { cn } from "@/client/lib/utils"

type SyncStatsSheetProps = {
  open: boolean
  onClose: () => void
  profileName: string
  connectionView: ConnectionView | null
  messages: ChatMessage[]
  copy: ConnectionCopyKeys & SyncCopyKeys & { waitingReply: string }
  analysis: ConnectionAnalysis | null
  syncMetrics: SyncMetrics | null | undefined
  analysisBundle?: ConnectionAnalysisBundle
  showTyping?: boolean
  hasUnread?: boolean
  justSent?: boolean
  syncSurge?: boolean
  relationshipIdentity?: RelationshipIdentity | null
  relationshipAura?: ConnectionAuraProfile | null
  relationshipMoments?: RelationshipMoment[]
}

export function SyncStatsSheet({
  open,
  onClose,
  profileName,
  connectionView,
  messages,
  copy,
  analysis,
  syncMetrics,
  analysisBundle,
  showTyping,
  hasUnread,
  justSent,
  syncSurge,
  relationshipIdentity,
  relationshipAura,
  relationshipMoments = [],
}: SyncStatsSheetProps) {
  const { t } = useI18n()
  const reduce = useReducedMotion()
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

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label={t("activityClose")}
            className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? undefined : { opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal
            aria-labelledby="sync-stats-title"
            className={cn(
              "fixed z-[121] left-0 right-0 bottom-0 mx-auto w-full max-w-lg",
              "max-h-[min(88dvh,640px)] flex flex-col",
              "rounded-t-[1.35rem] border border-white/10 border-b-0",
              "bg-[#0a0a0e]/98 backdrop-blur-2xl shadow-[0_-24px_80px_-24px_rgba(0,0,0,0.9)]"
            )}
            initial={reduce ? false : { y: "100%" }}
            animate={{ y: 0 }}
            exit={reduce ? undefined : { y: "100%" }}
            transition={{ type: "spring", stiffness: 420, damping: 36 }}
          >
            <div className="shrink-0 flex items-center justify-between gap-3 px-5 pt-4 pb-3 border-b border-white/[0.06]">
              <div className="min-w-0">
                <p
                  id="sync-stats-title"
                  className="text-[10px] uppercase tracking-[0.2em] text-white/35 font-extralight"
                >
                  {t("syncLabel")}
                </p>
                <h2 className="text-lg font-extralight text-white/95 truncate">
                  {t("chatSyncStatsTitle").replace("{name}", profileName)}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 w-10 h-10 rounded-xl border border-white/12 bg-white/[0.04] text-white/70 touch-manipulation"
                aria-label={t("activityClose")}
              >
                ×
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-4">
              {connectionView ? (
                <ConnectionHeader
                  view={connectionView}
                  messages={messages}
                  copy={copy}
                  showTyping={showTyping}
                  hasUnread={hasUnread}
                  justSent={justSent}
                  syncSurge={syncSurge}
                  analysisBundle={analysisBundle}
                  relationshipIdentity={relationshipIdentity}
                  relationshipAura={relationshipAura}
                  relationshipMoments={relationshipMoments}
                  alwaysExpanded
                />
              ) : analysis ? (
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-4">
                  <SyncStatusBar analysis={analysis} copy={copy} syncSurge={syncSurge} />
                  <p className="mt-3 text-[11px] text-white/45 font-extralight">{copy.syncStatusWaiting}</p>
                </div>
              ) : (
                <p className="text-sm text-white/50 font-extralight text-center py-8">
                  {copy.syncStatusWaiting}
                </p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
