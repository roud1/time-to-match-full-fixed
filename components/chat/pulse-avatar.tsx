"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

type PulseAvatarProps = {
  size?: "sm" | "md" | "lg"
  className?: string
  showRing?: boolean
}

const SIZE = {
  sm: { box: "w-12 h-12", px: 40 },
  md: { box: "w-14 h-14", px: 48 },
  lg: { box: "w-16 h-16", px: 56 },
} as const

/** Site logo avatar for Pulse AI guide. */
export function PulseAvatar({ size = "md", className, showRing = true }: PulseAvatarProps) {
  const s = SIZE[size]
  return (
    <div
      className={cn(
        "relative shrink-0 rounded-full overflow-hidden bg-[#0a0a0f]",
        s.box,
        showRing && "ring-1 ring-white/20 shadow-[0_0_20px_-6px_rgba(236,72,153,0.35)]",
        className
      )}
    >
      <Image
        src="/icon.svg"
        alt="Pulse"
        width={s.px}
        height={s.px}
        className="h-full w-full object-cover"
        unoptimized
        draggable={false}
      />
    </div>
  )
}
