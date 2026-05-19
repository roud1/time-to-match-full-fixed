"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { ReactNode } from "react"
import { LocationControl } from "@/components/location-control"

function Logo() {
  return (
    <div className="relative w-9 h-9">
      <motion.div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-500 via-rose-400 to-purple-600 p-[2px]">
        <div className="w-full h-full rounded-full bg-background/90 flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-pink-400">
            <path
              d="M12 2C12 2 8 6 8 10C8 12.21 9.79 14 12 14C14.21 14 16 12.21 16 10C16 6 12 2 12 2Z"
              fill="url(#heartGradAuth)"
              opacity="0.9"
            />
            <path
              d="M12 22C12 22 8 18 8 14C8 11.79 9.79 10 12 10C14.21 10 16 11.79 16 14C16 18 12 22 12 22Z"
              fill="url(#heartGradAuth2)"
              opacity="0.6"
            />
            <defs>
              <linearGradient id="heartGradAuth" x1="8" y1="2" x2="16" y2="14" gradientUnits="userSpaceOnUse">
                <stop stopColor="#ec4899" />
                <stop offset="1" stopColor="#a855f7" />
              </linearGradient>
              <linearGradient id="heartGradAuth2" x1="8" y1="10" x2="16" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="#ec4899" />
                <stop offset="1" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </motion.div>
    </div>
  )
}

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <motion.div className="relative min-h-screen flex flex-col">
      <header className="relative z-50 px-4 py-4 md:px-6">
        <div className="glass rounded-2xl px-4 md:px-6 py-3 mx-auto max-w-lg flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo />
            <span className="text-foreground/90 font-light tracking-wide text-sm">Time to Match</span>
          </Link>
          <LocationControl />
        </div>
      </header>

      <main className="relative z-10 flex-1 flex items-start justify-center px-4 py-6 md:py-8 pb-4">
        {children}
      </main>
    </motion.div>
  )
}
