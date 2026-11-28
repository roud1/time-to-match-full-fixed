"use client"

import { useEffect, useRef, type RefObject } from "react"
import { FACES_APART, KAIRO_MARK, PARTICLE_COUNT } from "./particles-data"

/**
 * Home-page animation (full screen, behind the content): emerald particles drift across the
 * whole start screen, stream into two profiles, the profiles glide towards each other and meet
 * in a slow kiss with a warm glow, then re-form into the Kairo heart-hourglass and scatter
 * across the screen again. Two light arcs rotate around the scene.
 *
 * The scene is centred on `anchorRef` (the free area between headline and timer card).
 * Canvas 2D; pauses when hidden; draws fewer particles on a device that cannot keep up;
 * with "reduce motion" a single still frame (the mark) is drawn.
 */

type Pt = { x: number; y: number; b: number }

function decode(b64: string): Pt[] {
  const bin = atob(b64)
  const out: Pt[] = []
  for (let i = 0; i + 2 < bin.length; i += 3) {
    out.push({
      x: (bin.charCodeAt(i) / 255) * 2 - 1 + (Math.random() - 0.5) / 255,
      y: (bin.charCodeAt(i + 1) / 255) * 2 - 1 + (Math.random() - 0.5) / 255,
      b: bin.charCodeAt(i + 2) / 255,
    })
  }
  return out
}

/* Timeline (seconds). States: S = scattered over the screen, F = faces, M = Kairo mark. */
const T = {
  gatherFrom: 1.4,
  gatherTo: 3.6,
  approachFrom: 3.6,
  approachTo: 6.6, // the faces glide together (one smooth ease-in-out)
  kissFrom: 5.9,
  kissPeak: 6.9,
  kissTo: 8.0,
  markFrom: 7.6,
  markTo: 9.2,
  scatterFrom: 10.6,
  scatterTo: 12.4,
  loop: 12.8,
}
/** How far each face glides towards the other (scene units): the profiles just meet. */
const APPROACH = 0.152

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const smooth = (t: number) => t * t * (3 - 2 * t)
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
const range = (t: number, a: number, b: number) => clamp01((t - a) / (b - a))

export function ParticleScene({
  className,
  anchorRef,
}: {
  className?: string
  anchorRef: RefObject<HTMLElement | null>
}) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext("2d", { alpha: true })
    if (!ctx) return

    const faces = decode(FACES_APART)
    const mark = decode(KAIRO_MARK)
    const n = PARTICLE_COUNT

    let seed = 7
    const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646

    // Scattered state: anywhere on the screen (fractions of the viewport), dim.
    const sx = Float32Array.from({ length: n }, () => rnd())
    const sy = Float32Array.from({ length: n }, () => rnd())
    const sb = Float32Array.from({ length: n }, () => 0.22 + rnd() * 0.45)
    // The man's profile is the left part of the face cloud, the woman's the right part.
    const side = Int8Array.from(faces, (p) => (p.x < -0.02 ? -1 : 1))
    // Where the lips meet: between the two profile tips (nose / lips band), after the approach.
    let tipMan = -1
    let tipWoman = 1
    let tipY = 0
    for (let i = 0; i < n; i++) {
      const p = faces[i]
      if (p.y < -0.05 || p.y > 0.35) continue
      if (side[i] < 0 && p.x > tipMan) {
        tipMan = p.x
        tipY = p.y
      }
      if (side[i] > 0 && p.x < tipWoman) tipWoman = p.x
    }
    const kissAt = { x: (tipMan + tipWoman) / 2, y: tipY + 0.07 }
    const markPts = mark.map((p) => ({ x: p.x * 0.42, y: p.y * 0.42 - 0.02, b: 0.55 + p.b * 0.45 }))
    const delay = Float32Array.from({ length: n }, () => rnd())
    const phase = Float32Array.from({ length: n }, () => rnd() * Math.PI * 2)
    const speed = Float32Array.from({ length: n }, () => 0.35 + rnd() * 0.8)
    const size = Float32Array.from({ length: n }, () => 0.7 + Math.pow(rnd(), 4) * 1.1)
    const px = new Float32Array(n)
    const py = new Float32Array(n)
    const pb = new Float32Array(n)

    const sprite = document.createElement("canvas")
    sprite.width = sprite.height = 32
    const sctx = sprite.getContext("2d")!
    const grad = sctx.createRadialGradient(16, 16, 0, 16, 16, 16)
    grad.addColorStop(0, "rgba(190,255,230,1)")
    grad.addColorStop(0.25, "rgba(25,230,160,0.55)")
    grad.addColorStop(1, "rgba(25,230,160,0)")
    sctx.fillStyle = grad
    sctx.fillRect(0, 0, 32, 32)

    let w = 0
    let h = 0
    let dpr = 1
    // Scene centre and radius in canvas pixels (from the anchor element).
    let cx = 0
    let cy = 0
    let R = 0
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      const r = canvas.getBoundingClientRect()
      w = Math.max(1, Math.round(r.width))
      h = Math.max(1, Math.round(r.height))
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      const a = anchorRef.current?.getBoundingClientRect()
      if (a && a.width > 0 && a.height > 0) {
        cx = a.left - r.left + a.width / 2
        cy = a.top - r.top + a.height / 2
        R = Math.min(a.width, a.height) / 2
      } else {
        cx = w / 2
        cy = h / 2
        R = Math.min(w, h) / 3
      }
    }
    resize()

    let stride = 1
    const draw = (time: number) => {
      const t = time % T.loop
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      const scale = R * 0.92
      const sideLen = R * 2

      // Arcs around the scene.
      const rot = (time / 16) * Math.PI * 2
      ctx.lineCap = "round"
      for (const start of [-0.25, Math.PI - 0.25]) {
        const a0 = start + rot
        const len = 0.9
        const g = ctx.createLinearGradient(
          cx + Math.cos(a0) * R * 0.9,
          cy + Math.sin(a0) * R * 0.9,
          cx + Math.cos(a0 + len) * R * 0.9,
          cy + Math.sin(a0 + len) * R * 0.9
        )
        g.addColorStop(0, "rgba(25,230,160,0)")
        g.addColorStop(0.6, "rgba(25,230,160,0.5)")
        g.addColorStop(1, "rgba(200,255,235,0.9)")
        ctx.strokeStyle = g
        ctx.lineWidth = Math.max(1.5, sideLen * 0.008)
        ctx.shadowColor = "rgba(25,230,160,0.8)"
        ctx.shadowBlur = sideLen * 0.04
        ctx.beginPath()
        ctx.arc(cx, cy, R * 0.9, a0, a0 + len)
        ctx.stroke()
      }
      ctx.shadowBlur = 0

      // Phase weights.
      const approach = easeInOut(range(t, T.approachFrom, T.approachTo))
      const toMark = range(t, T.markFrom, T.markTo)
      const toScatter = range(t, T.scatterFrom, T.scatterTo)
      const gather = range(t, T.gatherFrom, T.gatherTo)

      for (let i = 0; i < n; i += stride) {
        // Faces: two rigid profiles gliding towards each other.
        const f = faces[i]
        let x = f.x - side[i] * APPROACH * approach
        let y = f.y
        let b = f.b
        // Per-particle staggered morphs (gather, mark, scatter).
        const d = delay[i] * 0.45
        const g = easeInOut(clamp01((gather - d) / (1 - 0.45)))
        const m = easeInOut(clamp01((toMark - d) / (1 - 0.45)))
        const sc = easeInOut(clamp01((toScatter - d) / (1 - 0.45)))
        const mp = markPts[i]
        x += (mp.x - x) * m
        y += (mp.y - y) * m
        b += (mp.b - b) * m
        // Scene → screen pixels.
        let X = cx + x * scale
        let Y = cy + y * scale
        // Scattered over the whole screen (before gathering / after scattering).
        const scattered = t < T.gatherTo ? 1 - g : sc
        const wob = phase[i] + time * speed[i]
        const sX = sx[i] * w + Math.sin(wob) * 14
        const sY = sy[i] * h + Math.cos(wob * 1.3) * 14
        X += (sX - X) * scattered
        Y += (sY - Y) * scattered
        b += (sb[i] - b) * scattered
        // A faint shimmer while a shape holds.
        X += Math.sin(wob) * 0.6
        Y += Math.cos(wob * 1.3) * 0.6
        px[i] = X
        py[i] = Y
        pb[i] = b
      }

      ctx.globalCompositeOperation = "lighter"
      const unit = sideLen / 380
      for (let band = 0; band < 3; band++) {
        ctx.fillStyle = band === 2 ? "#c8ffe9" : "#19e6a0"
        ctx.globalAlpha = band === 0 ? 0.42 : band === 1 ? 0.78 : 0.9
        for (let i = 0; i < n; i += stride) {
          const bb = pb[i] < 0.33 ? 0 : pb[i] < 0.72 ? 1 : 2
          if (bb !== band) continue
          const s = size[i] * unit * (stride > 1 ? 1.25 : 1)
          ctx.fillRect(px[i] - s / 2, py[i] - s / 2, s, s)
        }
      }
      ctx.globalAlpha = 0.5
      for (let i = 0; i < n; i += 9) {
        if (pb[i] < 0.8) continue
        const d = size[i] * unit * 7
        ctx.drawImage(sprite, px[i] - d / 2, py[i] - d / 2, d, d)
      }
      ctx.globalAlpha = 1

      // Kiss: a soft glow that swells where the lips meet, then fades.
      const glow = (x: number, y: number, r: number, alpha: number) => {
        if (alpha <= 0.001) return
        const gr = ctx.createRadialGradient(x, y, 0, x, y, r)
        gr.addColorStop(0, `rgba(200,255,232,${0.85 * alpha})`)
        gr.addColorStop(0.3, `rgba(25,230,160,${0.42 * alpha})`)
        gr.addColorStop(1, "rgba(25,230,160,0)")
        ctx.fillStyle = gr
        ctx.fillRect(x - r, y - r, r * 2, r * 2)
      }
      const kiss =
        t < T.kissFrom || t > T.kissTo
          ? 0
          : t < T.kissPeak
            ? smooth(range(t, T.kissFrom, T.kissPeak))
            : 1 - smooth(range(t, T.kissPeak, T.kissTo))
      glow(cx + kissAt.x * scale, cy + kissAt.y * scale, sideLen * 0.12, kiss)
      const markGlow = Math.min(range(t, T.markFrom + 0.8, T.markTo + 0.4), 1 - range(t, T.scatterFrom - 0.6, T.scatterFrom + 0.6))
      glow(cx, cy, sideLen * 0.3, 0.32 * markGlow)
      ctx.globalCompositeOperation = "source-over"
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const onResize = () => {
      resize()
      if (reduce) draw(9.8)
    }
    window.addEventListener("resize", onResize)
    if (reduce) {
      draw(9.8)
      return () => window.removeEventListener("resize", onResize)
    }

    let raf = 0
    let running = false
    let last = performance.now()
    let clock = 0
    let frameMs = 16
    let frames = 0
    const loop = (now: number) => {
      const dt = now - last
      clock += Math.min(0.05, dt / 1000)
      last = now
      frameMs = frameMs * 0.9 + dt * 0.1
      if (++frames > 45 && stride < 3 && frameMs > (stride === 1 ? 24 : 30)) {
        stride++
        frames = 0
      }
      draw(clock)
      raf = requestAnimationFrame(loop)
    }
    const start = () => {
      if (running || document.hidden) return
      running = true
      last = performance.now()
      raf = requestAnimationFrame(loop)
    }
    const stop = () => {
      running = false
      cancelAnimationFrame(raf)
    }
    const onVis = () => (document.hidden ? stop() : start())
    document.addEventListener("visibilitychange", onVis)
    // Layout can settle after fonts/images: re-measure the anchor once more.
    const settle = window.setTimeout(resize, 400)
    draw(0)
    start()
    return () => {
      stop()
      window.clearTimeout(settle)
      document.removeEventListener("visibilitychange", onVis)
      window.removeEventListener("resize", onResize)
    }
  }, [anchorRef])

  return <canvas ref={ref} className={className} aria-hidden />
}
