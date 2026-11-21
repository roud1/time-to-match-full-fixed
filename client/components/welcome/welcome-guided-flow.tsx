"use client"

import { useCallback, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useI18n } from "@/client/lib/i18n"
import { OnboardingFlow } from "@/client/components/onboarding-flow"
import { ProfilePhotoPicker } from "@/client/components/profile-photo-picker"
import { InterestPicker } from "@/client/components/interest-picker"
import { MIN_INTERESTS, type InterestId } from "@/client/lib/interests"
import { getProfilePhotos } from "@/client/lib/profile-photos"
import {
  updateUserProfile,
  type StoredUserProfile,
} from "@/client/lib/user-profile"
import { markWelcomeSeen } from "@/client/lib/welcome-seen"
import { Input } from "@/client/components/ui/input"
import { Label } from "@/client/components/ui/label"
import { cn } from "@/client/lib/utils"
import { ArrowRight } from "lucide-react"
import "@/client/components/onboarding-luvia.css"

const SLIDES_DONE_KEY = "ttm-onboarding-done"
const PHASE_INDEX_KEY = "ttm-welcome-phase-index"

type GuidedPhase = "profile" | "interests" | "how-it-works"

function readSavedPhaseIndex(): number {
  if (typeof window === "undefined") return 0
  const raw = localStorage.getItem(PHASE_INDEX_KEY)
  const n = raw ? Number.parseInt(raw, 10) : 0
  return Number.isFinite(n) && n >= 0 ? n : 0
}

function savePhaseIndex(index: number) {
  if (typeof window === "undefined") return
  localStorage.setItem(PHASE_INDEX_KEY, String(index))
}

function clearPhaseIndex() {
  if (typeof window === "undefined") return
  localStorage.removeItem(PHASE_INDEX_KEY)
}

function needsProfileStep(profile: StoredUserProfile): boolean {
  const photos = getProfilePhotos(profile)
  return photos.length === 0 || !profile.name?.trim()
}

function needsInterestsStep(profile: StoredUserProfile): boolean {
  return (profile.interests?.length ?? 0) < MIN_INTERESTS
}

function slidesAlreadyDone(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem(SLIDES_DONE_KEY) === "1"
}

function markSlidesDone(): void {
  if (typeof window === "undefined") return
  localStorage.setItem(SLIDES_DONE_KEY, "1")
}

function computePhases(profile: StoredUserProfile): GuidedPhase[] {
  const phases: GuidedPhase[] = []
  if (needsProfileStep(profile)) phases.push("profile")
  if (needsInterestsStep(profile)) phases.push("interests")
  if (!slidesAlreadyDone()) phases.push("how-it-works")
  return phases
}

type WelcomeGuidedFlowProps = {
  profile: StoredUserProfile
  onComplete?: () => void
  className?: string
}

export function WelcomeGuidedFlow({ profile: initialProfile, onComplete, className }: WelcomeGuidedFlowProps) {
  const { t } = useI18n()
  const router = useRouter()
  const [profile, setProfile] = useState(initialProfile)
  const phases = useMemo(() => computePhases(profile), [profile])
  const [phaseIndex, setPhaseIndex] = useState(() => readSavedPhaseIndex())
  const phase = phases[Math.min(phaseIndex, Math.max(phases.length - 1, 0))]

  const [name, setName] = useState(profile.name ?? "")
  const [photos, setPhotos] = useState<string[]>(getProfilePhotos(profile))
  const [interests, setInterests] = useState<InterestId[]>(profile.interests ?? [])

  const finish = useCallback(() => {
    markWelcomeSeen()
    markSlidesDone()
    clearPhaseIndex()
    onComplete?.()
    router.replace("/app")
  }, [onComplete, router])

  const advance = useCallback(() => {
    if (phaseIndex >= phases.length - 1) {
      finish()
      return
    }
    const next = phaseIndex + 1
    savePhaseIndex(next)
    setPhaseIndex(next)
  }, [finish, phaseIndex, phases.length])

  const saveProfileStep = () => {
    const trimmed = name.trim()
    if (!trimmed || photos.length === 0) return
    const next = updateUserProfile({ name: trimmed, photoUrls: photos })
    if (next) {
      setProfile(next)
      advance()
    }
  }

  const saveInterestsStep = () => {
    if (interests.length < MIN_INTERESTS) return
    const next = updateUserProfile({ interests })
    if (next) {
      setProfile(next)
      advance()
    }
  }

  if (phases.length === 0) {
    finish()
    return null
  }

  if (phase === "how-it-works") {
    return (
      <div className={cn("w-full", className)}>
        <OnboardingFlow
          onComplete={() => {
            markSlidesDone()
            finish()
          }}
        />
      </div>
    )
  }

  const canContinue = phase === "profile" ? Boolean(name.trim()) && photos.length > 0 : interests.length >= MIN_INTERESTS

  return (
    <div className={cn("lv-onboard w-full max-w-lg mx-auto", className)}>
      <div className="lv-onboard__inner">
        <div className="lv-onboard__top">
          <div className="lv-onboard__bars" role="progressbar" aria-valuenow={phaseIndex + 1} aria-valuemin={1} aria-valuemax={phases.length}>
            {phases.map((p, i) => (
              <span key={p} className={cn(i <= phaseIndex && "is-done")} />
            ))}
          </div>
          <button type="button" onClick={finish} className="lv-onboard__skip">
            {t("onboardSkip")}
          </button>
        </div>

        {phase === "profile" && (
          <div className="lv-onboard__body">
            <h2 className="lv-onboard__title">{t("guidedStepProfileTitle")}</h2>
            <p className="lv-onboard__sub">{t("guidedStepProfileSub")}</p>
            <div className="lv-onboard__field">
              <Label className="lv-onboard__label">{t("regName")}</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            </div>
            <ProfilePhotoPicker value={photos} onChange={setPhotos} />
          </div>
        )}

        {phase === "interests" && (
          <div className="lv-onboard__body">
            <h2 className="lv-onboard__title">{t("guidedStepInterestsTitle")}</h2>
            <p className="lv-onboard__sub">{t("guidedStepInterestsSub")}</p>
            <InterestPicker value={interests} onChange={setInterests} />
          </div>
        )}

        <div className="lv-onboard__actions">
          <button
            type="button"
            className="lv-onboard__cta"
            disabled={!canContinue}
            onClick={phase === "profile" ? saveProfileStep : saveInterestsStep}
          >
            <span>{t("onboardContinue")}</span>
            <ArrowRight aria-hidden />
          </button>
        </div>
      </div>
    </div>
  )
}

/** Whether the guided wizard should run instead of the full welcome hub. */
export function shouldRunGuidedFlow(profile: StoredUserProfile): boolean {
  return computePhases(profile).length > 0
}
