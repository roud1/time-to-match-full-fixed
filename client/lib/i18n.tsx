"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  type ReactNode,
} from "react"
import { useUserLocation, type LocationStatus } from "@/client/hooks/use-user-location"
import {
  PROFILE_CITY_COORDS,
  distanceKm,
  formatDistance,
  type GeoPosition,
} from "@/client/lib/geo"
import {
  type Locale,
  isLocale,
  DEFAULT_LOCALE,
  detectLocale,
  localeNames,
  localeShortNames,
  localeToBcp47,
} from "@/client/lib/i18n/config"
import {
  loadLocaleMessages,
  rememberLocaleMessages,
  type LocaleMessages,
  type TranslationKey,
} from "@/client/lib/i18n/messages"

export type { Locale } from "@/client/lib/i18n/config"
export type { TranslationKey, LocaleMessages } from "@/client/lib/i18n/messages"
export {
  LOCALES,
  localeNames,
  localeShortNames,
  localeToBcp47,
  isLocale,
  DEFAULT_LOCALE,
  detectLocale,
} from "@/client/lib/i18n/config"

type ProfileTranslation = LocaleMessages["profiles"][number]

const PROFILE_AGES = [25, 28, 27, 26] as const
const PROFILE_TIMERS = ["23:45:12", "47:22:08", "12:15:33", "68:30:45"] as const

export function buildProfileCards(dict: LocaleMessages, locale: Locale, userPosition?: GeoPosition | null) {
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

export function I18nProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
  initialMessages,
}: {
  children: ReactNode
  /** Resolved on the server (choice cookie or Accept-Language), so the first paint is in that language. */
  initialLocale?: Locale
  /** The merged dictionary for `initialLocale`, sent by the server so no language bundle blocks the first paint. */
  initialMessages: LocaleMessages
}) {
  // Locale and dictionary always change together: a new language is shown once its pack has loaded.
  const [state, setState] = useState<{ locale: Locale; dict: LocaleMessages }>(() => {
    rememberLocaleMessages(initialLocale, initialMessages)
    return { locale: initialLocale, dict: initialMessages }
  })
  const { locale, dict: localeDict } = state
  const wanted = useRef<Locale>(initialLocale)

  const setLocale = useCallback((next: Locale) => {
    wanted.current = next
    void loadLocaleMessages(next).then(
      (dict) => {
        if (wanted.current === next) setState((prev) => (prev.locale === next ? prev : { locale: next, dict }))
      },
      () => {
        /* offline: keep the current language */
      }
    )
  }, [])

  useEffect(() => {
    let saved: string | null = null
    try {
      saved = localStorage.getItem("locale")
    } catch {
      /* storage blocked */
    }
    if (saved && isLocale(saved)) {
      setLocale(saved)
      // Keep the cookie in step so the server renders (and sends) this language next time.
      document.cookie = `ttm-locale=${saved};path=/;max-age=31536000;SameSite=Lax`
      return
    }
    // No explicit choice yet: follow the device language (beats the later location-based suggestion).
    const detected = detectLocale(typeof navigator !== "undefined" ? navigator.languages : [])
    setLocale(detected)
    try {
      localStorage.setItem("locale", detected)
    } catch {
      /* storage blocked */
    }
    document.cookie = `ttm-locale=${detected};path=/;max-age=31536000;SameSite=Lax`
  }, [setLocale])

  useEffect(() => {
    document.documentElement.lang = localeToBcp47(locale).split("-")[0] ?? DEFAULT_LOCALE
  }, [locale])

  const handleSetLocale = useCallback((newLocale: Locale) => {
    setLocale(newLocale)
    try {
      localStorage.setItem("locale", newLocale)
    } catch {
      /* storage blocked */
    }
    // Write cookie so server components (layout lang attr) can read the locale
    if (typeof document !== "undefined") {
      document.cookie = `ttm-locale=${newLocale};path=/;max-age=31536000;SameSite=Lax`
    }
  }, [setLocale])

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

  const profileCards = useMemo(
    () => buildProfileCards(localeDict, locale, userPosition),
    [localeDict, locale, userPosition]
  )

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

