"use client"

import { motion } from "motion/react"

type AppPanelHeaderProps = {
  title: string
  subtitle?: string
}

export function AppPanelHeader({ title, subtitle }: AppPanelHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="text-center mb-6 md:mb-8 px-1 ttm-app-panel-title-wrap"
    >
      <h1 className="ttm-app-panel-title text-2xl md:text-3xl">{title}</h1>
      {subtitle && (
        <p className="ttm-app-panel-subtitle text-sm font-extralight mt-1.5 max-w-xs mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
    </motion.div>
  )
}
