"use client"

import "./app-profile-detail.css"
import { localizeInterestName } from "@/client/lib/interest-labels"
import { useEffect, useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import { ArrowLeft, Heart, MapPin, MessageCircle, MoreHorizontal, X } from "lucide-react"
import { ProfilePhotoImage } from "@/client/components/ui/profile-photo-image"
import { VerifiedBadge } from "@/client/components/ui/verified-badge"
import type { SwipeProfile } from "@/client/lib/demo-profiles"
import { getSwipeProfilePhotos } from "@/client/lib/swipe-profile-photos"
import { getProfileDisplayAbout } from "@/client/lib/swipe-profile-display"
import { useI18n } from "@/client/lib/i18n"
import { cn } from "@/client/lib/utils"

type AppProfileDetailProps = {
  profile: SwipeProfile
  initialPhotoIndex: number
  context: "discover" | "chat"
  onClose: () => void
  onLike: () => void
  onNope: () => void
  onOpenSafety?: () => void
}

/**
 * Full profile ("Карточка профиля") of the native app / installed PWA — rendered only when html[data-ttm-app] is set.
 * Real data only: photos, name, age, verification, city, distance, interests, about. No compatibility percentage.
 */
export function AppProfileDetail({
  profile,
  initialPhotoIndex,
  context,
  onClose,
  onLike,
  onNope,
  onOpenSafety,
}: AppProfileDetailProps) {
  const { t, locale } = useI18n()
  const reduce = useReducedMotion()
  const photos = getSwipeProfilePhotos(profile)
  const [index, setIndex] = useState(Math.min(initialPhotoIndex, Math.max(photos.length - 1, 0)))
  const about = getProfileDisplayAbout(profile)
  const hasDistance = Boolean(profile.distance && profile.distance !== "—")
  const place = [profile.location, hasDistance ? profile.distance : null].filter(Boolean).join(", ")

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  return (
    <motion.div
      role="dialog"
      aria-modal
      aria-labelledby="app-profile-detail-name"
      className={cn("ttm-app-profile", context === "chat" ? "z-[80]" : "z-[75]")}
      initial={{ opacity: 0, y: reduce ? 0 : 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: reduce ? 0 : 24 }}
      transition={{ duration: reduce ? 0.12 : 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="ttm-app-profile__scroll">
        <div className="ttm-app-profile__photo">
          <ProfilePhotoImage
            key={photos[index] ?? profile.image}
            src={photos[index] ?? profile.image}
            className="object-cover object-[center_20%]"
            sizes="100vw"
            priority
          />
          <div className="ttm-app-profile__photo-fade" aria-hidden />
          {photos.length > 1 && (
            <>
              <div className="ttm-app-profile__bars" aria-hidden>
                {photos.map((_, i) => (
                  <span key={i} className={cn(i === index && "is-active")} />
                ))}
              </div>
              <button
                type="button"
                className="ttm-app-profile__tap ttm-app-profile__tap--prev"
                aria-label={t("swipePhotoGoTo").replace("{n}", String(Math.max(index, 1)))}
                onClick={() => setIndex((i) => Math.max(i - 1, 0))}
              />
              <button
                type="button"
                className="ttm-app-profile__tap ttm-app-profile__tap--next"
                aria-label={t("swipePhotoGoTo").replace("{n}", String(Math.min(index + 2, photos.length)))}
                onClick={() => setIndex((i) => Math.min(i + 1, photos.length - 1))}
              />
            </>
          )}
        </div>

        <div className="ttm-app-profile__body">
          {profile.isDemo && <span className="ttm-app-profile__demo">{t("appFeedDemoProfile")}</span>}
          <h2 id="app-profile-detail-name" className="ttm-app-profile__name">
            <span>
              {profile.name}, {profile.age}
            </span>
            {profile.photoVerified === true && <VerifiedBadge size={24} title={t("photoVerifiedLabel")} />}
          </h2>
          {place && (
            <p className="ttm-app-profile__place">
              <MapPin aria-hidden strokeWidth={1.9} />
              {place}
            </p>
          )}

          {profile.interests.length > 0 && (
            <section className="ttm-app-profile__section">
              <h3>{t("profileInterests")}</h3>
              <ul className="ttm-app-profile__chips">
                {profile.interests.map((it) => (
                  <li key={it}>{localizeInterestName(it, locale)}</li>
                ))}
              </ul>
            </section>
          )}

          {about && (
            <section className="ttm-app-profile__section">
              <h3>{t("profileBio")}</h3>
              <p className="ttm-app-profile__about">{about}</p>
            </section>
          )}
        </div>
      </div>

      <div className="ttm-app-profile__top">
        <button type="button" className="ttm-app-profile__round" onClick={onClose} aria-label={t("swipeProfileClose")}>
          <ArrowLeft aria-hidden strokeWidth={2} />
        </button>
        {onOpenSafety && (
          <button
            type="button"
            className="ttm-app-profile__round"
            onClick={onOpenSafety}
            aria-label={t("trustSafetyOpenAria")}
          >
            <MoreHorizontal aria-hidden strokeWidth={2} />
          </button>
        )}
      </div>

      <div className="ttm-app-profile__actions">
        {context === "chat" ? (
          <button type="button" className="ttm-app-profile__primary" onClick={onClose}>
            <MessageCircle aria-hidden strokeWidth={2} />
            {t("appProfileWrite")}
          </button>
        ) : (
          <>
            <button
              type="button"
              className="ttm-app-profile__round ttm-app-profile__round--big"
              onClick={() => {
                onClose()
                onNope()
              }}
              aria-label={t("discoverPassLabel")}
            >
              <X aria-hidden strokeWidth={2.2} />
            </button>
            <button
              type="button"
              className="ttm-app-profile__primary"
              onClick={() => {
                onClose()
                onLike()
              }}
            >
              <Heart aria-hidden fill="currentColor" strokeWidth={0} />
              {t("appProfileLike")}
            </button>
          </>
        )}
      </div>
    </motion.div>
  )
}
