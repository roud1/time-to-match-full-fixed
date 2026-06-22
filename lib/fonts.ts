import { Inter, Onest, Playfair_Display, Unbounded } from "next/font/google"

/** Landing display — premium serif with Cyrillic */
export const fontLandingDisplay = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  variable: "--font-landing-display",
  display: "swap",
  preload: true,
  weight: ["400", "500", "600", "700"],
})

/** Landing body — clean SaaS sans with Cyrillic */
export const fontLandingBody = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-landing-body",
  display: "swap",
  preload: true,
  weight: ["300", "400", "500", "600", "700"],
})

/** UI body — modern geometric sans with full Cyrillic */
export const fontBody = Onest({
  subsets: ["latin", "cyrillic"],
  variable: "--font-onest",
  display: "swap",
  preload: true,
  weight: ["300", "400", "500", "600", "700"],
})

/** Display headlines — bold futuristic impact with Cyrillic */
export const fontDisplay = Unbounded({
  subsets: ["latin", "cyrillic"],
  variable: "--font-unbounded",
  display: "swap",
  preload: true,
  weight: ["400", "500", "600", "700", "800", "900"],
})
