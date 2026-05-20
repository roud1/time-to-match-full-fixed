import * as React from "react"

import { cn } from "@/lib/utils"

const shells: Record<"glass" | "profile" | "info" | "floating", string> = {
  glass: cn("glass-card ttm-card-shell rounded-[var(--ttm-radius-2xl)]"),
  profile: cn("premium-profile-card ttm-card-shell rounded-[var(--ttm-radius-2xl)]"),
  info: cn(
    "rounded-2xl border border-white/10 bg-black/25 backdrop-blur-md",
    "shadow-[var(--ttm-shadow-card)]"
  ),
  floating: cn(
    "glass-card ttm-card-shell rounded-[var(--ttm-radius-2xl)]",
    "hover:border-pink-500/20 hover:shadow-[var(--ttm-shadow-float)] hover:-translate-y-px transition-all duration-300"
  ),
}

export type CinematicCardProps = React.ComponentProps<"div"> & {
  variant?: keyof typeof shells
}

/** One card language: glass profile deck, info panels, floating promo */
export function CinematicCard({ className, variant = "glass", ...props }: CinematicCardProps) {
  return <div className={cn(shells[variant], className)} {...props} />
}
