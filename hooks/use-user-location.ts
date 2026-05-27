"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  type GeoPosition,
  localeFromCountryCode,
  parseStoredPosition,
  storePosition,
} from "@/lib/geo"
import type { Locale } from "@/lib/i18n/config"
import { localeToBcp47 } from "@/lib/i18n/config"

export type LocationStatus =
  | "idle"
  | "loading"
  | "ready"
  | "denied"
  | "unsupported"
  | "error"

const COUNTRY_KEY = "user-country-code"

function readStoredCountryCode(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(COUNTRY_KEY)
}

function storeCountryCode(code: string | null) {
  if (typeof window === "undefined") return
  if (code) localStorage.setItem(COUNTRY_KEY, code)
  else localStorage.removeItem(COUNTRY_KEY)
}

type UseUserLocationOptions = {
  locale: Locale
  onLocaleSuggestion?: (locale: Locale) => void
  /** If false, only restores cached coords — no GPS prompt on load. */
  autoRequest?: boolean
}

async function reverseGeocode(
  position: GeoPosition,
  locale: Locale
): Promise<{ city: string | null; countryCode: string | null }> {
  const params = new URLSearchParams({
    lat: String(position.lat),
    lon: String(position.lng),
    format: "json",
  })

  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?${params}`,
    {
      headers: {
        Accept: "application/json",
        "Accept-Language": localeToBcp47(locale),
      },
    }
  )

  if (!response.ok) {
    return { city: null, countryCode: null }
  }

  const data = (await response.json()) as {
    address?: {
      city?: string
      town?: string
      village?: string
      municipality?: string
      state?: string
      country_code?: string
    }
  }

  const address = data.address
  const city =
    address?.city ??
    address?.town ??
    address?.village ??
    address?.municipality ??
    address?.state ??
    null

  return {
    city,
    countryCode: address?.country_code?.toUpperCase() ?? null,
  }
}

export function useUserLocation({
  locale,
  onLocaleSuggestion,
  autoRequest = false,
}: UseUserLocationOptions) {
  const [status, setStatus] = useState<LocationStatus>("idle")
  const [position, setPosition] = useState<GeoPosition | null>(null)
  const [city, setCity] = useState<string | null>(null)
  const [countryCode, setCountryCode] = useState<string | null>(() => readStoredCountryCode())
  const localeSuggested = useRef(false)
  const initialized = useRef(false)
  const onLocaleSuggestionRef = useRef(onLocaleSuggestion)
  const localeRef = useRef(locale)

  useEffect(() => {
    onLocaleSuggestionRef.current = onLocaleSuggestion
    localeRef.current = locale
  })

  const applyPosition = useCallback(
    async (coords: GeoPosition, suggestLocale: boolean) => {
      setPosition(coords)
      storePosition(coords)

      try {
        const { city: resolvedCity, countryCode } = await reverseGeocode(
          coords,
          localeRef.current
        )
        setCity(resolvedCity)
        if (countryCode) {
          setCountryCode(countryCode)
          storeCountryCode(countryCode)
        }
        setStatus("ready")

        if (
          suggestLocale &&
          !localeSuggested.current &&
          !localStorage.getItem("locale") &&
          onLocaleSuggestionRef.current
        ) {
          const suggested = localeFromCountryCode(countryCode ?? undefined)
          if (suggested) {
            localeSuggested.current = true
            onLocaleSuggestionRef.current(suggested)
          }
        }
      } catch {
        setStatus("ready")
      }
    },
    []
  )

  const requestLocation = useCallback(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setStatus("unsupported")
      return
    }

    setStatus("loading")

    navigator.geolocation.getCurrentPosition(
      (result) => {
        void applyPosition(
          { lat: result.coords.latitude, lng: result.coords.longitude },
          true
        )
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setStatus("denied")
        } else {
          setStatus("error")
        }
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 }
    )
  }, [applyPosition])

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const cached = parseStoredPosition(
      typeof window !== "undefined"
        ? localStorage.getItem("user-position")
        : null
    )

    if (cached) {
      void applyPosition(cached, false)
      return
    }

    if (autoRequest) {
      requestLocation()
    } else {
      setStatus("idle")
    }
  }, [applyPosition, requestLocation, autoRequest])

  useEffect(() => {
    if (!position) return
    void reverseGeocode(position, locale).then(({ city: resolvedCity, countryCode: code }) => {
      if (resolvedCity) setCity(resolvedCity)
      if (code) {
        setCountryCode(code)
        storeCountryCode(code)
      }
    })
  }, [locale, position])

  return {
    status,
    position,
    city,
    countryCode,
    requestLocation,
  }
}
