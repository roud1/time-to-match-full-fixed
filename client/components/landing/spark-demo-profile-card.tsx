import type { CSSProperties } from "react"
import Image from "next/image"
import { VerifiedBadge } from "@/client/components/ui/verified-badge"
import { getCompatibilityTier } from "@/client/lib/discover/compatibility-tier"
import { cn } from "@/client/lib/utils"

export type SparkDemoProfile = {
  name: string
  age: number
  compatibility: number
  timerLabel: string
  verified?: boolean
  imageUrl: string
  /** Fallback under image while loading */
  photoGradient?: string
  urgent?: boolean
}

type SparkDemoProfileCardProps = {
  profile: SparkDemoProfile
  className?: string
  /** Allow hover effects in marquee (default: decorative only). */
  interactive?: boolean
}

export function SparkDemoProfileCard({ profile, className, interactive }: SparkDemoProfileCardProps) {
  const tier = getCompatibilityTier(profile.compatibility)

  return (
    <article
      className={cn("spark-demo-card", interactive && "spark-demo-card--interactive", className)}
      aria-hidden={interactive ? undefined : true}
      tabIndex={interactive ? undefined : -1}
    >
      <div
        className="spark-demo-card__photo"
        style={
          profile.photoGradient
            ? ({ background: profile.photoGradient } satisfies CSSProperties)
            : undefined
        }
      >
        <Image
          src={profile.imageUrl}
          alt=""
          fill
          className="spark-demo-card__image"
          sizes="(max-width: 768px) 78vw, 320px"
          draggable={false}
        />
        <div className="spark-demo-card__photo-shade" aria-hidden />
        {profile.verified && (
          <span className="spark-demo-card__verified">
            <VerifiedBadge size={18} title="Верифицирован" />
          </span>
        )}
        <span
          className={cn(
            "spark-demo-card__timer",
            profile.urgent && "spark-demo-card__timer--urgent"
          )}
        >
          <span aria-hidden>⏳</span>
          {profile.timerLabel}
        </span>
      </div>
      <div className="spark-demo-card__body">
        <h3 className="spark-demo-card__name">
          {profile.name}
          <span className="spark-demo-card__age">, {profile.age}</span>
        </h3>
        <p
          className={cn(
            "spark-demo-card__compat",
            tier === "high" && "spark-demo-card__compat--high",
            tier === "mid" && "spark-demo-card__compat--mid",
            tier === "low" && "spark-demo-card__compat--low"
          )}
        >
          Совместимость {profile.compatibility}%
        </p>
      </div>
    </article>
  )
}
