"use client"

import { Heart } from "lucide-react"
import { useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

const HEARTS = [
  { left: "8%", top: "18%", size: 14, delay: "0s", opacity: 0.35 },
  { left: "88%", top: "22%", size: 18, delay: "-1.5s", opacity: 0.45 },
  { left: "72%", top: "68%", size: 12, delay: "-3s", opacity: 0.3 },
  { left: "14%", top: "72%", size: 16, delay: "-4.5s", opacity: 0.4 },
  { left: "48%", top: "12%", size: 10, delay: "-2s", opacity: 0.25 },
  { left: "92%", top: "58%", size: 13, delay: "-5s", opacity: 0.32 },
] as const

export function DatingHeroAtmosphere() {
  const reduce = useReducedMotion()

  return (
    <div className="ttm-dating-hero__atmosphere" aria-hidden>
      <div className="ttm-dating-hero__mesh" />
      <div className="ttm-dating-hero__glow ttm-dating-hero__glow--rose" />
      <div className="ttm-dating-hero__glow ttm-dating-hero__glow--amber" />
      <div className="ttm-dating-hero__vignette" />

      <div className={cn("ttm-dating-hero__match-pulse", !reduce && "ttm-dating-hero__match-pulse--live")}>
        <span className="ttm-dating-hero__match-pulse-ring" />
        <span className="ttm-dating-hero__match-pulse-core">
          <Heart size={18} fill="currentColor" aria-hidden />
        </span>
      </div>

      <div className="ttm-dating-hero__hearts">
        {HEARTS.map((heart, index) => (
          <span
            key={index}
            className={cn("ttm-dating-hero__heart", !reduce && "ttm-dating-hero__heart--float")}
            style={{
              left: heart.left,
              top: heart.top,
              animationDelay: heart.delay,
              opacity: heart.opacity,
            }}
          >
            <Heart size={heart.size} fill="currentColor" aria-hidden />
          </span>
        ))}
      </div>
    </div>
  )
}
