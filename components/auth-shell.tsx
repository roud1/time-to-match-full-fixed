"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { ReactNode } from "react"
import { Logo } from "@/components/logo"
import { LocationControl } from "@/components/location-control"

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <motion.div
      className="ttm-auth-shell ttm-brand-universe"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <header className="ttm-auth-shell__header relative z-50">
        <div className="ttm-brand-glass mx-auto max-w-lg flex items-center justify-between px-4 md:px-6 py-3 rounded-2xl">
          <Link href="/" className="flex items-center gap-3 ttm-brand-interactive">
            <Logo />
            <span className="ttm-brand-overline text-white/70">Time to Match</span>
          </Link>
          <LocationControl />
        </div>
      </header>

      <main className="relative z-10 flex-1 flex items-start justify-center ttm-page py-8 md:py-12 pb-8 w-full min-h-0">
        <div className="w-full flex justify-center px-4 md:px-6">{children}</div>
      </main>
    </motion.div>
  )
}
