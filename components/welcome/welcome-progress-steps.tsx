"use client"

import { useI18n } from "@/lib/i18n"
import { PROFILE_READY_STRENGTH } from "@/lib/profile-completion-hints"
import { cn } from "@/lib/utils"

type StepId = "account" | "profile" | "swipe"

type WelcomeProgressStepsProps = {
  strength: number
  activeStep?: StepId
  className?: string
}

export function WelcomeProgressSteps({ strength, activeStep, className }: WelcomeProgressStepsProps) {
  const { t } = useI18n()
  const profileDone = strength >= PROFILE_READY_STRENGTH

  const steps: { id: StepId; label: string; done: boolean }[] = [
    { id: "account", label: t("welcomeStepAccount"), done: true },
    { id: "profile", label: t("welcomeStepProfile"), done: profileDone },
    { id: "swipe", label: t("welcomeStepSwipe"), done: false },
  ]

  return (
    <nav className={cn("ttm-welcome-progress", className)} aria-label={t("welcomeProgressAria")}>
      <ol className="ttm-welcome-progress__list">
        {steps.map((step, i) => {
          const isActive = activeStep === step.id
          return (
            <li
              key={step.id}
              className={cn("ttm-welcome-progress__item", isActive && "ttm-welcome-progress__item--active")}
            >
              <span
                className={cn(
                  "ttm-welcome-progress__dot",
                  step.done && "ttm-welcome-progress__dot--done",
                  isActive && !step.done && "ttm-welcome-progress__dot--active"
                )}
                aria-hidden
              />
              <span
                className={cn(
                  "ttm-welcome-progress__label",
                  step.done && "ttm-welcome-progress__label--done",
                  isActive && "ttm-welcome-progress__label--active"
                )}
              >
                {step.label}
              </span>
              {i < steps.length - 1 && (
                <span
                  className={cn(
                    "ttm-welcome-progress__line",
                    step.done && "ttm-welcome-progress__line--done"
                  )}
                  aria-hidden
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
