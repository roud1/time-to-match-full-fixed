"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useI18n } from "@/client/lib/i18n"
import { getLikedYouProfiles, getSocialState, likeBack } from "@/client/lib/social-store"
import type { SwipeProfile } from "@/client/lib/demo-profiles"
import { PresenceBadge, presenceFromProfileId } from "@/client/components/activity/presence-badge"
import { MatchCelebrationScreen } from "@/client/components/app/match-celebration-screen"
import { EmotionalEmptyState } from "@/client/components/product/emotional-empty-state"
import { isFirstMatchPending } from "@/client/lib/product-experience"
import { Heart, Lock } from "lucide-react"
import { usePremiumUpgrade } from "@/client/components/premium/premium-upgrade-context"
import { fetchIncomingLikes, incomingLikeToProfileId } from "@/client/lib/likes/api"
import { fetchSubscriptionSummary } from "@/client/lib/monetization/api"
import { CinematicButton } from "@/client/components/ui/cinematic-button"
import { cn } from "@/client/lib/utils"

function LikesProfileCard({
  profile,
  onLikeBack,
  likedYouLabel,
  likeBackLabel,
  presenceLabels,
  blurred = false,
  grid = false,
}: {
  profile: SwipeProfile
  onLikeBack: (profile: SwipeProfile) => void
  likedYouLabel: string
  likeBackLabel: string
  presenceLabels: { online: string; recent: string; today: string }
  blurred?: boolean
  grid?: boolean
}) {
  return (
    <li
      className={cn(
        "ttm-likes-card ttm-surface-tile ttm-brand-glass ttm-brand-interactive relative",
        grid && "ttm-likes-card--grid",
        blurred && "ttm-likes-card--blurred"
      )}
    >
      {blurred && !grid ? (
        <div className="absolute inset-0 z-10 backdrop-blur-md bg-black/30 rounded-[inherit] pointer-events-none" aria-hidden />
      ) : null}
      <div className="ttm-likes-card__media">
        <Image
          src={profile.image}
          alt={blurred ? "" : profile.name}
          fill
          className={cnImage(blurred, grid)}
          sizes="(max-width: 640px) 72px, (max-width: 1024px) 33vw, 20vw"
        />
        {!blurred ? (
          <PresenceBadge
            variant={presenceFromProfileId(profile.id)}
            labelOnline={presenceLabels.online}
            labelRecent={presenceLabels.recent}
            labelToday={presenceLabels.today}
            className="ttm-likes-card__presence shrink-0"
          />
        ) : null}
      </div>
      <div className="ttm-likes-card__body">
        <p className="ttm-likes-card__name">
          {blurred ? "•••" : `${profile.name}, ${profile.age}`}
        </p>
        {!blurred ? (
          <>
            <p className="ttm-likes-card__meta">
              {profile.location} · {profile.distance}
            </p>
            <p className="ttm-likes-card__hint">{likedYouLabel}</p>
          </>
        ) : null}
      </div>
      {!blurred ? (
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
      ) : null}
    </li>
  )
}

function cnImage(blurred: boolean, grid?: boolean) {
  if (grid && blurred) return "object-cover"
  return blurred ? "object-cover scale-110 blur-xl opacity-60" : "object-cover"
}

export function LikesPanel() {
  const { t, locale, location } = useI18n()
  const { openUpgrade } = usePremiumUpgrade()
  const [likes, setLikes] = useState<SwipeProfile[]>([])
  const [incomingCount, setIncomingCount] = useState(0)
  const [premium, setPremium] = useState(false)
  const [premiumRequired, setPremiumRequired] = useState(false)
  const [matchedProfile, setMatchedProfile] = useState<SwipeProfile | null>(null)
  const [firstMatchMode, setFirstMatchMode] = useState(false)

  const refresh = useCallback(async () => {
    const sub = await fetchSubscriptionSummary()
    const isPremium = Boolean(sub.subscription.isPremium)
    setPremium(isPremium)

    const incoming = await fetchIncomingLikes()
    setIncomingCount(incoming.count)
    setPremiumRequired(incoming.premiumRequired)

    if (isPremium && incoming.profiles.length > 0) {
      const mapped: SwipeProfile[] = incoming.profiles.map((p) => ({
        id: incomingLikeToProfileId(p.userId),
        userId: p.userId,
        name: p.name,
        age: p.age,
        gender: p.gender,
        location: p.location,
        distance: "—",
        image: p.image,
        images: [p.image],
        bio: "",
        interests: [],
        timeLeft: "23:59:59",
        purpose: null,
        lat: 0,
        lng: 0,
      }))
      setLikes(mapped)
      return
    }

    if (!isPremium && incoming.teasers && incoming.teasers.length > 0) {
      const mapped: SwipeProfile[] = incoming.teasers.map((p) => ({
        id: incomingLikeToProfileId(p.userId),
        userId: p.userId,
        name: "•••",
        age: 0,
        gender: "female" as const,
        location: "—",
        distance: "—",
        image: p.image,
        images: [p.image],
        bio: "",
        interests: [],
        timeLeft: "23:59:59",
        purpose: null,
        lat: 0,
        lng: 0,
      }))
      setLikes(mapped)
      return
    }

    const state = getSocialState(locale, location.position)
    const all = getLikedYouProfiles(locale, location.position)
    setLikes(all.filter((p) => !state.matches.includes(p.id)))
  }, [locale, location.position])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    const onSocial = () => void refresh()
    window.addEventListener("ttm-social-updated", onSocial)
    return () => window.removeEventListener("ttm-social-updated", onSocial)
  }, [refresh])

  const handleLikeBack = (profile: SwipeProfile) => {
    if (!premium) {
      openUpgrade("likedYou")
      return
    }
    void likeBack(profile.id, locale, location.position).then((matched) => {
      if (matched) {
        setFirstMatchMode(isFirstMatchPending())
        setMatchedProfile(profile)
      }
      void refresh()
    })
  }

  const presenceLabels = {
    online: t("presenceOnline"),
    recent: t("presenceRecent"),
    today: t("presenceToday"),
  }

  const displayCount = premium ? likes.length : Math.max(incomingCount, likes.length)
  const countLabel = t("likesCountLabel").replace("{count}", String(displayCount))
  const showPaywall = !premium && (premiumRequired || displayCount > 0)

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

      {showPaywall && likes.length === 0 && displayCount > 0 ? (
        <div className="ttm-likes-page__empty px-4">
          <EmotionalEmptyState
            title={t("likesPaywallTitle")}
            body={t("likesPaywallBody").replace("{count}", String(displayCount))}
            icon={Lock}
            action={
              <CinematicButton variant="primary" className="w-full max-w-xs" onClick={() => openUpgrade("likedYou")}>
                {t("likesPaywallCta")}
              </CinematicButton>
            }
          />
        </div>
      ) : likes.length === 0 ? (
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
              <p className="ttm-likes-page__stat-value">{displayCount}</p>
              <p className="ttm-likes-page__stat-label">{countLabel}</p>
            </div>
            {!premium ? (
              <button
                type="button"
                onClick={() => openUpgrade("likedYou")}
                className="ttm-likes-page__cta ttm-brand-cta w-full text-center"
              >
                {t("likesPaywallCta")}
              </button>
            ) : (
              <Link href="/app" className="ttm-likes-page__cta ttm-brand-cta">
                {t("likesDiscoverCta")}
              </Link>
            )}
            <ul className="ttm-likes-page__tips">
              <li className="ttm-likes-page__tip">{t("likesAsideTip1")}</li>
              <li className="ttm-likes-page__tip">{t("likesAsideTip2")}</li>
            </ul>
          </aside>

          <div className="ttm-likes-page__main relative">
            {!premium ? (
              <div className="ttm-likes-blur-overlay pointer-events-none">
                <Lock className="w-9 h-9 text-[#ff2e63]" aria-hidden />
                <p className="ttm-likes-blur-overlay__title">{t("likesPaywallTitle")}</p>
                <p className="ttm-likes-blur-overlay__body">
                  {t("likesPaywallBody").replace("{count}", String(displayCount))}
                </p>
                <CinematicButton
                  variant="primary"
                  className="pointer-events-auto"
                  onClick={() => openUpgrade("likedYou")}
                >
                  {t("likesPaywallCta")}
                </CinematicButton>
              </div>
            ) : null}
            <ul className="ttm-likes-page__grid ttm-likes-page__grid--dating">
              {likes.map((profile) => (
                <LikesProfileCard
                  key={profile.userId ?? profile.id}
                  profile={profile}
                  onLikeBack={handleLikeBack}
                  likedYouLabel={t("likesLikedYou")}
                  likeBackLabel={t("likesLikeBack")}
                  presenceLabels={presenceLabels}
                  blurred={!premium}
                  grid
                />
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
