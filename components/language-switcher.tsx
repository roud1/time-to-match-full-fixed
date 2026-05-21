"use client"

import { motion, AnimatePresence } from "motion/react"
import { useState } from "react"
import { useI18n, localeNames, type Locale } from "@/lib/i18n"

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n()
  const [isOpen, setIsOpen] = useState(false)

  const locales: Locale[] = ["ru", "uk", "en"]

  return (
    <div className="fixed bottom-4 right-4 z-[60]">
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          className="flex items-center gap-1.5 px-3 py-2 rounded-full glass border border-foreground/10 text-foreground/90 text-sm font-light shadow-lg hover:bg-foreground/10 transition-all duration-300"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
            />
          </svg>
          {localeNames[locale]}
          <svg
            className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
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
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.15 }}
              role="listbox"
              className="absolute bottom-full right-0 mb-2 py-1 glass rounded-xl border border-foreground/10 overflow-hidden min-w-[80px] shadow-xl"
            >
              {locales.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  role="option"
                  aria-selected={locale === loc}
                  onClick={() => {
                    setLocale(loc)
                    setIsOpen(false)
                  }}
                  className={`w-full px-4 py-2 text-sm font-light text-left transition-colors ${
                    locale === loc
                      ? "text-white/60 bg-white/06"
                      : "text-foreground/70 hover:text-foreground hover:bg-foreground/5"
                  }`}
                >
                  {localeNames[loc]}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
