"use client"

import { motion } from "motion/react"
import { useI18n } from "@/lib/i18n"
import { PremiumButton } from "@/components/ui/premium-button"

const STEPS = [
  { title: "onboard1Title", sub: "onboard1Sub", num: "01" },
  { title: "onboard2Title", sub: "onboard2Sub", num: "02" },
  { title: "onboard3Title", sub: "onboard3Sub", num: "03" },
] as const

export function OnboardingSection() {
  const { t } = useI18n()

  return (
    <section className="relative py-24 md:py-36 px-5 sm:px-8 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-14 md:mb-20"
        >
          <h2 className="ttm-cin-headline text-balance">{t("onboard2Title")}</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-7">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              className="cin-glass rounded-2xl p-7 md:p-9 min-h-[220px] flex flex-col"
            >
              <span className="text-4xl font-extralight text-white/25 mb-5">{step.num}</span>
              <h3 className="text-lg font-light tracking-tight text-white/90 mb-3">{t(step.title)}</h3>
              <p className="text-sm text-white/45 font-extralight leading-relaxed flex-1">{t(step.sub)}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex justify-center mt-14"
        >
          <PremiumButton href="/register">{t("onboardStart")}</PremiumButton>
        </motion.div>
      </div>
    </section>
  )
}
