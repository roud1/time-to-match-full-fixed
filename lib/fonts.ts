import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google"

/** Body copy — modern romantic sans */
export const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-plus-jakarta",
  display: "swap",
  preload: true,
  weight: ["400", "500", "600", "700"],
})

/** Display headlines — romantic serif */
export const playfair = Playfair_Display({
  subsets: ["latin", "latin-ext"],
  variable: "--font-playfair",
  display: "swap",
  preload: true,
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
})
