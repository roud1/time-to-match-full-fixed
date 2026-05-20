"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { useReducedMotion } from "motion/react"
import { useI18n } from "@/lib/i18n"
import { PremiumButton } from "@/components/ui/premium-button"
import { CinematicParticles } from "@/components/ui/cinematic-particles"
import { cn } from "@/lib/utils"

const SLIDE_KEYS = [
  { title: "onboard1Title", sub: "onboard1Sub" },
  { title: "onboard2Title", sub: "onboard2Sub" },
  { title: "onboard3Title", sub: "onboard3Sub" },
] as const

type OnboardingFlowProps = {
  onComplete: () => void
  className?: string
}

export function OnboardingFlow({ onComplete, className }: OnboardingFlowProps) {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const [step, setStep] = useState(0)
  const isLast = step === SLIDE_KEYS.length - 1

  return (
    <div
      className={cn(
        "relative w-full max-w-lg mx-auto overflow-hidden rounded-[1.75rem]",
        "border border-white/12 bg-black/35 backdrop-blur-xl shadow-[0_32px_100px_-36px_rgba(236,72,153,0.35)]",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_-10%,rgba(236,72,153,0.22),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-violet-600/[0.08] via-transparent to-transparent" />
      <CinematicParticles count={10} className="opacity-50" />

      <div className="relative px-5 pt-10 pb-8 md:px-10 md:pt-12 md:pb-10 min-h-[320px] flex flex-col">
        <div className="flex gap-1.5 mb-10">
          {SLIDE_KEYS.map((_, i) => (
            <div key={i} className="flex-1 h-1 rounded-full bg-white/[0.08] overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500"
                initial={false}
                animate={{ width: i <= step ? "100%" : "0%" }}
                transition={{ duration: reduce ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 22, filter: reduce ? "none" : "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -16, filter: reduce ? "none" : "blur(4px)" }}
            transition={{ duration: reduce ? 0.2 : 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 flex flex-col items-center text-center"
          >
            <motion.span
              className="text-[10px] uppercase tracking-[0.35em] text-pink-200/75 font-light mb-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.05 }}
            >
              {step + 1} / {SLIDE_KEYS.length}
            </motion.span>
            <h2 className="text-[1.65rem] sm:text-3xl md:text-[2.1rem] font-extralight tracking-tight text-balance mb-5 leading-[1.15] text-white">
              {t(SLIDE_KEYS[step].title)}
            </h2>
            <p className="text-sm sm:text-base text-white/55 font-light leading-relaxed max-w-md">
              {t(SLIDE_KEYS[step].sub)}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="mt-auto pt-10 flex flex-col gap-3">
          {!isLast ? (
            <PremiumButton className="w-full min-h-[52px]" onClick={() => setStep((s) => s + 1)}>
              {t("onboardContinue")}
            </PremiumButton>
          ) : (
            <PremiumButton className="w-full min-h-[52px]" onClick={onComplete}>
              {t("onboardStart")}
            </PremiumButton>
          )}
          <button
            type="button"
            onClick={onComplete}
            className="w-full py-3 text-sm font-light text-white/45 hover:text-white/75 transition-colors touch-manipulation"
          >
            {t("onboardSkip")}
          </button>
        </div>
      </div>
    </div>
  )
}
