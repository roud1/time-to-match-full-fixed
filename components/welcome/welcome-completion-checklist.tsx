"use client"

import Link from "next/link"
import { useI18n } from "@/lib/i18n"
import {
  getPendingProfileHints,
  type ProfileCompletionHintId,
} from "@/lib/profile-completion-hints"
import type { StoredUserProfile } from "@/lib/user-profile"
import { useVerificationStatus } from "@/hooks/use-verification-status"

const HINT_LABEL: Record<
  ProfileCompletionHintId,
  | "profileHintAddPhoto"
  | "profileHintAddBio"
  | "profileHintAddInterests"
  | "profileHintAddVibe"
  | "profileHintVerify"
  | "profileHintVoice"
> = {
  photo: "profileHintAddPhoto",
  bio: "profileHintAddBio",
  interests: "profileHintAddInterests",
  vibe: "profileHintAddVibe",
  verify: "profileHintVerify",
  voice: "profileHintVoice",
}

type WelcomeCompletionChecklistProps = {
  profile: StoredUserProfile
  maxItems?: number
}

export function WelcomeCompletionChecklist({ profile, maxItems = 4 }: WelcomeCompletionChecklistProps) {
  const { t } = useI18n()
  const { verified: photoVerified } = useVerificationStatus()
  const hints = getPendingProfileHints(profile, photoVerified).slice(0, maxItems)

  if (hints.length === 0) return null

  return (
    <div className="ttm-welcome-page__panel ttm-welcome-checklist">
      <p className="ttm-welcome-page__panel-title">{t("profileCompletionTitle")}</p>
      <ul className="ttm-welcome-checklist__list">
        {hints.map((id) => (
          <li key={id}>
            <Link href="/profile?edit=1" className="ttm-welcome-checklist__item">
              {t(HINT_LABEL[id])}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
