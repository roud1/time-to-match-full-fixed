"use client"

import type { SVGProps } from "react"
import { cn } from "@/lib/utils"

export type BrandIconName =
  | "discover"
  | "likes"
  | "chat"
  | "map"
  | "profile"
  | "sync"
  | "shield"
  | "chevron-left"

const PATHS: Record<BrandIconName, React.ReactNode> = {
  discover: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
    />
  ),
  likes: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
    />
  ),
  chat: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
    />
  ),
  map: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
    />
  ),
  profile: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  ),
  sync: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 12a8 8 0 0114.5-4M20 12a8 8 0 01-14.5 4M8 8V4H4M16 20v-4h4"
    />
  ),
  shield: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
    />
  ),
  "chevron-left": (
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  ),
}

type BrandIconProps = {
  name: BrandIconName
  active?: boolean
  size?: "sm" | "md"
  className?: string
} & Omit<SVGProps<SVGSVGElement>, "width" | "height">

export function BrandIcon({ name, active, size = "md", className, ...props }: BrandIconProps) {
  return (
    <span
      className={cn(
        "ttm-brand-icon",
        size === "sm" ? "ttm-brand-icon--sm" : "ttm-brand-icon--md",
        active && "ttm-brand-icon--active",
        className
      )}
      aria-hidden={props["aria-label"] ? undefined : true}
    >
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
        {PATHS[name]}
      </svg>
    </span>
  )
}
