"use client"

import Image from "next/image"
import { useState } from "react"
import { cn } from "@/client/lib/utils"

const FALLBACK_GRADIENT =
  "linear-gradient(145deg, rgba(168, 85, 247, 0.35) 0%, rgba(236, 72, 153, 0.22) 48%, rgba(11, 15, 20, 0.92) 100%)"

type ProfilePhotoImageProps = {
  src: string
  alt?: string
  className?: string
  sizes?: string
  priority?: boolean
  width?: number
  height?: number
  fill?: boolean
}

export function ProfilePhotoImage({
  src,
  alt = "",
  className,
  sizes = "320px",
  priority,
  width,
  height,
  fill = true,
}: ProfilePhotoImageProps) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div
        className={cn("relative overflow-hidden", className)}
        aria-hidden={!alt}
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
      >
        <div className="absolute inset-0" style={{ background: FALLBACK_GRADIENT }} />
        <div className="absolute inset-0 flex items-end justify-center pb-[22%]">
          <span className="block w-[38%] aspect-square rounded-full bg-white/20" />
        </div>
      </div>
    )
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={className}
        sizes={sizes}
        priority={priority}
        loading={priority ? undefined : "lazy"}
        onError={() => setFailed(true)}
      />
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? 480}
      height={height ?? 600}
      className={className}
      sizes={sizes}
      priority={priority}
      loading={priority ? undefined : "lazy"}
      onError={() => setFailed(true)}
    />
  )
}
