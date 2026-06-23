/**
 * Manual overrides for strings that machine translation left identical to English
 * or that need premium dating-app tone. Run after i18n:translate.
 */
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const localesDir = path.join(__dirname, "..", "lib/i18n/locales")

/** @type {Record<string, Record<string, string>>} */
const OVERRIDES = {
  uk: {
    adminColReason: "Причина",
    lifeActiveNow: "АКТИВНО ЗАРАЗ ✦",
    lifePeerActiveNow: "АКТИВНО ЗАРАЗ ✦",
    netEventSyncPeakTitle: "Пік синхронізації",
    netEventResonanceTitle: "Емоційний резонанс",
    netEventStableWeekTitle: "Тиждень стабільного зв'язку",
    netEventNightSurgeTitle: "Нічний сплеск енергії",
    netEventDeepCompatTitle: "Глибока сумісність",
    intelStateResonance: "Емоційний резонанс",
    intelStateCognitive: "Когнітивне зближення",
    intelStateAttachment: "Формування прив'язаності",
    intelStateDistance: "Емоційна дистанція",
    intelStateStableRhythm: "Стабільний емоційний ритм",
    datingAiLiveLabel: "Наживо",
    datingPricingFree: "Безкоштовно",
    seconds: "Секунд",
    profileOnline: "В мережі",
    trustBack: "Назад",
    adminColStatus: "Статус",
    swipeMatchWord: "МЕТЧ",
    swipeProfileClose: "Закрити",
    product: "Продукт",
  },
  de: {
    relPersonalityDeepSync: "Tiefer SYNC",
    premiumCompareFree: "Basis",
    datingAiLiveLabel: "Live",
  },
  es: {
    energySteady: "Constante",
    nope: "NO",
    regStepFinish: "Final",
    discoverExpiryHoursShort: "{hours} h",
    expiryNotifMatchFallback: "interlocutor",
    freezePackMedium: "Popular",
  },
  pl: {
    adminColStatus: "Status",
    discoverFiltersKm: "km",
  },
  fr: {
    minutes: "minutes",
    heroUrgent: "Connexion active",
    swipePhotoGoTo: "Photo {n}",
    regStepFinish: "Terminé",
    chatPlaceholder: "Écrivez un message…",
    datingHow2Title: "Discussion",
    datingPreviewChat: "Discussion",
  },
  it: {
    energySteady: "Costante",
    nope: "NO",
    regStepAccount: "Account",
    regPassword: "Password",
    welcomeStepAccount: "Account",
    profileStatTimer: "Timer",
    discoverFiltersKm: "km",
    discoverFiltersReset: "Reimposta",
    settingsAccount: "Account",
    settingsPrivacy: "Privacy",
    datingPreviewTimer: "Timer",
  },
  tr: {
    adminColStatus: "Durum",
    datingAiLiveLabel: "Canlı",
    datingPricingFree: "Ücretsiz",
    relPersonalityDeepSync: "Derin SYNC",
    discoverFiltersKm: "km",
    profileStatTimer: "Sayaç",
    datingPreviewTimer: "Sayaç",
  },
}

let patched = 0
for (const [loc, overrides] of Object.entries(OVERRIDES)) {
  const file = path.join(localesDir, `${loc}.json`)
  const data = JSON.parse(fs.readFileSync(file, "utf8"))
  let n = 0
  for (const [key, value] of Object.entries(overrides)) {
    if (key in data && data[key] !== value) {
      data[key] = value
      n++
    }
  }
  const sorted = Object.fromEntries(Object.keys(data).sort().map((k) => [k, data[k]]))
  fs.writeFileSync(file, JSON.stringify(sorted, null, 2) + "\n", "utf8")
  console.log(`${loc}: patched ${n} keys`)
  patched += n
}
console.log(`Total patched: ${patched}`)
