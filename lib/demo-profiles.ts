import type { Locale } from "@/lib/i18n"
import type { CommonInterest } from "@/lib/interests/types"
import { demoProfileGenderFromIndex } from "@/lib/swipe-gender-filter"
import { distanceKm, formatDistance, type GeoPosition } from "@/lib/geo"
import { getCityCoords, getCityLabel, type CityId } from "@/lib/cities"

export const DEMO_SWIPE_KEY = "ttm-demo-swipe"

export type SwipeProfile = {
  id: number
  name: string
  age: number
  gender: "male" | "female"
  location: string
  distance: string
  image: string
  /** Gallery photos (first item matches `image`). */
  images: string[]
  timeLeft: string
  bio: string
  interests: string[]
  lat: number
  lng: number
  /** Interest overlap 0–100 (API or client). */
  compatibility?: number
  commonInterests?: CommonInterest[]
  /** Source user id when loaded from API. */
  userId?: string
  /** Server photo verification badge. */
  photoVerified?: boolean
  /** Longer about text for discover full card. */
  about?: string
}

const CITY_IDS: CityId[] = ["kyiv", "lviv", "odesa", "kharkiv", "dnipro", "lviv", "kyiv", "odesa"]

const DEMO_DATA: Partial<
  Record<
    Locale,
    Array<{
      name: string
      bio: string
      interests: string[]
      age: number
      timeLeft: string
      distanceIndex: number
    }>
  >
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
    { name: "Настя", bio: "Рисую акварелью и ищу вдохновение", interests: ["Искусство", "Природа", "Кофе"], age: 22, timeLeft: "31:20:44", distanceIndex: 2 },
    { name: "Роман", bio: "Стартапер. Люблю длинные прогулки", interests: ["Бизнес", "Путешествия", "Книги"], age: 27, timeLeft: "28:55:12", distanceIndex: 3 },
    { name: "Лера", bio: "Танцую сальсу, мечтаю о море", interests: ["Танцы", "Музыка", "Путешествия"], age: 25, timeLeft: "26:40:08", distanceIndex: 0 },
    { name: "Павел", bio: "Инженер и любитель настолок", interests: ["Игры", "Кино", "Кофе"], age: 29, timeLeft: "24:18:33", distanceIndex: 1 },
    { name: "Даша", bio: "Маркетолог. Обожаю креатив", interests: ["Дизайн", "Мода", "Кофе"], age: 24, timeLeft: "22:07:19", distanceIndex: 2 },
    { name: "Кирилл", bio: "Серфинг по выходным", interests: ["Спорт", "Природа", "Путешествия"], age: 28, timeLeft: "19:52:41", distanceIndex: 3 },
    { name: "Анна", bio: "Ветеринар. Мягкая и внимательная", interests: ["Животные", "Природа", "Книги"], age: 26, timeLeft: "17:33:55", distanceIndex: 0 },
    { name: "Глеб", bio: "Диджей вечеринок", interests: ["Музыка", "Вечеринки", "Кино"], age: 27, timeLeft: "15:11:28", distanceIndex: 1 },
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
    { name: "Настя", bio: "Малюю аквареллю й шукаю натхнення", interests: ["Мистецтво", "Природа", "Кава"], age: 22, timeLeft: "31:20:44", distanceIndex: 2 },
    { name: "Роман", bio: "Стартапер. Люблю довгі прогулянки", interests: ["Бізнес", "Подорожі", "Книги"], age: 27, timeLeft: "28:55:12", distanceIndex: 3 },
    { name: "Лера", bio: "Танцюю сальсу, мрію про море", interests: ["Танці", "Музика", "Подорожі"], age: 25, timeLeft: "26:40:08", distanceIndex: 0 },
    { name: "Павло", bio: "Інженер і любитель настільних ігор", interests: ["Ігри", "Кіно", "Кава"], age: 29, timeLeft: "24:18:33", distanceIndex: 1 },
    { name: "Даша", bio: "Маркетолог. Обожнюю креатив", interests: ["Дизайн", "Мода", "Кава"], age: 24, timeLeft: "22:07:19", distanceIndex: 2 },
    { name: "Кирило", bio: "Серфінг на вихідних", interests: ["Спорт", "Природа", "Подорожі"], age: 28, timeLeft: "19:52:41", distanceIndex: 3 },
    { name: "Анна", bio: "Ветеринар. М'яка й уважна", interests: ["Тварини", "Природа", "Книги"], age: 26, timeLeft: "17:33:55", distanceIndex: 0 },
    { name: "Гліб", bio: "Діджей вечірок", interests: ["Музика", "Вечірки", "Кіно"], age: 27, timeLeft: "15:11:28", distanceIndex: 1 },
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
    { name: "Nastya", bio: "Watercolor artist seeking inspiration", interests: ["Art", "Nature", "Coffee"], age: 22, timeLeft: "31:20:44", distanceIndex: 2 },
    { name: "Roman", bio: "Startup founder. Love long walks", interests: ["Business", "Travel", "Books"], age: 27, timeLeft: "28:55:12", distanceIndex: 3 },
    { name: "Lera", bio: "Salsa dancer dreaming of the sea", interests: ["Dance", "Music", "Travel"], age: 25, timeLeft: "26:40:08", distanceIndex: 0 },
    { name: "Paul", bio: "Engineer and board-game fan", interests: ["Games", "Movies", "Coffee"], age: 29, timeLeft: "24:18:33", distanceIndex: 1 },
    { name: "Dasha", bio: "Marketer. Creative soul", interests: ["Design", "Fashion", "Coffee"], age: 24, timeLeft: "22:07:19", distanceIndex: 2 },
    { name: "Kirill", bio: "Weekend surfer", interests: ["Sports", "Nature", "Travel"], age: 28, timeLeft: "19:52:41", distanceIndex: 3 },
    { name: "Anna", bio: "Vet. Gentle and attentive", interests: ["Animals", "Nature", "Books"], age: 26, timeLeft: "17:33:55", distanceIndex: 0 },
    { name: "Gleb", bio: "Party DJ", interests: ["Music", "Nightlife", "Movies"], age: 27, timeLeft: "15:11:28", distanceIndex: 1 },
  ],
}

const FALLBACK_KM = [2, 5, 1, 8, 12, 3, 6, 4, 7, 9]

const ABOUT_TAIL: Partial<Record<Locale, string[]>> = {
  ru: [
    "Открыта к встречам и долгим разговорам.",
    "Ценю юмор, честность и живой диалог.",
    "Ищу человека, с кем легко молчать и говорить.",
    "Люблю спонтанные планы и тёплые вечера.",
    "Важны эмпатия и общие ритуалы.",
    "Готова удивлять и удивляться.",
    "Свободна вечером — напиши первым.",
    "Верю в химию, а не в идеальные анкеты.",
    "Собираю моменты, а не галочки.",
    "Хочу связь, где оба растут.",
  ],
  uk: [
    "Відкрита до зустрічей і довгих розмов.",
    "Ціную гумор, чесність і живий діалог.",
    "Шукаю людину, з якою легко мовчати й говорити.",
    "Люблю спонтанні плани й теплі вечори.",
    "Важливі емпатія й спільні ритуали.",
    "Готова дивувати й дивуватися.",
    "Вільна ввечері — напиши першим.",
    "Вірю в хімію, а не в ідеальні анкети.",
    "Збираю моменти, а не галочки.",
    "Хочу зв'язок, де обидва ростуть.",
  ],
  en: [
    "Open to meetups and long conversations.",
    "I value humor, honesty, and real dialogue.",
    "Looking for someone easy to talk and be quiet with.",
    "Love spontaneous plans and warm evenings.",
    "Empathy and shared rituals matter to me.",
    "Ready to surprise and be surprised.",
    "Free most evenings — say hi first.",
    "I believe in chemistry, not perfect profiles.",
    "Collecting moments, not checkboxes.",
    "I want a connection where we both grow.",
  ],
}

function buildProfileAbout(locale: Locale, bio: string, index: number): string {
  const tails = ABOUT_TAIL[locale] ?? ABOUT_TAIL.en ?? []
  const tail = tails[index % tails.length] ?? ""
  return tail ? `${bio} ${tail}` : bio
}

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
  const data = DEMO_DATA[locale] ?? DEMO_DATA.en ?? []

  return data.map((profile, index) => {
    const cityId = CITY_IDS[index % CITY_IDS.length]
    const cityCoords = getCityCoords(cityId)
    const distance =
      userPosition != null && cityCoords != null
        ? formatDistance(locale, distanceKm(userPosition, cityCoords))
        : formatDistance(locale, FALLBACK_KM[profile.distanceIndex % FALLBACK_KM.length])

    const anchor = userPosition ?? cityCoords ?? { lat: 50.45, lng: 30.52 }
    const coords = offsetPosition(anchor, index)

    const slot = ((index * 3 + profile.distanceIndex) % 4) + 1
    const images = [
      `/images/profile-${slot}.jpg`,
      `/images/profile-${(slot % 4) + 1}.jpg`,
      `/images/profile-${((slot + 1) % 4) + 1}.jpg`,
    ]

    return {
      id: index + 1,
      name: profile.name,
      age: profile.age,
      gender: demoProfileGenderFromIndex(index),
      location: getCityLabel(cityId, locale),
      distance,
      image: images[0],
      images,
      timeLeft: profile.timeLeft,
      bio: profile.bio,
      about: buildProfileAbout(locale, profile.bio, index),
      interests: profile.interests,
      lat: coords.lat,
      lng: coords.lng,
    }
  })
}
