"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { useI18n } from "@/lib/i18n"
import {
  mergePhotos,
  MAX_PROFILE_PHOTOS,
} from "@/lib/profile-photos"
import {
  uploadPhotoFiles,
  isPhotoS3Configured,
} from "@/lib/client/photo-upload"
import { Progress } from "@/components/ui/progress"
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
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [s3Configured, setS3Configured] = useState<boolean | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [pendingPreview, setPendingPreview] = useState<string[]>([])

  useEffect(() => {
    void isPhotoS3Configured().then(setS3Configured)
  }, [])

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length || atMax || uploading) return
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"))
    if (!list.length) return

    setUploadError(null)
    setUploading(true)
    setUploadProgress(0)

    const previewUrls = list.map((f) => URL.createObjectURL(f))
    setPendingPreview(previewUrls)

    try {
      const results = await uploadPhotoFiles(list, (done, total) => {
        setUploadProgress(Math.round((done / total) * 100))
      })
      const urls = results.map((r) => r.url)
      if (results.some((r) => r.usedFallback) && s3Configured === false) {
        setUploadError(t("photoUploadS3Unavailable"))
      }
      onChange(mergePhotos(value, urls))
    } catch {
      setUploadError(t("photoUploadFailed"))
    } finally {
      previewUrls.forEach((u) => URL.revokeObjectURL(u))
      setPendingPreview([])
      setUploading(false)
      setUploadProgress(0)
      if (inputRef.current) inputRef.current.value = ""
    }
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

  const displayPhotos = pendingPreview.length > 0 ? [...value, ...pendingPreview] : value

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

      {s3Configured === false && !uploading && (
        <p className="text-[11px] text-amber-200/75 font-light border border-amber-500/20 rounded-xl px-3 py-2 bg-amber-500/[0.06]">
          {t("photoUploadS3Unavailable")}
        </p>
      )}

      {uploading && (
        <div className="space-y-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3">
          <p className="text-xs text-white/55 font-light">
            {t("photoUploadProgress")
              .replace("{current}", String(Math.max(1, Math.round((uploadProgress / 100) * pendingPreview.length || 1))))
              .replace("{total}", String(pendingPreview.length || 1))}
          </p>
          <Progress value={uploadProgress} className="h-1.5" />
        </div>
      )}

      {displayPhotos.length > 0 && (
        <div
          className={cn(
            "grid gap-2",
            compact ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-3"
          )}
        >
          {displayPhotos.map((url, index) => {
            const isPending = index >= value.length
            return (
              <div
                key={`${url.slice(0, 32)}-${index}`}
                className={cn(
                  "relative group aspect-[3/4] rounded-xl overflow-hidden border border-foreground/10 bg-foreground/5",
                  isPending && "opacity-70"
                )}
              >
                <Image src={url} alt="" fill className="object-cover" sizes="(max-width: 640px) 33vw, 200px" unoptimized />
                {index === 0 && !isPending && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-light bg-white/20 text-white">
                    {t("profilePhotoPrimary")}
                  </span>
                )}
                {isPending && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-[10px] text-white/80 font-light">
                    {t("photoUploadProgress").replace("{current}", "…").replace("{total}", "…")}
                  </span>
                )}
                {!isPending && (
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
                )}
              </div>
            )
          })}
        </div>
      )}

      <label
        className={cn(
          "block cursor-pointer rounded-2xl border border-dashed border-foreground/15 p-5 text-center transition-colors",
          atMax || uploading
            ? "opacity-40 cursor-not-allowed"
            : "hover:border-white/15 hover:bg-white/5"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          disabled={atMax || uploading}
          className="sr-only"
          onChange={(e) => void handleFiles(e.target.files)}
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

      {(error || uploadError) && (
        <p className="text-xs text-red-400 font-light">{error ?? uploadError}</p>
      )}
    </div>
  )
}
