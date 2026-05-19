"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"
import { useI18n } from "@/lib/i18n"
import {
  CUSTOM_CITY_ID,
  getProfileCityName,
  type CitySelectValue,
} from "@/lib/cities"
import { getInterestLabel, MIN_INTERESTS, type InterestId } from "@/lib/interests"
import { enableDemoSwipeDeck } from "@/lib/demo-profiles"
import { getProfilePhotos } from "@/lib/profile-photos"
import { ProfilePhotoGallery } from "@/components/profile-photo-gallery"
import { ProfilePhotoPicker } from "@/components/profile-photo-picker"
import {
  clearSession,
  getAgeFromBirthdate,
  getProfileTimeLeft,
  getUserProfile,
  isLoggedIn,
  PROFILE_DURATION_MS,
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
import { isPremiumActive } from "@/lib/user-profile"
import { PremiumButton } from "@/components/ui/premium-button"

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
}

function genderLabel(t: (k: string) => string, gender: Gender) {
  if (gender === "male") return t("regGenderMale")
  if (gender === "female") return t("regGenderFemale")
  return t("regGenderOther")
}

function lookingLabel(t: (k: string) => string, looking: LookingFor) {
  if (looking === "men") return t("regLookingMen")
  if (looking === "women") return t("regLookingWomen")
  return t("regLookingAll")
}

function formatMemberDate(ts: number, locale: string) {
  return new Intl.DateTimeFormat(locale === "uk" ? "uk-UA" : locale === "en" ? "en-US" : "ru-RU", {
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
  }
}

export function ProfileScreen() {
  const { t, locale } = useI18n()
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")
  const section: ProfileSection = tabParam === "premium" ? "premium" : "profile"
  const [profile, setProfile] = useState<StoredUserProfile | null>(null)
  const [editing, setEditing] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0, remaining: 0 })
  const [form, setForm] = useState<EditForm | null>(null)

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
    if (!profile) return
    const tick = () => setTimeLeft(getProfileTimeLeft(profile.registeredAt))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [profile])

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

    const isManual = form.cityId === CUSTOM_CITY_ID
    const patch = {
      bio: form.bio.trim(),
      interests: form.interests,
      lookingFor: form.lookingFor,
      gender: form.gender,
      photoUrls: form.photoUrls,
      ...(isManual
        ? { customCity: form.customCity.trim(), cityId: undefined }
        : {
            cityId: form.cityId as Exclude<CitySelectValue, "" | typeof CUSTOM_CITY_ID>,
            customCity: undefined,
          }),
    }

    const next = updateUserProfile(patch)
    if (next) {
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
      <motion.div className="glass-card rounded-3xl p-8 max-w-md w-full text-center">
        <p className="text-muted-foreground font-light">{t("locationLoading")}</p>
      </motion.div>
    )
  }

  const cityName = getProfileCityName(profile, locale)
  const photos = getProfilePhotos(profile)
  const age = getAgeFromBirthdate(profile.birthdate)
  const progress = Math.round((timeLeft.remaining / PROFILE_DURATION_MS) * 100)
  const expired = timeLeft.remaining <= 0
  const localeTag = locale === "uk" ? "uk-UA" : locale === "en" ? "en-US" : "ru-RU"

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
            className="mb-4 rounded-xl border border-pink-500/30 bg-pink-500/10 px-4 py-2 text-center text-sm font-light text-pink-300"
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
      {/* Hero card */}
      <div className="premium-profile-card rounded-[1.75rem] overflow-hidden mb-4 p-4 md:p-5 border border-white/10">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex flex-wrap gap-2 shrink-0 justify-end">
            {isPremiumActive(profile) && (
              <span className="px-3 py-1 rounded-full text-xs font-light tracking-wide border border-amber-500/30 bg-amber-500/10 text-amber-200">
                {t("premiumActiveBadge")}
              </span>
            )}
            <span
              className={cn(
                "px-3 py-1 rounded-full text-xs font-light tracking-wide border",
                expired
                  ? "border-red-500/30 bg-red-500/10 text-red-300"
                  : "border-pink-500/30 bg-pink-500/10 text-pink-300"
              )}
            >
              {expired ? t("profileExpired") : t("profileActive")}
            </span>
          </div>
          {photos.length > 0 && (
            <span className="text-xs text-muted-foreground font-light">
              {photos.length} {t("profilePhotos").toLowerCase()}
            </span>
          )}
        </div>

        <ProfilePhotoGallery photos={photos} name={profile.name} className="mb-4" />

        <div className="pb-2 px-1 text-center">
          <h1 className="text-2xl md:text-3xl font-extralight tracking-tight">
            {profile.name}
            {age != null && (
              <span className="text-muted-foreground font-light">, {age}</span>
            )}
          </h1>
          <p className="text-sm text-muted-foreground font-light mt-1 flex items-center justify-center gap-1.5">
            <svg className="w-4 h-4 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {cityName}
          </p>
        </div>
      </div>

      {/* Timer */}
      <div className="rounded-2xl p-5 mb-4 border border-white/10 bg-black/25 backdrop-blur-md">
        <p className="text-[10px] text-white/50 font-light uppercase tracking-[0.2em] text-center mb-4">
          {t("profileTimerLabel")}
        </p>
        <div className="flex justify-center gap-3 mb-4">
          {[
            { value: timeLeft.hours, label: t("hours") },
            { value: timeLeft.minutes, label: t("minutes") },
            { value: timeLeft.seconds, label: t("seconds") },
          ].map((item, i) => (
            <div key={i} className="text-center">
              <div className="premium-timer-cell rounded-xl px-3 py-2 min-w-[56px]">
                <span className="text-xl font-extralight tabular-nums text-white">
                  {String(item.value).padStart(2, "0")}
                </span>
              </div>
              <span className="text-[9px] text-white/45 mt-1 block uppercase tracking-wider">{item.label}</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground font-light mb-2">{t("profileProgress")}</p>
        <div className="h-1.5 rounded-full bg-foreground/10 overflow-hidden">
          <motion.div
            className={cn(
              "h-full rounded-full transition-all duration-1000",
              expired
                ? "bg-red-500/60 w-0"
                : "bg-gradient-to-r from-pink-500 to-purple-600"
            )}
            style={{ width: expired ? "0%" : `${progress}%` }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground/70 font-light mt-2 text-right">
          {t("profileMemberSince")}: {formatMemberDate(profile.registeredAt, localeTag)}
        </p>
      </div>

      {/* Details / Edit */}
      <div className="glass-card rounded-3xl p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-light tracking-tight">{t("profilePageTitle")}</h2>
            <p className="text-xs text-muted-foreground font-light mt-0.5">{t("profilePageSubtitle")}</p>
          </div>
          {!editing ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="px-4 py-2 rounded-full border border-foreground/10 text-sm font-light text-foreground/80 hover:bg-foreground/5 transition-colors"
            >
              {t("profileEdit")}
            </button>
          ) : null}
        </div>

        {editing ? (
          <div className="space-y-5">
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
                className="rounded-xl bg-foreground/5 border-foreground/10 font-light resize-none"
              />
            </div>

            <CityField
              cityId={form.cityId}
              customCity={form.customCity}
              onCityIdChange={(id) =>
                setForm((prev) =>
                  prev
                    ? { ...prev, cityId: id, customCity: id === CUSTOM_CITY_ID ? prev.customCity : "" }
                    : prev
                )
              }
              onCustomCityChange={(value) =>
                setForm((prev) => (prev ? { ...prev, customCity: value } : prev))
              }
            />

            <div className="space-y-2">
              <Label className="text-foreground/80 font-light">{t("profileInterests")}</Label>
              <InterestPicker
                value={form.interests}
                onChange={(ids) => setForm((prev) => (prev ? { ...prev, interests: ids } : prev))}
              />
            </div>

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
                className="flex-1 py-3 rounded-full border border-foreground/10 text-foreground/80 font-light hover:bg-foreground/5 transition-colors"
              >
                {t("profileCancel")}
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={form.interests.length < MIN_INTERESTS || !form.bio.trim()}
                className="flex-1 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-light disabled:opacity-40 transition-opacity"
              >
                {t("profileSave")}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
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
                  className="rounded-xl bg-foreground/5 border border-foreground/10 px-3 py-3"
                >
                  <p className="text-[10px] text-muted-foreground font-light uppercase tracking-wider mb-1">
                    {item.label}
                  </p>
                  <p className="text-sm font-light text-foreground/90 truncate">{item.value}</p>
                </div>
              ))}
            </div>

            <div>
              <p className="text-xs text-muted-foreground font-light mb-2 uppercase tracking-widest">
                {t("profileBio")}
              </p>
              <p className="text-sm font-light text-foreground/85 leading-relaxed">{profile.bio}</p>
            </div>

            {profile.interests && profile.interests.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground font-light mb-3">{t("profileInterests")}</p>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((id) => (
                    <span
                      key={id}
                      className="px-3 py-1 rounded-full text-xs font-light bg-pink-500/10 text-pink-300 border border-pink-500/20"
                    >
                      {getInterestLabel(id, locale)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
        </>
      )}

      <div className="mt-4 space-y-3">
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
