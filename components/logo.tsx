"use client"

import { useId } from "react"

type LogoProps = {
  size?: "sm" | "md"
}

export function Logo({ size = "md" }: LogoProps) {
  const id = useId().replace(/:/g, "")
  const heartGrad = `heartGrad-${id}`
  const heartGrad2 = `heartGrad2-${id}`

  const box = size === "sm" ? "w-8 h-8" : "w-9 h-9"
  const icon = size === "sm" ? 16 : 18

  return (
    <div className={`relative ${box}`}>
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-500 via-rose-400 to-purple-600 p-[2px]">
        <div className="w-full h-full rounded-full bg-background/90 flex items-center justify-center">
          <svg width={icon} height={icon} viewBox="0 0 24 24" fill="none" className="text-pink-400">
            <path
              d="M12 2C12 2 8 6 8 10C8 12.21 9.79 14 12 14C14.21 14 16 12.21 16 10C16 6 12 2 12 2Z"
              fill={`url(#${heartGrad})`}
              opacity="0.9"
            />
            <path
              d="M12 22C12 22 8 18 8 14C8 11.79 9.79 10 12 10C14.21 10 16 11.79 16 14C16 18 12 22 12 22Z"
              fill={`url(#${heartGrad2})`}
              opacity="0.6"
            />
            <defs>
              <linearGradient id={heartGrad} x1="8" y1="2" x2="16" y2="14" gradientUnits="userSpaceOnUse">
                <stop stopColor="#ec4899" />
                <stop offset="1" stopColor="#a855f7" />
              </linearGradient>
              <linearGradient id={heartGrad2} x1="8" y1="10" x2="16" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="#ec4899" />
                <stop offset="1" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
      <div className="absolute inset-0 rounded-full bg-pink-500/20 blur-md -z-10" />
    </div>
  )
}
