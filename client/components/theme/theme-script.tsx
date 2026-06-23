import { themeInitScript } from "@/client/lib/theme"

/** Runs before hydration — prevents theme flash */
export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
}
