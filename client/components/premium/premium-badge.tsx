"use client"

import Link from "next/link"
import { cn } from "@/client/lib/utils"

export function PremiumBadgeLink({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-gradient-to-r from-amber-500/18 to-white/06",
        "min-h-11 px-4 py-2 text-sm font-light tracking-wide text-amber-100/95 shadow-sm ttm-premium-badge-glow",
        "hover:border-amber-400/55 hover:from-amber-500/25 active:scale-[0.98] transition-all touch-manipulation"
      )}
    >
      <svg className="w-4 h-4 text-amber-300 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7-6.3-4.6L5.7 21l2.3-7-6-4.6h7.6L12 2z" />
      </svg>
      {label}
    </Link>
  )
}
