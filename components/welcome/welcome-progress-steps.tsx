"use client"

import { useI18n } from "@/lib/i18n"
import { PROFILE_READY_STRENGTH } from "@/lib/profile-completion-hints"
import { cn } from "@/lib/utils"

type WelcomeProgressStepsProps = {
  strength: number
  className?: string
}

export function WelcomeProgressSteps({ strength, className }: WelcomeProgressStepsProps) {
  const { t } = useI18n()
  const profileDone = strength >= PROFILE_READY_STRENGTH

  const steps = [
    { id: "account", label: t("welcomeStepAccount"), done: true },
    { id: "profile", label: t("welcomeStepProfile"), done: profileDone },
    { id: "swipe", label: t("welcomeStepSwipe"), done: false },
  ]

  return (
    <nav className={cn("ttm-welcome-progress", className)} aria-label={t("welcomeProgressAria")}>
      <ol className="ttm-welcome-progress__list">
        {steps.map((step, i) => (
          <li key={step.id} className="ttm-welcome-progress__item">
            <span
              className={cn(
                "ttm-welcome-progress__dot",
                step.done && "ttm-welcome-progress__dot--done"
              )}
              aria-hidden
            />
            <span
              className={cn(
                "ttm-welcome-progress__label",
                step.done && "ttm-welcome-progress__label--done"
              )}
            >
              {step.label}
            </span>
            {i < steps.length - 1 && <span className="ttm-welcome-progress__line" aria-hidden />}
          </li>
        ))}
      </ol>
    </nav>
  )
}
