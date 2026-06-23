"use client"

import Image from "next/image"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { User } from "lucide-react"
import { useI18n } from "@/client/lib/i18n"
import { getUserProfile } from "@/client/lib/user-profile"
import { getProfilePhotos } from "@/client/lib/profile-photos"
import { cn } from "@/client/lib/utils"

type HeaderProfileLinkProps = {
  className?: string
}

export function HeaderProfileLink({ className }: HeaderProfileLinkProps) {
  const { t } = useI18n()
  const [photo, setPhoto] = useState<string | null>(null)
  const [initial, setInitial] = useState("?")

  const syncProfile = useCallback(() => {
    const profile = getUserProfile()
    const name = profile?.name?.trim()
    setInitial(name ? name.charAt(0).toUpperCase() : "?")
    setPhoto(profile ? getProfilePhotos(profile)[0] ?? null : null)
  }, [])

  useEffect(() => {
    syncProfile()
    window.addEventListener("ttm-user-profile-changed", syncProfile)
    window.addEventListener("storage", syncProfile)
    return () => {
      window.removeEventListener("ttm-user-profile-changed", syncProfile)
      window.removeEventListener("storage", syncProfile)
    }
  }, [syncProfile])

  return (
    <Link
      href="/profile"
      className={cn("ttm-header-icon-btn shrink-0 overflow-hidden p-0", className)}
      aria-label={t("navProfile")}
      title={t("navProfile")}
    >
      {photo ? (
        <span className="relative block h-full w-full min-h-[2.75rem] min-w-[2.75rem]">
          <Image src={photo} alt="" fill className="object-cover" sizes="44px" priority />
        </span>
      ) : initial !== "?" ? (
        <span className="flex h-full w-full min-h-[2.75rem] min-w-[2.75rem] items-center justify-center text-sm font-medium text-[var(--accent)]">
          {initial}
        </span>
      ) : (
        <User className="h-5 w-5" strokeWidth={1.5} aria-hidden />
      )}
    </Link>
  )
}
