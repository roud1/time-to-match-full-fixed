/** Application identity and public URLs. */
export const APP_NAME = "Time to Match" as const
export const APP_SLUG = "time-to-match" as const

export function getAppBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  )
}
