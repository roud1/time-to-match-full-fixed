import { Cormorant_Garamond, Outfit } from "next/font/google"

/** UI body — clean geometric sans (latin); Cyrillic via system fallbacks in CSS */
export const fontBody = Outfit({
  subsets: ["latin", "latin-ext"],
  variable: "--font-outfit",
  display: "swap",
  preload: true,
  weight: ["300", "400", "500", "600", "700"],
})

/** Display headlines — romantic premium serif with Cyrillic */
export const fontDisplay = Cormorant_Garamond({
  subsets: ["latin", "cyrillic"],
  variable: "--font-cormorant",
  display: "swap",
  preload: true,
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
})
