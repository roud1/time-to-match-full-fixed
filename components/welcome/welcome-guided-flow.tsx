"use client"

import { useCallback, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useI18n } from "@/lib/i18n"
import { OnboardingFlow } from "@/components/onboarding-flow"
import { ProfilePhotoPicker } from "@/components/profile-photo-picker"
import { InterestPicker } from "@/components/interest-picker"
import { MIN_INTERESTS, type InterestId } from "@/lib/interests"
import { getProfilePhotos } from "@/lib/profile-photos"
import {
  updateUserProfile,
  type StoredUserProfile,
} from "@/lib/user-profile"
import { markWelcomeSeen } from "@/lib/welcome-seen"
import { WelcomeProgressSteps } from "@/components/welcome/welcome-progress-steps"
import { computeProfileStrength } from "@/lib/profile-completion"
import { CinematicButton } from "@/components/ui/cinematic-button"
import { CinematicCard } from "@/components/ui/cinematic-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

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
      <CinematicCard variant="glass" className={cn("ttm-brand-glass w-full border border-white/10", className)}>
        <OnboardingFlow
          onComplete={() => {
            markSlidesDone()
            finish()
          }}
        />
      </CinematicCard>
    )
  }

  const stepNum = phaseIndex + 1
  const totalSteps = phases.length

  return (
    <CinematicCard variant="glass" className={cn("ttm-brand-glass w-full border border-white/10 p-6 md:p-8", className)}>
      <WelcomeProgressSteps
        strength={computeProfileStrength(profile)}
        activeStep={
          phase === "profile" || phase === "interests" ? "profile" : phase === "how-it-works" ? "swipe" : "account"
        }
        className="mb-6"
      />
      <p className="p9-register-step-label mb-2">
        {stepNum} / {totalSteps}
      </p>

      {phase === "profile" && (
        <div className="space-y-5">
          <div>
            <h2 className="ttm-brand-gradient-text text-xl font-extralight tracking-tight mb-2">
              {t("guidedStepProfileTitle")}
            </h2>
            <p className="text-sm text-white/50 font-light leading-relaxed">{t("guidedStepProfileSub")}</p>
          </div>
          <div>
            <Label className="text-foreground/80 font-light mb-2 block">{t("regName")}</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-2xl bg-white/[0.04] border-white/10"
              autoComplete="name"
            />
          </div>
          <ProfilePhotoPicker value={photos} onChange={setPhotos} />
          <CinematicButton
            variant="primary"
            className="w-full min-h-[52px]"
            disabled={!name.trim() || photos.length === 0}
            onClick={saveProfileStep}
          >
            {t("onboardContinue")}
          </CinematicButton>
        </div>
      )}

      {phase === "interests" && (
        <div className="space-y-5">
          <div>
            <h2 className="ttm-brand-gradient-text text-xl font-extralight tracking-tight mb-2">
              {t("guidedStepInterestsTitle")}
            </h2>
            <p className="text-sm text-white/50 font-light leading-relaxed">{t("guidedStepInterestsSub")}</p>
          </div>
          <InterestPicker value={interests} onChange={setInterests} />
          <CinematicButton
            variant="primary"
            className="w-full min-h-[52px]"
            disabled={interests.length < MIN_INTERESTS}
            onClick={saveInterestsStep}
          >
            {t("onboardContinue")}
          </CinematicButton>
        </div>
      )}

      <button
        type="button"
        onClick={finish}
        className="w-full mt-4 py-3 text-sm font-light text-white/45 hover:text-white/75 transition-colors touch-manipulation"
      >
        {t("onboardSkip")}
      </button>
    </CinematicCard>
  )
}

/** Whether the guided wizard should run instead of the full welcome hub. */
export function shouldRunGuidedFlow(profile: StoredUserProfile): boolean {
  return computePhases(profile).length > 0
}
