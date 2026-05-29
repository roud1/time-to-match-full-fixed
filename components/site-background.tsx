"use client"

import { DatingParallaxBg } from "@/components/landing/dating/dating-parallax-bg"

/** Site-wide ambient — same dark neon mesh as the dating homepage. */
export function SiteBackground() {
  return (
    <div className="site-bg-root site-ambient" aria-hidden>
      <DatingParallaxBg className="site-ambient__parallax" />
    </div>
  )
}
