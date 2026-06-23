import type { ShareMoment } from "@/client/lib/shared/share-moments"

const W = 1080
const H = 1920

const STATE_COLORS: Record<string, [string, string]> = {
  growing: ["#6366f1", "#8b5cf6"],
  stable: ["#94a3b8", "#64748b"],
  fading: ["#475569", "#334155"],
  intense: ["#a855f7", "#ec4899"],
  unstable: ["#f59e0b", "#78716c"],
  deepening: ["#7c3aed", "#4f46e5"],
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/** Instagram story–friendly 9:16 PNG from share moment data. */
export async function renderShareMomentPng(moment: ShareMoment): Promise<Blob> {
  const canvas = document.createElement("canvas")
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("canvas_unavailable")

  const [c1, c2] = STATE_COLORS[moment.state] ?? STATE_COLORS.growing
  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, "#050506")
  bg.addColorStop(0.35, c1 + "44")
  bg.addColorStop(0.7, c2 + "33")
  bg.addColorStop(1, "#050506")
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  const glow = ctx.createRadialGradient(W / 2, H * 0.38, 0, W / 2, H * 0.38, W * 0.45)
  glow.addColorStop(0, c1 + "55")
  glow.addColorStop(1, "transparent")
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, W, H)

  ctx.fillStyle = "rgba(255,255,255,0.35)"
  ctx.font = "300 28px system-ui, sans-serif"
  ctx.textAlign = "center"
  ctx.fillText("TIME TO MATCH", W / 2, 120)

  const ringR = 140
  const cx = W / 2
  const cy = H * 0.38
  const ringGrad = ctx.createLinearGradient(cx - ringR, cy, cx + ringR, cy)
  ringGrad.addColorStop(0, c1)
  ringGrad.addColorStop(1, c2)
  ctx.strokeStyle = ringGrad
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.arc(cx, cy, ringR, 0, Math.PI * 2)
  ctx.stroke()

  ctx.fillStyle = "#ffffff"
  ctx.font = "200 96px system-ui, sans-serif"
  ctx.fillText(`${moment.syncPercent}%`, cx, cy + 32)

  ctx.font = "300 52px system-ui, sans-serif"
  ctx.fillStyle = "rgba(255,255,255,0.92)"
  wrapText(ctx, moment.title, cx, H * 0.58, W - 120, 62)

  ctx.font="300 36px system-ui, sans-serif"
  ctx.fillStyle = "rgba(255,255,255,0.55)"
  wrapText(ctx, moment.subtitle, cx, H * 0.66, W - 120, 48)

  ctx.font = "300 32px system-ui, sans-serif"
  ctx.fillStyle = "rgba(255,255,255,0.4)"
  ctx.fillText(moment.partnerName.toUpperCase(), cx, H * 0.78)

  ctx.font = "300 24px system-ui, sans-serif"
  ctx.fillText(`#${moment.hashtag}`, cx, H - 80)

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("blob_failed"))),
      "image/png",
      0.92
    )
  })
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(" ")
  let line = ""
  let yy = y
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, yy)
      line = word
      yy += lineHeight
    } else {
      line = test
    }
  }
  if (line) ctx.fillText(line, x, yy)
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export async function downloadShareMomentPng(moment: ShareMoment, filename = "time-to-match-sync.png") {
  const blob = await renderShareMomentPng(moment)
  downloadBlob(blob, filename)
}
