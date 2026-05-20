"use client"

import { motion } from "motion/react"
import Link from "next/link"
import { useI18n } from "@/lib/i18n"

export function CTASection() {
  const { t } = useI18n()

  return (
    <section id="premium" className="relative py-32 px-4 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-pink-500/15 blur-[150px]"
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 left-1/3 w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[120px]"
        />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-light tracking-widest uppercase text-muted-foreground border border-foreground/10 bg-foreground/5 mb-8">
            {t("ctaBadge")}
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl md:text-6xl lg:text-7xl font-extralight tracking-tight leading-[1.1] mb-6 text-balance"
        >
          {t("ctaTitle")}{" "}
          <span className="text-glow bg-gradient-to-r from-pink-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
            {t("ctaTitleHighlight")}
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg md:text-xl text-muted-foreground font-light max-w-xl mx-auto mb-10 leading-relaxed"
        >
          {t("ctaSubtitle")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Link
            href="/register"
            className="inline-block px-10 py-5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-light text-lg tracking-wide shadow-xl shadow-pink-500/30 hover:shadow-pink-500/50 hover:opacity-95 transition-all duration-300"
          >
            {t("ctaButton")}
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-6 text-sm text-muted-foreground/60 font-light"
        >
          {t("ctaDisclaimer")}
        </motion.p>
      </div>
    </section>
  )
}
