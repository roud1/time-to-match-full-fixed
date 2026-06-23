"use client"

import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import type { AppTab } from "@/client/components/app/bottom-nav"
import { tabCrossfade, springSoft, transitionCinematic } from "@/client/lib/motion-system"

type AppTabTransitionProps = {
  tab: AppTab
  children: React.ReactNode
}

export function AppTabTransition({ tab, children }: AppTabTransitionProps) {
  const reduce = useReducedMotion()

  if (reduce) {
    return <div className="ttm-native-app__tab-panel">{children}</div>
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={tab}
        className="ttm-native-app__tab-panel ttm-gpu-layer"
        initial={tabCrossfade.initial}
        animate={tabCrossfade.animate}
        exit={tabCrossfade.exit}
        transition={transitionCinematic(0.38)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

export function ChatThreadTransition({
  open,
  children,
}: {
  open: boolean
  children: React.ReactNode
}) {
  const reduce = useReducedMotion()

  return (
    <AnimatePresence mode="wait">
      {open && (
        <motion.div
          key="chat-thread"
          className="ttm-chat-immersive"
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: 16 }}
          transition={reduce ? { duration: 0.15 } : springSoft}
        >
          <div className="ttm-chat-immersive__ambient absolute inset-0 pointer-events-none" aria-hidden />
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
