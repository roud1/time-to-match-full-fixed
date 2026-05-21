"use client"

import { motion } from "motion/react"
import { useI18n } from "@/lib/i18n"
import { PremiumButton } from "@/components/ui/premium-button"

export function CTASection() {
  const { t } = useI18n()

  return (
    <section id="start" className="relative py-24 md:py-36 px-5 sm:px-8 overflow-hidden scroll-mt-24">
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(100vw,560px)] h-[min(80vh,480px)] cin-hero-glow pointer-events-none"
        animate={{ opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <motion.span
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="ttm-cin-overline inline-block px-4 py-2 rounded-full cin-glass mb-10"
        >
          {t("ctaBadge")}
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.95, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="ttm-cin-display text-balance mb-8 cin-headline-glow"
        >
          {t("ctaTitle")}{" "}
          <span className="text-white/55">{t("ctaTitleHighlight")}</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="ttm-cin-sub max-w-md mx-auto mb-12"
        >
          {t("ctaSubtitle")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.85, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <PremiumButton href="/register" size="mobile" className="min-w-[220px]">
            {t("ctaButton")}
          </PremiumButton>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-8 ttm-cin-overline opacity-50"
        >
          {t("ctaDisclaimer")}
        </motion.p>
      </div>
    </section>
  )
}
