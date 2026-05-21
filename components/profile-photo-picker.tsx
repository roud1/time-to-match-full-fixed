"use client"

import Image from "next/image"
import { useRef } from "react"
import { useI18n } from "@/lib/i18n"
import {
  filesToDataUrls,
  MAX_PROFILE_PHOTOS,
  mergePhotos,
} from "@/lib/profile-photos"
import { cn } from "@/lib/utils"

type ProfilePhotoPickerProps = {
  value: string[]
  onChange: (photos: string[]) => void
  error?: string
  compact?: boolean
}

export function ProfilePhotoPicker({
  value,
  onChange,
  error,
  compact = false,
}: ProfilePhotoPickerProps) {
  const { t } = useI18n()
  const inputRef = useRef<HTMLInputElement>(null)
  const atMax = value.length >= MAX_PROFILE_PHOTOS

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length || atMax) return
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"))
    if (!list.length) return
    const urls = await filesToDataUrls(list)
    onChange(mergePhotos(value, urls))
    if (inputRef.current) inputRef.current.value = ""
  }

  const removeAt = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  const movePrimary = (index: number) => {
    if (index === 0) return
    const next = [...value]
    const [picked] = next.splice(index, 1)
    next.unshift(picked)
    onChange(next)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground font-light">
          {t("regPhotosHint").replace("{n}", String(MAX_PROFILE_PHOTOS))}
        </p>
        <span className="text-xs text-muted-foreground/70 font-light tabular-nums">
          {value.length}/{MAX_PROFILE_PHOTOS}
        </span>
      </div>

      {value.length > 0 && (
        <div
          className={cn(
            "grid gap-2",
            compact ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-3"
          )}
        >
          {value.map((url, index) => (
            <div
              key={`${url.slice(0, 32)}-${index}`}
              className="relative group aspect-[3/4] rounded-xl overflow-hidden border border-foreground/10 bg-foreground/5"
            >
              <Image src={url} alt="" fill className="object-cover" sizes="(max-width: 640px) 33vw, 200px" unoptimized />
              {index === 0 && (
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-light bg-white/20 text-white">
                  {t("profilePhotoPrimary")}
                </span>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                {index !== 0 && (
                  <button
                    type="button"
                    onClick={() => movePrimary(index)}
                    className="px-2 py-1 rounded-lg text-[10px] font-light bg-white/20 text-white hover:bg-white/30 text-center"
                  >
                    {t("profilePhotoMakePrimary")}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeAt(index)}
                  className="p-1.5 rounded-lg bg-red-500/80 text-white hover:bg-red-500"
                  aria-label={t("profilePhotoRemove")}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <label
        className={cn(
          "block cursor-pointer rounded-2xl border border-dashed border-foreground/15 p-5 text-center transition-colors",
          atMax
            ? "opacity-40 cursor-not-allowed"
            : "hover:border-white/15 hover:bg-white/5"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          disabled={atMax}
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center mx-auto mb-2">
          <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <p className="text-sm font-light text-foreground/80">
          {atMax ? t("regPhotosMax").replace("{n}", String(MAX_PROFILE_PHOTOS)) : t("regPhotosAdd")}
        </p>
      </label>

      {error && <p className="text-xs text-red-400 font-light">{error}</p>}
    </div>
  )
}
