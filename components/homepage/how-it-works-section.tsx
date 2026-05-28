"use client"

import { motion } from "motion/react"
import { GlassPanel } from "@/components/homepage/ui/glass-panel"

const ITEMS = [
  {
    title: "Match lasts 24 hours",
    text: "Every match has a real deadline. You either act or lose it.",
  },
  {
    title: "No endless swiping",
    text: "Less noise and less fatigue. More focus on people who matter.",
  },
  {
    title: "You decide fast or lose it",
    text: "Real-time pressure creates real decisions, not passive chats.",
  },
] as const

export function HowItWorksSection() {
  return (
    <section className="relative mx-auto w-full max-w-6xl px-5 pb-20 md:px-8">
      <motion.h2
        id="how-it-works"
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        className="mb-8 text-center text-2xl font-semibold tracking-[-0.02em] text-white sm:text-3xl"
      >
        How it works
      </motion.h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
        {ITEMS.map((item, idx) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.35, delay: idx * 0.08, ease: [0.4, 0, 0.2, 1] }}
            whileHover={{ y: -4, scale: 1.015 }}
          >
            <GlassPanel className="h-full p-6 shadow-[0_0_0_rgba(255,61,113,0)] transition-shadow hover:shadow-[0_0_34px_rgba(255,61,113,0.2)]">
              <h3 className="text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-300">{item.text}</p>
            </GlassPanel>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
