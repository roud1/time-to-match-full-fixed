"use client"

import { motion } from "motion/react"
import { useReducedMotion } from "motion/react"
import { ChatVoiceNoteDemo } from "@/components/chat/chat-voice-note-demo"

type ProfileVoiceIntroProps = {
  seed: number
  recorded: boolean
  onRecordedChange: (v: boolean) => void
  title: string
  subtitle: string
  voiceHint: string
  voiceDemo: string
  voiceDuration: string
  markReady: string
}

export function ProfileVoiceIntro({
  seed,
  recorded,
  onRecordedChange,
  title,
  subtitle,
  voiceHint,
  voiceDemo,
  voiceDuration,
  markReady,
}: ProfileVoiceIntroProps) {
  const reduce = useReducedMotion()

  return (
    <div className="rounded-[1.35rem] border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent backdrop-blur-2xl p-4 md:p-5 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.85)]">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-pink-200/80 font-light mb-1">{voiceHint}</p>
          <h3 className="text-lg font-extralight text-foreground/95">{title}</h3>
          <p className="text-xs text-muted-foreground font-light mt-1 leading-relaxed">{subtitle}</p>
        </div>
        {recorded && (
          <span className="shrink-0 text-[10px] px-2.5 py-1 rounded-full border border-emerald-500/35 bg-emerald-500/10 text-emerald-200">
            ✓
          </span>
        )}
      </div>
      <ChatVoiceNoteDemo seed={seed} durationLabel={voiceDuration} demoLabel={voiceDemo} />
      {!recorded ? (
        <motion.button
          type="button"
          whileTap={reduce ? undefined : { scale: 0.98 }}
          onClick={() => onRecordedChange(true)}
          className="mt-4 w-full py-3 rounded-2xl border border-pink-500/30 bg-pink-500/10 text-sm font-light text-pink-100 hover:bg-pink-500/15 touch-manipulation transition-colors"
        >
          {markReady}
        </motion.button>
      ) : (
        <p className="mt-3 text-center text-[11px] text-muted-foreground font-light">{subtitle}</p>
      )}
    </div>
  )
}
