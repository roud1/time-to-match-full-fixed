"use client"

import type { MouseEventHandler, ReactNode } from "react"

import { CinematicButton, type CinematicButtonProps } from "@/client/components/ui/cinematic-button"

export type PremiumButtonProps = {
  href?: string
  variant?: "primary" | "ghost" | "secondary" | "glow"
  size?: CinematicButtonProps["size"]
  className?: string
  children: ReactNode
  onClick?: MouseEventHandler<HTMLButtonElement>
  disabled?: boolean
  type?: "button" | "submit" | "reset"
}

/** Wraps `CinematicButton` with touch-friendly defaults used across marketing & profile CTAs */
export function PremiumButton({
  href,
  variant = "primary",
  size = "mobile",
  className,
  children,
  onClick,
  disabled,
  type = "button",
}: PremiumButtonProps) {
  const v =
    variant === "ghost"
      ? "ghost"
      : variant === "secondary"
        ? "secondary"
        : variant === "glow"
          ? "glow"
          : "primary"

  return (
    <CinematicButton
      href={href}
      variant={v}
      size={size}
      className={className}
      onClick={onClick}
      disabled={disabled}
      type={type}
    >
      {children}
    </CinematicButton>
  )
}

export { cinematicButtonVariants } from "./cinematic-button"
