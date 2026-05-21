"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

export const cinematicButtonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-light tracking-[0.04em] transition-all duration-500 outline-none focus-visible:ring-1 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050506] disabled:pointer-events-none disabled:opacity-40 touch-manipulation",
  {
    variants: {
      variant: {
        primary: "text-white cin-btn-primary",
        secondary:
          "text-white/85 bg-white/[0.06] border border-white/12 hover:bg-white/[0.09] hover:border-white/18",
        ghost: "text-white/75 cin-btn-ghost",
        glow: "text-white cin-btn-primary shadow-[0_0_48px_-12px_rgba(255,255,255,0.15)]",
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
