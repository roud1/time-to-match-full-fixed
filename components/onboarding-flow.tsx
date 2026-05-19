"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { useI18n } from "@/lib/i18n"
import { PremiumButton } from "@/components/ui/premium-button"
import { cn } from "@/lib/utils"

const SLIDE_KEYS = [
  { title: "onboard1Title", sub: "onboard1Sub", icon: "⏳" },
  { title: "onboard2Title", sub: "onboard2Sub", icon: "✨" },
  { title: "onboard3Title", sub: "onboard3Sub", icon: "🔥" },
] as const

type OnboardingFlowProps = {
  onComplete: () => void
  className?: string
}

export function OnboardingFlow({ onComplete, className }: OnboardingFlowProps) {
  const { t } = useI18n()
  const [step, setStep] = useState(0)

  const isLast = step === SLIDE_KEYS.length - 1

  return (
    <div
      className={cn(
        "relative w-full max-w-lg mx-auto overflow-hidden rounded-3xl border border-foreground/10",
        "bg-gradient-to-b from-foreground/[0.06] to-transparent backdrop-blur-2xl",
        "shadow-[0_24px_80px_-20px_rgba(236,72,153,0.25)]",
        className
      )}
    >
      <motion.div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(236,72,153,0.12),transparent)]" />

      <div className="relative px-6 pt-8 pb-6 md:px-10 md:pt-10">
        <div className="flex gap-2 mb-8">
          {SLIDE_KEYS.map((_, i) => (
            <motion.div
              key={i}
              className={cn(
                "h-0.5 flex-1 rounded-full transition-colors duration-500",
                i <= step ? "bg-gradient-to-r from-pink-500 to-purple-500" : "bg-foreground/10"
              )}
              layout
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="min-h-[220px] flex flex-col items-center text-center"
          >
            <span className="text-4xl mb-6" aria-hidden>
              {SLIDE_KEYS[step].icon}
            </span>
            <h2 className="text-2xl md:text-3xl font-extralight tracking-tight text-balance mb-4">
              {t(SLIDE_KEYS[step].title)}
            </h2>
            <p className="text-sm md:text-base text-muted-foreground font-light leading-relaxed max-w-sm">
              {t(SLIDE_KEYS[step].sub)}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          {!isLast ? (
            <PremiumButton
              className="w-full"
              onClick={() => setStep((s) => s + 1)}
            >
              {t("onboardContinue")}
            </PremiumButton>
          ) : (
            <PremiumButton className="w-full" onClick={onComplete}>
              {t("onboardStart")}
            </PremiumButton>
          )}
          <button
            type="button"
            onClick={onComplete}
            className="w-full py-3 text-sm font-light text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("onboardSkip")}
          </button>
        </div>
      </div>
    </div>
  )
}
