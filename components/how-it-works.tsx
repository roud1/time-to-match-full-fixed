"use client"

import { motion } from "motion/react"
import { useI18n } from "@/lib/i18n"

const stepIcons = [
  (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
]

export function HowItWorks() {
  const { t } = useI18n()

  const steps = [
    { number: "01", title: t("step1Title"), description: t("step1Desc"), icon: stepIcons[0] },
    { number: "02", title: t("step2Title"), description: t("step2Desc"), icon: stepIcons[1] },
    { number: "03", title: t("step3Title"), description: t("step3Desc"), icon: stepIcons[2] },
  ]

  return (
    <section id="how" className="relative py-20 md:py-32 px-5 sm:px-8 overflow-hidden scroll-mt-24">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16 md:mb-24"
        >
          <span className="ttm-brand-overline inline-block px-4 py-2 rounded-full ttm-brand-glass mb-8">
            {t("howBadge")}
          </span>
          <h2 className="ttm-cin-headline text-balance mb-6">
            {t("howTitle")}{" "}
            <span className="text-white/50">{t("howTitleHighlight")}</span>
          </h2>
          <p className="ttm-cin-sub max-w-lg mx-auto">{t("howSubtitle")}</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <div className="ttm-brand-glass rounded-2xl p-8 pt-10 text-center h-full ttm-brand-interactive">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full border border-white/10 bg-[#050506] text-[10px] font-light tracking-[0.2em] text-white/50">
                  {step.number}
                </div>

                <div className="w-12 h-12 rounded-full border border-white/10 bg-white/[0.03] flex items-center justify-center mx-auto mb-6 text-white/70">
                  {step.icon}
                </div>

                <h3 className="text-lg font-light text-white/90 mb-3 tracking-tight">{step.title}</h3>
                <p className="text-sm font-light text-white/45 leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
