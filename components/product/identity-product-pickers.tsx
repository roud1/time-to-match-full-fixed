"use client"

import { motion, useReducedMotion } from "motion/react"
import type { Locale } from "@/lib/i18n"
import {
  ENERGY_TAG_OPTIONS,
  COMMUNICATION_STYLE_OPTIONS,
  CONNECTION_PREF_OPTIONS,
  MAX_ENERGY_TAGS,
  MIN_ENERGY_TAGS,
  getEnergyTagLabel,
  getCommunicationStyleLabel,
  getConnectionPrefLabel,
} from "@/lib/profile-identity"
import { cn } from "@/lib/utils"

export function EnergyTagPicker({
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
    if (value.length >= MAX_ENERGY_TAGS) return
    onChange([...value, id])
  }

  return (
    <div className="space-y-2">
      <p className="p9-register-step-label">
        {MIN_ENERGY_TAGS}–{MAX_ENERGY_TAGS}
      </p>
      <div className="flex flex-wrap gap-2">
        {ENERGY_TAG_OPTIONS.map((tag) => {
          const on = value.includes(tag.id)
          return (
            <motion.button
              key={tag.id}
              type="button"
              whileTap={reduce ? undefined : { scale: 0.96 }}
              onClick={() => toggle(tag.id)}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-light border transition-all duration-300",
                on
                  ? "border-indigo-400/35 bg-indigo-500/15 text-indigo-100/90 shadow-[0_0_20px_-6px_var(--ttm-glow-sync-soft)]"
                  : "border-white/10 bg-white/[0.04] text-foreground/70 hover:border-white/18"
              )}
            >
              {getEnergyTagLabel(tag.id, locale)}
            </motion.button>
          )
        })}
      </div>
      {error && <p className="text-xs text-red-400/90 font-light">{error}</p>}
    </div>
  )
}

export function CommunicationStylePicker({
  value,
  onChange,
  locale,
}: {
  value: string
  onChange: (id: string) => void
  locale: Locale
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {COMMUNICATION_STYLE_OPTIONS.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={cn(
            "ttm-choice text-left py-3 px-3.5 border rounded-xl text-sm font-light transition-all",
            value === opt.id
              ? "border-indigo-400/40 bg-indigo-500/12 text-indigo-100/95"
              : "border-white/10 bg-white/[0.03] text-foreground/75 hover:border-white/16"
          )}
        >
          {getCommunicationStyleLabel(opt.id, locale)}
        </button>
      ))}
    </div>
  )
}

export function ConnectionPrefPicker({
  value,
  onChange,
  locale,
}: {
  value: string
  onChange: (id: string) => void
  locale: Locale
}) {
  return (
    <div className="flex flex-col gap-2">
      {CONNECTION_PREF_OPTIONS.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={cn(
            "ttm-choice text-left py-2.5 px-3.5 border rounded-xl text-sm font-light transition-all",
            value === opt.id
              ? "border-violet-400/35 bg-violet-500/10 text-violet-100/90"
              : "border-white/10 bg-white/[0.03] text-foreground/72 hover:border-white/16"
          )}
        >
          {getConnectionPrefLabel(opt.id, locale)}
        </button>
      ))}
    </div>
  )
}
