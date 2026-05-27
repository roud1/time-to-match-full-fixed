"use client"

import Link from "next/link"
import { User } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { getUserProfile } from "@/lib/user-profile"
import { cn } from "@/lib/utils"

type HeaderProfileLinkProps = {
  className?: string
}

export function HeaderProfileLink({ className }: HeaderProfileLinkProps) {
  const { t } = useI18n()
  const name = getUserProfile()?.name
  const initial = (name ?? "?").charAt(0).toUpperCase()

  return (
    <Link
      href="/profile"
      className={cn("ttm-header-icon-btn shrink-0", className)}
      aria-label={t("navProfile")}
      title={t("navProfile")}
    >
      {name ? (
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent-soft-bg)] text-[10px] font-medium text-[var(--accent)]">
          {initial}
        </span>
      ) : (
        <User className="h-5 w-5" strokeWidth={1.5} aria-hidden />
      )}
    </Link>
  )
}
