"use client"

import Image from "next/image"
import { PULSE_AVATAR_SRC } from "@/lib/pulse-companion"
import { cn } from "@/lib/utils"

type PulseAvatarProps = {
  size?: "sm" | "md"
  src?: string
  className?: string
}

const SIZE_PX = { sm: 48, md: 56 } as const
const SIZE_CLASS = { sm: "w-12 h-12", md: "w-14 h-14" } as const

export function PulseAvatar({ size = "md", src = PULSE_AVATAR_SRC, className }: PulseAvatarProps) {
  const px = SIZE_PX[size]
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full",
        "ring-2 ring-white/20 shadow-[0_0_22px_-6px_rgba(255,255,255,0.4)]",
        SIZE_CLASS[size],
        className
      )}
    >
      <Image
        src={src}
        alt="Pulse"
        width={px}
        height={px}
        unoptimized
        className="h-full w-full object-cover object-[center_18%]"
        sizes={`${px}px`}
        draggable={false}
      />
      <span
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          background:
            "linear-gradient(180deg, transparent 55%, rgba(7,7,7,0.35) 100%)",
        }}
        aria-hidden
      />
    </div>
  )
}
