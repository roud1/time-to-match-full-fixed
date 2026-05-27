import { VerifiedBadge } from "@/components/ui/verified-badge"
import { getCompatibilityTier } from "@/lib/discover/compatibility-tier"
import { cn } from "@/lib/utils"

export type SparkDemoProfile = {
  name: string
  age: number
  compatibility: number
  timerLabel: string
  verified?: boolean
  /** CSS gradient for photo area */
  photoGradient: string
  initials: string
  urgent?: boolean
}

type SparkDemoProfileCardProps = {
  profile: SparkDemoProfile
  className?: string
}

export function SparkDemoProfileCard({ profile, className }: SparkDemoProfileCardProps) {
  const tier = getCompatibilityTier(profile.compatibility)

  return (
    <article
      className={cn("spark-demo-card", className)}
      aria-hidden
      tabIndex={-1}
    >
      <div
        className="spark-demo-card__photo"
        style={{ background: profile.photoGradient }}
      >
        <span className="spark-demo-card__initials">{profile.initials}</span>
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
