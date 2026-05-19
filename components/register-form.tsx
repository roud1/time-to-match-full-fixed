"use client"

import { useEffect, useState, type ReactNode } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"
import { useI18n } from "@/lib/i18n"
import {
  CUSTOM_CITY_ID,
  findCityIdFromName,
  getCityCoords,
  type CitySelectValue,
} from "@/lib/cities"
import { storePosition } from "@/lib/geo"
import { saveUserProfile, setSession } from "@/lib/user-profile"
import { CityField } from "@/components/city-field"
import { InterestPicker } from "@/components/interest-picker"
import { MIN_INTERESTS, type InterestId } from "@/lib/interests"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { ProfilePhotoPicker } from "@/components/profile-photo-picker"

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
  bio: string
  agreeTerms: boolean
}

type FormErrors = Partial<Record<keyof FormData | "photo" | "city", string>>

const STEPS = [1, 2, 3] as const

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: ReactNode
}) {
  return (
    <div className="space-y-2">
      <Label className="text-foreground/80 font-light">{label}</Label>
      {children}
      {error && <p className="text-xs text-red-400 font-light">{error}</p>}
    </div>
  )
}

export function RegisterForm() {
  const { t, location } = useI18n()
  const router = useRouter()
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
      if (!form.bio.trim()) next.bio = t("regErrorRequired")
      if (!form.agreeTerms) next.agreeTerms = t("regErrorTerms")
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleNext = () => {
    if (!validateStep(step)) return
    if (step < 3) setStep((step + 1) as (typeof STEPS)[number])
    else handleSubmit()
  }

  const handleSubmit = () => {
    if (!validateStep(3)) return

    const isManual = form.cityId === CUSTOM_CITY_ID
    const profile = {
      name: form.name.trim(),
      email: form.email.trim(),
      bio: form.bio.trim(),
      interests: form.interests,
      gender: form.gender,
      lookingFor: form.lookingFor,
      birthdate: form.birthdate,
      ...(photos.length > 0 ? { photoUrls: photos } : {}),
      registeredAt: Date.now(),
      ...(isManual
        ? { customCity: form.customCity.trim() }
        : { cityId: form.cityId as Exclude<CitySelectValue, "" | typeof CUSTOM_CITY_ID> }),
    }

    saveUserProfile(profile, form.password)

    if (!isManual && form.cityId) {
      storePosition(getCityCoords(form.cityId))
    }
    setSession(form.email.trim(), true)

    router.push("/welcome")
  }

  const stepLabels = [t("regStepAccount"), t("regStepProfile"), t("regStepFinish")]

  return (
    <motion.div className="glass-card rounded-3xl p-6 md:p-8 max-w-md w-full">
      <div className="text-center mb-8">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-light tracking-widest uppercase text-pink-400 border border-pink-500/20 bg-pink-500/10 mb-4">
          72h
        </span>
        <h1 className="text-2xl md:text-3xl font-extralight tracking-tight mb-2">{t("regPageTitle")}</h1>
        <p className="text-sm text-muted-foreground font-light">{t("regPageSubtitle")}</p>
      </div>

      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex-1 flex items-center gap-2">
            <motion.div
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                step >= s ? "bg-gradient-to-r from-pink-500 to-purple-600" : "bg-foreground/10"
              )}
            />
            {i < STEPS.length - 1 && <span className="sr-only">{stepLabels[i]}</span>}
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground font-light text-center mb-6 -mt-4">
        {stepLabels[step - 1]} · {step}/3
      </p>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          {step === 1 && (
            <>
              <Field label={t("regName")} error={errors.name}>
                <Input
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder={t("regNamePlaceholder")}
                  className="h-11 rounded-xl bg-foreground/5 border-foreground/10 font-light"
                />
              </Field>
              <Field label={t("regEmail")} error={errors.email}>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder={t("regEmailPlaceholder")}
                  className="h-11 rounded-xl bg-foreground/5 border-foreground/10 font-light"
                />
              </Field>
              <Field label={t("regPassword")} error={errors.password}>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  placeholder={t("regPasswordPlaceholder")}
                  className="h-11 rounded-xl bg-foreground/5 border-foreground/10 font-light"
                />
              </Field>
              <Field label={t("regConfirmPassword")} error={errors.confirmPassword}>
                <Input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => update("confirmPassword", e.target.value)}
                  className="h-11 rounded-xl bg-foreground/5 border-foreground/10 font-light"
                />
              </Field>
            </>
          )}

          {step === 2 && (
            <>
              <Field label={t("regBirthdate")} error={errors.birthdate}>
                <Input
                  type="date"
                  value={form.birthdate}
                  onChange={(e) => update("birthdate", e.target.value)}
                  className="h-11 rounded-xl bg-foreground/5 border-foreground/10 font-light"
                />
              </Field>
              <Field label={t("regGender")}>
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
                        "py-2.5 rounded-xl text-sm font-light border transition-all",
                        form.gender === value
                          ? "border-pink-500/50 bg-pink-500/10 text-pink-300"
                          : "border-foreground/10 bg-foreground/5 text-foreground/70 hover:bg-foreground/10"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label={t("regLookingFor")}>
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
                        "py-2.5 rounded-xl text-sm font-light border transition-all",
                        form.lookingFor === value
                          ? "border-purple-500/50 bg-purple-500/10 text-purple-300"
                          : "border-foreground/10 bg-foreground/5 text-foreground/70 hover:bg-foreground/10"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </Field>
              <div className="space-y-2">
                <Label className="text-foreground/80 font-light">{t("regCity")}</Label>
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
              <Field label={t("regInterests")} error={errors.interests}>
                <InterestPicker
                  value={form.interests}
                  onChange={(ids) => update("interests", ids)}
                />
              </Field>
            </>
          )}

          {step === 3 && (
            <>
              <Field label={t("regBio")} error={errors.bio}>
                <Textarea
                  value={form.bio}
                  onChange={(e) => update("bio", e.target.value)}
                  placeholder={t("regBioPlaceholder")}
                  rows={4}
                  className="rounded-xl bg-foreground/5 border-foreground/10 font-light resize-none"
                />
              </Field>
              <Field label={t("regPhoto")} error={errors.photo}>
                <ProfilePhotoPicker value={photos} onChange={setPhotos} />
              </Field>
              <div className="flex items-start gap-3 pt-2">
                <Checkbox
                  id="terms"
                  checked={form.agreeTerms}
                  onCheckedChange={(checked) => update("agreeTerms", checked === true)}
                />
                <label htmlFor="terms" className="text-xs text-muted-foreground font-light leading-relaxed cursor-pointer">
                  {t("regAgreeTerms")}{" "}
                  <span className="text-pink-400 hover:underline">{t("regTerms")}</span> {t("regAnd")}{" "}
                  <span className="text-pink-400 hover:underline">{t("regPrivacy")}</span>
                </label>
              </div>
              {errors.agreeTerms && (
                <p className="text-xs text-red-400 font-light -mt-2">{errors.agreeTerms}</p>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-3 mt-8">
        {step > 1 && (
          <button
            type="button"
            onClick={() => setStep((step - 1) as (typeof STEPS)[number])}
            className="flex-1 py-3 rounded-full border border-foreground/10 text-foreground/80 font-light hover:bg-foreground/5 transition-colors"
          >
            {t("regBack")}
          </button>
        )}
        <button
          type="button"
          onClick={handleNext}
          className="flex-1 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-light tracking-wide shadow-lg shadow-pink-500/20 hover:opacity-90 transition-opacity"
        >
          {step === 3 ? t("regSubmit") : t("regNext")}
        </button>
      </div>

      <p className="text-center text-sm text-muted-foreground font-light mt-6">
        {t("regHasAccount")}{" "}
        <Link href="/login" className="text-pink-400 hover:underline">
          {t("regSignIn")}
        </Link>
      </p>
    </motion.div>
  )
}
