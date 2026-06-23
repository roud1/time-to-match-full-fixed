"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  type ReactNode,
} from "react"
import { useUserLocation, type LocationStatus } from "@/hooks/use-user-location"
import {
  PROFILE_CITY_COORDS,
  distanceKm,
  formatDistance,
  type GeoPosition,
} from "@/lib/geo"
import {
  type Locale,
  LOCALE_FALLBACK,
  isLocale,
  localeNames,
  localeShortNames,
  localeToBcp47,
} from "@/lib/i18n/config"
import enMessages from "@/lib/i18n/locales/en.json"
import ukMessages from "@/lib/i18n/locales/uk.json"
import deMessages from "@/lib/i18n/locales/de.json"
import esMessages from "@/lib/i18n/locales/es.json"
import plMessages from "@/lib/i18n/locales/pl.json"
import frMessages from "@/lib/i18n/locales/fr.json"
import itMessages from "@/lib/i18n/locales/it.json"
import trMessages from "@/lib/i18n/locales/tr.json"
import ruMessages from "@/lib/i18n/locales/ru.json"

export type { Locale } from "@/lib/i18n/config"
export {
  LOCALES,
  localeNames,
  localeShortNames,
  localeToBcp47,
  isLocale,
  DEFAULT_LOCALE,
} from "@/lib/i18n/config"

export type TranslationKey = keyof typeof ruMessages
type LocaleMessages = typeof ruMessages
type ProfileTranslation = (typeof ruMessages.profiles)[number]

const JSON_LOCALES: Partial<Record<Locale, LocaleMessages>> = {
  ru: ruMessages as unknown as LocaleMessages,
  en: enMessages as unknown as LocaleMessages,
  uk: ukMessages as unknown as LocaleMessages,
  de: deMessages as unknown as LocaleMessages,
  es: esMessages as unknown as LocaleMessages,
  pl: plMessages as unknown as LocaleMessages,
  fr: frMessages as unknown as LocaleMessages,
  it: itMessages as unknown as LocaleMessages,
  tr: trMessages as unknown as LocaleMessages,
}

function getLocalePack(loc: Locale): LocaleMessages | undefined {
  return JSON_LOCALES[loc]
}

export function buildLocaleDict(locale: Locale): LocaleMessages {
  const chain = [...LOCALE_FALLBACK[locale]].reverse()
  let merged: Record<string, unknown> = {}
  for (const loc of chain) {
    const pack = getLocalePack(loc)
    if (pack) merged = { ...merged, ...pack }
  }
  return merged as LocaleMessages
}

const PROFILE_AGES = [25, 28, 27, 26] as const
const PROFILE_TIMERS = ["23:45:12", "47:22:08", "12:15:33", "68:30:45"] as const

export function buildProfileCards(locale: Locale, userPosition?: GeoPosition | null) {
  const dict = buildLocaleDict(locale)
  return dict.profiles.map((profile, index) => {
    const distance =
      userPosition != null
        ? formatDistance(locale, distanceKm(userPosition, PROFILE_CITY_COORDS[index]))
        : dict.profileDistances[index]

    return {
      id: index + 1,
      ...profile,
      age: PROFILE_AGES[index],
      distance,
      image: `/images/profile-${index + 1}.jpg`,
      timeLeft: PROFILE_TIMERS[index],
    }
  })
}

interface LocationContextValue {
  status: LocationStatus
  city: string | null
  position: GeoPosition | null
  countryCode: string | null
  requestLocation: (options?: { force?: boolean }) => void
}

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: TranslationKey) => string
  profiles: ProfileTranslation[]
  profileCards: ReturnType<typeof buildProfileCards>
  location: LocationContextValue
}

const I18nContext = createContext<I18nContextType | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("ru")

  useEffect(() => {
    const saved = localStorage.getItem("locale")
    if (saved && isLocale(saved)) setLocale(saved)
  }, [])

  useEffect(() => {
    document.documentElement.lang = localeToBcp47(locale).split("-")[0] ?? "ru"
  }, [locale])

  const localeDict = useMemo(() => buildLocaleDict(locale), [locale])

  const handleSetLocale = useCallback((newLocale: Locale) => {
    setLocale(newLocale)
    localStorage.setItem("locale", newLocale)
  }, [])

  const {
    status: locationStatus,
    position: userPosition,
    city: userCity,
    countryCode: userCountryCode,
    requestLocation,
  } = useUserLocation({ locale, onLocaleSuggestion: handleSetLocale })

  const t = useCallback(
    (key: TranslationKey) => {
      const value = localeDict[key]
      return typeof value === "string" ? value : ""
    },
    [localeDict]
  )

  const profileCards = useMemo(() => buildProfileCards(locale, userPosition), [locale, userPosition])

  const location = useMemo(
    () => ({
      status: locationStatus,
      city: userCity,
      position: userPosition,
      countryCode: userCountryCode,
      requestLocation,
    }),
    [locationStatus, userCity, userPosition, userCountryCode, requestLocation]
  )
  
  return (
    <I18nContext.Provider
      value={{
        locale,
        setLocale: handleSetLocale,
        t,
        profiles: localeDict.profiles,
        profileCards,
        location,
      }}
    >
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider")
  }
  return context
}

