"use client"

import { motion, useReducedMotion } from "motion/react"
import { useI18n } from "@/lib/i18n"
import type { TranslationKey } from "@/lib/i18n"

const STEPS: { intensity: 1 | 2 | 3 | 4; titleKey: TranslationKey; descKey: TranslationKey }[] = [
  { intensity: 1, titleKey: "landingEvolutionStep1Title", descKey: "landingEvolutionStep1Desc" },
  { intensity: 2, titleKey: "landingEvolutionStep2Title", descKey: "landingEvolutionStep2Desc" },
  { intensity: 3, titleKey: "landingEvolutionStep3Title", descKey: "landingEvolutionStep3Desc" },
  { intensity: 4, titleKey: "landingEvolutionStep4Title", descKey: "landingEvolutionStep4Desc" },
]

export function ConnectionEvolutionSection() {
  const { t } = useI18n()
  const reduce = useReducedMotion()

  return (
    <section
      id="evolution"
      className="relative py-24 md:py-36 px-5 sm:px-8 overflow-hidden scroll-mt-28"
    >
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(100vw,640px)] h-[min(70vh,400px)] opacity-40"
        style={{
          background:
            "radial-gradient(ellipse, rgba(45,212,191,0.12) 0%, rgba(167,139,250,0.06) 45%, transparent 65%)",
          filter: "blur(40px)",
        }}
        aria-hidden
      />

      <div className="relative z-10 max-w-3xl mx-auto">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-14 md:mb-20"
        >
          <span className="ttm-brand-overline inline-block px-4 py-2 rounded-full ttm-brand-glass mb-6">
            {t("landingEvolutionBadge")}
          </span>
          <h2 className="ttm-brand-headline text-balance mb-5">
            {t("landingEvolutionTitle")}{" "}
            <span className="text-muted-foreground">{t("landingEvolutionTitleHighlight")}</span>
          </h2>
          <p className="ttm-brand-subtitle max-w-md mx-auto">{t("landingEvolutionSubtitle")}</p>
        </motion.div>

        <div className="landing-evolution__track pl-2 md:pl-0">
          <div className="landing-evolution__line hidden md:block" aria-hidden />

          <ul className="space-y-5 md:space-y-6">
            {STEPS.map((step, index) => (
              <motion.li
                key={step.titleKey}
                initial={reduce ? false : { opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.85,
                  delay: index * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <div
                  className="landing-evolution__node ttm-brand-timeline-node flex gap-4 md:gap-5 p-5 md:p-6"
                  data-intensity={step.intensity}
                >
                  <div className="shrink-0 flex flex-col items-center pt-1">
                    <span
                      className={`landing-evolution__orb ${index === STEPS.length - 1 ? "landing-evolution__orb--active" : ""}`}
                      style={{
                        opacity: 0.35 + step.intensity * 0.15,
                        boxShadow: `0 0 ${8 + step.intensity * 6}px rgba(220,225,255,${0.15 + step.intensity * 0.08})`,
                      }}
                      aria-hidden
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-medium mb-1.5">
                      {String(step.intensity).padStart(2, "0")} · {t("landingEvolutionPhase")}
                    </p>
                    <h3 className="text-base md:text-lg font-medium text-foreground tracking-tight mb-2">
                      {t(step.titleKey)}
                    </h3>
                    <p className="text-sm font-normal text-muted-foreground leading-relaxed">
                      {t(step.descKey)}
                    </p>
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
