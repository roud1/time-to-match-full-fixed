"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { Navbar } from "@/client/components/navbar"
import { Footer } from "@/client/components/footer"
import { TtmButton } from "@/client/components/ds/ttm-button"
import { useI18n } from "@/client/lib/i18n"
import type { Metadata } from "next"

const FADE_UP = (delay = 0) => ({
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.65, ease: [0.22, 1, 0.36, 1] as const },
})

const IN_VIEW = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { delay, duration: 0.65, ease: [0.22, 1, 0.36, 1] as const },
})

export default function StoryPage() {
  const { t } = useI18n()

  return (
    <main className="min-h-screen bg-transparent">
      <Navbar />

      {/* ── Hero ── */}
      <section className="pt-32 pb-16 px-6 max-w-2xl mx-auto">
        <motion.p {...FADE_UP(0)} className="ttm-overline mb-4">
          {t("storyOverline")}
        </motion.p>
        <motion.h1
          {...FADE_UP(0.07)}
          className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.08] mb-6"
          style={{
            background: "linear-gradient(135deg, #f5f5f7 0%, rgba(245,245,247,0.75) 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          {t("storyHeroTitle")}
        </motion.h1>
        <motion.p {...FADE_UP(0.13)} className="ttm-body text-lg leading-relaxed">
          {t("storyHeroSub")}
        </motion.p>
      </section>

      {/* ── Book section ── */}
      <section className="max-w-2xl mx-auto px-6 pb-16">
        <motion.div
          {...IN_VIEW()}
          className="rounded-2xl p-6 sm:p-8"
          style={{
            background: "rgba(13,17,23,0.75)",
            border: "0.5px solid rgba(247,37,133,0.2)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 0 60px -20px rgba(247,37,133,0.15)",
          }}
        >
          {/* Epigraph */}
          <div className="mb-6 pl-4 border-l-2 border-[rgba(247,37,133,0.4)]">
            <p className="text-sm italic text-white/50 leading-relaxed">
              {t("storyEpigraph")}
            </p>
            <p className="text-xs text-white/30 mt-2 font-medium tracking-wide">
              — Adam Silvera, <em>They Both Die at the End</em>
            </p>
          </div>

          <h2 className="text-xl font-semibold text-white/90 mb-3">
            {t("storyBookTitle")}
          </h2>
          <p className="text-sm text-white/55 leading-relaxed mb-4">
            {t("storyBookBody1")}
          </p>
          <p className="text-sm text-white/55 leading-relaxed">
            {t("storyBookBody2")}
          </p>
        </motion.div>
      </section>

      {/* ── Why 24 hours ── */}
      <section className="max-w-2xl mx-auto px-6 pb-16">
        <motion.h2
          {...IN_VIEW()}
          className="text-2xl sm:text-3xl font-bold tracking-tight mb-8"
          style={{
            background: "linear-gradient(135deg, #f72585 0%, #b5179e 55%, #7209b7 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          {t("storyWhyTitle")}
        </motion.h2>

        <div className="space-y-6">
          {[
            { num: "01", titleKey: "storyWhy1Title", bodyKey: "storyWhy1Body" },
            { num: "02", titleKey: "storyWhy2Title", bodyKey: "storyWhy2Body" },
            { num: "03", titleKey: "storyWhy3Title", bodyKey: "storyWhy3Body" },
          ].map((item, i) => (
            <motion.div
              key={item.num}
              {...IN_VIEW(i * 0.07)}
              className="flex gap-5 items-start"
            >
              <span
                className="shrink-0 text-xs font-bold tabular-nums mt-1"
                style={{ color: "rgba(247,37,133,0.6)" }}
              >
                {item.num}
              </span>
              <div>
                <h3 className="text-base font-semibold text-white/90 mb-1.5">
                  {t(item.titleKey as Parameters<typeof t>[0])}
                </h3>
                <p className="text-sm text-white/50 leading-relaxed">
                  {t(item.bodyKey as Parameters<typeof t>[0])}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── What happened ── */}
      <section className="max-w-2xl mx-auto px-6 pb-16">
        <motion.div
          {...IN_VIEW()}
          className="rounded-2xl p-6 sm:p-8 space-y-4"
          style={{
            background: "rgba(8,11,16,0.8)",
            border: "0.5px solid rgba(255,255,255,0.07)",
          }}
        >
          <h2 className="text-xl font-semibold text-white/90">
            {t("storyBuiltTitle")}
          </h2>
          <p className="text-sm text-white/50 leading-relaxed">
            {t("storyBuiltBody1")}
          </p>
          <p className="text-sm text-white/50 leading-relaxed">
            {t("storyBuiltBody2")}
          </p>
        </motion.div>
      </section>

      {/* ── Final CTA ── */}
      <section className="text-center pb-28 px-6">
        <motion.div {...IN_VIEW()} className="space-y-4">
          <p
            className="text-2xl font-bold tracking-tight"
            style={{
              background: "linear-gradient(135deg, #f5f5f7 0%, rgba(245,245,247,0.7) 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {t("storyCtaTitle")}
          </p>
          <p className="text-sm text-white/40 max-w-sm mx-auto leading-relaxed">
            {t("storyCtaSub")}
          </p>
          <div className="pt-2">
            <TtmButton href="/register">{t("storyCtaButton")}</TtmButton>
          </div>
          <p className="mt-4">
            <Link
              href="/"
              className="text-sm text-white/30 hover:text-white/60 transition-colors"
            >
              ← {t("storyBackHome")}
            </Link>
          </p>
        </motion.div>
      </section>

      <Footer />
    </main>
  )
}
