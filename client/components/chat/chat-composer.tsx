"use client"

import { SendHorizontal } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useReducedMotion } from "motion/react"
import { cn } from "@/client/lib/utils"

type ChatComposerProps = {
  draft: string
  onDraftChange: (v: string) => void
  onSend: () => void
  replySnippet: string | null
  onClearReply: () => void
  voiceSeed: number
  /** When true, input is hidden and a calm notice is shown (e.g. muted thread). */
  disabled?: boolean
  disabledHint?: string
  labels: {
    placeholder: string
    send: string
    voiceHint: string
    voiceDemo: string
    attach: string
    mediaDemo: string
    voiceDuration: string
    replyingTo: string
    cancelReply: string
  }
}

export function ChatComposer({
  draft,
  onDraftChange,
  onSend,
  replySnippet,
  onClearReply,
  disabled,
  disabledHint,
  labels,
}: ChatComposerProps) {
  const reduce = useReducedMotion()

  const handleSend = () => {
    if (disabled) return
    if (!draft.trim()) return
    onSend()
    onClearReply()
  }

  return (
    <div className="ttm-chat-composer__inner safe-area-pb">
        {disabled && (
          <div className="rounded-2xl border border-sky-500/25 bg-sky-500/[0.08] px-4 py-3 text-center">
            <p className="text-sm font-light text-sky-100/90 leading-relaxed">{disabledHint}</p>
          </div>
        )}
        <div className={cn(disabled && "pointer-events-none opacity-[0.22]")}>
        <AnimatePresence>
          {replySnippet && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="flex items-start gap-2 rounded-2xl border border-white/14 bg-white/[0.08] px-3 py-2"
            >
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-white/80/70">{labels.replyingTo}</p>
                <p className="text-xs text-foreground/85 font-light line-clamp-2">{replySnippet}</p>
              </div>
              <button type="button" onClick={onClearReply} className="text-[11px] text-muted-foreground shrink-0 touch-manipulation py-1">
                {labels.cancelReply}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Photo and voice buttons were removed: they only showed a local preview / a fake waveform and sent nothing. */}
        <div className="ttm-chat-composer__row">
          <label className="flex-1 min-w-0 sr-only" htmlFor="chat-composer-input">
            {labels.placeholder}
          </label>
          <textarea
            id="chat-composer-input"
            rows={1}
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder={labels.placeholder}
            className="ttm-chat-composer__input"
          />
          <motion.button
            type="button"
            whileTap={reduce ? undefined : { scale: 0.94 }}
            onClick={handleSend}
            disabled={!draft.trim()}
            aria-label={labels.send}
            className={cn(
              "ttm-chat-send shrink-0 min-h-[44px] px-4 rounded-2xl text-sm font-light text-white touch-manipulation",
              "ttm-brand-cta rounded-2xl min-h-0 border-0",
              !draft.trim() && "opacity-40 pointer-events-none"
            )}
          >
            <span className="ttm-chat-send__label">{labels.send}</span>
            <SendHorizontal className="ttm-chat-send__icon" aria-hidden />
          </motion.button>
        </div>
        </div>
    </div>
  )
}
