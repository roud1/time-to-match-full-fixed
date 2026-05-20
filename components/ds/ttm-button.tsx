"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"
import type { ComponentPropsWithoutRef } from "react"

type Variant = "primary" | "secondary" | "ghost"

const variantClass: Record<Variant, string> = {
  primary: "ttm-btn ttm-btn-primary",
  secondary: "ttm-btn ttm-btn-secondary",
  ghost: "ttm-btn ttm-btn-ghost",
}

type TtmButtonProps = {
  variant?: Variant
  href?: string
  className?: string
  children: React.ReactNode
} & Omit<ComponentPropsWithoutRef<"button">, "children"> &
  Omit<ComponentPropsWithoutRef<typeof Link>, "children">

export function TtmButton({
  variant = "primary",
  href,
  className,
  children,
  ...rest
}: TtmButtonProps) {
  const reduce = useReducedMotion()
  const cls = cn(variantClass[variant], className)

  const inner = (
    <motion.span
      className="inline-flex items-center justify-center gap-2 w-full"
      whileHover={reduce ? undefined : { scale: 1.02 }}
      whileTap={reduce ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.span>
  )

  if (href) {
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    )
  }

  return (
    <button type="button" className={cls} {...rest}>
      {inner}
    </button>
  )
}
