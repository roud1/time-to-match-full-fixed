"use client"

import { DatingParallaxLayer } from "@/client/components/landing/dating/dating-parallax-layer"
import { useSectionParallaxY } from "@/client/hooks/use-parallax"
import { useRef } from "react"

type DatingSectionOrbsProps = {
  variant?: "rose" | "coral" | "mixed"
}

/** Layered background orbs with scroll parallax for mid-page sections. */
export function DatingSectionOrbs({ variant = "mixed" }: DatingSectionOrbsProps) {
  const ref = useRef<HTMLDivElement>(null)
  const orb1Y = useSectionParallaxY(ref, [-45, 45], 1)
  const orb2Y = useSectionParallaxY(ref, [-30, 30], 0.65)
  const orb3Y = useSectionParallaxY(ref, [-55, 55], 1.2)

  return (
    <div ref={ref} className="ttm-dating-section-orbs" aria-hidden>
      {(variant === "rose" || variant === "mixed") && (
        <DatingParallaxLayer
          y={orb1Y}
          className="ttm-dating-section-orbs__orb ttm-dating-section-orbs__orb--rose"
        />
      )}
      {(variant === "coral" || variant === "mixed") && (
        <DatingParallaxLayer
          y={orb2Y}
          className="ttm-dating-section-orbs__orb ttm-dating-section-orbs__orb--coral"
        />
      )}
      {variant === "mixed" && (
        <DatingParallaxLayer
          y={orb3Y}
          className="ttm-dating-section-orbs__orb ttm-dating-section-orbs__orb--amber"
        />
      )}
    </div>
  )
}
