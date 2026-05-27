"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"
import { useReducedMotion } from "motion/react"
import { useI18n, type TranslationKey } from "@/lib/i18n"
import { localeToBcp47 } from "@/lib/i18n/config"
import {
  CUSTOM_CITY_ID,
  getProfileCityName,
  type CitySelectValue,
} from "@/lib/cities"
import { getInterestLabel, MIN_INTERESTS, type InterestId } from "@/lib/interests"
import { MIN_VIBES, MIN_ENERGY_TAGS } from "@/lib/profile-identity"
import {
  EnergyTagPicker,
  CommunicationStylePicker,
  ConnectionPrefPicker,
} from "@/components/product/identity-product-pickers"
import { ProfileIdentitySummary } from "@/components/product/profile-identity-summary"
import { computeProfileStrength } from "@/lib/profile-completion"
import { enableDemoSwipeDeck } from "@/lib/demo-profiles"
import { getProfilePhotos } from "@/lib/profile-photos"
import { ProfilePhotoGallery } from "@/components/profile-photo-gallery"
import { ProfilePhotoPicker } from "@/components/profile-photo-picker"
import {
  clearSession,
  getAgeFromBirthdate,
  getUserProfile,
  isLoggedIn,
  isPremiumActive,
  updateUserProfile,
  type StoredUserProfile,
} from "@/lib/user-profile"
import { CityField } from "@/components/city-field"
import { InterestPicker } from "@/components/interest-picker"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { BottomNavBar } from "@/components/app/bottom-nav-bar"
import { ProfileTabs, type ProfileSection } from "@/components/profile-tabs"
import { ProfilePremiumPanel } from "@/components/profile-premium-panel"
import { PremiumButton } from "@/components/ui/premium-button"
import { FreezeWalletStrip } from "@/components/matches/freeze-wallet-strip"
import { LevelXpBar } from "@/components/gamification/level-xp-bar"
import { AchievementList } from "@/components/gamification/achievement-list"
import { useUser } from "@/hooks/use-user"
import { useAchievements } from "@/hooks/use-achievements"
import { CinematicParticles } from "@/components/ui/cinematic-particles"
import { VibeCloudPicker, IntentionDeck, MoodOrbit } from "@/components/profile/identity-pickers"
import { ProfileVoiceIntro } from "@/components/profile/profile-voice-intro"
import { OwnTrustCenter } from "@/components/trust/own-trust-center"
import { ProfileAura } from "@/components/product/profile-aura"
import { ConnectionsHubCard } from "@/components/profile/connections-hub-card"
import { ProfileLifePresence } from "@/components/profile/profile-life-presence"
import { ProfileExpiryPanel } from "@/components/profile/profile-expiry-panel"
import { ProfileDatingFields, dispatchProfileDatingSync } from "@/components/profile/profile-dating-fields"
import { PhotoVerificationBlock } from "@/components/profile/photo-verification-block"
import { VerifiedBadge } from "@/components/ui/verified-badge"
import { useVerificationStatus } from "@/hooks/use-verification-status"
import { useProfileLife } from "@/hooks/use-profile-life"
import { recordProfileActivity, reviveProfilePresence } from "@/lib/profile-life-store"
import type { DatingPurpose } from "@/lib/interests/types"
import { DEFAULT_MAX_DISTANCE_KM } from "@/lib/interests/types"

type Gender = StoredUserProfile["gender"]
type LookingFor = StoredUserProfile["lookingFor"]

type EditForm = {
  bio: string
  interests: InterestId[]
  cityId: CitySelectValue
  customCity: string
  lookingFor: LookingFor
  gender: Gender
  photoUrls: string[]
  vibeIds: string[]
  energyTagIds: string[]
  intention: string
  mood: string
  communicationStyle: string
  connectionPref: string
  promptFavorite: string
  voiceIntroRecorded: boolean
  purpose?: DatingPurpose
  maxDistance: number
  latitude?: number | null
  longitude?: number | null
  dbInterestIds: number[]
}

function genderLabel(t: (k: TranslationKey) => string, gender: Gender) {
  if (gender === "male") return t("regGenderMale")
  if (gender === "female") return t("regGenderFemale")
  return t("regGenderOther")
}

function lookingLabel(t: (k: TranslationKey) => string, looking: LookingFor) {
  if (looking === "men") return t("regLookingMen")
  if (looking === "women") return t("regLookingWomen")
  return t("regLookingAll")
}

function formatMemberDate(ts: number, locale: string) {
  return new Intl.DateTimeFormat(localeToBcp47(locale), {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(ts))
}

function profileToForm(p: StoredUserProfile): EditForm {
  return {
    bio: p.bio,
    interests: p.interests ?? [],
    cityId: p.cityId ?? (p.customCity ? CUSTOM_CITY_ID : ""),
    customCity: p.customCity ?? "",
    lookingFor: p.lookingFor,
    gender: p.gender,
    photoUrls: getProfilePhotos(p),
    vibeIds: p.vibeIds ?? [],
    energyTagIds: p.energyTagIds ?? [],
    intention: p.intention ?? "",
    mood: p.mood ?? "",
    communicationStyle: p.communicationStyle ?? "",
    connectionPref: p.connectionPref ?? "",
    promptFavorite: p.promptFavorite ?? "",
    voiceIntroRecorded: p.voiceIntroRecorded ?? false,
    purpose: p.purpose,
    maxDistance: p.maxDistance ?? DEFAULT_MAX_DISTANCE_KM,
    latitude: p.latitude,
    longitude: p.longitude,
    dbInterestIds: p.dbInterestIds ?? [],
  }
}

function strengthHintKey(score: number): "profileStrengthStart" | "profileStrengthGrow" | "profileStrengthGlow" {
  if (score < 40) return "profileStrengthStart"
  if (score < 75) return "profileStrengthGrow"
  return "profileStrengthGlow"
}

export function ProfileScreen() {
  const { user: meUser } = useUser()
  const { verified: photoVerified } = useVerificationStatus()
  const { data: achievements = [] } = useAchievements(Boolean(meUser?.id && meUser.id !== "local"))
  const { t, locale } = useI18n()
  const router = useRouter()
  const searchParams = useSearchParams()
  const reduce = useReducedMotion()
  const tabParam = searchParams.get("tab")
  const section: ProfileSection = tabParam === "premium" ? "premium" : "profile"
  const [profile, setProfile] = useState<StoredUserProfile | null>(null)
  const [editing, setEditing] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)
  const [form, setForm] = useState<EditForm | null>(null)
  const profileLife = useProfileLife()

  useEffect(() => {
    const stored = getUserProfile()
    if (!stored) {
      router.replace("/register")
      return
    }
    if (!isLoggedIn()) {
      router.replace("/login")
      return
    }
    setProfile(stored)
    setForm(profileToForm(stored))
  }, [router])

  useEffect(() => {
    const sync = () => {
      const next = getUserProfile()
      if (next && !editing) {
        setProfile(next)
        setForm(profileToForm(next))
      }
    }
    window.addEventListener("ttm-user-profile-changed", sync)
    return () => window.removeEventListener("ttm-user-profile-changed", sync)
  }, [editing])

  const strength = useMemo(() => (profile ? computeProfileStrength(profile) : 0), [profile])

  const handleLogout = () => {
    clearSession()
    router.push("/")
  }

  const setSection = (next: ProfileSection) => {
    const url = next === "premium" ? "/profile?tab=premium" : "/profile"
    router.replace(url, { scroll: false })
  }

  const handleSave = () => {
    if (!profile || !form) return
    if (form.interests.length < MIN_INTERESTS) return
    if (form.vibeIds.length > 0 && form.vibeIds.length < MIN_VIBES) return
    if (form.energyTagIds.length > 0 && form.energyTagIds.length < MIN_ENERGY_TAGS) return

    const isManual = form.cityId === CUSTOM_CITY_ID
    const patch = {
      bio: form.bio.trim(),
      interests: form.interests,
      lookingFor: form.lookingFor,
      gender: form.gender,
      photoUrls: form.photoUrls,
      vibeIds: form.vibeIds,
      energyTagIds: form.energyTagIds,
      intention: form.intention.trim() || undefined,
      mood: form.mood.trim() || undefined,
      communicationStyle: form.communicationStyle.trim() || undefined,
      connectionPref: form.connectionPref.trim() || undefined,
      promptFavorite: form.promptFavorite.trim() || undefined,
      voiceIntroRecorded: form.voiceIntroRecorded,
      purpose: form.purpose,
      maxDistance: form.maxDistance,
      latitude: form.latitude,
      longitude: form.longitude,
      dbInterestIds: form.dbInterestIds,
      ...(isManual
        ? { customCity: form.customCity.trim(), cityId: undefined }
        : {
            cityId: form.cityId as Exclude<CitySelectValue, "" | typeof CUSTOM_CITY_ID>,
            customCity: undefined,
          }),
    }

    const next = updateUserProfile(patch)
    if (next) {
      recordProfileActivity()
      dispatchProfileDatingSync()
      setProfile(next)
      setForm(profileToForm(next))
      setEditing(false)
      setSavedFlash(true)
      setTimeout(() => setSavedFlash(false), 2500)
    }
  }

  const handleCancel = () => {
    if (profile) setForm(profileToForm(profile))
    setEditing(false)
  }

  if (!profile || !form) {
    return (
      <div className="ttm-brand-glass rounded-3xl p-8 max-w-md w-full text-center">
        <p className="text-muted-foreground font-light">{t("locationLoading")}</p>
      </div>
    )
  }

  const cityName = getProfileCityName(profile, locale)
  const photos = getProfilePhotos(profile)
  const age = getAgeFromBirthdate(profile.birthdate)
  const localeTag = localeToBcp47(locale)
  const hintKey = strengthHintKey(strength)
  const saveDisabled =
    form.interests.length < MIN_INTERESTS ||
    !form.bio.trim() ||
    (form.vibeIds.length > 0 && form.vibeIds.length < MIN_VIBES) ||
    (form.energyTagIds.length > 0 && form.energyTagIds.length < MIN_ENERGY_TAGS)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-lg pb-28"
    >
      <AnimatePresence>
        {savedFlash && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-4 rounded-2xl border border-white/16 bg-gradient-to-r from-white/08 to-white/10 px-4 py-3 text-center text-sm font-light text-white/80 shadow-[0_12px_40px_-20px_rgba(255,255,255,0.35)]"
          >
            {t("profileSaved")}
          </motion.div>
        )}
      </AnimatePresence>

      <ProfileTabs
        active={section}
        onChange={setSection}
        premiumActive={isPremiumActive(profile)}
      />

      {section === "premium" ? (
        <ProfilePremiumPanel profile={profile} onProfileUpdate={setProfile} />
      ) : (
        <>
          <ProfileExpiryPanel profile={profile} onProfileUpdate={setProfile} />
          <PhotoVerificationBlock />
          <div className="ttm-brand-glass relative rounded-[1.85rem] overflow-hidden mb-5 ttm-brand-glow-aura">
            <ProfileAura profile={profile} />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_0%,var(--ttm-glow-cinematic),transparent_55%)] pointer-events-none" />
            <CinematicParticles count={8} className="opacity-40 pointer-events-none" />
            <div className="relative p-4 md:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div className="flex flex-wrap gap-2">
                  {isPremiumActive(profile) && (
                    <span className="px-3 py-1 rounded-full text-[10px] font-light tracking-wide border border-amber-500/35 bg-amber-500/10 text-amber-200">
                      {t("premiumActiveBadge")}
                    </span>
                  )}
                  <span className="px-3 py-1 rounded-full text-[10px] font-light tracking-wide border border-emerald-500/35 bg-emerald-500/10 text-emerald-200">
                    {t("profileActive")}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground font-light tabular-nums">
                  {strength}% · {t("profileStrengthLabel")}
                </span>
              </div>

              <div className="p9-profile-avatar-ring mb-5 rounded-2xl overflow-hidden">
                <ProfilePhotoGallery photos={photos} name={profile.name} className="rounded-2xl overflow-hidden ring-1 ring-white/10" />
              </div>

              <div className="text-center space-y-2 mb-5">
                <h1 className="ttm-brand-gradient-text text-3xl md:text-[2.1rem] font-extralight tracking-tight inline-flex items-center justify-center gap-2 flex-wrap">
                  <span>
                    {profile.name}
                    {age != null && <span className="text-white/45 font-light">, {age}</span>}
                  </span>
                  {(photoVerified || meUser?.photo_verified) && (
                    <VerifiedBadge size={18} title={t("photoVerifiedLabel")} />
                  )}
                </h1>
                <p className="text-sm text-white/55 font-light flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 text-white/60 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {cityName}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl p-4 mb-2">
                <div className="flex justify-between items-end gap-3 mb-2">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/45 font-light">{t("profileStrengthLabel")}</p>
                  <p className="text-xs text-white/80/90 font-light">{t(hintKey)}</p>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: "var(--ttm-brand-gradient-sync)" }}
                    initial={false}
                    animate={{ width: `${strength}%` }}
                    transition={{ type: "spring", stiffness: 120, damping: 20 }}
                  />
                </div>
              </div>

              <OwnTrustCenter profileStrength={strength} />
            </div>
          </div>

          {profileLife && (
            <ProfileLifePresence
              life={profileLife}
              onRevive={() => {
                reviveProfilePresence()
              }}
            />
          )}

          <ConnectionsHubCard />

          {!editing && (
            <div className="space-y-4 mb-5">
              <div className="ttm-brand-glass rounded-[1.35rem] p-5">
                <p className="p9-register-step-label mb-3">{t("profileAtmosphereTitle")}</p>
                {(profile.vibeIds?.length ?? 0) > 0 ||
                (profile.energyTagIds?.length ?? 0) > 0 ||
                profile.intention ? (
                  <ProfileIdentitySummary profile={profile} locale={locale} />
                ) : (
                  <p className="text-xs text-muted-foreground font-light">{t("profileAtmosphereEmpty")}</p>
                )}
              </div>

              <ProfileVoiceIntro
                seed={profile.email.length * 997 + profile.name.length}
                recorded={profile.voiceIntroRecorded ?? false}
                onRecordedChange={(v) => {
                  const next = updateUserProfile({ voiceIntroRecorded: v })
                  if (next) {
                    setProfile(next)
                    setForm(profileToForm(next))
                  }
                }}
                title={t("profileVoiceIntroTitle")}
                subtitle={t("profileVoiceIntroSub")}
                voiceHint={t("chatVoiceHint")}
                voiceDemo={t("chatVoiceDemo")}
                voiceDuration={t("chatVoiceDuration")}
                markReady={t("profileVoiceMarkReady")}
              />

              <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-5">
                <p className="text-[10px] uppercase tracking-[0.2em] text-purple-200/70 font-light mb-3">{t("profileSectionStory")}</p>
                <p className="text-sm font-light text-foreground/85 leading-relaxed">{profile.bio}</p>
                {profile.interests && profile.interests.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {profile.interests.map((id) => (
                      <span
                        key={id}
                        className="px-3 py-1 rounded-full text-xs font-light bg-purple-500/10 text-purple-200 border border-purple-500/25"
                      >
                        {getInterestLabel(id, locale)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="rounded-[1.75rem] border border-white/10 bg-black/30 backdrop-blur-2xl p-6 md:p-8 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.75)]">
            <div className="flex items-center justify-between mb-6 gap-3">
              <div>
                <h2 className="text-lg font-extralight tracking-tight">{t("profilePageTitle")}</h2>
                <p className="text-xs text-muted-foreground font-light mt-1">{t("profilePageSubtitle")}</p>
              </div>
              {!editing ? (
                <motion.button
                  type="button"
                  whileTap={reduce ? undefined : { scale: 0.97 }}
                  onClick={() => setEditing(true)}
                  className="shrink-0 px-4 py-2.5 rounded-full border border-white/15 bg-white/06 text-sm font-light text-white/85 hover:bg-white/08 transition-colors touch-manipulation"
                >
                  {t("profileEdit")}
                </motion.button>
              ) : null}
            </div>

            {editing ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-foreground/80 font-light">{t("regPhoto")}</Label>
                  <ProfilePhotoPicker
                    value={form.photoUrls}
                    onChange={(photoUrls) => setForm((prev) => (prev ? { ...prev, photoUrls } : prev))}
                    compact
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground/80 font-light">{t("profileBio")}</Label>
                  <Textarea
                    value={form.bio}
                    onChange={(e) => setForm((prev) => (prev ? { ...prev, bio: e.target.value } : prev))}
                    rows={4}
                    className="rounded-2xl bg-foreground/5 border-foreground/10 font-light resize-none min-h-[120px]"
                  />
                </div>

                <CityField
                  cityId={form.cityId}
                  customCity={form.customCity}
                  onCityIdChange={(id) =>
                    setForm((prev) =>
                      prev ? { ...prev, cityId: id, customCity: id === CUSTOM_CITY_ID ? prev.customCity : "" } : prev
                    )
                  }
                  onCustomCityChange={(value) => setForm((prev) => (prev ? { ...prev, customCity: value } : prev))}
                />

                <div className="space-y-2">
                  <Label className="text-foreground/80 font-light">{t("profileInterests")}</Label>
                  <InterestPicker
                    value={form.interests}
                    onChange={(ids) => setForm((prev) => (prev ? { ...prev, interests: ids } : prev))}
                  />
                </div>

                <ProfileDatingFields
                  purpose={form.purpose}
                  maxDistance={form.maxDistance}
                  latitude={form.latitude}
                  longitude={form.longitude}
                  dbInterestIds={form.dbInterestIds}
                  onChange={(patch) => setForm((prev) => (prev ? { ...prev, ...patch } : prev))}
                />

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-4">
                  <p className="text-xs text-white/50 font-light">{t("regSoulPremiumLead")}</p>
                  <div>
                    <Label className="text-foreground/80 font-light mb-2 block">{t("profileSectionIdentity")}</Label>
                    <VibeCloudPicker
                      value={form.vibeIds}
                      onChange={(ids) => setForm((prev) => (prev ? { ...prev, vibeIds: ids } : prev))}
                      locale={locale}
                    />
                  </div>
                  <div>
                    <Label className="text-foreground/80 font-light mb-2 block">{t("regEnergyLabel")}</Label>
                    <EnergyTagPicker
                      value={form.energyTagIds}
                      onChange={(ids) => setForm((prev) => (prev ? { ...prev, energyTagIds: ids } : prev))}
                      locale={locale}
                    />
                  </div>
                  <div>
                    <Label className="text-foreground/80 font-light mb-2 block">{t("regIntentionLabel")}</Label>
                    <IntentionDeck
                      value={form.intention}
                      onChange={(id) => setForm((prev) => (prev ? { ...prev, intention: id } : prev))}
                      locale={locale}
                    />
                  </div>
                  <div>
                    <Label className="text-foreground/80 font-light mb-2 block">{t("regMoodLabel")}</Label>
                    <MoodOrbit
                      value={form.mood}
                      onChange={(id) => setForm((prev) => (prev ? { ...prev, mood: id } : prev))}
                      locale={locale}
                    />
                  </div>
                  <div>
                    <Label className="text-foreground/80 font-light mb-2 block">{t("regCommunicationLabel")}</Label>
                    <CommunicationStylePicker
                      value={form.communicationStyle}
                      onChange={(id) => setForm((prev) => (prev ? { ...prev, communicationStyle: id } : prev))}
                      locale={locale}
                    />
                  </div>
                  <div>
                    <Label className="text-foreground/80 font-light mb-2 block">{t("regConnectionPrefLabel")}</Label>
                    <ConnectionPrefPicker
                      value={form.connectionPref}
                      onChange={(id) => setForm((prev) => (prev ? { ...prev, connectionPref: id } : prev))}
                      locale={locale}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground/80 font-light">{t("regPromptFavorite")}</Label>
                    <Textarea
                      value={form.promptFavorite}
                      onChange={(e) => setForm((prev) => (prev ? { ...prev, promptFavorite: e.target.value } : prev))}
                      rows={2}
                      placeholder={t("regPromptFavoritePlaceholder")}
                      className="rounded-xl bg-foreground/5 border-foreground/10 font-light resize-none"
                    />
                  </div>
                </div>

                <ProfileVoiceIntro
                  seed={profile.email.length * 997 + profile.name.length}
                  recorded={form.voiceIntroRecorded}
                  onRecordedChange={(v) => setForm((prev) => (prev ? { ...prev, voiceIntroRecorded: v } : prev))}
                  title={t("profileVoiceIntroTitle")}
                  subtitle={t("profileVoiceIntroSub")}
                  voiceHint={t("chatVoiceHint")}
                  voiceDemo={t("chatVoiceDemo")}
                  voiceDuration={t("chatVoiceDuration")}
                  markReady={t("profileVoiceMarkReady")}
                />

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-foreground/80 font-light text-xs">{t("profileGender")}</Label>
                    <select
                      value={form.gender}
                      onChange={(e) =>
                        setForm((prev) => (prev ? { ...prev, gender: e.target.value as Gender } : prev))
                      }
                      className="w-full rounded-xl bg-foreground/5 border border-foreground/10 px-3 py-2 text-sm font-light"
                    >
                      <option value="male">{t("regGenderMale")}</option>
                      <option value="female">{t("regGenderFemale")}</option>
                      <option value="other">{t("regGenderOther")}</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground/80 font-light text-xs">{t("profileLookingFor")}</Label>
                    <select
                      value={form.lookingFor}
                      onChange={(e) =>
                        setForm((prev) =>
                          prev ? { ...prev, lookingFor: e.target.value as LookingFor } : prev
                        )
                      }
                      className="w-full rounded-xl bg-foreground/5 border border-foreground/10 px-3 py-2 text-sm font-light"
                    >
                      <option value="men">{t("regLookingMen")}</option>
                      <option value="women">{t("regLookingWomen")}</option>
                      <option value="all">{t("regLookingAll")}</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 py-3.5 rounded-2xl border border-white/12 text-foreground/85 font-light hover:bg-white/[0.04] transition-colors touch-manipulation"
                  >
                    {t("profileCancel")}
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saveDisabled}
                    className="ttm-brand-cta flex-1 py-3.5 rounded-2xl font-extralight disabled:opacity-40 touch-manipulation"
                  >
                    {t("profileSave")}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: t("profileEmail"), value: profile.email },
                    {
                      label: t("profileAge"),
                      value: age != null ? `${age} ${t("profileYears")}` : "—",
                    },
                    { label: t("profileGender"), value: genderLabel(t, profile.gender) },
                    { label: t("profileLookingFor"), value: lookingLabel(t, profile.lookingFor) },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-xl bg-foreground/[0.04] border border-white/10 px-3 py-3 backdrop-blur-md"
                    >
                      <p className="text-[10px] text-muted-foreground font-light uppercase tracking-wider mb-1">
                        {item.label}
                      </p>
                      <p className="text-sm font-light text-foreground/90 truncate">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <div className="mt-5 space-y-3">
        {section === "profile" && <FreezeWalletStrip />}
        {section === "profile" && meUser?.level != null && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
            <LevelXpBar
              level={meUser.level ?? 1}
              xpInLevel={meUser.xpInLevel ?? 0}
              xpForNextLevel={meUser.xpForNextLevel ?? 100}
              progress={meUser.xpProgress ?? 0}
            />
          </div>
        )}
        {section === "profile" && achievements.length > 0 && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
            <h2 className="text-sm font-medium text-[var(--text-primary)] mb-3">Достижения</h2>
            <AchievementList items={achievements} />
          </div>
        )}
        <PremiumButton
          className="w-full min-h-[52px]"
          onClick={() => {
            enableDemoSwipeDeck()
            router.push("/app")
          }}
        >
          {t("profileStartSwipe")}
        </PremiumButton>
        <PremiumButton variant="ghost" className="w-full min-h-[48px]" onClick={handleLogout}>
          {t("profileLogout")}
        </PremiumButton>
      </div>

      <BottomNavBar active="profile" />
    </motion.div>
  )
}
