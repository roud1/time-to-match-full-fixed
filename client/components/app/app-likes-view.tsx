"use client"

import "./app-likes.css"
import Image from "next/image"
import Link from "next/link"
import { Check, ChevronRight, Crown, Heart } from "lucide-react"
import { useI18n } from "@/client/lib/i18n"
import type { SwipeProfile } from "@/client/lib/demo-profiles"
import type { MatchDto } from "@/server/matches/types"
import { discoverIdToNumeric } from "@/client/lib/discover/map-profile"
import { cn } from "@/client/lib/utils"

type AppLikesViewProps = {
  likes: SwipeProfile[]
  count: number
  premium: boolean
  /** Newest active match without messages yet — the "mutual like" hero. */
  freshMatch: MatchDto | null
  onLikeBack: (profile: SwipeProfile) => void
  onOpenPremium: () => void
}

/** Fanned stack of up to three real photos (blurred when the viewer may not see who it is). */
function PhotoStack({ photos, blurred }: { photos: string[]; blurred: boolean }) {
  const shown = photos.slice(0, 3)
  return (
    <div className="ttm-app-likes__stack" aria-hidden>
      {shown.length === 0 ? (
        <div className="ttm-app-likes__stack-photo ttm-app-likes__stack-photo--empty">
          <Image src="/brand/luvia/symbol.svg" alt="" width={120} height={90} unoptimized />
        </div>
      ) : (
        shown.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className={cn("ttm-app-likes__stack-photo", `ttm-app-likes__stack-photo--${shown.length}-${i}`)}
          >
            <Image src={src} alt="" fill sizes="180px" className={cn("object-cover", blurred && "ttm-app-likes__blur")} />
          </div>
        ))
      )}
      <span className="ttm-app-likes__badge ttm-app-likes__badge--top">
        <Heart aria-hidden fill="currentColor" strokeWidth={0} />
      </span>
      <span className="ttm-app-likes__badge ttm-app-likes__badge--bottom">
        <Heart aria-hidden fill="currentColor" strokeWidth={0} />
      </span>
    </div>
  )
}

/**
 * Likes screen of the native app / installed PWA (rendered only when html[data-ttm-app] is set).
 * Real data only: incoming likes, the newest match, premium state.
 */
export function AppLikesView({ likes, count, premium, freshMatch, onLikeBack, onOpenPremium }: AppLikesViewProps) {
  const { t } = useI18n()
  const photos = likes.map((p) => p.image).filter(Boolean)
  const hasLikes = count > 0 || likes.length > 0

  return (
    <div className="ttm-app-likes">
      <header className="ttm-app-likes__head">
        <h1 className="ttm-app-likes__title">{t("tabLikes")}</h1>
        <p className="ttm-app-likes__subtitle">{t("likesSubtitle")}</p>
      </header>

      {freshMatch ? (
        <section className="ttm-app-likes__hero">
          {/* The person you matched with — not the people who liked you. */}
          <PhotoStack photos={freshMatch.peerPhoto ? [freshMatch.peerPhoto] : []} blurred={false} />
          <h2 className="ttm-app-likes__hero-title">{t("appLikesMutualTitle")}</h2>
          <p className="ttm-app-likes__hero-body">
            {freshMatch.peerName
              ? t("appLikesMutualWith").replace("{name}", freshMatch.peerName)
              : t("appLikesMutualBody")}
          </p>
          <Link
            href={`/app?tab=chat&with=${discoverIdToNumeric(freshMatch.peerUserId)}`}
            className="ttm-app-likes__btn ttm-app-likes__btn--primary"
          >
            {t("appLikesWrite")}
          </Link>
          <Link href="/app?tab=chat" className="ttm-app-likes__btn ttm-app-likes__btn--ghost">
            {t("appLikesAllChats")}
          </Link>
        </section>
      ) : hasLikes ? (
        <section className="ttm-app-likes__hero">
          <PhotoStack photos={photos} blurred={!premium} />
          <h2 className="ttm-app-likes__hero-title">{t("likesPaywallTitle")}</h2>
          <p className="ttm-app-likes__hero-body">
            {premium
              ? t("appLikesCount").replace("{count}", String(Math.max(count, likes.length)))
              : t("likesPaywallBody").replace("{count}", String(Math.max(count, likes.length)))}
          </p>
          {!premium && (
            <button type="button" onClick={onOpenPremium} className="ttm-app-likes__btn ttm-app-likes__btn--primary">
              {t("likesPaywallCta")}
            </button>
          )}
        </section>
      ) : (
        <section className="ttm-app-likes__hero">
          <PhotoStack photos={[]} blurred={false} />
          <h2 className="ttm-app-likes__hero-title">{t("likesEmptyTitle")}</h2>
          <p className="ttm-app-likes__hero-body">{t("likesEmptyBody")}</p>
          <Link href="/app" className="ttm-app-likes__btn ttm-app-likes__btn--primary">
            {t("likesDiscoverCta")}
          </Link>
        </section>
      )}

      {premium && likes.length > 0 && (
        <ul className="ttm-app-likes__list" aria-label={t("likesSubtitle")}>
          {likes.map((p) => (
            <li key={p.userId ?? p.id} className="ttm-app-likes__row">
              <span className="ttm-app-likes__avatar">
                <Image src={p.image} alt="" fill sizes="56px" className="object-cover" />
              </span>
              <span className="ttm-app-likes__row-text">
                <span className="ttm-app-likes__row-name">
                  {p.name}
                  {p.age ? `, ${p.age}` : ""}
                </span>
                {p.location && p.location !== "—" && <span className="ttm-app-likes__row-meta">{p.location}</span>}
              </span>
              <button
                type="button"
                className="ttm-app-likes__like-back"
                onClick={() => onLikeBack(p)}
                aria-label={t("likesLikeBack")}
              >
                <Heart aria-hidden fill="currentColor" strokeWidth={0} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {!premium && (
        <button type="button" className="ttm-app-likes__premium" onClick={onOpenPremium}>
          <span className="ttm-app-likes__crown" aria-hidden>
            <Crown strokeWidth={1.8} />
          </span>
          <span className="ttm-app-likes__premium-text">
            <span className="ttm-app-likes__premium-title">{t("appLikesPremiumTitle")}</span>
            {(["appLikesPremiumPerk1", "appLikesPremiumPerk2", "appLikesPremiumPerk3"] as const).map((k) => (
              <span key={k} className="ttm-app-likes__perk">
                <Check aria-hidden strokeWidth={2.4} />
                {t(k)}
              </span>
            ))}
          </span>
          <ChevronRight aria-hidden className="ttm-app-likes__chevron" strokeWidth={1.8} />
        </button>
      )}
    </div>
  )
}
