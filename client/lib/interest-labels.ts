import type { Locale } from "@/client/lib/i18n/config"

/**
 * Interest names in every app language, keyed by slug (the server `interests.slug` and the icon
 * picker ids). `ru` is also the name stored on the server, so names coming from the API can be
 * translated too.
 */
export const INTEREST_LABELS: Record<string, Record<Locale, string>> = {
  travel: { ru: "Путешествия", uk: "Подорожі", en: "Travel", de: "Reisen", es: "Viajes", pl: "Podróże", fr: "Voyages", it: "Viaggi", tr: "Seyahat" },
  coffee: { ru: "Кофе", uk: "Кава", en: "Coffee", de: "Kaffee", es: "Café", pl: "Kawa", fr: "Café", it: "Caffè", tr: "Kahve" },
  photography: { ru: "Фотография", uk: "Фотографія", en: "Photography", de: "Fotografie", es: "Fotografía", pl: "Fotografia", fr: "Photographie", it: "Fotografia", tr: "Fotoğrafçılık" },
  art: { ru: "Искусство", uk: "Мистецтво", en: "Art", de: "Kunst", es: "Arte", pl: "Sztuka", fr: "Art", it: "Arte", tr: "Sanat" },
  music: { ru: "Музыка", uk: "Музика", en: "Music", de: "Musik", es: "Música", pl: "Muzyka", fr: "Musique", it: "Musica", tr: "Müzik" },
  sports: { ru: "Спорт", uk: "Спорт", en: "Sports", de: "Sport", es: "Deporte", pl: "Sport", fr: "Sport", it: "Sport", tr: "Spor" },
  fitness: { ru: "Фитнес", uk: "Фітнес", en: "Fitness", de: "Fitness", es: "Fitness", pl: "Fitness", fr: "Fitness", it: "Fitness", tr: "Fitness" },
  yoga: { ru: "Йога", uk: "Йога", en: "Yoga", de: "Yoga", es: "Yoga", pl: "Joga", fr: "Yoga", it: "Yoga", tr: "Yoga" },
  cooking: { ru: "Кулинария", uk: "Кулінарія", en: "Cooking", de: "Kochen", es: "Cocina", pl: "Gotowanie", fr: "Cuisine", it: "Cucina", tr: "Yemek yapmak" },
  movies: { ru: "Кино", uk: "Кіно", en: "Movies", de: "Filme", es: "Cine", pl: "Kino", fr: "Cinéma", it: "Cinema", tr: "Sinema" },
  books: { ru: "Книги", uk: "Книги", en: "Books", de: "Bücher", es: "Libros", pl: "Książki", fr: "Livres", it: "Libri", tr: "Kitaplar" },
  nightlife: { ru: "Вечеринки", uk: "Вечірки", en: "Nightlife", de: "Partys", es: "Fiestas", pl: "Imprezy", fr: "Soirées", it: "Feste", tr: "Partiler" },
  nature: { ru: "Природа", uk: "Природа", en: "Nature", de: "Natur", es: "Naturaleza", pl: "Natura", fr: "Nature", it: "Natura", tr: "Doğa" },
  design: { ru: "Дизайн", uk: "Дизайн", en: "Design", de: "Design", es: "Diseño", pl: "Design", fr: "Design", it: "Design", tr: "Tasarım" },
  business: { ru: "Бизнес", uk: "Бізнес", en: "Business", de: "Business", es: "Negocios", pl: "Biznes", fr: "Business", it: "Business", tr: "İş dünyası" },
  gaming: { ru: "Игры", uk: "Ігри", en: "Gaming", de: "Gaming", es: "Videojuegos", pl: "Gry", fr: "Jeux vidéo", it: "Videogiochi", tr: "Oyun" },
  fashion: { ru: "Мода", uk: "Мода", en: "Fashion", de: "Mode", es: "Moda", pl: "Moda", fr: "Mode", it: "Moda", tr: "Moda" },
  pets: { ru: "Животные", uk: "Тварини", en: "Pets", de: "Tiere", es: "Mascotas", pl: "Zwierzęta", fr: "Animaux", it: "Animali", tr: "Hayvanlar" },
  wine: { ru: "Вино", uk: "Вино", en: "Wine", de: "Wein", es: "Vino", pl: "Wino", fr: "Vin", it: "Vino", tr: "Şarap" },
  dance: { ru: "Танцы", uk: "Танці", en: "Dance", de: "Tanzen", es: "Baile", pl: "Taniec", fr: "Danse", it: "Danza", tr: "Dans" },
  // Server-only interests (no icon in the picker)
  auto: { ru: "Авто", uk: "Авто", en: "Cars", de: "Autos", es: "Coches", pl: "Motoryzacja", fr: "Voitures", it: "Auto", tr: "Arabalar" },
  volunteering: { ru: "Волонтёрство", uk: "Волонтерство", en: "Volunteering", de: "Ehrenamt", es: "Voluntariado", pl: "Wolontariat", fr: "Bénévolat", it: "Volontariato", tr: "Gönüllülük" },
  science: { ru: "Наука", uk: "Наука", en: "Science", de: "Wissenschaft", es: "Ciencia", pl: "Nauka", fr: "Science", it: "Scienza", tr: "Bilim" },
  theatre: { ru: "Театр", uk: "Театр", en: "Theatre", de: "Theater", es: "Teatro", pl: "Teatr", fr: "Théâtre", it: "Teatro", tr: "Tiyatro" },
  surfing: { ru: "Сёрфинг", uk: "Серфінг", en: "Surfing", de: "Surfen", es: "Surf", pl: "Surfing", fr: "Surf", it: "Surf", tr: "Sörf" },
  meditation: { ru: "Медитация", uk: "Медитація", en: "Meditation", de: "Meditation", es: "Meditación", pl: "Medytacja", fr: "Méditation", it: "Meditazione", tr: "Meditasyon" },
  startups: { ru: "Стартапы", uk: "Стартапи", en: "Startups", de: "Start-ups", es: "Startups", pl: "Startupy", fr: "Startups", it: "Startup", tr: "Girişimler" },
  podcasts: { ru: "Подкасты", uk: "Подкасти", en: "Podcasts", de: "Podcasts", es: "Podcasts", pl: "Podcasty", fr: "Podcasts", it: "Podcast", tr: "Podcastler" },
  running: { ru: "Бег", uk: "Біг", en: "Running", de: "Laufen", es: "Correr", pl: "Bieganie", fr: "Course à pied", it: "Corsa", tr: "Koşu" },
}

const SLUG_BY_SERVER_NAME = new Map<string, string>(
  Object.entries(INTEREST_LABELS).map(([slug, labels]) => [labels.ru.toLowerCase(), slug])
)

/** Label for a slug in the given language (falls back to English, then the slug). */
export function interestLabelBySlug(slug: string, locale: Locale): string {
  const labels = INTEREST_LABELS[slug]
  return labels ? labels[locale] || labels.en : slug
}

/** Translate an interest name as stored on the server (Russian) or a slug; unknown names pass through. */
export function localizeInterestName(name: string, locale: Locale): string {
  const slug = INTEREST_LABELS[name] ? name : SLUG_BY_SERVER_NAME.get(name.trim().toLowerCase())
  return slug ? interestLabelBySlug(slug, locale) : name
}
