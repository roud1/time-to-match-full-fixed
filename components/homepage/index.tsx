"use client"

import { motion } from "motion/react"
import { FinalCtaSection } from "@/components/homepage/final-cta-section"
import { HeroSection } from "@/components/homepage/hero-section"
import { HowItWorksSection } from "@/components/homepage/how-it-works-section"
import { TrustSection } from "@/components/homepage/trust-section"

export function Homepage() {
  return (
    <motion.main
      className="relative min-h-screen overflow-x-hidden bg-[#0B0B12] text-white"
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-fuchsia-500/35 blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-20 top-44 h-80 w-80 rounded-full bg-violet-500/30 blur-3xl"
          animate={{ x: [0, -24, 0], y: [0, 18, 0], scale: [1, 1.06, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute left-1/2 top-64 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl"
          animate={{ x: [0, 14, 0], y: [0, -14, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:3px_3px] opacity-20" />
      </div>

      <HeroSection />
      <HowItWorksSection />
      <TrustSection />
      <FinalCtaSection />
    </motion.main>
  )
}
