"use client"

import type { CSSProperties } from "react"
import Image from "next/image"
import { Heart } from "lucide-react"
import { VerifiedBadge } from "@/components/ui/verified-badge"
import type { DatingDemoProfile } from "@/components/landing/dating/use-dating-profiles"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

type DatingProfileCardProps = {
  profile: DatingDemoProfile
  className?: string
  style?: CSSProperties
  featured?: boolean
  bio?: string
  interests?: string[]
  maxInterests?: number
}

export function DatingProfileCard({
  profile,
  className,
  style,
  featured,
  bio,
  interests,
  maxInterests = 4,
}: DatingProfileCardProps) {
  const { t } = useI18n()
  const scoreTier =
    profile.connectionScore >= 80 ? "high" : profile.connectionScore >= 65 ? "mid" : "low"

  return (
    <article
      className={cn(
        "ttm-dating-card",
        featured && "ttm-dating-card--featured",
        className
      )}
      style={style}
    >
      <div className="ttm-dating-card__photo">
        <Image
          key={profile.imageUrl}
          src={profile.imageUrl}
          alt=""
          fill
          className="ttm-dating-card__image"
          sizes="(max-width: 768px) 70vw, 260px"
          draggable={false}
        />
        <div className="ttm-dating-card__shade" aria-hidden />
        {profile.verified && (
          <span className="ttm-dating-card__verified">
            <VerifiedBadge size={16} title={t("datingVerifiedTitle")} />
          </span>
        )}
        <span className={cn("ttm-dating-card__score", `ttm-dating-card__score--${scoreTier}`)}>
          <Heart size={12} fill="currentColor" aria-hidden />
          {profile.connectionScore}%
        </span>
      </div>
      <div className="ttm-dating-card__body">
        <h3 className="ttm-dating-card__name">
          {profile.name}
          <span className="ttm-dating-card__age">, {profile.age}</span>
        </h3>
        <p className="ttm-dating-card__distance">{profile.distance}</p>
        {bio ? <p className="ttm-dating-card__bio">{bio}</p> : null}
        {interests && interests.length > 0 ? (
          <div className="ttm-dating-card__tags">
            {interests.slice(0, maxInterests).map((tag) => (
              <span key={tag} className="ttm-dating-card__tag">
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  )
}
