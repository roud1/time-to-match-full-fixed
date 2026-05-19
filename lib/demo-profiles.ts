import type { Locale } from "@/lib/i18n"
import { distanceKm, formatDistance, type GeoPosition } from "@/lib/geo"
import { getCityCoords, getCityLabel, type CityId } from "@/lib/cities"

export const DEMO_SWIPE_KEY = "ttm-demo-swipe"

export type SwipeProfile = {
  id: number
  name: string
  age: number
  location: string
  distance: string
  image: string
  timeLeft: string
  bio: string
  interests: string[]
  lat: number
  lng: number
}

const CITY_IDS: CityId[] = ["kyiv", "lviv", "odesa", "kharkiv", "dnipro", "lviv", "kyiv", "odesa"]

const DEMO_DATA: Record<
  Locale,
  Array<{
    name: string
    bio: string
    interests: string[]
    age: number
    timeLeft: string
    distanceIndex: number
  }>
> = {
  ru: [
    { name: "Алиса", bio: "Люблю путешествия и хороший кофе", interests: ["Путешествия", "Кофе", "Фотография"], age: 25, timeLeft: "71:12:08", distanceIndex: 0 },
    { name: "Максим", bio: "Фотограф. Ищу свою музу", interests: ["Фотография", "Искусство", "Музыка"], age: 28, timeLeft: "68:40:22", distanceIndex: 1 },
    { name: "Виктория", bio: "Архитектор с любовью к искусству", interests: ["Архитектура", "Дизайн", "Йога"], age: 27, timeLeft: "65:05:44", distanceIndex: 2 },
    { name: "Дмитрий", bio: "Предприниматель. Ценю искренность", interests: ["Бизнес", "Спорт", "Путешествия"], age: 26, timeLeft: "62:18:30", distanceIndex: 3 },
    { name: "София", bio: "Бариста и любительница закатов", interests: ["Кофе", "Музыка", "Природа"], age: 24, timeLeft: "58:33:15", distanceIndex: 0 },
    { name: "Артём", bio: "Играю на гитаре, ищу компанию для концертов", interests: ["Музыка", "Кино", "Вечеринки"], age: 29, timeLeft: "54:09:51", distanceIndex: 1 },
    { name: "Мария", bio: "Йога по утрам, вино по вечерам", interests: ["Йога", "Вино", "Книги"], age: 23, timeLeft: "49:27:03", distanceIndex: 2 },
    { name: "Иван", bio: "Люблю готовить и открывать новые места", interests: ["Кулинария", "Путешествия", "Кино"], age: 31, timeLeft: "44:55:40", distanceIndex: 3 },
    { name: "Катя", bio: "Дизайнер интерьеров. Обожаю минимализм", interests: ["Дизайн", "Искусство", "Мода"], age: 26, timeLeft: "39:12:18", distanceIndex: 0 },
    { name: "Олег", bio: "Бегаю марафоны и смотрю сериалы", interests: ["Спорт", "Фитнес", "Кино"], age: 30, timeLeft: "33:48:06", distanceIndex: 1 },
  ],
  uk: [
    { name: "Аліса", bio: "Люблю подорожі та гарну каву", interests: ["Подорожі", "Кава", "Фотографія"], age: 25, timeLeft: "71:12:08", distanceIndex: 0 },
    { name: "Максим", bio: "Фотограф. Шукаю свою музу", interests: ["Фотографія", "Мистецтво", "Музика"], age: 28, timeLeft: "68:40:22", distanceIndex: 1 },
    { name: "Вікторія", bio: "Архітектор з любов'ю до мистецтва", interests: ["Архітектура", "Дизайн", "Йога"], age: 27, timeLeft: "65:05:44", distanceIndex: 2 },
    { name: "Дмитро", bio: "Підприємець. Ціную щирість", interests: ["Бізнес", "Спорт", "Подорожі"], age: 26, timeLeft: "62:18:30", distanceIndex: 3 },
    { name: "Софія", bio: "Бариста та любителька заходів сонця", interests: ["Кава", "Музика", "Природа"], age: 24, timeLeft: "58:33:15", distanceIndex: 0 },
    { name: "Артем", bio: "Граю на гітарі, шукаю компанію на концерти", interests: ["Музика", "Кіно", "Вечірки"], age: 29, timeLeft: "54:09:51", distanceIndex: 1 },
    { name: "Марія", bio: "Йога вранці, вино ввечері", interests: ["Йога", "Вино", "Книги"], age: 23, timeLeft: "49:27:03", distanceIndex: 2 },
    { name: "Іван", bio: "Люблю готувати та відкривати нові місця", interests: ["Кулінарія", "Подорожі", "Кіно"], age: 31, timeLeft: "44:55:40", distanceIndex: 3 },
    { name: "Катя", bio: "Дизайнер інтер'єрів. Обожнюю мінімалізм", interests: ["Дизайн", "Мистецтво", "Мода"], age: 26, timeLeft: "39:12:18", distanceIndex: 0 },
    { name: "Олег", bio: "Бігаю марафони та дивлюсь серіали", interests: ["Спорт", "Фітнес", "Кіно"], age: 30, timeLeft: "33:48:06", distanceIndex: 1 },
  ],
  en: [
    { name: "Alice", bio: "Love traveling and good coffee", interests: ["Travel", "Coffee", "Photography"], age: 25, timeLeft: "71:12:08", distanceIndex: 0 },
    { name: "Max", bio: "Photographer. Looking for my muse", interests: ["Photography", "Art", "Music"], age: 28, timeLeft: "68:40:22", distanceIndex: 1 },
    { name: "Victoria", bio: "Architect with a love for art", interests: ["Architecture", "Design", "Yoga"], age: 27, timeLeft: "65:05:44", distanceIndex: 2 },
    { name: "Dmitry", bio: "Entrepreneur. Value sincerity", interests: ["Business", "Sports", "Travel"], age: 26, timeLeft: "62:18:30", distanceIndex: 3 },
    { name: "Sophie", bio: "Barista and sunset lover", interests: ["Coffee", "Music", "Nature"], age: 24, timeLeft: "58:33:15", distanceIndex: 0 },
    { name: "Artem", bio: "Guitar player looking for concert buddies", interests: ["Music", "Movies", "Nightlife"], age: 29, timeLeft: "54:09:51", distanceIndex: 1 },
    { name: "Maria", bio: "Yoga in the morning, wine in the evening", interests: ["Yoga", "Wine", "Books"], age: 23, timeLeft: "49:27:03", distanceIndex: 2 },
    { name: "Ivan", bio: "Love cooking and discovering new places", interests: ["Cooking", "Travel", "Movies"], age: 31, timeLeft: "44:55:40", distanceIndex: 3 },
    { name: "Kate", bio: "Interior designer. Minimalism fan", interests: ["Design", "Art", "Fashion"], age: 26, timeLeft: "39:12:18", distanceIndex: 0 },
    { name: "Oleg", bio: "Marathon runner and series binger", interests: ["Sports", "Fitness", "Movies"], age: 30, timeLeft: "33:48:06", distanceIndex: 1 },
  ],
}

const FALLBACK_KM = [2, 5, 1, 8, 12, 3, 6, 4, 7, 9]

/** Stable nearby offset (~2–12 km) from a base point for map markers. */
export function offsetPosition(base: GeoPosition, index: number): GeoPosition {
  const angle = ((index * 47) % 360) * (Math.PI / 180)
  const km = 2 + (index % 7) * 1.4
  const dLat = (km / 111) * Math.cos(angle)
  const dLng = (km / (111 * Math.cos((base.lat * Math.PI) / 180))) * Math.sin(angle)
  return { lat: base.lat + dLat, lng: base.lng + dLng }
}

export function enableDemoSwipeDeck() {
  if (typeof window === "undefined") return
  sessionStorage.setItem(DEMO_SWIPE_KEY, "1")
}

export function consumeDemoSwipeDeck(): boolean {
  if (typeof window === "undefined") return false
  const active = sessionStorage.getItem(DEMO_SWIPE_KEY) === "1"
  if (active) sessionStorage.removeItem(DEMO_SWIPE_KEY)
  return active
}

export function buildDemoSwipeProfiles(
  locale: Locale,
  userPosition?: GeoPosition | null
): SwipeProfile[] {
  const data = DEMO_DATA[locale]

  return data.map((profile, index) => {
    const cityId = CITY_IDS[index % CITY_IDS.length]
    const distance =
      userPosition != null
        ? formatDistance(locale, distanceKm(userPosition, getCityCoords(cityId)))
        : formatDistance(locale, FALLBACK_KM[profile.distanceIndex % FALLBACK_KM.length])

    const cityCoords = getCityCoords(cityId)
    const coords = userPosition
      ? offsetPosition(userPosition, index)
      : offsetPosition(cityCoords, index)

    return {
      id: index + 1,
      name: profile.name,
      age: profile.age,
      location: getCityLabel(cityId, locale),
      distance,
      image: `/images/profile-${(index % 4) + 1}.jpg`,
      timeLeft: profile.timeLeft,
      bio: profile.bio,
      interests: profile.interests,
      lat: coords.lat,
      lng: coords.lng,
    }
  })
}
