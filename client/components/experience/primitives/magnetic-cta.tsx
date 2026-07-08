"use client"

/**
 * MagneticCTA — кнопка с магнитным притяжением курсора.
 * При наведении кнопка "тянется" к курсору (max 12px).
 * Создаёт ощущение живого UI — пользователь чувствует что хочет нажать.
 */

import { useRef, useCallback } from "react"
import { motion, useMotionValue, useSpring } from "motion/react"
import { cn } from "@/client/lib/utils"

type MagneticCTAProps = {
  children: React.ReactNode
  href?: string
  onClick?: () => void
  className?: string
  strength?: number
}

export function MagneticCTA({
  children,
  href,
  onClick,
  className,
  strength = 0.35,
}: MagneticCTAProps) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 400, damping: 28 })
  const springY = useSpring(y, { stiffness: 400, damping: 28 })

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      x.set((e.clientX - cx) * strength)
      y.set((e.clientY - cy) * strength)
    },
    [x, y, strength]
  )

  const handleMouseLeave = useCallback(() => {
    x.set(0)
    y.set(0)
  }, [x, y])

  const inner = (
    <motion.div
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn("inline-block cursor-pointer", className)}
    >
      {children}
    </motion.div>
  )

  if (href) {
    return <a href={href}>{inner}</a>
  }
  return <div onClick={onClick}>{inner}</div>
}
