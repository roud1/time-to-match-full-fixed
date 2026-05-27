import { Resend } from "resend"
import { log } from "@/lib/server/log"

let resendClient: Resend | null = null

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  if (!resendClient) resendClient = new Resend(key)
  return resendClient
}

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const resend = getResend()
  if (!resend) {
    log.warn("email_skip_no_resend_key", { to, subject })
    return false
  }

  const from = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev"

  try {
    const { error } = await resend.emails.send({ from, to, subject, html })
    if (error) {
      log.error("email_send_err", { to, message: error.message })
      return false
    }
    log.info("email_sent", { to, subject })
    return true
  } catch (e) {
    log.error("email_send_exception", {
      to,
      err: e instanceof Error ? e.message : String(e),
    })
    return false
  }
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY)
}
