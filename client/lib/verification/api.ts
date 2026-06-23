import type {
  VerificationGesturePrompt,
  VerificationStatusResponse,
} from "@/client/lib/verification/types"

export async function fetchVerificationGesture(): Promise<VerificationGesturePrompt | null> {
  const res = await fetch("/api/verification/gesture", { credentials: "include" })
  if (!res.ok) return null
  return (await res.json()) as VerificationGesturePrompt
}

export async function fetchVerificationStatus(): Promise<VerificationStatusResponse> {
  const res = await fetch("/api/verification/status", { credentials: "include" })
  if (!res.ok) return { verified: false, requestStatus: "none" }
  return (await res.json()) as VerificationStatusResponse
}

export async function submitVerificationSelfie(
  gesture: string,
  file: File
): Promise<{ ok: true } | { ok: false; message: string }> {
  const form = new FormData()
  form.set("gesture", gesture)
  form.set("selfie", file)

  const res = await fetch("/api/verification/submit", {
    method: "POST",
    credentials: "include",
    body: form,
  })

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { message?: string; error?: string }
    return { ok: false, message: data.message ?? data.error ?? "Upload failed" }
  }

  return { ok: true }
}
