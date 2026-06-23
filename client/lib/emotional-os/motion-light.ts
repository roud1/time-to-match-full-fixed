import type { EmotionalOrchestration } from "@/client/lib/emotional-os/orchestrator"
import type { AtmosphereNetworkState } from "@/client/lib/emotional-os/atmosphere-network"

/** Final cinematic motion & light pass (Phase 20). */
export type MotionLightPass = {
  softMotion: number
  depthDrift: number
  lightDiffusion: number
  glowAdaptive: number
  blurDepth: number
}

export function deriveMotionLightPass(
  orchestration: EmotionalOrchestration,
  network: AtmosphereNetworkState
): MotionLightPass {
  const pacingMul =
    orchestration.pacing === "surge"
      ? 1.12
      : orchestration.pacing === "still"
        ? 0.78
        : 1

  return {
    softMotion: orchestration.motionScale * pacingMul * 0.92,
    depthDrift: 0.08 + network.waveAmplitude * 0.35,
    lightDiffusion: Math.min(1, 0.25 + orchestration.atmosphereShift * 0.5),
    glowAdaptive: Math.min(1, network.syncAmbience * 0.65 + orchestration.uiDensity * 0.25),
    blurDepth: network.cinematicNight ? 2.5 : 1.2,
  }
}

export function motionLightCss(m: MotionLightPass): Record<string, string> {
  return {
    "--eo-soft-motion": String(m.softMotion),
    "--eo-depth-drift": String(m.depthDrift),
    "--eo-light-diffusion": String(m.lightDiffusion),
    "--eo-glow-adaptive": String(m.glowAdaptive),
    "--eo-blur-depth": String(m.blurDepth),
  }
}
