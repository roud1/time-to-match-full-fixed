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
import {
  BookOpen,
  Briefcase,
  Camera,
  Clapperboard,
  Coffee,
  Dumbbell,
  Gamepad2,
  HeartPulse,
  Mountain,
  Music,
  Music2,
  Palette,
  PartyPopper,
  PawPrint,
  PenTool,
  Plane,
  Shirt,
  Sparkles,
  UtensilsCrossed,
  Wine,
  type LucideIcon,
} from "lucide-react"
import "./interest-picker.css"

const ICONS: Record<InterestId, LucideIcon> = {
  travel: Plane,
  coffee: Coffee,
  photography: Camera,
  art: Palette,
  music: Music,
  sports: Dumbbell,
  fitness: HeartPulse,
  yoga: Sparkles,
  cooking: UtensilsCrossed,
  movies: Clapperboard,
  books: BookOpen,
  nightlife: PartyPopper,
  nature: Mountain,
  design: PenTool,
  business: Briefcase,
  gaming: Gamepad2,
  fashion: Shirt,
  pets: PawPrint,
  wine: Wine,
  dance: Music2,
}

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
      <div className="lv-interests" role="group" aria-label={t("regInterests")}>
        {options.map((option) => {
          const selected = value.includes(option.id)
          const disabled = !selected && value.length >= MAX_INTERESTS
          const Icon = ICONS[option.id as InterestId] ?? Sparkles

          return (
            <button
              key={option.id}
              type="button"
              disabled={disabled}
              aria-pressed={selected}
              onClick={() => toggle(option.id)}
              className={cn("lv-interests__item", selected && "is-selected")}
            >
              <Icon aria-hidden strokeWidth={1.7} />
              <span>{option.label}</span>
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
