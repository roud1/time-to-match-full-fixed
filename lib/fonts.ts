import { Inter, Onest, Playfair_Display } from "next/font/google"

/** Display headlines — premium serif with Cyrillic */
export const fontDisplay = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  variable: "--font-landing-display",
  display: "swap",
  preload: true,
  weight: ["400", "500", "600", "700"],
})

/** Alias for landing pages */
export const fontLandingDisplay = fontDisplay

/** Latin body — clean SaaS sans (no Cyrillic in Inter) */
export const fontLandingBody = Inter({
  subsets: ["latin"],
  variable: "--font-landing-body",
  display: "swap",
  preload: true,
  weight: ["300", "400", "500", "600", "700"],
})

/** UI body — Cyrillic-capable sans fallback for RU/UK UI */
export const fontBody = Onest({
  subsets: ["latin", "cyrillic"],
  variable: "--font-onest",
  display: "swap",
  preload: true,
  weight: ["300", "400", "500", "600", "700"],
})
