"use client"

import { useEffect, useId, useMemo, useRef, useState } from "react"
import { useI18n } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n/config"
import {
  CUSTOM_CITY_ID,
  filterCities,
  findCityIdFromName,
  getCityLabel,
  type CityId,
  type CitySelectValue,
} from "@/lib/cities"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import "@/app/city-field.css"

type CityFieldProps = {
  cityId: CitySelectValue
  customCity: string
  onCityIdChange: (id: CitySelectValue) => void
  onCustomCityChange: (value: string) => void
  error?: string
}

function displayValue(
  cityId: CitySelectValue,
  customCity: string,
  locale: Locale
): string {
  if (cityId && cityId !== CUSTOM_CITY_ID) {
    return getCityLabel(cityId as CityId, locale)
  }
  return customCity
}

export function CityField({
  cityId,
  customCity,
  onCityIdChange,
  onCustomCityChange,
  error,
}: CityFieldProps) {
  const { t, locale } = useI18n()
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(() => displayValue(cityId, customCity, locale))
  const [activeIndex, setActiveIndex] = useState(0)

  const suggestions = useMemo(() => filterCities(query, locale, 12), [query, locale])
  const trimmed = query.trim()
  const exactMatch = trimmed ? findCityIdFromName(trimmed) : null
  const showCustomOption =
    trimmed.length > 0 && !exactMatch && !suggestions.some((c) => c.label.toLowerCase() === trimmed.toLowerCase())

  const optionCount = suggestions.length + (showCustomOption ? 1 : 0)

  useEffect(() => {
    setQuery(displayValue(cityId, customCity, locale))
  }, [cityId, customCity, locale])

  useEffect(() => {
    const onDocClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onDocClick)
    return () => document.removeEventListener("mousedown", onDocClick)
  }, [])

  const selectPreset = (id: CityId) => {
    onCityIdChange(id)
    onCustomCityChange("")
    setQuery(getCityLabel(id, locale))
    setOpen(false)
  }

  const commitCustom = (value: string) => {
    const text = value.trim()
    if (!text) {
      onCityIdChange("")
      onCustomCityChange("")
      setQuery("")
      return
    }
    const matched = findCityIdFromName(text)
    if (matched) {
      selectPreset(matched)
      return
    }
    onCityIdChange(CUSTOM_CITY_ID)
    onCustomCityChange(text)
    setQuery(text)
  }

  const commitQuery = () => {
    commitCustom(query)
    setOpen(false)
  }

  const handleSelectIndex = (index: number) => {
    if (index < suggestions.length) {
      selectPreset(suggestions[index]!.id)
      return
    }
    if (showCustomOption) {
      commitCustom(trimmed)
      setOpen(false)
    }
  }

  return (
    <div ref={rootRef} className="ttm-city-field">
      <Input
        value={query}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-invalid={Boolean(error)}
        placeholder={t("regCityPlaceholder")}
        autoComplete="address-level2"
        onChange={(e) => {
          const next = e.target.value
          setQuery(next)
          setOpen(true)
          setActiveIndex(0)

          const matched = findCityIdFromName(next)
          if (matched && next.trim().toLowerCase() === getCityLabel(matched, locale).toLowerCase()) {
            onCityIdChange(matched)
            onCustomCityChange("")
          } else if (!next.trim()) {
            onCityIdChange("")
            onCustomCityChange("")
          } else {
            onCityIdChange(CUSTOM_CITY_ID)
            onCustomCityChange(next)
          }
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          window.setTimeout(() => {
            if (!rootRef.current?.contains(document.activeElement)) {
              commitQuery()
            }
          }, 120)
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault()
            setOpen(true)
            setActiveIndex((i) => (optionCount === 0 ? 0 : (i + 1) % optionCount))
            return
          }
          if (e.key === "ArrowUp") {
            e.preventDefault()
            setOpen(true)
            setActiveIndex((i) => (optionCount === 0 ? 0 : (i - 1 + optionCount) % optionCount))
            return
          }
          if (e.key === "Enter" && open && optionCount > 0) {
            e.preventDefault()
            handleSelectIndex(activeIndex)
            return
          }
          if (e.key === "Escape") {
            setOpen(false)
            setQuery(displayValue(cityId, customCity, locale))
          }
        }}
        className={cn(
          "ttm-city-field__input h-11 rounded-xl bg-foreground/5 border-foreground/10 font-light",
          error && "border-red-500/50"
        )}
      />

      {open && (suggestions.length > 0 || showCustomOption || (trimmed && !optionCount)) ? (
        <ul id={listId} role="listbox" className="ttm-city-field__list">
          {suggestions.map((city, index) => (
            <li key={city.id} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={activeIndex === index}
                className={cn(
                  "ttm-city-field__option",
                  activeIndex === index && "ttm-city-field__option--active"
                )}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectPreset(city.id)}
              >
                {city.label}
              </button>
            </li>
          ))}
          {showCustomOption ? (
            <li role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={activeIndex === suggestions.length}
                className={cn(
                  "ttm-city-field__option ttm-city-field__option--custom",
                  activeIndex === suggestions.length && "ttm-city-field__option--active"
                )}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => commitCustom(trimmed)}
              >
                {t("regCityUseCustom").replace("{city}", trimmed)}
              </button>
            </li>
          ) : null}
          {trimmed && suggestions.length === 0 && !showCustomOption ? (
            <li className="ttm-city-field__empty" role="presentation">
              {t("regCityNoResults")}
            </li>
          ) : null}
        </ul>
      ) : null}

      {error ? <p className="text-xs text-red-400 font-light mt-1.5">{error}</p> : null}
    </div>
  )
}
