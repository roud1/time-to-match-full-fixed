"use client"

import { useMemo } from "react"
import { useI18n } from "@/client/lib/i18n"
import {
  MAX_INTERESTS,
  MIN_INTERESTS,
  getInterestsForLocale,
  type InterestId,
} from "@/client/lib/interests"
import { cn } from "@/client/lib/utils"

type InterestPickerProps = {
  value: InterestId[]
  onChange: (ids: InterestId[]) => void
  error?: string
}

export function InterestPicker({ value, onChange, error }: InterestPickerProps) {
  const { t, locale } = useI18n()
  const options = useMemo(() => getInterestsForLocale(locale), [locale])

  const toggle = (id: InterestId) => {
    if (value.includes(id)) {
      onChange(value.filter((item) => item !== id))
      return
    }
    if (value.length >= MAX_INTERESTS) return
    onChange([...value, id])
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground font-light">
        {t("regInterestsHint")} ({value.length}/{MAX_INTERESTS})
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = value.includes(option.id)
          const disabled = !selected && value.length >= MAX_INTERESTS

          return (
            <button
              key={option.id}
              type="button"
              disabled={disabled}
              onClick={() => toggle(option.id)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                selected
                  ? "border-[var(--accent)] bg-[var(--accent-soft-bg)] text-[var(--text-primary)] shadow-sm"
                  : "border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:border-[var(--accent-soft-border)] hover:bg-[var(--accent-soft-bg)]/70",
                disabled && "opacity-45 cursor-not-allowed hover:bg-[var(--bg-secondary)]"
              )}
            >
              {option.label}
            </button>
          )
        })}
      </div>
      {value.length > 0 && value.length < MIN_INTERESTS && (
        <p className="text-xs text-muted-foreground font-light">
          {t("regInterestsMin").replace("{n}", String(MIN_INTERESTS))}
        </p>
      )}
      {error && <p className="text-xs text-red-400 font-light">{error}</p>}
    </div>
  )
}
