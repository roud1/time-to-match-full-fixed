"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"
import { useReducedMotion } from "motion/react"
import { useI18n } from "@/lib/i18n"
import {
  CUSTOM_CITY_ID,
  findCityIdFromName,
  getCityCoords,
  type CitySelectValue,
} from "@/lib/cities"
import { storePosition } from "@/lib/geo"
import { trackProductEvent } from "@/lib/analytics-client"
import { saveUserProfile, setSession } from "@/lib/user-profile"
import { recordProfileActivity } from "@/lib/profile-life-store"
import { CityField } from "@/components/city-field"
import { InterestPicker } from "@/components/interest-picker"
import { MIN_INTERESTS, type InterestId } from "@/lib/interests"
import { MIN_VIBES } from "@/lib/profile-identity"
import { CinematicButton } from "@/components/ui/cinematic-button"
import { CinematicCard } from "@/components/ui/cinematic-card"
import { CinematicField } from "@/components/ui/cinematic-field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { ProfilePhotoPicker } from "@/components/profile-photo-picker"
import { VibeCloudPicker, IntentionDeck, MoodOrbit } from "@/components/profile/identity-pickers"

type Gender = "male" | "female" | "other"
type LookingFor = "men" | "women" | "all"

type FormData = {
  name: string
  email: string
  password: string
  confirmPassword: string
  birthdate: string
  gender: Gender
  lookingFor: LookingFor
  cityId: CitySelectValue
  customCity: string
  interests: InterestId[]
  vibeIds: string[]
  intention: string
  mood: string
  promptFavorite: string
  bio: string
  agreeTerms: boolean
}

type FormErrors = Partial<
  Record<keyof FormData | "photo" | "city" | "vibes" | "intention", string>
>

const STEPS = [1, 2, 3, 4] as const

export function RegisterForm() {
  const { t, locale, location } = useI18n()
  const router = useRouter()
  const reduce = useReducedMotion()
  const [step, setStep] = useState<(typeof STEPS)[number]>(1)
  const [errors, setErrors] = useState<FormErrors>({})
  const [photos, setPhotos] = useState<string[]>([])

  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    birthdate: "",
    gender: "male",
    lookingFor: "women",
    cityId: "",
    customCity: "",
    interests: [],
    vibeIds: [],
    intention: "",
    mood: "",
    promptFavorite: "",
    bio: "",
    agreeTerms: false,
  })

  useEffect(() => {
    if (!location.city || form.cityId) return
    const matched = findCityIdFromName(location.city)
    if (matched) {
      setForm((prev) => ({ ...prev, cityId: matched, customCity: "" }))
    } else {
      setForm((prev) => ({
        ...prev,
        cityId: CUSTOM_CITY_ID,
        customCity: location.city ?? "",
      }))
    }
  }, [location.city, form.cityId])

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const isAdult = (date: string) => {
    if (!date) return false
    const birth = new Date(date)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
    return age >= 18
  }

  const validateStep = (s: number): boolean => {
    const next: FormErrors = {}

    if (s === 1) {
      if (!form.name.trim()) next.name = t("regErrorRequired")
      if (!form.email.trim()) next.email = t("regErrorRequired")
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = t("regErrorEmail")
      if (form.password.length < 8) next.password = t("regErrorPassword")
      if (form.password !== form.confirmPassword) next.confirmPassword = t("regErrorPasswordMatch")
    }

    if (s === 2) {
      if (!form.birthdate) next.birthdate = t("regErrorRequired")
      else if (!isAdult(form.birthdate)) next.birthdate = t("regErrorAge")
      if (!form.cityId) {
        next.city = t("regErrorRequired")
      } else if (form.cityId === CUSTOM_CITY_ID && !form.customCity.trim()) {
        next.city = t("regErrorRequired")
      }
      if (form.interests.length < MIN_INTERESTS) {
        next.interests = t("regErrorInterests")
      }
    }

    if (s === 3) {
      if (form.vibeIds.length < MIN_VIBES) next.vibes = t("regErrorVibes")
      if (!form.intention.trim()) next.intention = t("regErrorIntention")
    }

    if (s === 4) {
      if (!form.bio.trim()) next.bio = t("regErrorRequired")
      if (!form.agreeTerms) next.agreeTerms = t("regErrorTerms")
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleNext = () => {
    if (!validateStep(step)) return
    if (step < 4) setStep((step + 1) as (typeof STEPS)[number])
    else handleSubmit()
  }

  const handleSubmit = () => {
    if (!validateStep(4)) return

    const isManual = form.cityId === CUSTOM_CITY_ID
    const profile = {
      name: form.name.trim(),
      email: form.email.trim(),
      bio: form.bio.trim(),
      interests: form.interests,
      gender: form.gender,
      lookingFor: form.lookingFor,
      birthdate: form.birthdate,
      vibeIds: form.vibeIds,
      intention: form.intention,
      ...(form.mood ? { mood: form.mood } : {}),
      ...(form.promptFavorite.trim() ? { promptFavorite: form.promptFavorite.trim() } : {}),
      ...(photos.length > 0 ? { photoUrls: photos } : {}),
      registeredAt: Date.now(),
      ...(isManual
        ? { customCity: form.customCity.trim() }
        : { cityId: form.cityId as Exclude<CitySelectValue, "" | typeof CUSTOM_CITY_ID> }),
    }

    saveUserProfile(profile, form.password)
    recordProfileActivity()

    if (!isManual && form.cityId && form.cityId !== CUSTOM_CITY_ID) {
      storePosition(getCityCoords(form.cityId))
    }
    setSession(form.email.trim(), true)

    trackProductEvent("register_complete", {
      has_photos: photos.length > 0,
      city_preset: !isManual,
    })

    router.push("/welcome")
  }

  const stepLabels = [t("regStepAccount"), t("regStepRoots"), t("regStepSoul"), t("regStepReveal")]

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-md"
    >
      <CinematicCard variant="glass" className="p-6 md:p-8 border border-white/10 shadow-[0_28px_90px_-40px_rgba(236,72,153,0.35)]">
        <div className="text-center mb-8">
          <span className="ttm-badge-soft mb-4 block mx-auto w-fit">Pulse</span>
          <h1 className="ttm-type-h1 text-foreground mb-2">{t("regPageTitle")}</h1>
          <p className="ttm-type-muted">{t("regPageSubtitle")}</p>
        </div>

        <div className="flex items-center gap-2 mb-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex-1 flex items-center gap-2">
              <motion.div
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors duration-300",
                  step >= s ? "bg-gradient-to-r from-pink-500 to-purple-600" : "bg-foreground/10"
                )}
                layout={!reduce}
              />
              {i < STEPS.length - 1 && <span className="sr-only">{stepLabels[i]}</span>}
            </div>
          ))}
        </div>
        <p className="ttm-type-muted text-center mb-6 text-xs sm:text-sm">
          {stepLabels[step - 1]} · {step}/4
        </p>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: reduce ? 0 : 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: reduce ? 0 : -12 }}
            transition={{ duration: reduce ? 0.15 : 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-5"
          >
            {step === 1 && (
              <>
                <CinematicField label={t("regName")} error={errors.name}>
                  <Input
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder={t("regNamePlaceholder")}
                  />
                </CinematicField>
                <CinematicField label={t("regEmail")} error={errors.email}>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder={t("regEmailPlaceholder")}
                  />
                </CinematicField>
                <CinematicField label={t("regPassword")} error={errors.password}>
                  <Input
                    type="password"
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    placeholder={t("regPasswordPlaceholder")}
                  />
                </CinematicField>
                <CinematicField label={t("regConfirmPassword")} error={errors.confirmPassword}>
                  <Input
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e) => update("confirmPassword", e.target.value)}
                  />
                </CinematicField>
              </>
            )}

            {step === 2 && (
              <>
                <CinematicField label={t("regBirthdate")} error={errors.birthdate}>
                  <Input type="date" value={form.birthdate} onChange={(e) => update("birthdate", e.target.value)} />
                </CinematicField>
                <CinematicField label={t("regGender")}>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        ["male", t("regGenderMale")],
                        ["female", t("regGenderFemale")],
                        ["other", t("regGenderOther")],
                      ] as const
                    ).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => update("gender", value)}
                        className={cn(
                          "ttm-choice py-2.5 border",
                          form.gender === value
                            ? "border-pink-500/50 bg-pink-500/10 text-pink-300"
                            : "border-foreground/10 bg-foreground/5 text-foreground/70 hover:bg-foreground/10"
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </CinematicField>
                <CinematicField label={t("regLookingFor")}>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        ["men", t("regLookingMen")],
                        ["women", t("regLookingWomen")],
                        ["all", t("regLookingAll")],
                      ] as const
                    ).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => update("lookingFor", value)}
                        className={cn(
                          "ttm-choice py-2.5 border",
                          form.lookingFor === value
                            ? "border-purple-500/50 bg-purple-500/10 text-purple-300"
                            : "border-foreground/10 bg-foreground/5 text-foreground/70 hover:bg-foreground/10"
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </CinematicField>
                <div className="flex flex-col gap-2">
                  <Label className="ttm-type-label font-normal">{t("regCity")}</Label>
                  <CityField
                    cityId={form.cityId}
                    customCity={form.customCity}
                    onCityIdChange={(id) => {
                      update("cityId", id)
                      if (id !== CUSTOM_CITY_ID) update("customCity", "")
                      setErrors((prev) => ({ ...prev, city: undefined }))
                    }}
                    onCustomCityChange={(value) => update("customCity", value)}
                    error={errors.city}
                  />
                </div>
                <CinematicField label={t("regInterests")}>
                  <InterestPicker
                    value={form.interests}
                    onChange={(ids) => update("interests", ids)}
                    error={errors.interests}
                  />
                </CinematicField>
              </>
            )}

            {step === 3 && (
              <>
                <p className="text-sm text-muted-foreground font-light leading-relaxed">{t("regIdentityLead")}</p>
                <div>
                  <Label className="ttm-type-label font-normal mb-2 block">{t("regStepSoul")}</Label>
                  <VibeCloudPicker
                    value={form.vibeIds}
                    onChange={(ids) => update("vibeIds", ids)}
                    locale={locale}
                    error={errors.vibes}
                  />
                </div>
                <div>
                  <Label className="ttm-type-label font-normal mb-2 block">{t("regIntentionLabel")}</Label>
                  <IntentionDeck value={form.intention} onChange={(id) => update("intention", id)} locale={locale} />
                  {errors.intention && <p className="text-xs text-red-400/90 font-light mt-2">{errors.intention}</p>}
                </div>
                <div>
                  <Label className="ttm-type-label font-normal mb-2 block">{t("regMoodLabel")}</Label>
                  <MoodOrbit value={form.mood} onChange={(id) => update("mood", id)} locale={locale} />
                </div>
                <CinematicField label={t("regPromptFavorite")}>
                  <Textarea
                    value={form.promptFavorite}
                    onChange={(e) => update("promptFavorite", e.target.value)}
                    placeholder={t("regPromptFavoritePlaceholder")}
                    rows={3}
                    className="min-h-[88px] resize-none"
                  />
                </CinematicField>
              </>
            )}

            {step === 4 && (
              <>
                <CinematicField label={t("regBio")} error={errors.bio}>
                  <Textarea
                    value={form.bio}
                    onChange={(e) => update("bio", e.target.value)}
                    placeholder={t("regBioPlaceholder")}
                    rows={4}
                    className="min-h-[120px] resize-none"
                  />
                </CinematicField>
                <CinematicField label={t("regPhoto")} error={errors.photo}>
                  <ProfilePhotoPicker value={photos} onChange={setPhotos} />
                </CinematicField>
                <div className="flex items-start gap-3 pt-2">
                  <Checkbox
                    id="terms"
                    checked={form.agreeTerms}
                    onCheckedChange={(checked) => update("agreeTerms", checked === true)}
                  />
                  <label htmlFor="terms" className="ttm-type-muted leading-relaxed cursor-pointer">
                    {t("regAgreeTerms")}{" "}
                    <span className="text-pink-400 hover:underline">{t("regTerms")}</span> {t("regAnd")}{" "}
                    <span className="text-pink-400 hover:underline">{t("regPrivacy")}</span>
                  </label>
                </div>
                {errors.agreeTerms && (
                  <p className="text-xs text-red-400/95 font-light -mt-2">{errors.agreeTerms}</p>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <CinematicButton
              type="button"
              variant="secondary"
              size="mobile"
              className="flex-1"
              onClick={() => setStep((step - 1) as (typeof STEPS)[number])}
            >
              {t("regBack")}
            </CinematicButton>
          )}
          <CinematicButton
            type="button"
            variant="primary"
            size="mobile"
            className={step > 1 ? "flex-1" : "w-full"}
            onClick={handleNext}
          >
            {step === 4 ? t("regSubmit") : t("regNext")}
          </CinematicButton>
        </div>

        <p className="text-center ttm-type-muted mt-6">
          {t("regHasAccount")}{" "}
          <Link href="/login" className="text-pink-400 hover:underline">
            {t("regSignIn")}
          </Link>
        </p>
      </CinematicCard>
    </motion.div>
  )
}
