"use client"

import { motion } from "motion/react"
import { useI18n } from "@/lib/i18n"

export function LocationControl() {
  const { t, location } = useI18n()

  const label =
    location.status === "loading" || location.status === "idle"
      ? t("locationLoading")
      : location.status === "ready" && location.city
        ? location.city
        : location.status === "denied"
          ? t("locationDenied")
          : location.status === "unsupported"
            ? t("locationUnsupported")
            : t("locationEnable")

  const canRetry =
    location.status === "denied" ||
    location.status === "error" ||
    location.status === "unsupported"

  return (
    <button
      type="button"
      onClick={location.requestLocation}
      title={canRetry ? t("locationEnable") : undefined}
      className="hidden sm:flex items-center gap-1.5 max-w-[140px] px-3 py-2 rounded-full bg-foreground/5 border border-foreground/10 text-foreground/80 text-xs font-light hover:bg-foreground/10 transition-all duration-300"
    >
      <svg
        className={`w-3.5 h-3.5 shrink-0 ${
          location.status === "loading" ? "animate-pulse text-pink-400" : "text-pink-400"
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
      <span className="truncate">{label}</span>
    </button>
  )
}

export function LocationBanner() {
  const { t, location } = useI18n()

  if (location.status !== "denied" && location.status !== "error") {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-20 left-1/2 -translate-x-1/2 z-40 px-4 w-full max-w-md"
    >
      <motion.div className="glass rounded-2xl px-4 py-3 flex items-center justify-between gap-3 border border-foreground/10 shadow-lg">
        <p className="text-xs text-muted-foreground font-light leading-relaxed">
          {t("locationBannerText")}
        </p>
        <button
          type="button"
          onClick={location.requestLocation}
          className="shrink-0 px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-light whitespace-nowrap"
        >
          {t("locationEnable")}
        </button>
      </motion.div>
    </motion.div>
  )
}
