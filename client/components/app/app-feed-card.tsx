"use client"

import { useEffect, useState } from "react"
import { motion, type MotionValue } from "motion/react"
import { Info, MapPin, ShieldCheck } from "lucide-react"
import { ProfilePhotoImage } from "@/client/components/ui/profile-photo-image"
import { VerifiedBadge } from "@/client/components/ui/verified-badge"
import type { SwipeProfile } from "@/client/lib/demo-profiles"
import { getProfileDisplayAbout } from "@/client/lib/swipe-profile-display"
import { getSwipeProfilePhotos } from "@/client/lib/swipe-profile-photos"
import { useI18n } from "@/client/lib/i18n"
import { cn } from "@/client/lib/utils"

type AppFeedCardProps = {
  profile: SwipeProfile
  likeLabel: string
  nopeLabel: string
  safetyAria: string
  likeOpacity?: MotionValue<number>
  nopeOpacity?: MotionValue<number>
  onOpenSafety?: () => void
  onOpenProfile?: (photoIndex: number) => void
}

/**
 * Swipe card of the native app / installed PWA (rendered only when html[data-ttm-app] is set).
 * Shows only real profile data: photos, name, age, verification, city, distance, bio.
 */
export function AppFeedCard({
  profile,
  likeLabel,
  nopeLabel,
  safetyAria,
  likeOpacity,
  nopeOpacity,
  onOpenSafety,
  onOpenProfile,
}: AppFeedCardProps) {
  const { t } = useI18n()
  const photos = getSwipeProfilePhotos(profile)
  const [photoIndex, setPhotoIndex] = useState(0)
  const about = getProfileDisplayAbout(profile)
  const hasDistance = Boolean(profile.distance && profile.distance !== "—")

  useEffect(() => {
    setPhotoIndex(0)
  }, [profile.id])

  const safeIndex = Math.min(photoIndex, Math.max(photos.length - 1, 0))
  const cover = photos[safeIndex] ?? profile.image
  const many = photos.length > 1

  return (
    <article className="ttm-app-swipe" aria-label={`${profile.name}, ${profile.age}`}>
      <ProfilePhotoImage
        key={cover}
        src={cover}
        className="ttm-app-swipe__photo object-cover object-[center_20%] select-none pointer-events-none"
        sizes="(max-width: 640px) 100vw, 420px"
        priority
      />
      <div className="ttm-app-swipe__scrim" aria-hidden />

      {many && (
        <>
          <button
            type="button"
            className="ttm-app-swipe__tap ttm-app-swipe__tap--prev"
            aria-label={t("swipePhotoGoTo").replace("{n}", String(Math.max(safeIndex, 1)))}
            onClick={(e) => {
              e.stopPropagation()
              setPhotoIndex((i) => Math.max(i - 1, 0))
            }}
          />
          <button
            type="button"
            className="ttm-app-swipe__tap ttm-app-swipe__tap--next"
            aria-label={t("swipePhotoGoTo").replace("{n}", String(Math.min(safeIndex + 2, photos.length)))}
            onClick={(e) => {
              e.stopPropagation()
              setPhotoIndex((i) => Math.min(i + 1, photos.length - 1))
            }}
          />
          <span className="ttm-app-swipe__counter" aria-hidden>
            {safeIndex + 1}/{photos.length}
          </span>
        </>
      )}

      {onOpenSafety && (
        <button
          type="button"
          className="ttm-app-swipe__safety"
          aria-label={safetyAria}
          onClick={(e) => {
            e.stopPropagation()
            onOpenSafety()
          }}
        >
          <ShieldCheck aria-hidden strokeWidth={1.7} />
        </button>
      )}

      {profile.isDemo && <span className="ttm-app-swipe__demo">{t("appFeedDemoProfile")}</span>}

      {likeOpacity && nopeOpacity && (
        <>
          <motion.span style={{ opacity: likeOpacity }} className="ttm-app-swipe__stamp ttm-app-swipe__stamp--like">
            {likeLabel}
          </motion.span>
          <motion.span style={{ opacity: nopeOpacity }} className="ttm-app-swipe__stamp ttm-app-swipe__stamp--nope">
            {nopeLabel}
          </motion.span>
        </>
      )}

      <div className="ttm-app-swipe__info">
        <div className="ttm-app-swipe__text">
          <h2 className="ttm-app-swipe__name">
            <span className="truncate">
              {profile.name}, {profile.age}
            </span>
            {profile.photoVerified === true && (
              <VerifiedBadge size={22} title={t("photoVerifiedLabel")} className="shrink-0" />
            )}
          </h2>
          {(profile.location || hasDistance) && (
            <p className="ttm-app-swipe__place">
              <MapPin aria-hidden strokeWidth={1.8} />
              <span className="truncate">
                {[profile.location, hasDistance ? profile.distance : null].filter(Boolean).join(", ")}
              </span>
            </p>
          )}
          {profile.interests.length > 0 ? (
            <ul className="ttm-app-swipe__tags" aria-label={t("profileInterests")}>
              {profile.interests.slice(0, 3).map((it) => (
                <li key={it}>{it}</li>
              ))}
            </ul>
          ) : (
            about && <p className="ttm-app-swipe__bio">{about}</p>
          )}
        </div>
        {onOpenProfile && (
          <button
            type="button"
            className={cn("ttm-app-swipe__open")}
            aria-label={t("lvProfileInfo")}
            onClick={(e) => {
              e.stopPropagation()
              onOpenProfile(safeIndex)
            }}
          >
            <Info aria-hidden strokeWidth={1.8} />
          </button>
        )}
      </div>
    </article>
  )
}
