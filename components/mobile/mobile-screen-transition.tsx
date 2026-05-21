"use client"

import { usePathname } from "next/navigation"
import { motion, AnimatePresence, useReducedMotion } from "motion/react"
import { screenSlide, transitionCinematic } from "@/lib/motion-system"

const APP_ROUTES = ["/app", "/profile", "/settings", "/notifications"]

function isAppRoute(path: string) {
  return APP_ROUTES.some((r) => path === r || path.startsWith(`${r}/`))
}

export function MobileScreenTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const reduce = useReducedMotion()
  const appLike = isAppRoute(pathname)

  if (reduce) {
    return <div className="ttm-screen-transition min-h-full">{children}</div>
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        className="ttm-screen-transition min-h-full ttm-gpu-layer"
        initial={appLike ? screenSlide.initial : { opacity: 0 }}
        animate={appLike ? screenSlide.animate : { opacity: 1 }}
        exit={appLike ? screenSlide.exit : { opacity: 0 }}
        transition={transitionCinematic(appLike ? 0.42 : 0.35)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
