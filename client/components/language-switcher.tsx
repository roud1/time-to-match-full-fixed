"use client"

import { motion, AnimatePresence } from "motion/react"
import { usePathname, useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"
import { useI18n, type Locale } from "@/client/lib/i18n"
import { LOCALES, localeNames, localeShortNames } from "@/client/lib/i18n/config"
import { cn } from "@/client/lib/utils"

type LanguageSwitcherProps = {
  /** Inline in a header/nav — no fixed bottom-right positioning */
  embedded?: boolean
  className?: string
}

function LanguageSwitcherInner({ embedded = false, className }: LanguageSwitcherProps) {
  const { locale, setLocale } = useI18n()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)

  const locales: Locale[] = [...LOCALES]
  const inApp = pathname === "/app" || pathname.startsWith("/app/")
  const chatThreadOpen = inApp && searchParams.get("with") != null
  const aboveDock = inApp && !chatThreadOpen && !embedded

  return (
    <div
      className={cn(
        "ttm-lang-switcher",
        embedded && "ttm-lang-switcher--embedded",
        aboveDock && "ttm-lang-switcher--above-dock",
        className
      )}
      aria-label="Язык"
    >
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          className="flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-full glass border border-foreground/10 text-foreground/90 text-sm font-light shadow-lg hover:bg-foreground/10 transition-all duration-300 touch-manipulation backdrop-blur-xl"
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
            />
          </svg>
          <span className="text-xs sm:text-sm">{localeShortNames[locale]}</span>
          <svg
            className={cn("w-3 h-3 shrink-0 transition-transform", isOpen && "rotate-180")}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: embedded ? -8 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: embedded ? -8 : 8 }}
              transition={{ duration: 0.15 }}
              role="listbox"
              className={cn(
                "absolute right-0 py-1 glass rounded-xl border border-foreground/10 overflow-hidden min-w-[148px] max-h-[min(320px,50vh)] overflow-y-auto shadow-xl backdrop-blur-xl",
                embedded ? "top-full mt-2 z-[60]" : "bottom-full mb-2"
              )}
            >
              {locales.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  role="option"
                  aria-selected={locale === loc}
                  title={localeNames[loc]}
                  onClick={() => {
                    setLocale(loc)
                    setIsOpen(false)
                  }}
                  className={cn(
                    "w-full min-h-[44px] px-4 py-2 text-sm font-light text-left transition-colors touch-manipulation flex items-center justify-between gap-3",
                    locale === loc
                      ? "text-white/60 bg-white/06"
                      : "text-foreground/70 hover:text-foreground hover:bg-foreground/5"
                  )}
                >
                  <span>{localeNames[loc]}</span>
                  <span className="text-[10px] uppercase tracking-wider text-foreground/40">
                    {localeShortNames[loc]}
                  </span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export function LanguageSwitcher(props: LanguageSwitcherProps) {
  return (
    <Suspense fallback={null}>
      <LanguageSwitcherInner {...props} />
    </Suspense>
  )
}
