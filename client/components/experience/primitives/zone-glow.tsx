"use client"

import { useRef } from "react"
import { useSectionParallaxY } from "@/client/hooks/use-parallax"
import { ParallaxLayer } from "@/client/components/experience/primitives/parallax-layer"
import { cn } from "@/client/lib/utils"

type ZoneGlowProps = {
  variant: "pink" | "purple" | "green" | "amber"
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center"
  size?: "sm" | "md" | "lg"
  className?: string
}

const VARIANT_CLASS = {
  pink: "xp-zone-glow--pink",
  purple: "xp-zone-glow--purple",
  green: "xp-zone-glow--green",
  amber: "xp-zone-glow--amber",
} as const

const POSITION_CLASS = {
  "top-left": "xp-zone-glow--tl",
  "top-right": "xp-zone-glow--tr",
  "bottom-left": "xp-zone-glow--bl",
  "bottom-right": "xp-zone-glow--br",
  center: "xp-zone-glow--center",
} as const

const SIZE_CLASS = {
  sm: "xp-zone-glow--sm",
  md: "xp-zone-glow--md",
  lg: "xp-zone-glow--lg",
} as const

/** Decorative zone glow blob with subtle scroll parallax. */
export function ZoneGlow({
  variant,
  position = "top-right",
  size = "md",
  className,
}: ZoneGlowProps) {
  const ref = useRef<HTMLDivElement>(null)
  const y = useSectionParallaxY(ref, [-40, 40], 0.7)

  return (
    <div ref={ref} className={cn("xp-zone-glow-anchor", className)} aria-hidden>
      <ParallaxLayer y={y}>
        <div
          className={cn(
            "xp-zone-glow",
            VARIANT_CLASS[variant],
            POSITION_CLASS[position],
            SIZE_CLASS[size]
          )}
        />
      </ParallaxLayer>
    </div>
  )
}
