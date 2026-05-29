"use client"

import Image from "next/image"
import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import { useI18n } from "@/lib/i18n"
import { getProfileCityName } from "@/lib/cities"
import { getProfilePhotos } from "@/lib/profile-photos"
import { getAgeFromBirthdate, type StoredUserProfile } from "@/lib/user-profile"
import { OnboardingSyncVisual } from "@/components/product/onboarding-sync-visual"
import { ProfileAura } from "@/components/product/profile-aura"
import { ProfileIdentitySummary } from "@/components/product/profile-identity-summary"
import { VerifiedBadge } from "@/components/ui/verified-badge"
import { cn } from "@/lib/utils"
import "@/app/profile-presence.css"

type ProfilePresenceCardProps = {
  profile: StoredUserProfile
  age?: number | null
  strength: number
  strengthHint: string
  photoVerified?: boolean
  /** Compact stats row under strength bar */
  timerLabel?: string
  connectionsCount?: number
  className?: string
  onEdit?: () => void
  /** Desktop welcome: two-column card interior */
  layout?: "default" | "wide"
  /** Link whole strength block (welcome → edit profile) */
  strengthEditHref?: string
}

export function ProfilePresenceCard({
  profile,
  age,
  strength,
  strengthHint,
  photoVerified,
  timerLabel,
  connectionsCount,
  className,
  onEdit,
  layout = "default",
  strengthEditHref,
}: ProfilePresenceCardProps) {
  const { t, locale } = useI18n()
  const reduce = useReducedMotion()
  const cityName = getProfileCityName(profile, locale)
  const photo = getProfilePhotos(profile)[0]
  const displayAge = age ?? getAgeFromBirthdate(profile.birthdate)
  const isOwnProfile = className?.includes("profile-presence--own")
  const identityPhotoCover = Boolean(photo) && (layout === "wide" || isOwnProfile)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0.2 : 0.65, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "p9-onboarding relative overflow-hidden w-full mb-5",
        layout === "wide" && "p9-onboarding--wide",
        className
      )}
    >
      <div className="p9-onboarding__glow" aria-hidden />
      <ProfileAura profile={profile} />

      <div className="profile-presence__layout relative">
        <div
          className={cn(
            "profile-presence__identity rounded-2xl overflow-hidden relative",
            isOwnProfile ? "mb-3" : "mb-4",
            identityPhotoCover
              ? "profile-presence__identity--cover"
              : "ttm-brand-glass p-4 flex items-center gap-4"
          )}
        >
          {identityPhotoCover && photo && (
            <>
              <Image
                src={photo}
                alt=""
                fill
                className="profile-presence__identity-bg object-cover"
                sizes="(max-width: 1023px) 100vw, 320px"
                unoptimized={photo.startsWith("data:") || photo.startsWith("blob:")}
              />
              <div className="profile-presence__identity-scrim" aria-hidden />
            </>
          )}

          <div
            className={cn(
              "profile-presence__identity-body",
              identityPhotoCover && "profile-presence__identity-body--cover"
            )}
          >
            {!identityPhotoCover && (
              <div className="p9-profile-avatar-ring shrink-0">
                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-foreground/10">
                  {photo ? (
                    <Image
                      src={photo}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="64px"
                      unoptimized={photo.startsWith("data:") || photo.startsWith("blob:")}
                    />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-xl font-extralight text-foreground/80">
                      {profile.name.charAt(0)}
                    </span>
                  )}
                </div>
              </div>
            )}
            <div className="profile-presence__identity-text min-w-0 flex-1 text-left">
              <p
                className={cn(
                  "profile-presence__identity-name text-sm font-extralight truncate inline-flex items-center gap-1.5 max-w-full",
                  !identityPhotoCover && "text-foreground/90"
                )}
              >
                <span className="truncate">
                  {profile.name}
                  {displayAge != null && (
                    <span className="profile-presence__identity-age">, {displayAge}</span>
                  )}
                </span>
                {photoVerified && identityPhotoCover && (
                  <VerifiedBadge size={16} title={t("photoVerifiedLabel")} />
                )}
              </p>
              <p
                className={cn(
                  "profile-presence__identity-city text-xs font-light",
                  !identityPhotoCover && "text-muted-foreground"
                )}
              >
                {cityName}
              </p>
              <p
                className={cn(
                  "profile-presence__identity-sync text-[10px] font-light mt-1 uppercase tracking-[0.2em]",
                  !identityPhotoCover && "text-indigo-300/80"
                )}
              >
                {t("welcomeSyncReady")}
              </p>
            </div>
          </div>

          {onEdit ? (
            <button
              type="button"
              onClick={onEdit}
              className={cn(
                "text-[11px] font-light px-3 py-2 rounded-full border transition-colors touch-manipulation",
                identityPhotoCover
                  ? "profile-presence__identity-edit"
                  : "shrink-0 border-foreground/15 text-foreground/75 hover:bg-foreground/5"
              )}
            >
              {t("profileEdit")}
            </button>
          ) : null}
        </div>

        {isOwnProfile ? (
          <>
            <OnboardingSyncVisual
              className="profile-presence__sync-row max-w-[13rem] mx-auto"
              intensity="vivid"
            />
            <div className="profile-presence__cols">
              <div className="profile-presence__col">
                <div className="profile-presence__atmosphere rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-4 h-full">
                  <p className="p9-register-step-label mb-3">{t("welcomeAtmosphereTitle")}</p>
                  {(profile.vibeIds?.length ?? 0) > 0 ||
                  (profile.energyTagIds?.length ?? 0) > 0 ||
                  profile.intention ||
                  profile.mood ? (
                    <ProfileIdentitySummary profile={profile} locale={locale} compact />
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs text-muted-foreground font-light">{t("profileAtmosphereEmpty")}</p>
                      {onEdit ? (
                        <button
                          type="button"
                          onClick={onEdit}
                          className="text-xs font-light px-3 py-2 rounded-full border border-[var(--accent)]/30 text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors touch-manipulation"
                        >
                          {t("profileAtmosphereCta")}
                        </button>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
              <div className="profile-presence__col space-y-3">
                {(() => {
                  const strengthBlock = (
                    <div className="profile-presence__strength rounded-2xl border border-foreground/10 bg-foreground/[0.04] p-4 space-y-3">
                      <div className="flex justify-between items-end gap-3">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-light">
                          {t("profileStrengthLabel")}
                        </p>
                        <p className="text-xs text-foreground/80 font-light">{strengthHint}</p>
                      </div>
                      <div className="h-2 rounded-full bg-foreground/10 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: "var(--ttm-brand-gradient-sync)" }}
                          initial={false}
                          animate={{ width: `${strength}%` }}
                          transition={{ type: "spring", stiffness: 120, damping: 20 }}
                        />
                      </div>
                      {(timerLabel != null || connectionsCount != null) && (
                        <div className="grid grid-cols-3 gap-2 pt-1">
                          <div className="text-center rounded-xl border border-foreground/10 py-2 px-1">
                            <p className="text-sm font-medium tabular-nums text-foreground">{strength}%</p>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
                              {t("profileStatStrength")}
                            </p>
                          </div>
                          <div className="text-center rounded-xl border border-foreground/10 py-2 px-1">
                            <p className="text-sm font-medium tabular-nums text-foreground">{timerLabel ?? "—"}</p>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
                              {t("profileStatTimer")}
                            </p>
                          </div>
                          <div className="text-center rounded-xl border border-foreground/10 py-2 px-1">
                            <p className="text-sm font-medium tabular-nums text-foreground">
                              {connectionsCount ?? 0}
                            </p>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
                              {t("profileStatConnections")}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                  if (strengthEditHref) {
                    return (
                      <Link
                        href={strengthEditHref}
                        className="profile-presence__strength-link block rounded-2xl transition-opacity hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                      >
                        {strengthBlock}
                      </Link>
                    )
                  }
                  return strengthBlock
                })()}
                <div className="profile-presence__connection rounded-2xl border border-indigo-500/15 bg-indigo-500/[0.06] px-4 py-3">
                  <p className="text-sm font-extralight text-foreground/85 mb-1">{t("welcomeConnectionTitle")}</p>
                  <p className="text-xs text-muted-foreground font-light leading-relaxed">
                    {t("welcomeConnectionBody")}
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="profile-presence__head relative text-center mb-6">
              {layout !== "wide" && (
                <p className="ttm-badge-brand mb-4 mx-auto w-fit">{t("welcomeRitualEyebrow")}</p>
              )}
              <OnboardingSyncVisual className={cn("mb-5", layout === "wide" && "mb-0")} intensity="vivid" />
              {layout !== "wide" && (
                <>
                  <h2 className="ttm-brand-gradient-text text-[1.65rem] md:text-[2rem] font-extralight tracking-tight mb-2 inline-flex items-center justify-center gap-2 flex-wrap">
                    <span>
                      {t("welcomeTitle")}, {profile.name}
                      {displayAge != null && (
                        <span className="text-foreground/45 font-light text-[1.35rem]">, {displayAge}</span>
                      )}
                    </span>
                    {photoVerified && <VerifiedBadge size={18} title={t("photoVerifiedLabel")} />}
                  </h2>
                  <p className="text-sm text-muted-foreground font-light leading-relaxed max-w-md mx-auto">
                    {t("welcomeSubtitle")}
                  </p>
                </>
              )}
            </div>

            <div className="profile-presence__atmosphere rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-4 mb-4">
              <p className="p9-register-step-label mb-3">{t("welcomeAtmosphereTitle")}</p>
              {(profile.vibeIds?.length ?? 0) > 0 ||
              (profile.energyTagIds?.length ?? 0) > 0 ||
              profile.intention ||
              profile.mood ? (
                <ProfileIdentitySummary profile={profile} locale={locale} compact />
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground font-light">{t("profileAtmosphereEmpty")}</p>
                  {onEdit ? (
                    <button
                      type="button"
                      onClick={onEdit}
                      className="text-xs font-light px-3 py-2 rounded-full border border-[var(--accent)]/30 text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors touch-manipulation"
                    >
                      {t("profileAtmosphereCta")}
                    </button>
                  ) : null}
                </div>
              )}
            </div>

            {(() => {
              const strengthBlock = (
                <div className="profile-presence__strength rounded-2xl border border-foreground/10 bg-foreground/[0.04] p-4 space-y-3">
                  <div className="flex justify-between items-end gap-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-light">
                      {t("profileStrengthLabel")}
                    </p>
                    <p className="text-xs text-foreground/80 font-light">{strengthHint}</p>
                  </div>
                  <div className="h-2 rounded-full bg-foreground/10 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: "var(--ttm-brand-gradient-sync)" }}
                      initial={false}
                      animate={{ width: `${strength}%` }}
                      transition={{ type: "spring", stiffness: 120, damping: 20 }}
                    />
                  </div>
                  {(timerLabel != null || connectionsCount != null) && (
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <div className="text-center rounded-xl border border-foreground/10 py-2 px-1">
                        <p className="text-sm font-medium tabular-nums text-foreground">{strength}%</p>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
                          {t("profileStatStrength")}
                        </p>
                      </div>
                      <div className="text-center rounded-xl border border-foreground/10 py-2 px-1">
                        <p className="text-sm font-medium tabular-nums text-foreground">{timerLabel ?? "—"}</p>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
                          {t("profileStatTimer")}
                        </p>
                      </div>
                      <div className="text-center rounded-xl border border-foreground/10 py-2 px-1">
                        <p className="text-sm font-medium tabular-nums text-foreground">{connectionsCount ?? 0}</p>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
                          {t("profileStatConnections")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )
              if (strengthEditHref) {
                return (
                  <Link
                    href={strengthEditHref}
                    className="profile-presence__strength-link block rounded-2xl transition-opacity hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                  >
                    {strengthBlock}
                  </Link>
                )
              }
              return strengthBlock
            })()}

            <div className="profile-presence__connection rounded-2xl border border-indigo-500/15 bg-indigo-500/[0.06] px-4 py-3 mt-4">
              <p className="text-sm font-extralight text-foreground/85 mb-1">{t("welcomeConnectionTitle")}</p>
              <p className="text-xs text-muted-foreground font-light leading-relaxed">{t("welcomeConnectionBody")}</p>
            </div>
          </>
        )}
      </div>
    </motion.div>
  )
}
