"use client"

import { motion } from "motion/react"
import { LiveButton } from "@/components/homepage/ui/live-button"

export function FinalCtaSection() {
  return (
    <section className="relative mx-auto w-full max-w-6xl px-5 pb-24 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
        className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-fuchsia-500/12 via-violet-500/10 to-transparent px-6 py-14 text-center backdrop-blur-2xl sm:px-10"
      >
        <h2 className="text-3xl font-bold tracking-[-0.03em] text-white sm:text-5xl">
          Start your first match
        </h2>

        <div className="mt-8 flex justify-center">
          <motion.div
            animate={{
              boxShadow: [
                "0 0 0 rgba(255,61,113,0)",
                "0 0 42px rgba(255,61,113,0.35)",
                "0 0 0 rgba(255,61,113,0)",
              ],
            }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            className="rounded-2xl"
          >
            <LiveButton href="/register" className="px-10">
              Start your first match
            </LiveButton>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
