"use client"

import { motion } from "motion/react"
import { useI18n } from "@/lib/i18n"

const stepIcons = [
  (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
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
    <section id="how" className="relative py-24 px-4 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-light tracking-widest uppercase text-muted-foreground border border-foreground/10 bg-foreground/5 mb-6">
            {t("howBadge")}
          </span>
          <h2 className="text-3xl md:text-5xl font-extralight tracking-tight mb-4 text-balance">
            {t("howTitle")}{" "}
            <span className="bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent">
              {t("howTitleHighlight")}
            </span>
          </h2>
          <p className="text-muted-foreground font-light max-w-xl mx-auto">
            {t("howSubtitle")}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="relative"
            >
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-1/2 w-full h-px bg-gradient-to-r from-foreground/10 to-transparent" />
              )}

              <div className="glass-card rounded-2xl p-6 text-center relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-xs font-light text-white">
                  {step.number}
                </div>

                <div className="w-14 h-14 rounded-2xl bg-foreground/5 flex items-center justify-center mx-auto mb-4 mt-4 text-foreground/70">
                  {step.icon}
                </div>

                <h3 className="text-lg font-light mb-2 text-foreground">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground font-light leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
