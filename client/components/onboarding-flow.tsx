"use client"

import { useState } from "react"
import { motion, AnimatePresence, useReducedMotion } from "motion/react"
import { useI18n } from "@/client/lib/i18n"
import { DatingOnboardingVisual } from "@/client/components/dating/dating-onboarding-visual"
import { cn } from "@/client/lib/utils"
import { ArrowRight } from "lucide-react"
import "@/client/components/onboarding-luvia.css"

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
    <div className={cn("ttm-dating-onboarding lv-onboard w-full max-w-lg mx-auto", className)}>
      <div className="relative flex flex-col lv-onboard__inner">
        <div className="lv-onboard__top">
        <div className="ttm-dating-onboarding__progress lv-onboard__bars flex gap-1.5">
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
          <button type="button" onClick={onComplete} className="lv-onboard__skip">
            {t("onboardSkip")}
          </button>
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

            <h2 className="ttm-dating-onboarding__title lv-onboard__title text-balance">
              {t(slide.title)}
            </h2>
            <p className="lv-onboard__sub">
              {t(slide.sub)}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="lv-onboard__actions">
          <button
            type="button"
            className="lv-onboard__cta"
            onClick={isLast ? onComplete : () => setStep((s) => s + 1)}
          >
            <span>{isLast ? t("onboardStart") : t("onboardContinue")}</span>
            <ArrowRight aria-hidden />
          </button>
        </div>
      </div>
    </div>
  )
}
