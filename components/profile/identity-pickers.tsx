"use client"

import { motion } from "motion/react"
import { useReducedMotion } from "motion/react"
import type { Locale } from "@/lib/i18n"
import {
  VIBE_OPTIONS,
  INTENTION_OPTIONS,
  MOOD_OPTIONS,
  MAX_VIBES,
  MIN_VIBES,
  getVibeLabel,
  getIntentionLabel,
  getMoodLabel,
} from "@/lib/profile-identity"
import { cn } from "@/lib/utils"

export function VibeCloudPicker({
  value,
  onChange,
  locale,
  error,
}: {
  value: string[]
  onChange: (ids: string[]) => void
  locale: Locale
  error?: string
}) {
  const reduce = useReducedMotion()
  const toggle = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((x) => x !== id))
      return
    }
    if (value.length >= MAX_VIBES) return
    onChange([...value, id])
  }

  return (
    <div className="space-y-2">
      <p className="text-[11px] text-muted-foreground font-light uppercase tracking-[0.18em]">{MIN_VIBES}–{MAX_VIBES}</p>
      <div className="flex flex-wrap gap-2">
        {VIBE_OPTIONS.map((v, i) => {
          const on = value.includes(v.id)
          return (
            <motion.button
              key={v.id}
              type="button"
              layout={!reduce}
              initial={false}
              whileTap={{ scale: 0.96 }}
              onClick={() => toggle(v.id)}
              className={cn(
                "rounded-full px-3.5 py-2 text-sm font-light border transition-all duration-300 touch-manipulation",
                on
                  ? "border-pink-400/50 bg-gradient-to-r from-pink-500/25 to-purple-600/20 text-pink-100 shadow-[0_0_24px_-8px_rgba(236,72,153,0.45)]"
                  : "border-white/10 bg-white/[0.04] text-foreground/75 hover:border-white/20"
              )}
              style={{ transitionDelay: reduce ? "0ms" : `${i * 15}ms` }}
            >
              {getVibeLabel(v.id, locale)}
            </motion.button>
          )
        })}
      </div>
      {error && <p className="text-xs text-red-400/90 font-light">{error}</p>}
    </div>
  )
}

export function IntentionDeck({
  value,
  onChange,
  locale,
}: {
  value: string
  onChange: (id: string) => void
  locale: Locale
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-1">
      {INTENTION_OPTIONS.map((opt) => {
        const on = value === opt.id
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={cn(
              "rounded-2xl border px-4 py-3 text-left text-sm font-light transition-all duration-300 touch-manipulation",
              on
                ? "border-purple-400/45 bg-purple-500/15 text-purple-100 shadow-[0_0_28px_-10px_rgba(168,85,247,0.4)]"
                : "border-white/10 bg-white/[0.03] text-foreground/80 hover:border-white/18"
            )}
          >
            {getIntentionLabel(opt.id, locale)}
          </button>
        )
      })}
    </div>
  )
}

export function MoodOrbit({
  value,
  onChange,
  locale,
}: {
  value: string
  onChange: (id: string) => void
  locale: Locale
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {MOOD_OPTIONS.map((opt) => {
        const on = value === opt.id
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={cn(
              "rounded-2xl px-4 py-2.5 text-xs font-light border touch-manipulation transition-all",
              on
                ? "border-sky-400/45 bg-sky-500/15 text-sky-100"
                : "border-white/10 bg-white/[0.04] text-foreground/75 hover:border-white/20"
            )}
          >
            {getMoodLabel(opt.id, locale)}
          </button>
        )
      })}
    </div>
  )
}
