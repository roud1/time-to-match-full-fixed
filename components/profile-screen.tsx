"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"
import { useReducedMotion } from "motion/react"
import { useI18n, type TranslationKey } from "@/lib/i18n"
import { localeToBcp47 } from "@/lib/i18n/config"
import { CUSTOM_CITY_ID, type CitySelectValue } from "@/lib/cities"
import { getInterestLabel, MIN_INTERESTS, type InterestId } from "@/lib/interests"
import { MIN_VIBES, MIN_ENERGY_TAGS } from "@/lib/profile-identity"
import {
  EnergyTagPicker,
  CommunicationStylePicker,
  ConnectionPrefPicker,
} from "@/components/product/identity-product-pickers"
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
import { ProfileTabs, type ProfileSection } from "@/components/profile-tabs"
import { ProfilePremiumPanel } from "@/components/profile-premium-panel"
import { PremiumButton } from "@/components/ui/premium-button"
import { FreezeWalletStrip } from "@/components/matches/freeze-wallet-strip"
import { LevelXpBar } from "@/components/gamification/level-xp-bar"
import { AchievementList } from "@/components/gamification/achievement-list"
import { useUser } from "@/hooks/use-user"
import { useAchievements } from "@/hooks/use-achievements"
import { ProfilePresenceCard } from "@/components/profile/profile-presence-card"
import { strengthHintKey } from "@/components/profile/profile-strength-utils"
import { getConnectionSummary } from "@/lib/connection-summary"
import { getProfileTimeLeft } from "@/lib/user-profile"
import { VibeCloudPicker, IntentionDeck, MoodOrbit } from "@/components/profile/identity-pickers"
import { ProfileVoiceIntro } from "@/components/profile/profile-voice-intro"
import { OwnTrustCenter } from "@/components/trust/own-trust-center"
import { ConnectionsHubCard } from "@/components/profile/connections-hub-card"
import { ProfileLifePresence } from "@/components/profile/profile-life-presence"
import { ProfileExpiryPanel } from "@/components/profile/profile-expiry-panel"
import { ProfileDatingFields, dispatchProfileDatingSync } from "@/components/profile/profile-dating-fields"
import { PhotoVerificationBlock } from "@/components/profile/photo-verification-block"
import { useVerificationStatus } from "@/hooks/use-verification-status"
import { useProfileLife } from "@/hooks/use-profile-life"
import { useDesktopAppNav } from "@/hooks/use-desktop-app-nav"
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
  ageMin?: number | null
  ageMax?: number | null
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

function purposeLabel(t: (k: TranslationKey) => string, purpose?: DatingPurpose) {
  if (!purpose) return "—"
  return t(`datingPurpose_${purpose}` as "datingPurpose_serious")
}

function formatDiscoverAgeRange(ageMin?: number | null, ageMax?: number | null) {
  if (ageMin == null && ageMax == null) return "—"
  if (ageMin != null && ageMax != null) return `${ageMin}–${ageMax}`
  if (ageMin != null) return `${ageMin}+`
  return `≤${ageMax}`
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
    ageMin: p.ageMin ?? null,
    ageMax: p.ageMax ?? null,
    latitude: p.latitude,
    longitude: p.longitude,
    dbInterestIds: p.dbInterestIds ?? [],
  }
}

function formatProfileTimer(h: number, m: number, s: number) {
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
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
  const [statsTick, setStatsTick] = useState(0)
  const profileLife = useProfileLife()
  const isDesktop = useDesktopAppNav()

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

  useEffect(() => {
    const onEditRequest = () => setEditing(true)
    window.addEventListener("ttm-profile-request-edit", onEditRequest)
    return () => window.removeEventListener("ttm-profile-request-edit", onEditRequest)
  }, [])

  useEffect(() => {
    if (searchParams.get("edit") === "1") setEditing(true)
  }, [searchParams])

  useEffect(() => {
    const bump = () => setStatsTick((n) => n + 1)
    const id = window.setInterval(bump, 1000)
    window.addEventListener("ttm-user-profile-changed", bump)
    window.addEventListener("ttm-connection-updated", bump)
    return () => {
      window.clearInterval(id)
      window.removeEventListener("ttm-user-profile-changed", bump)
      window.removeEventListener("ttm-connection-updated", bump)
    }
  }, [])

  useEffect(() => {
    if (!meUser || editing) return
    const patch: Partial<StoredUserProfile> = {}
    if (meUser.purpose != null) patch.purpose = meUser.purpose as DatingPurpose
    if (meUser.maxDistance != null) patch.maxDistance = meUser.maxDistance
    if (meUser.ageMin !== undefined) patch.ageMin = meUser.ageMin
    if (meUser.ageMax !== undefined) patch.ageMax = meUser.ageMax
    if (meUser.interestIds?.length) patch.dbInterestIds = meUser.interestIds
    if (Object.keys(patch).length === 0) return
    const next = updateUserProfile(patch)
    if (next) {
      setProfile(next)
      setForm(profileToForm(next))
    }
  }, [meUser?.id, editing])

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
      ageMin: form.ageMin,
      ageMax: form.ageMax,
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

  const photos = getProfilePhotos(profile)
  const age = getAgeFromBirthdate(profile.birthdate)
  const localeTag = localeToBcp47(locale)
  const hintKey = strengthHintKey(strength)
  const timer = getProfileTimeLeft(profile)
  const timerLabel = formatProfileTimer(timer.hours, timer.minutes, timer.seconds)
  const connectionsCount = getConnectionSummary().activeCount
  void statsTick
  const saveDisabled =
    form.interests.length < MIN_INTERESTS ||
    !form.bio.trim() ||
    (form.vibeIds.length > 0 && form.vibeIds.length < MIN_VIBES) ||
    (form.energyTagIds.length > 0 && form.energyTagIds.length < MIN_ENERGY_TAGS)

  const desktopLayout = isDesktop && section === "profile" && !editing

  const profileConnectionsVoice =
    !editing && section === "profile" ? (
      <div className="ttm-profile-freeze-adjacent">
        <ConnectionsHubCard className="ttm-profile-freeze-adjacent__item" />
        <ProfileVoiceIntro
          className="ttm-profile-freeze-adjacent__item"
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
      </div>
    ) : null

  const profileFooter = (
    <div className={cn("space-y-3", desktopLayout ? "" : "mt-5")}>
      {section === "profile" && <FreezeWalletStrip />}
      {profileConnectionsVoice}
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
          <h2 className="text-sm font-medium text-[var(--text-primary)] mb-3">{t("profileAchievementsTitle")}</h2>
          <AchievementList items={achievements} />
        </div>
      )}
      <div className={cn(desktopLayout && "ttm-profile-desktop__actions")}>
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
    </div>
  )

  const profilePresenceHero = !editing ? (
    <ProfilePresenceCard
      profile={profile}
      age={age}
      strength={strength}
      strengthHint={t(hintKey)}
      photoVerified={photoVerified || meUser?.photo_verified}
      timerLabel={timerLabel}
      connectionsCount={connectionsCount}
      layout={desktopLayout ? "wide" : "default"}
      className="profile-presence--own"
      onEdit={() => setEditing(true)}
    />
  ) : null

  const profileSecondaryBlocks = (
    <>
      <ProfileExpiryPanel profile={profile} onProfileUpdate={setProfile} />
      <PhotoVerificationBlock />

      {editing && (
        <div className="ttm-profile-section-card p-5">
          <Label className="text-foreground/80 font-light mb-2 block">{t("regPhoto")}</Label>
          <ProfilePhotoGallery
            photos={photos}
            name={profile.name}
            className="rounded-2xl overflow-hidden ring-1 ring-foreground/10"
          />
        </div>
      )}

      {!editing && (
        <div>
          <OwnTrustCenter profileStrength={strength} />
        </div>
      )}

      {profileLife && (
        <ProfileLifePresence
          life={profileLife}
          onRevive={() => {
            reviveProfilePresence()
          }}
        />
      )}

      {!editing && (
        <div className="ttm-profile-section-card p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-purple-200/70 font-light mb-3">
            {t("profileSectionStory")}
          </p>
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
      )}
    </>
  )

  const profileAside = (
    <>
      {profilePresenceHero}
      {profileSecondaryBlocks}
    </>
  )

  const profileDetailsCard = (
    <div className="ttm-profile-section-card p-6 md:p-8 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.35)]">
      <div className="flex items-center justify-between mb-6 gap-3">
        <div>
          <h2 className="text-lg font-extralight tracking-tight">{t("profileDetailsTitle")}</h2>
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
            ageMin={form.ageMin}
            ageMax={form.ageMax}
            gender={form.gender}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2 sm:col-span-2">
              <Label className="text-foreground/80 font-light text-xs">{t("profileLookingFor")}</Label>
              <select
                value={form.lookingFor}
                onChange={(e) =>
                  setForm((prev) => (prev ? { ...prev, lookingFor: e.target.value as LookingFor } : prev))
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
          <div className={cn("grid gap-3", desktopLayout ? "grid-cols-2" : "grid-cols-2")}>
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

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
            <p className="text-xs text-white/50 font-light">{t("profileDiscoverPrefsTitle")}</p>
            <div className={cn("grid gap-3", desktopLayout ? "grid-cols-2" : "grid-cols-2")}>
              {[
                {
                  label: t("datingPurposeLabel"),
                  value: purposeLabel(t, profile.purpose),
                },
                {
                  label: t("profileMaxDistance"),
                  value: `${profile.maxDistance ?? DEFAULT_MAX_DISTANCE_KM} ${t("discoverFiltersKm")}`,
                },
                {
                  label: `${t("discoverFiltersAgeFrom")} – ${t("discoverFiltersAgeTo")}`,
                  value: formatDiscoverAgeRange(profile.ageMin, profile.ageMax),
                },
                {
                  label: t("profileInterests"),
                  value:
                    profile.dbInterestIds && profile.dbInterestIds.length > 0
                      ? `${profile.dbInterestIds.length}`
                      : "—",
                },
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
            <p className="text-[10px] text-muted-foreground font-light">{t("profileDiscoverAgeHint")}</p>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "w-full",
        isDesktop && section === "profile" && editing && "ttm-profile-screen--editing"
      )}
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
        <div className={cn(isDesktop && "ttm-profile-desktop__premium")}>
          <ProfilePremiumPanel profile={profile} onProfileUpdate={setProfile} />
        </div>
      ) : desktopLayout ? (
        <div className="ttm-profile-desktop__stack">
          {profilePresenceHero ? (
            <div className="ttm-profile-desktop__hero">{profilePresenceHero}</div>
          ) : null}
          <div className="ttm-profile-desktop__columns">
            <div className="ttm-profile-desktop__col ttm-profile-desktop__col--main">
              {profileDetailsCard}
              {profileFooter}
            </div>
            <div className="ttm-profile-desktop__col ttm-profile-desktop__col--side">
              {profileSecondaryBlocks}
            </div>
          </div>
        </div>
      ) : (
        <>
          {profileAside}
          {profileDetailsCard}
          {profileFooter}
        </>
      )}

    </motion.div>
  )
}
