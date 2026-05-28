"use client"

import { motion } from "motion/react"
import { GlassPanel } from "@/components/homepage/ui/glass-panel"

export function TrustSection() {
  return (
    <section className="relative mx-auto w-full max-w-5xl px-5 pb-20 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-70px" }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      >
        <GlassPanel className="p-6 text-center">
          <p className="text-lg font-medium text-white">Real people. Real decisions.</p>
          <p className="mt-2 text-sm text-zinc-300">Matches happening every minute.</p>
        </GlassPanel>
      </motion.div>
    </section>
  )
}
