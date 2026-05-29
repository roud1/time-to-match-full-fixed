"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { Camera, Heart, Sparkles, Timer, Users } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { computeProfileStrength } from "@/lib/profile-completion"
import { getProfilePhotos } from "@/lib/profile-photos"
import { MIN_INTERESTS } from "@/lib/interests"
import { MIN_VIBES } from "@/lib/profile-identity"
import { getConnectionSummary } from "@/lib/connection-summary"
import { getUserProfile, getProfileTimeLeft } from "@/lib/user-profile"
import { useVerificationStatus } from "@/hooks/use-verification-status"
import { cn } from "@/lib/utils"

function formatTimer(h: number, m: number, s: number) {
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

type HintId = "photo" | "bio" | "interests" | "vibe" | "verify" | "voice"

const HINT_LABEL: Record<HintId, "profileHintAddPhoto" | "profileHintAddBio" | "profileHintAddInterests" | "profileHintAddVibe" | "profileHintVerify" | "profileHintVoice"> = {
  photo: "profileHintAddPhoto",
  bio: "profileHintAddBio",
  interests: "profileHintAddInterests",
  vibe: "profileHintAddVibe",
  verify: "profileHintVerify",
  voice: "profileHintVoice",
}

export function ProfilePageBand() {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const { verified: photoVerified } = useVerificationStatus()
  const [tick, setTick] = useState(0)
  const [liveIndex, setLiveIndex] = useState(0)

  const bump = useCallback(() => setTick((n) => n + 1), [])

  useEffect(() => {
    window.addEventListener("ttm-user-profile-changed", bump)
    window.addEventListener("ttm-connection-updated", bump)
    const id = window.setInterval(bump, 1000)
    return () => {
      window.removeEventListener("ttm-user-profile-changed", bump)
      window.removeEventListener("ttm-connection-updated", bump)
      window.clearInterval(id)
    }
  }, [bump])

  const profile = useMemo(() => getUserProfile(), [tick])
  const strength = profile ? computeProfileStrength(profile) : 0
  const timer = profile ? getProfileTimeLeft(profile) : null
  const connections = getConnectionSummary()

  const pendingHints = useMemo((): HintId[] => {
    if (!profile) return []
    const hints: HintId[] = []
    if (getProfilePhotos(profile).length === 0) hints.push("photo")
    if ((profile.bio?.trim().length ?? 0) < 12) hints.push("bio")
    if ((profile.interests?.length ?? 0) < MIN_INTERESTS) hints.push("interests")
    if ((profile.vibeIds?.length ?? 0) < MIN_VIBES && (profile.energyTagIds?.length ?? 0) === 0) hints.push("vibe")
    if (!photoVerified) hints.push("verify")
    if (!profile.voiceIntroRecorded) hints.push("voice")
    return hints
  }, [profile, photoVerified])

  const liveMessages = useMemo(() => {
    const time = timer ? formatTimer(timer.hours, timer.minutes, timer.seconds) : "—"
    return [
      t("profileLiveStrength").replace("{score}", String(strength)),
      t("profileLiveTimer").replace("{time}", time),
      t("profileLiveConnections").replace("{count}", String(connections.activeCount)),
      ...(pendingHints.length > 0 ? [t("profileLiveComplete")] : []),
    ]
  }, [t, strength, timer, connections.activeCount, pendingHints.length])

  useEffect(() => {
    const id = window.setInterval(() => {
      setLiveIndex((i) => (i + 1) % Math.max(1, liveMessages.length))
    }, 3200)
    return () => window.clearInterval(id)
  }, [liveMessages.length])

  const requestEdit = () => {
    window.dispatchEvent(new CustomEvent("ttm-profile-request-edit"))
  }

  if (!profile) return null

  const chips = [
    { icon: Timer, label: t("profileChipTimer") },
    { icon: Users, label: t("profileChipSync") },
    { icon: Sparkles, label: t("profileChipStrength") },
  ]

  return (
    <div className="ttm-profile-band">
      <p className="ttm-profile-band__eyebrow">{t("profileEyebrow")}</p>
      <p className="ttm-profile-band__lead">{t("profilePageLead")}</p>

      <ul className="ttm-profile-band__chips" aria-label={t("profileBandChipsAria")}>
        {chips.map(({ icon: Icon, label }) => (
          <li key={label} className="ttm-profile-band__chip">
            <Icon className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
            {label}
          </li>
        ))}
      </ul>

      <div className="ttm-profile-band__live" role="status" aria-live="polite">
        <span className="ttm-profile-band__live-dot" aria-hidden />
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={liveMessages[liveIndex] ?? liveMessages[0]}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="ttm-profile-band__live-text"
          >
            {liveMessages[liveIndex] ?? liveMessages[0]}
          </motion.span>
        </AnimatePresence>
      </div>

      <div className="ttm-profile-band__stats">
        <div className="ttm-profile-band__stat">
          <Sparkles className="h-4 w-4 text-[var(--accent)] mb-1.5" aria-hidden />
          <p className="ttm-profile-band__stat-value">{strength}%</p>
          <p className="ttm-profile-band__stat-label">{t("profileStatStrength")}</p>
        </div>
        <div className="ttm-profile-band__stat">
          <Timer className="h-4 w-4 text-[var(--accent)] mb-1.5" aria-hidden />
          <p className="ttm-profile-band__stat-value tabular-nums">
            {timer ? formatTimer(timer.hours, timer.minutes, timer.seconds) : "—"}
          </p>
          <p className="ttm-profile-band__stat-label">{t("profileStatTimer")}</p>
        </div>
        <div className="ttm-profile-band__stat">
          <Heart className="h-4 w-4 text-[var(--accent)] mb-1.5" aria-hidden />
          <p className="ttm-profile-band__stat-value">{connections.activeCount}</p>
          <p className="ttm-profile-band__stat-label">{t("profileStatConnections")}</p>
        </div>
      </div>

      {pendingHints.length > 0 && (
        <div className="ttm-profile-band__completion">
          <p className="ttm-profile-band__completion-title">{t("profileCompletionTitle")}</p>
          <div className="ttm-profile-band__hints" role="list">
            {pendingHints.map((id) => (
              <button
                key={id}
                type="button"
                role="listitem"
                onClick={requestEdit}
                className={cn("ttm-profile-band__hint", id === "verify" && "ttm-profile-band__hint--accent")}
              >
                {id === "photo" && <Camera className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />}
                {t(HINT_LABEL[id])}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
