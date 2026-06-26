"use client"

import { usePathname } from "next/navigation"
import { DatingParallaxBg } from "@/client/components/landing/dating/dating-parallax-bg"

const AUTH_PATHS = new Set(["/login", "/register"])
const EXPERIENCE_PATHS = new Set(["/"])

/** Site-wide ambient — same dark neon mesh as the dating homepage. */
export function SiteBackground() {
  const pathname = usePathname() ?? ""
  if (AUTH_PATHS.has(pathname) || EXPERIENCE_PATHS.has(pathname)) return null

  return (
    <div className="site-bg-root site-ambient" aria-hidden>
      <DatingParallaxBg className="site-ambient__parallax" />
    </div>
  )
}
