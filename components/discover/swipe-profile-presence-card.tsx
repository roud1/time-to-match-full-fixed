"use client"

import { useEffect, useState } from "react"
import { ProfilePhotoImage } from "@/components/ui/profile-photo-image"
import { motion, useReducedMotion, type MotionValue } from "motion/react"
import type { SwipeProfile } from "@/lib/demo-profiles"
import type { PeerTrustSignals } from "@/lib/demo-trust-signals"
import { computeDiscoverCompatibility, getCompatibilityHintLabel } from "@/lib/discover-compatibility"
import { computeInterestOverlapForProfile } from "@/lib/discover/interest-overlap"
import { getProfileDisplayAbout } from "@/lib/swipe-profile-display"
import { getSwipeProfilePhotos } from "@/lib/swipe-profile-photos"
import { PulseCharacter } from "@/components/landing/pulse-character"
import { SwipeProfileExpiryChip } from "@/components/discover/swipe-profile-expiry-chip"
import { VerifiedBadge } from "@/components/ui/verified-badge"
import { PeerTrustChip } from "@/components/trust/peer-trust-chip"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import type { SwipeCardLabels } from "@/components/app/swipe-profile-card"
import "@/app/profile-presence.css"

type SwipeProfilePresenceCardProps = {
  profile: SwipeProfile
  labels: SwipeCardLabels
  trust?: PeerTrustSignals
  likeOpacity?: MotionValue<number>
  nopeOpacity?: MotionValue<number>
  onOpenSafety?: () => void
  className?: string
}

export function SwipeProfilePresenceCard({
  profile,
  labels,
  trust,
  likeOpacity,
  nopeOpacity,
  onOpenSafety,
  className,
}: SwipeProfilePresenceCardProps) {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const photos = getSwipeProfilePhotos(profile)
  const [photoIndex, setPhotoIndex] = useState(0)
  const compatibility = computeDiscoverCompatibility(profile)
  const overlap = computeInterestOverlapForProfile(profile)
  const matchPct = overlap.compatibility || compatibility.resonancePercent
  const about = getProfileDisplayAbout(profile)
  const photoVerified = profile.photoVerified === true

  useEffect(() => {
    setPhotoIndex(0)
  }, [profile.id])

  const safeIndex = Math.min(photoIndex, Math.max(photos.length - 1, 0))
  const coverPhoto = photos[safeIndex] ?? profile.image

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0.2 : 0.65, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "p9-onboarding relative overflow-hidden w-full mb-0",
        "p9-onboarding--wide swipe-profile-presence",
        className
      )}
      data-atmosphere={compatibility.atmosphere}
      style={{ ["--discover-resonance" as string]: matchPct / 100 }}
    >
      {likeOpacity && nopeOpacity && (
        <>
          <motion.div
            style={{ opacity: likeOpacity }}
            className="swipe-profile-presence__stamp swipe-profile-presence__stamp--like"
          >
            {labels.like}
          </motion.div>
          <motion.div
            style={{ opacity: nopeOpacity }}
            className="swipe-profile-presence__stamp swipe-profile-presence__stamp--nope"
          >
            {labels.nope}
          </motion.div>
        </>
      )}

      <div className="p9-onboarding__glow" aria-hidden />

      <div className="profile-presence__layout relative">
        <div className="profile-presence__head swipe-profile-presence__pulse-host relative text-center mb-6">
          <PulseCharacter size="mini" className="swipe-profile-presence__pulse mx-auto" />
        </div>

        <div className="profile-presence__identity profile-presence__identity--cover swipe-profile-presence__hero overflow-hidden relative">
          <ProfilePhotoImage
            key={coverPhoto}
            src={coverPhoto}
            className="profile-presence__identity-bg object-cover object-[center_18%]"
            sizes="(max-width: 1023px) 100vw, 360px"
            priority
          />
          <div className="profile-presence__identity-scrim" aria-hidden />

          <div className="swipe-profile-presence__identity-chrome">
            <SwipeProfileExpiryChip profileId={profile.id} timeLeft={profile.timeLeft} live />
          </div>

          <div className="profile-presence__identity-body profile-presence__identity-body--cover">
            <div className="profile-presence__identity-text min-w-0">
              <p className="profile-presence__identity-name text-sm font-extralight">
                {profile.name}
                <span className="profile-presence__identity-age">, {profile.age}</span>
                {photoVerified && (
                  <VerifiedBadge size={16} title={t("photoVerifiedLabel")} className="inline ml-1.5 align-middle" />
                )}
              </p>
              <p className="profile-presence__identity-city text-xs font-light">
                {profile.location} · {profile.distance}
              </p>
            </div>
          </div>

          {onOpenSafety && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onOpenSafety()
              }}
              className="profile-presence__identity-edit swipe-profile-presence__safety-btn touch-manipulation"
              aria-label={labels.safetyAria}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                />
              </svg>
            </button>
          )}
        </div>

        <div className="profile-presence__atmosphere swipe-profile-presence__panel swipe-profile-presence__panel--interests">
          <p className="swipe-profile-presence__panel-label">{t("profileInterests")}</p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {profile.interests.map((interest) => (
              <span key={interest} className="swipe-profile-presence__chip">
                {interest}
              </span>
            ))}
          </div>
          <p className="swipe-profile-presence__bio-label">{t("profileBio")}</p>
          <p className="swipe-profile-presence__bio">{about}</p>
        </div>

        <div className="profile-presence__strength swipe-profile-presence__panel swipe-profile-presence__panel--resonance">
          <div className="swipe-profile-presence__resonance-head">
            <p className="swipe-profile-presence__panel-label mb-0">{t("discoverResonanceLabel")}</p>
            <span className="swipe-profile-presence__match-badge">{matchPct}%</span>
          </div>
          <div className="swipe-profile-presence__meter" role="progressbar" aria-valuenow={matchPct} aria-valuemin={0} aria-valuemax={100}>
            <motion.div
              className="swipe-profile-presence__meter-fill"
              initial={false}
              animate={{ width: `${matchPct}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            />
          </div>
          <p className="swipe-profile-presence__resonance-hint">
            {getCompatibilityHintLabel(compatibility.chemistryHint, t)}
          </p>
          {overlap.commonInterests.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {overlap.commonInterests.slice(0, 4).map((tag) => (
                <span key={`${tag.id}-${tag.name}`} className="swipe-profile-presence__overlap-chip">
                  {tag.emoji ? `${tag.emoji} ` : ""}
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {photos.length > 1 && (
          <div className="profile-presence__gallery swipe-profile-presence__gallery swipe-profile-presence__panel">
            <p className="swipe-profile-presence__panel-label">{t("profilePhotos")}</p>
            <div className="swipe-profile-presence__photo-row">
              {photos.map((src, i) => (
                <button
                  key={`${src}-${i}`}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setPhotoIndex(i)
                  }}
                  className={cn(
                    "swipe-profile-presence__photo-thumb",
                    i === safeIndex && "swipe-profile-presence__photo-thumb--active"
                  )}
                  aria-label={t("swipePhotoGoTo").replace("{n}", String(i + 1))}
                >
                  <ProfilePhotoImage src={src} className="object-cover object-[center_18%]" sizes="80px" />
                </button>
              ))}
            </div>
          </div>
        )}

        {trust && (
          <div className="swipe-profile-presence__trust">
            <PeerTrustChip
              signals={trust}
              labels={{
                trustShort: labels.trustShort,
                verified: labels.trustVerified,
                review: labels.trustReview,
              }}
            />
          </div>
        )}

        <div className="profile-presence__connection swipe-profile-presence__connection rounded-2xl border px-4 py-3 mt-0">
          <p className="text-sm font-extralight text-foreground/85 mb-1">{t("welcomeConnectionTitle")}</p>
          <p className="text-xs text-muted-foreground font-light leading-relaxed">
            {t("welcomeConnectionBody")}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
