"use client"

import { useMemo } from "react"
import { useI18n } from "@/lib/i18n"
import {
  CUSTOM_CITY_ID,
  getCitiesForLocale,
  type CityId,
  type CitySelectValue,
} from "@/lib/cities"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type CityFieldProps = {
  cityId: CitySelectValue
  customCity: string
  onCityIdChange: (id: CitySelectValue) => void
  onCustomCityChange: (value: string) => void
  error?: string
}

export function CityField({
  cityId,
  customCity,
  onCityIdChange,
  onCustomCityChange,
  error,
}: CityFieldProps) {
  const { t, locale } = useI18n()
  const cities = useMemo(() => getCitiesForLocale(locale), [locale])
  const isManual = cityId === CUSTOM_CITY_ID

  return (
    <div className="space-y-3">
      <select
        value={cityId}
        onChange={(e) => onCityIdChange(e.target.value as CitySelectValue)}
        className={cn(
          "h-11 w-full rounded-xl border bg-foreground/5 px-3 text-sm font-light outline-none transition-[color,box-shadow]",
          "border-foreground/10 focus:border-pink-500/40 focus:ring-[3px] focus:ring-pink-500/20",
          !cityId && "text-muted-foreground",
          error && !isManual && "border-red-500/50"
        )}
      >
        <option value="" disabled>
          {t("regCitySelect")}
        </option>
        {cities.map((city) => (
          <option key={city.id} value={city.id} className="bg-background text-foreground">
            {city.label}
          </option>
        ))}
        <option value={CUSTOM_CITY_ID} className="bg-background text-foreground">
          {t("regCityOther")}
        </option>
      </select>

      {isManual && (
        <Input
          value={customCity}
          onChange={(e) => onCustomCityChange(e.target.value)}
          placeholder={t("regCityPlaceholder")}
          className={cn(
            "h-11 rounded-xl bg-foreground/5 border-foreground/10 font-light",
            error && "border-red-500/50"
          )}
        />
      )}

      <button
        type="button"
        onClick={() => {
          if (isManual) {
            onCustomCityChange("")
            onCityIdChange("")
          } else {
            onCityIdChange(CUSTOM_CITY_ID)
          }
        }}
        className="text-xs text-pink-400 font-light hover:underline"
      >
        {isManual ? t("regCityFromList") : t("regCityManual")}
      </button>

      {error && <p className="text-xs text-red-400 font-light">{error}</p>}
    </div>
  )
}
