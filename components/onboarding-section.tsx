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
    <section className="relative py-20 md:py-28 px-4 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-balance">
            {t("onboard2Title")}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative rounded-3xl border border-foreground/10 bg-gradient-to-b from-foreground/[0.07] to-transparent p-6 md:p-8 min-h-[220px] flex flex-col"
            >
              <span className="text-4xl font-extralight text-pink-500/30 mb-4">{step.num}</span>
              <h3 className="text-xl font-light tracking-tight mb-3">{t(step.title)}</h3>
              <p className="text-sm text-muted-foreground font-extralight leading-relaxed flex-1">
                {t(step.sub)}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-10 flex justify-center"
        >
          <PremiumButton href="/register">{t("onboardStart")}</PremiumButton>
        </motion.div>
      </div>
    </section>
  )
}
