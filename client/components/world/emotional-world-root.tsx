"use client"

import type { ReactNode } from "react"
import { EmotionalOsRoot } from "@/client/components/emotional-os/emotional-os-root"

import type { Locale } from "@/client/lib/i18n"
import type { GeoPosition } from "@/client/lib/geo"

type EmotionalWorldRootProps = {
  children: ReactNode
  className?: string
  /** Full-screen ambient (app shell). Off on marketing pages if needed. */
  ambient?: boolean
  locale?: Locale
  position?: GeoPosition | null
}

/** Wraps Phase 20 EmotionalOsRoot for backward compatibility. */
export function EmotionalWorldRoot(props: EmotionalWorldRootProps) {
  return <EmotionalOsRoot {...props} />
}
