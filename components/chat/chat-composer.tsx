"use client"

import { useRef, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { useReducedMotion } from "motion/react"
import { ChatVoiceNoteDemo } from "@/components/chat/chat-voice-note-demo"
import { cn } from "@/lib/utils"

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
  voiceSeed,
  disabled,
  disabledHint,
  labels,
}: ChatComposerProps) {
  const reduce = useReducedMotion()
  const fileRef = useRef<HTMLInputElement>(null)
  const [showVoice, setShowVoice] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const handleSend = () => {
    if (disabled) return
    if (!draft.trim()) return
    onSend()
    setImagePreview(null)
    onClearReply()
  }

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    e.target.value = ""
    if (!f || !f.type.startsWith("image/")) return
    const url = URL.createObjectURL(f)
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return url
    })
  }

  return (
    <div className="border-t border-white/10 bg-black/40 backdrop-blur-2xl safe-area-pb shadow-[0_-16px_48px_-24px_rgba(0,0,0,0.85)]">
      <div className="mx-auto w-full max-w-lg px-4 pt-2.5 pb-3 space-y-2 relative">
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

        {imagePreview && (
          <div className="relative rounded-2xl overflow-hidden border border-white/15">
            {/* eslint-disable-next-line @next/next/no-img-element -- blob preview */}
            <img src={imagePreview} alt="" className="w-full max-h-40 object-cover opacity-90" />
            <button
              type="button"
              className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/60 text-white text-lg leading-none border border-white/20"
              onClick={() => {
                setImagePreview((prev) => {
                  if (prev) URL.revokeObjectURL(prev)
                  return null
                })
              }}
              aria-label={labels.cancelReply}
            >
              ×
            </button>
            <p className="text-[10px] text-center text-muted-foreground py-1.5 bg-black/50 font-light">{labels.mediaDemo}</p>
          </div>
        )}

        <AnimatePresence>
          {showVoice && (
            <motion.div
              key="voice"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <ChatVoiceNoteDemo seed={voiceSeed} durationLabel={labels.voiceDuration} demoLabel={labels.voiceDemo} />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-2 items-end">
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="shrink-0 h-11 w-11 rounded-2xl border border-white/12 bg-white/[0.05] flex items-center justify-center text-muted-foreground hover:text-foreground active:scale-95 transition-transform touch-manipulation"
            aria-label={labels.attach}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setShowVoice((v) => !v)}
            className={cn(
              "shrink-0 h-11 w-11 rounded-2xl border flex items-center justify-center touch-manipulation active:scale-95 transition-all",
              showVoice
                ? "border-sky-400/50 bg-sky-500/20 text-sky-200"
                : "border-white/12 bg-white/[0.05] text-muted-foreground hover:text-foreground"
            )}
            aria-label={labels.voiceHint}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 013-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
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
            className={cn(
              "flex-1 min-w-0 max-h-32 min-h-[44px] rounded-2xl resize-none bg-white/[0.06] border border-white/12",
              "px-4 py-3 text-[15px] font-light outline-none focus:border-white/18 focus:ring-1 focus:ring-white/10",
              "placeholder:text-muted-foreground/55"
            )}
          />
          <motion.button
            type="button"
            whileTap={reduce ? undefined : { scale: 0.94 }}
            onClick={handleSend}
            disabled={!draft.trim()}
            className={cn(
              "shrink-0 min-h-[44px] px-4 rounded-2xl text-sm font-light text-white touch-manipulation",
              "cin-btn-primary rounded-2xl",
              !draft.trim() && "opacity-40 pointer-events-none"
            )}
          >
            {labels.send}
          </motion.button>
        </div>
        </div>
      </div>
    </div>
  )
}
