import { Onest, Unbounded } from "next/font/google"

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
