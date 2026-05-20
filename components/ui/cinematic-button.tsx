"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

export const cinematicButtonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-light tracking-wide transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-pink-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-45 touch-manipulation",
  {
    variants: {
      variant: {
        primary:
          "text-white bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 shadow-lg shadow-pink-500/30 hover:opacity-95",
        secondary:
          "text-foreground/90 bg-foreground/[0.08] border border-foreground/12 hover:bg-foreground/[0.12] hover:border-foreground/18",
        ghost:
          "text-foreground/85 border border-foreground/15 bg-foreground/[0.04] hover:bg-foreground/[0.09]",
        glow:
          "text-white bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 border border-pink-500/25 shadow-[0_0_36px_-6px_rgba(236,72,153,0.55)] hover:shadow-[0_0_48px_-4px_rgba(236,72,153,0.65)] hover:opacity-95",
      },
      size: {
        default: "px-8 py-4 min-h-[48px] text-base",
        mobile: "px-8 py-4 min-h-[52px] text-base",
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
  const showShimmer = variant === "primary" || variant === "glow"
  const inner = (
    <>
      {showShimmer && (
        <span className="absolute inset-0 rounded-full premium-btn-shimmer opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-500" />
      )}
      <span className="relative z-10">{children}</span>
    </>
  )

  if (href) {
    return (
      <motion.span className="inline-flex max-w-full" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Link href={href} className={cn(classes, "group")}>
          {inner}
        </Link>
      </motion.span>
    )
  }

  return (
    <motion.button
      type={type}
      disabled={disabled}
      className={cn(classes, "group")}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
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
