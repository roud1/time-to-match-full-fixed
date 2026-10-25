import { Resend } from "resend"
import nodemailer, { type Transporter } from "nodemailer"
import { log } from "@/server/log"

/**
 * Email transport. Two options (SMTP wins when both are set):
 *  - SMTP:   SMTP_HOST, SMTP_PORT (587 STARTTLS or 465 TLS), SMTP_USER, SMTP_PASS, SMTP_FROM (optional)
 *            works with Gmail (app password), Brevo, Mailgun, Yandex, any provider — no own domain needed.
 *  - Resend: RESEND_API_KEY, RESEND_FROM_EMAIL (needs a verified domain to reach arbitrary recipients).
 */

let resendClient: Resend | null = null
let smtpTransport: Transporter | null = null

function smtpConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST?.trim() && process.env.SMTP_USER?.trim() && process.env.SMTP_PASS)
}

function getSmtp(): Transporter | null {
  if (!smtpConfigured()) return null
  if (!smtpTransport) {
    const port = Number(process.env.SMTP_PORT ?? 587)
    smtpTransport = nodemailer.createTransport({
      host: process.env.SMTP_HOST!.trim(),
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER!.trim(), pass: process.env.SMTP_PASS },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    })
  }
  return smtpTransport
}

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  if (!resendClient) resendClient = new Resend(key)
  return resendClient
}

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const smtp = getSmtp()
  if (smtp) {
    const from = process.env.SMTP_FROM?.trim() || process.env.SMTP_USER!.trim()
    try {
      await smtp.sendMail({ from: `Time to Match <${from}>`, to, subject, html })
      log.info("email_sent", { to, subject, via: "smtp" })
      return true
    } catch (e) {
      log.error("email_send_exception", { to, via: "smtp", err: e instanceof Error ? e.message : String(e) })
      return false
    }
  }

  const resend = getResend()
  if (!resend) {
    log.warn("email_skip_no_provider", { to, subject })
    return false
  }

  const from = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev"
  try {
    const { error } = await resend.emails.send({ from, to, subject, html })
    if (error) {
      log.error("email_send_err", { to, message: error.message })
      return false
    }
    log.info("email_sent", { to, subject, via: "resend" })
    return true
  } catch (e) {
    log.error("email_send_exception", { to, via: "resend", err: e instanceof Error ? e.message : String(e) })
    return false
  }
}

export function isEmailConfigured(): boolean {
  return smtpConfigured() || Boolean(process.env.RESEND_API_KEY)
}
