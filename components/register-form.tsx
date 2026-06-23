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
import { markLocationSettled } from "@/lib/location-settled"
import { trackEvent } from "@/lib/analytics-client"
import { saveUserProfile, setSession, clearCredentials } from "@/lib/user-profile"
import { registerOnServer, syncRegistrationProfile } from "@/lib/auth/client"
import { recordProfileActivity } from "@/lib/profile-life-store"
import { CityField } from "@/components/city-field"
import { InterestPicker } from "@/components/interest-picker"
import { MIN_INTERESTS, type InterestId } from "@/lib/interests"
import { MIN_VIBES } from "@/lib/profile-identity"
import { CinematicButton } from "@/components/ui/cinematic-button"
import { CinematicCard } from "@/components/ui/cinematic-card"
import { CinematicField } from "@/components/ui/cinematic-field"
import { BirthdatePicker } from "@/components/ui/birthdate-picker"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { ProfilePhotoPicker } from "@/components/profile-photo-picker"
import { VibeCloudPicker, IntentionDeck, MoodOrbit } from "@/components/profile/identity-pickers"
import {
  EnergyTagPicker,
  CommunicationStylePicker,
  ConnectionPrefPicker,
} from "@/components/product/identity-product-pickers"
import { MIN_ENERGY_TAGS } from "@/lib/profile-identity"

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
  energyTagIds: string[]
  intention: string
  mood: string
  communicationStyle: string
  connectionPref: string
  promptFavorite: string
  bio: string
  agreeTerms: boolean
}

type FormErrors = Partial<
  Record<keyof FormData | "photo" | "city" | "vibes" | "energy" | "intention" | "communication" | "connectionPref" | "form", string>
>

const STEPS = [1, 2, 3, 4] as const

function regChoiceClass(selected: boolean) {
  return cn(
    "ttm-choice w-full min-w-0 py-2.5 px-2 border text-xs sm:text-sm transition-colors touch-manipulation",
    selected
      ? "border-[var(--accent)] bg-[var(--accent-soft-bg)] text-[var(--text-primary)] shadow-sm"
      : "border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:border-[var(--accent-soft-border)] hover:bg-[var(--accent-soft-bg)]/60"
  )
}

export function RegisterForm() {
  const { t, locale, location } = useI18n()
  const router = useRouter()
  const reduce = useReducedMotion()
  const [step, setStep] = useState<(typeof STEPS)[number]>(1)
  const [errors, setErrors] = useState<FormErrors>({})
  const [photos, setPhotos] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

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
    energyTagIds: [],
    intention: "",
    mood: "",
    communicationStyle: "",
    connectionPref: "",
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
      if (form.energyTagIds.length < MIN_ENERGY_TAGS) next.energy = t("regErrorEnergy")
      if (!form.intention.trim()) next.intention = t("regErrorIntention")
      if (!form.communicationStyle.trim()) next.communication = t("regErrorCommunication")
      if (!form.connectionPref.trim()) next.connectionPref = t("regErrorConnectionPref")
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

  const handleSubmit = async () => {
    if (!validateStep(4) || submitting) return

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
      energyTagIds: form.energyTagIds,
      intention: form.intention,
      communicationStyle: form.communicationStyle,
      connectionPref: form.connectionPref,
      ...(form.mood ? { mood: form.mood } : {}),
      ...(form.promptFavorite.trim() ? { promptFavorite: form.promptFavorite.trim() } : {}),
      ...(photos.length > 0 ? { photoUrls: photos } : {}),
      registeredAt: Date.now(),
      ...(isManual
        ? { customCity: form.customCity.trim() }
        : { cityId: form.cityId as Exclude<CitySelectValue, "" | typeof CUSTOM_CITY_ID> }),
    }

    setSubmitting(true)
    try {
      const serverResult = await registerOnServer({
        email: form.email.trim(),
        password: form.password,
        name: form.name.trim(),
      })

      if (serverResult.ok) {
        clearCredentials()
        saveUserProfile(profile)
        await syncRegistrationProfile(profile)

        if (!isManual && form.cityId && form.cityId !== CUSTOM_CITY_ID) {
          const coords = getCityCoords(form.cityId)
          if (coords) storePosition(coords)
        }
        setSession(form.email.trim(), true)
        recordProfileActivity()
        trackEvent("register", { has_photos: photos.length > 0, city_preset: !isManual })
        trackEvent("register_complete", {
          has_photos: photos.length > 0,
          city_preset: !isManual,
        })
        router.push("/welcome")
        return
      }

      if (serverResult.demoFallback) {
        saveUserProfile(profile, form.password)
        recordProfileActivity()

        if (!isManual && form.cityId && form.cityId !== CUSTOM_CITY_ID) {
          const coords = getCityCoords(form.cityId)
          if (coords) storePosition(coords)
        }
        setSession(form.email.trim(), true)
        trackEvent("register", { has_photos: photos.length > 0, city_preset: !isManual })
        trackEvent("register_complete", {
          has_photos: photos.length > 0,
          city_preset: !isManual,
        })
        router.push("/welcome")
        return
      }

      if (serverResult.status === 409) {
        setErrors({ email: serverResult.message ?? t("regErrorEmail") })
        setStep(1)
        return
      }

      setErrors({ form: serverResult.message ?? t("regErrorRequired") })
    } finally {
      setSubmitting(false)
    }
  }

  const stepLabels = [t("regStepAccount"), t("regStepRoots"), t("regStepSoul"), t("regStepReveal")]

  return (
    <div className="w-full">
      <CinematicCard variant="glass" className="ttm-brand-glass p-6 md:p-8 border border-white/10">
        <div className="text-center mb-8">
          <span className="ttm-badge-brand mb-4 block mx-auto w-fit">SYNC</span>
          <h1 className="ttm-brand-title text-foreground mb-2">{t("regPageTitle")}</h1>
          <p className="ttm-type-muted">{t("regPageSubtitle")}</p>
        </div>

        <div className="flex items-center gap-2 mb-2" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={4}>
          {STEPS.map((s, i) => (
            <div key={s} className="flex-1 flex items-center gap-2">
              <motion.div
                className={cn(
                  "ttm-reg-progress__segment",
                  step >= s && "ttm-reg-progress__segment--active"
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
                    placeholder={t("regConfirmPasswordPlaceholder")}
                  />
                </CinematicField>
              </>
            )}

            {step === 2 && (
              <>
                <CinematicField
                  label={t("regBirthdate")}
                  error={errors.birthdate}
                  className="gap-1.5 [&_.ttm-type-label]:mb-0"
                >
                  <BirthdatePicker
                    value={form.birthdate}
                    onChange={(iso) => update("birthdate", iso)}
                    aria-invalid={Boolean(errors.birthdate)}
                  />
                </CinematicField>
                <CinematicField label={t("regGender")}>
                  <div className="grid grid-cols-3 gap-2 w-full min-w-0">
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
                        className={regChoiceClass(form.gender === value)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </CinematicField>
                <CinematicField label={t("regLookingFor")}>
                  <div className="grid grid-cols-3 gap-2 w-full min-w-0">
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
                        className={regChoiceClass(form.lookingFor === value)}
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
                      if (id) {
                        markLocationSettled()
                        if (id !== CUSTOM_CITY_ID) {
                          const coords = getCityCoords(id)
                          if (coords) storePosition(coords)
                        }
                      }
                    }}
                    onCustomCityChange={(value) => {
                      update("customCity", value)
                      if (value.trim()) markLocationSettled()
                    }}
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
                <p className="text-sm text-white/55 font-light leading-relaxed">{t("regSoulPremiumLead")}</p>
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
                <div>
                  <Label className="ttm-type-label font-normal mb-2 block">{t("regEnergyLabel")}</Label>
                  <EnergyTagPicker
                    value={form.energyTagIds}
                    onChange={(ids) => update("energyTagIds", ids)}
                    locale={locale}
                    error={errors.energy}
                  />
                </div>
                <div>
                  <Label className="ttm-type-label font-normal mb-2 block">{t("regCommunicationLabel")}</Label>
                  <CommunicationStylePicker
                    value={form.communicationStyle}
                    onChange={(id) => update("communicationStyle", id)}
                    locale={locale}
                  />
                  {errors.communication && (
                    <p className="text-xs text-red-400/90 font-light mt-2">{errors.communication}</p>
                  )}
                </div>
                <div>
                  <Label className="ttm-type-label font-normal mb-2 block">{t("regConnectionPrefLabel")}</Label>
                  <ConnectionPrefPicker
                    value={form.connectionPref}
                    onChange={(id) => update("connectionPref", id)}
                    locale={locale}
                  />
                  {errors.connectionPref && (
                    <p className="text-xs text-red-400/90 font-light mt-2">{errors.connectionPref}</p>
                  )}
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
                    <span className="text-white/60 hover:underline">{t("regTerms")}</span> {t("regAnd")}{" "}
                    <span className="text-white/60 hover:underline">{t("regPrivacy")}</span>
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
            disabled={submitting}
          >
            {step === 4 ? (submitting ? t("loginLoading") : t("regSubmit")) : t("regNext")}
          </CinematicButton>
        </div>

        <p className="text-center ttm-type-muted mt-6">
          {t("regHasAccount")}{" "}
          <Link href="/login" className="text-white/60 hover:underline">
            {t("regSignIn")}
          </Link>
        </p>
      </CinematicCard>
    </div>
  )
}
