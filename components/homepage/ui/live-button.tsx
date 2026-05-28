"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type LiveButtonProps = {
  href: string
  children: ReactNode
  variant?: "primary" | "secondary"
  className?: string
}

export function LiveButton({
  href,
  children,
  variant = "primary",
  className,
}: LiveButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-14 items-center justify-center rounded-2xl px-8 text-base font-semibold",
        "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-300/50",
        variant === "primary" &&
          "bg-gradient-to-r from-[#FF3D71] via-[#E954FF] to-[#7C5CFF] text-white shadow-[0_0_40px_rgba(255,61,113,0.3)] hover:scale-[1.03] hover:shadow-[0_0_56px_rgba(255,61,113,0.45)]",
        variant === "secondary" &&
          "border border-white/15 bg-white/[0.04] text-zinc-200 backdrop-blur-xl hover:border-white/30 hover:bg-white/[0.1]",
        className
      )}
    >
      {children}
    </Link>
  )
}
