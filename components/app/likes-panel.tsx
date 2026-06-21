"use client"

import Image from "next/image"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { useI18n } from "@/lib/i18n"
import { getLikedYouProfiles, getSocialState, likeBack } from "@/lib/social-store"
import type { SwipeProfile } from "@/lib/demo-profiles"
import { PresenceBadge, presenceFromProfileId } from "@/components/activity/presence-badge"
import { MatchCelebrationScreen } from "@/components/app/match-celebration-screen"
import { EmotionalEmptyState } from "@/components/product/emotional-empty-state"
import { isFirstMatchPending } from "@/lib/product-experience"
import { Heart } from "lucide-react"

function LikesProfileCard({
  profile,
  onLikeBack,
  likedYouLabel,
  likeBackLabel,
  presenceLabels,
}: {
  profile: SwipeProfile
  onLikeBack: (profile: SwipeProfile) => void
  likedYouLabel: string
  likeBackLabel: string
  presenceLabels: { online: string; recent: string; today: string }
}) {
  return (
    <li className="ttm-likes-card ttm-surface-tile ttm-brand-glass ttm-brand-interactive">
      <div className="ttm-likes-card__media">
        <Image
          src={profile.image}
          alt={profile.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 72px, (max-width: 1024px) 33vw, 20vw"
        />
        <PresenceBadge
          variant={presenceFromProfileId(profile.id)}
          labelOnline={presenceLabels.online}
          labelRecent={presenceLabels.recent}
          labelToday={presenceLabels.today}
          className="ttm-likes-card__presence shrink-0"
        />
      </div>
      <div className="ttm-likes-card__body">
        <p className="ttm-likes-card__name">
          {profile.name}, {profile.age}
        </p>
        <p className="ttm-likes-card__meta">
          {profile.location} · {profile.distance}
        </p>
        <p className="ttm-likes-card__hint">{likedYouLabel}</p>
      </div>
      <div className="ttm-likes-card__actions">
        <button
          type="button"
          onClick={() => onLikeBack(profile)}
          className="ttm-likes-card__like-btn"
          aria-label={likeBackLabel}
        >
          <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <span className="ttm-likes-card__like-label">{likeBackLabel}</span>
        </button>
      </div>
    </li>
  )
}

export function LikesPanel() {
  const { t, locale, location } = useI18n()
  const [likes, setLikes] = useState<SwipeProfile[]>([])
  const [matchedProfile, setMatchedProfile] = useState<SwipeProfile | null>(null)
  const [firstMatchMode, setFirstMatchMode] = useState(false)

  const refresh = useCallback(() => {
    const state = getSocialState(locale, location.position)
    const all = getLikedYouProfiles(locale, location.position)
    setLikes(all.filter((p) => !state.matches.includes(p.id)))
  }, [locale, location.position])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    const onSocial = () => refresh()
    window.addEventListener("ttm-social-updated", onSocial)
    return () => window.removeEventListener("ttm-social-updated", onSocial)
  }, [refresh])

  const handleLikeBack = (profile: SwipeProfile) => {
    void likeBack(profile.id, locale, location.position).then((matched) => {
      if (matched) {
        setFirstMatchMode(isFirstMatchPending())
        setMatchedProfile(profile)
      }
      refresh()
    })
  }

  const presenceLabels = {
    online: t("presenceOnline"),
    recent: t("presenceRecent"),
    today: t("presenceToday"),
  }

  const countLabel = t("likesCountLabel").replace("{count}", String(likes.length))

  return (
    <div className="ttm-likes-page">
      <header className="ttm-likes-page__header">
        <h1 className="ttm-likes-page__title">{t("tabLikes")}</h1>
        <p className="ttm-likes-page__subtitle">{t("likesSubtitle")}</p>
      </header>

      <MatchCelebrationScreen
        profile={matchedProfile}
        isFirstMatch={firstMatchMode}
        onClose={() => {
          setMatchedProfile(null)
          setFirstMatchMode(false)
        }}
      />

      {likes.length === 0 ? (
        <div className="ttm-likes-page__empty">
          <EmotionalEmptyState
            title={t("likesEmptyTitle")}
            body={t("likesEmptyBody")}
            icon={Heart}
            action={
              <Link href="/app" className="ttm-likes-page__cta ttm-brand-cta">
                {t("likesDiscoverCta")}
              </Link>
            }
          />
        </div>
      ) : (
        <div className="ttm-likes-page__body">
          <aside className="ttm-likes-page__aside" aria-label={t("likesAsideAria")}>
            <div className="ttm-likes-page__stat ttm-brand-glass">
              <p className="ttm-likes-page__stat-value">{likes.length}</p>
              <p className="ttm-likes-page__stat-label">{countLabel}</p>
            </div>
            <ul className="ttm-likes-page__tips">
              <li className="ttm-likes-page__tip">{t("likesAsideTip1")}</li>
              <li className="ttm-likes-page__tip">{t("likesAsideTip2")}</li>
            </ul>
            <Link href="/app" className="ttm-likes-page__cta ttm-brand-cta">
              {t("likesDiscoverCta")}
            </Link>
          </aside>

          <div className="ttm-likes-page__main">
            <ul className="ttm-likes-page__grid">
              {likes.map((profile) => (
                <LikesProfileCard
                  key={profile.id}
                  profile={profile}
                  onLikeBack={handleLikeBack}
                  likedYouLabel={t("likesLikedYou")}
                  likeBackLabel={t("likesLikeBack")}
                  presenceLabels={presenceLabels}
                />
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
