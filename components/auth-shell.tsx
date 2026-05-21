"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { ReactNode } from "react"
import { Logo } from "@/components/logo"
import { LocationControl } from "@/components/location-control"

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <motion.div className="relative min-h-screen flex flex-col bg-[#050506]">
      <header className="relative z-50 px-4 py-4 md:px-8">
        <div className="cin-nav-minimal mx-auto max-w-lg flex items-center justify-between px-4 md:px-6 py-3 rounded-2xl">
          <Link href="/" className="flex items-center gap-3">
            <Logo />
            <span className="text-white/75 font-light tracking-[0.12em] text-xs uppercase">
              Time to Match
            </span>
          </Link>
          <LocationControl />
        </div>
      </header>

      <main className="relative z-10 flex-1 flex items-start justify-center ttm-page py-8 md:py-12 pb-6">
        {children}
      </main>
    </motion.div>
  )
}
