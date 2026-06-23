"use client"

import { cn } from "@/client/lib/utils"

export type PresenceVariant = "online" | "recent" | "today"

export function presenceFromProfileId(id: number): PresenceVariant {
  const m = id % 5
  if (m === 0 || m === 1) return "online"
  if (m === 2 || m === 3) return "recent"
  return "today"
}

export function PresenceBadge({
  variant,
  labelOnline,
  labelRecent,
  labelToday,
  className,
}: {
  variant: PresenceVariant
  labelOnline: string
  labelRecent: string
  labelToday: string
  className?: string
}) {
  const label = variant === "online" ? labelOnline : variant === "recent" ? labelRecent : labelToday
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-light tracking-wide backdrop-blur-md",
        variant === "online" && "border-emerald-500/35 bg-emerald-500/10 text-emerald-200",
        variant === "recent" && "border-amber-500/35 bg-amber-500/10 text-amber-100",
        variant === "today" && "border-sky-500/35 bg-sky-500/10 text-sky-100",
        className
      )}
    >
      <span className="relative flex h-1.5 w-1.5 shrink-0">
        {variant === "online" && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-45" />
        )}
        <span
          className={cn(
            "relative rounded-full h-1.5 w-1.5",
            variant === "online" && "bg-emerald-400 ttm-presence-glow-emerald",
            variant === "recent" && "bg-amber-300 ttm-presence-glow-amber",
            variant === "today" && "bg-sky-400 ttm-presence-glow-sky"
          )}
        />
      </span>
      {label}
    </span>
  )
}
