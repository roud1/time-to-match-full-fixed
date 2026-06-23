"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/client/lib/utils"

export const cinematicButtonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium tracking-[0.04em] transition-all duration-500 outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 touch-manipulation",
  {
    variants: {
      variant: {
        primary: "ttm-brand-cta text-primary-foreground border-0",
        secondary:
          "ttm-brand-interactive text-foreground bg-muted/80 border border-border hover:bg-muted hover:border-border rounded-full",
        ghost: "ttm-brand-interactive text-foreground/85 cin-btn-ghost rounded-full",
        glow: "ttm-brand-cta text-primary-foreground ttm-brand-glow-chemistry",
      },
      size: {
        default: "px-9 py-4 min-h-[48px] text-base",
        mobile: "px-9 py-4 min-h-[52px] text-[15px]",
        compact: "px-5 py-2.5 min-h-[40px] text-sm",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export type CinematicButtonProps = VariantProps<typeof cinematicButtonVariants> & {
  href?: string
  children: React.ReactNode
  className?: string
  disabled?: boolean
  type?: "button" | "submit" | "reset"
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  form?: string
  name?: string
  value?: string | ReadonlyArray<string> | number
  id?: string
  autoFocus?: boolean
  tabIndex?: number
}

export function CinematicButton({
  className,
  variant,
  size,
  href,
  children,
  disabled,
  type = "button",
  onClick,
  form,
  name,
  value,
  id,
  autoFocus,
  tabIndex,
}: CinematicButtonProps) {
  const classes = cn(cinematicButtonVariants({ variant, size }), className)
  const inner = <span className="relative z-10">{children}</span>

  if (href) {
    return (
      <motion.span
        className="inline-flex max-w-full"
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.985 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link href={href} className={classes}>
          {inner}
        </Link>
      </motion.span>
    )
  }

  return (
    <motion.button
      type={type}
      disabled={disabled}
      className={classes}
      whileHover={{ scale: disabled ? 1 : 1.015 }}
      whileTap={{ scale: disabled ? 1 : 0.985 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      onClick={onClick}
      form={form}
      name={name}
      value={value}
      id={id}
      autoFocus={autoFocus}
      tabIndex={tabIndex}
    >
      {inner}
    </motion.button>
  )
}
