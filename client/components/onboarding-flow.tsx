"use client"

import { useState } from "react"
import { motion, AnimatePresence, useReducedMotion } from "motion/react"
import { useI18n } from "@/client/lib/i18n"
import { CinematicButton } from "@/client/components/ui/cinematic-button"
import { DatingOnboardingVisual } from "@/client/components/dating/dating-onboarding-visual"
import { cn } from "@/client/lib/utils"

import type { TranslationKey } from "@/client/lib/i18n"

const SLIDES: { title: TranslationKey; sub: TranslationKey; visual: "timer" | "rules" | "start" }[] = [
  { title: "mvpOnboard1Title", sub: "mvpOnboard1Sub", visual: "timer" as const },
  { title: "mvpOnboard2Title", sub: "mvpOnboard2Sub", visual: "rules" as const },
  { title: "mvpOnboard3Title", sub: "mvpOnboard3Sub", visual: "start" as const },
]

type OnboardingFlowProps = {
  onComplete: () => void
  className?: string
}

export function OnboardingFlow({ onComplete, className }: OnboardingFlowProps) {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const [step, setStep] = useState(0)
  const isLast = step === SLIDES.length - 1
  const slide = SLIDES[step]

  return (
    <div className={cn("ttm-dating-onboarding w-full max-w-lg mx-auto", className)}>
      <div className="ttm-dating-onboarding__glow" />
      <div className="relative px-5 pt-8 pb-8 md:px-10 md:pt-10 md:pb-10 min-h-[380px] flex flex-col">
        <div className="ttm-dating-onboarding__progress flex gap-1.5 mb-6">
          {SLIDES.map((_, i) => (
            <div key={i} className="flex-1 h-1 rounded-full overflow-hidden">
              <motion.div
                className="ttm-dating-onboarding__progress-fill h-full rounded-full"
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
            initial={{ opacity: 0, y: 20, filter: reduce ? "none" : "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -14, filter: reduce ? "none" : "blur(4px)" }}
            transition={{ duration: reduce ? 0.2 : 0.52, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 flex flex-col items-center text-center"
          >
            <DatingOnboardingVisual variant={slide.visual} />

            <span className="ttm-badge-brand mb-4">{t("onboardEyebrow")}</span>
            <span className="p9-register-step-label mb-3 block">
              {step + 1} / {SLIDES.length}
            </span>
            <h2 className="ttm-dating-onboarding__title text-balance mb-4 leading-[1.12]">
              {t(slide.title)}
            </h2>
            <p className="text-sm sm:text-base text-white/55 font-light leading-relaxed max-w-md">
              {t(slide.sub)}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="mt-auto pt-8 flex flex-col gap-3">
          {!isLast ? (
            <CinematicButton variant="primary" className="w-full min-h-[52px]" onClick={() => setStep((s) => s + 1)}>
              {t("onboardContinue")}
            </CinematicButton>
          ) : (
            <CinematicButton variant="primary" className="w-full min-h-[52px]" onClick={onComplete}>
              {t("onboardStart")}
            </CinematicButton>
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
