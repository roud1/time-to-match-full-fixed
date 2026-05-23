"use client"

import { usePathname } from "next/navigation"
import { motion, AnimatePresence, useReducedMotion } from "motion/react"
import { screenSlide, transitionCinematic } from "@/lib/motion-system"

const APP_ROUTES = ["/app", "/profile", "/settings", "/notifications"]
const AUTH_ROUTES = ["/register", "/login", "/welcome"]

function isAppRoute(path: string) {
  return APP_ROUTES.some((r) => path === r || path.startsWith(`${r}/`))
}

function isAuthRoute(path: string) {
  return AUTH_ROUTES.some((r) => path === r || path.startsWith(`${r}/`))
}

export function MobileScreenTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const reduce = useReducedMotion()
  const appLike = isAppRoute(pathname)
  const authLike = isAuthRoute(pathname)

  if (reduce) {
    return <div className="ttm-screen-transition min-h-full">{children}</div>
  }

  const motionProps = appLike
    ? screenSlide
    : authLike
      ? { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 1 } }
      : { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        className="ttm-screen-transition min-h-full ttm-gpu-layer"
        initial={motionProps.initial}
        animate={motionProps.animate}
        exit={motionProps.exit}
        transition={transitionCinematic(appLike ? 0.42 : authLike ? 0.2 : 0.35)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
