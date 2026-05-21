"use client"

import { motion } from "motion/react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { TtmButton } from "@/components/ds/ttm-button"
import { useI18n } from "@/lib/i18n"
import { Shield, Sparkles, Timer, Users } from "lucide-react"

const VALUES = [
  { icon: Sparkles, titleKey: "aboutValueQuality" as const, bodyKey: "aboutValueQualityBody" as const },
  { icon: Timer, titleKey: "aboutValueAlgo" as const, bodyKey: "aboutValueAlgoBody" as const },
  { icon: Shield, titleKey: "aboutValueSafety" as const, bodyKey: "aboutValueSafetyBody" as const },
  { icon: Users, titleKey: "aboutValueMeet" as const, bodyKey: "aboutValueMeetBody" as const },
]

export default function AboutPage() {
  const { t } = useI18n()

  return (
    <main className="min-h-screen bg-[#050506]">
      <Navbar />
      <section className="pt-32 pb-20 px-6 max-w-3xl mx-auto text-center">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="ttm-overline mb-4"
        >
          Time to Match
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="ttm-h1 mb-6"
        >
          {t("aboutHeroTitle")}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          className="ttm-body text-lg max-w-xl mx-auto"
        >
          {t("aboutHeroBody")}
        </motion.p>
      </section>

      <section className="max-w-2xl mx-auto px-6 pb-24 space-y-16">
        {VALUES.map((v, i) => (
          <motion.article
            key={v.titleKey}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: i * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex gap-5 items-start"
          >
            <div className="shrink-0 w-12 h-12 rounded-2xl ttm-glass flex items-center justify-center text-[var(--ttm-warm)]">
              <v.icon className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-lg font-medium text-[var(--ttm-text)] mb-2">{t(v.titleKey)}</h2>
              <p className="ttm-body">{t(v.bodyKey)}</p>
            </div>
          </motion.article>
        ))}
      </section>

      <section className="text-center pb-28 px-6">
        <TtmButton href="/register">{t("heroCtaPrimary")}</TtmButton>
        <p className="mt-6">
          <Link href="/" className="text-sm text-[var(--ttm-text-muted)] hover:text-[var(--ttm-warm)]">
            ← {t("learnMore")}
          </Link>
        </p>
      </section>
      <Footer />
    </main>
  )
}
