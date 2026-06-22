import { Cormorant_Garamond, Outfit } from "next/font/google"

/** UI body — clean geometric sans with Cyrillic */
export const fontBody = Outfit({
  // @ts-expect-error Outfit ships Cyrillic on Google Fonts; next/font subset types are incomplete
  subsets: ["latin", "cyrillic"],
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
