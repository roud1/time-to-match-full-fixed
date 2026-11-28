"use client"

import { useEffect, useRef } from "react"
import { FACES_APART, FACES_TOGETHER, KAIRO_MARK, PARTICLE_COUNT } from "./particles-data"

/**
 * Home-page animation: emerald particles drift, gather into two profiles that move together,
 * glow at the kiss, re-form into the Kairo heart-hourglass and scatter again — under two slowly
 * rotating light arcs. Canvas 2D, one loop (~10 s), pauses when hidden or off-screen, draws fewer
 * particles on a device that cannot keep up; with
 * "reduce motion" a single still frame (the Kairo mark) is drawn.
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

// Timeline (seconds): scatter → faces apart → faces together → kiss → mark → scatter.
const KEYS = [
  { t: 0, set: 0 },
  { t: 1.4, set: 0 },
  { t: 3.2, set: 1 },
  { t: 4.0, set: 1 },
  { t: 5.4, set: 2 },
  { t: 6.4, set: 2 },
  { t: 7.8, set: 3 },
  { t: 9.6, set: 3 },
  { t: 10.8, set: 0 },
] as const
const LOOP = 10.8
const KISS = { at: 5.5, from: 4.9, to: 6.6 }
const MARK_GLOW = { from: 7.6, to: 10.2 }

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

export function ParticleScene({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext("2d", { alpha: true })
    if (!ctx) return

    const apart = decode(FACES_APART)
    const together = decode(FACES_TOGETHER)
    const mark = decode(KAIRO_MARK)
    const n = PARTICLE_COUNT

    // Deterministic per-particle randomness.
    let seed = 7
    const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646

    // Set 0 = scattered cloud, 1 = faces apart, 2 = faces together, 3 = the Kairo mark (smaller, centred).
    const scatter: Pt[] = Array.from({ length: n }, () => {
      const a = rnd() * Math.PI * 2
      const r = 0.25 + Math.pow(rnd(), 0.7) * 0.75
      return { x: Math.cos(a) * r, y: Math.sin(a) * r * 0.85, b: 0.25 + rnd() * 0.45 }
    })
    const markScaled: Pt[] = mark.map((p) => ({ x: p.x * 0.42, y: p.y * 0.42 - 0.02, b: 0.55 + p.b * 0.45 }))
    const sets: Pt[][] = [scatter, apart, together, markScaled]
    const delay = Float32Array.from({ length: n }, () => rnd() * 0.45)
    const phase = Float32Array.from({ length: n }, () => rnd() * Math.PI * 2)
    const speed = Float32Array.from({ length: n }, () => 0.4 + rnd() * 0.9)
    const size = Float32Array.from({ length: n }, () => 0.7 + Math.pow(rnd(), 4) * 1.1)
    // Positions of the current frame (computed once, then drawn in brightness bands).
    const px = new Float32Array(n)
    const py = new Float32Array(n)
    const pb = new Float32Array(n)

    // Pre-rendered soft dot for the brightest particles (cheaper than shadows).
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
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      const r = canvas.getBoundingClientRect()
      w = Math.max(1, Math.round(r.width))
      h = Math.max(1, Math.round(r.height))
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
    }
    resize()

    const segment = (t: number) => {
      for (let k = 0; k < KEYS.length - 1; k++) {
        if (t >= KEYS[k].t && t < KEYS[k + 1].t) return k
      }
      return KEYS.length - 2
    }

    // Adaptive quality: a device that cannot keep up draws every 2nd / 3rd particle.
    let stride = 1
    const draw = (time: number) => {
      const t = time % LOOP
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      const side = Math.min(w, h)
      const cx = w / 2
      const cy = h / 2
      const R = side / 2

      // Rotating arcs (behind the particles).
      const rot = (time / 14) * Math.PI * 2
      ctx.lineCap = "round"
      for (const [start, len] of [
        [-0.25, 0.9],
        [Math.PI - 0.25, 0.9],
      ] as const) {
        const a0 = start + rot
        const g = ctx.createLinearGradient(
          cx + Math.cos(a0) * R * 0.9,
          cy + Math.sin(a0) * R * 0.9,
          cx + Math.cos(a0 + len) * R * 0.9,
          cy + Math.sin(a0 + len) * R * 0.9
        )
        g.addColorStop(0, "rgba(25,230,160,0)")
        g.addColorStop(0.6, "rgba(25,230,160,0.55)")
        g.addColorStop(1, "rgba(200,255,235,0.95)")
        ctx.strokeStyle = g
        ctx.lineWidth = Math.max(1.5, side * 0.008)
        ctx.shadowColor = "rgba(25,230,160,0.8)"
        ctx.shadowBlur = side * 0.04
        ctx.beginPath()
        ctx.arc(cx, cy, R * 0.9, a0, a0 + len)
        ctx.stroke()
      }
      ctx.shadowBlur = 0

      // Particles.
      const k = segment(t)
      const k0 = KEYS[k]
      const k1 = KEYS[k + 1]
      const from = sets[k0.set]
      const to = sets[k1.set]
      const span = k1.t - k0.t
      const moving = k0.set !== k1.set
      const scale = R * 0.92
      const local = moving ? (t - k0.t) / span : 1
      for (let i = 0; i < n; i += stride) {
        const p = moving ? ease(Math.min(1, Math.max(0, (local - delay[i] * 0.6) / (1 - 0.45 * 0.6)))) : 1
        const a = from[i]
        const b = to[i]
        // Drift: strong while scattered, a faint shimmer while a shape holds.
        const scattered = (k0.set === 0 ? 1 - p : 0) + (k1.set === 0 ? p : 0)
        const loose = 0.06 + 0.94 * scattered
        const wob = phase[i] + time * speed[i]
        px[i] = cx + (a.x + (b.x - a.x) * p + Math.sin(wob) * 0.02 * loose) * scale
        py[i] = cy + (a.y + (b.y - a.y) * p + Math.cos(wob * 1.3) * 0.02 * loose) * scale
        pb[i] = a.b + (b.b - a.b) * p
      }
      ctx.globalCompositeOperation = "lighter"
      // Most particles are tiny squares drawn in three brightness bands (few state changes);
      // only the brightest few get the soft glow sprite.
      const unit = side / 380
      for (let band = 0; band < 3; band++) {
        ctx.fillStyle = band === 2 ? "#c8ffe9" : "#19e6a0"
        ctx.globalAlpha = band === 0 ? 0.45 : band === 1 ? 0.8 : 0.9
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

      // Kiss glow and the mark's halo.
      const glow = (x: number, y: number, r: number, alpha: number) => {
        if (alpha <= 0) return
        const g = ctx.createRadialGradient(x, y, 0, x, y, r)
        g.addColorStop(0, `rgba(190,255,230,${0.9 * alpha})`)
        g.addColorStop(0.3, `rgba(25,230,160,${0.45 * alpha})`)
        g.addColorStop(1, "rgba(25,230,160,0)")
        ctx.fillStyle = g
        ctx.fillRect(x - r, y - r, r * 2, r * 2)
      }
      const bell = (from: number, at: number, to: number) =>
        t < from || t > to ? 0 : t < at ? (t - from) / (at - from) : 1 - (t - at) / (to - at)
      glow(cx - 0.06 * scale, cy + 0.36 * scale, side * 0.15, bell(KISS.from, KISS.at, KISS.to))
      glow(cx, cy, side * 0.3, 0.35 * bell(MARK_GLOW.from, (MARK_GLOW.from + MARK_GLOW.to) / 2, MARK_GLOW.to))
      ctx.globalCompositeOperation = "source-over"
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduce) {
      draw(8.6)
      const onResize = () => {
        resize()
        draw(8.6)
      }
      window.addEventListener("resize", onResize)
      return () => window.removeEventListener("resize", onResize)
    }

    let raf = 0
    let running = false
    let visible = true
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
      if (running || document.hidden || !visible) return
      running = true
      last = performance.now()
      raf = requestAnimationFrame(loop)
    }
    const stop = () => {
      running = false
      cancelAnimationFrame(raf)
    }
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible) start()
      else stop()
    })
    io.observe(canvas)
    const onVis = () => (document.hidden ? stop() : start())
    document.addEventListener("visibilitychange", onVis)
    const onResize = () => resize()
    window.addEventListener("resize", onResize)
    draw(0)
    start()
    return () => {
      stop()
      io.disconnect()
      document.removeEventListener("visibilitychange", onVis)
      window.removeEventListener("resize", onResize)
    }
  }, [])

  return <canvas ref={ref} className={className} aria-hidden />
}
