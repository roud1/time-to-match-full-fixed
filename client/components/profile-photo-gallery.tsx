"use client"

import Image from "next/image"
import { useState } from "react"
import { cn } from "@/client/lib/utils"

type ProfilePhotoGalleryProps = {
  photos: string[]
  name: string
  className?: string
}

export function ProfilePhotoGallery({ photos, name, className }: ProfilePhotoGalleryProps) {
  const [active, setActive] = useState(0)

  if (photos.length === 0) {
    return (
      <div
        className={cn(
          "flex items-center justify-center aspect-[4/5] min-h-[220px] w-full rounded-2xl bg-gradient-to-br from-[var(--accent)]/15 via-foreground/5 to-[var(--accent)]/10 border border-foreground/10",
          className
        )}
      >
        <span className="text-5xl font-extralight text-foreground/45">{name.charAt(0).toUpperCase()}</span>
      </div>
    )
  }

  const index = Math.min(active, photos.length - 1)
  const activeSrc = photos[index]
  const needsUnoptimized = (src: string) =>
    src.startsWith("data:") || src.startsWith("blob:")

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative aspect-[4/5] max-h-80 w-full rounded-2xl overflow-hidden border border-foreground/10 bg-foreground/5">
        <Image
          src={activeSrc}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 480px"
          unoptimized={needsUnoptimized(activeSrc)}
          priority
        />
        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setActive((i) => (i === 0 ? photos.length - 1 : i - 1))}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full glass flex items-center justify-center text-foreground/90 hover:bg-foreground/10"
              aria-label="Previous photo"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setActive((i) => (i === photos.length - 1 ? 0 : i + 1))}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full glass flex items-center justify-center text-foreground/90 hover:bg-foreground/10"
              aria-label="Next photo"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {photos.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActive(i)}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all",
                    i === index ? "bg-white w-4" : "bg-white/40"
                  )}
                  aria-label={`Photo ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {photos.map((url, i) => (
            <button
              key={`${url.slice(0, 24)}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "relative shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-colors",
                i === index ? "border-white/25" : "border-transparent opacity-60 hover:opacity-100"
              )}
            >
              <Image
                src={url}
                alt=""
                fill
                className="object-cover"
                sizes="56px"
                unoptimized={needsUnoptimized(url)}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
