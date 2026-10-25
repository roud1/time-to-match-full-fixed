import { isEmailConfigured } from "@/server/email/send-email"

/**
 * TEST-STAGE ONLY. While no email provider is configured (no RESEND_API_KEY) nobody can receive a
 * verification link, so sign-in on a second device would be impossible. With AUTO_VERIFY_EMAIL=1 AND
 * no RESEND_API_KEY, new accounts are marked verified immediately. As soon as RESEND_API_KEY is set,
 * real verification applies again even if the flag is still on.
 */
export function shouldAutoVerifyEmail(): boolean {
  return process.env.AUTO_VERIFY_EMAIL === "1" && !isEmailConfigured()
}
