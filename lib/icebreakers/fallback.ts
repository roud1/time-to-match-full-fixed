import type { Icebreaker } from "@/lib/icebreakers/types"

/** Used when DATABASE_URL is unset or API returns empty. */
export const FALLBACK_ICEBREAKERS: Icebreaker[] = [
  { id: 1, text: "Если бы ты мог оказаться где угодно прямо сейчас — куда?", category: "question" },
  { id: 2, text: "Кофе или чай? От этого зависит наше будущее 😄", category: "funny" },
  { id: 3, text: "Какая песня сейчас играет у тебя в голове?", category: "simple" },
  { id: 4, text: "Твой идеальный выходной — это...?", category: "question" },
  { id: 5, text: "Что бы ты выбрал: уметь летать или быть невидимым?", category: "funny" },
  { id: 6, text: "Книга или фильм? Что последнее тронуло до мурашек?", category: "question" },
  { id: 7, text: "Ты сова или жаворонок? Только честно", category: "simple" },
  { id: 8, text: "Пицца с ананасами: да или нет? От этого многое зависит 😏", category: "funny" },
  { id: 9, text: "Что ты ценишь в людях больше всего?", category: "question" },
  { id: 10, text: "Твой любимый запах? У меня целая теория про это", category: "flirt" },
  {
    id: 11,
    text: "Если бы мы пошли гулять прямо сейчас — куда бы ты меня повёл/повела?",
    category: "flirt",
  },
  { id: 12, text: "Что обычно лежит у тебя на прикроватной тумбочке?", category: "simple" },
  { id: 13, text: "Какая мелочь сделала тебя счастливым на этой неделе?", category: "question" },
  { id: 14, text: "Ты больше по горам или по морю?", category: "simple" },
  { id: 15, text: "Твоё guilty pleasure (стыдное удовольствие)? Я не расскажу 😇", category: "funny" },
  { id: 16, text: "Что ты делаешь, когда никто не видит?", category: "flirt" },
  { id: 17, text: "Какой суперсилой ты бы хотел обладать?", category: "funny" },
  { id: 18, text: "Что для тебя важнее: ум или чувство юмора?", category: "question" },
  { id: 19, text: "Твой любимый способ провести вечер после тяжёлого дня?", category: "simple" },
  {
    id: 20,
    text: "Если бы ты мог поговорить с любым человеком из истории — кто бы это был?",
    category: "question",
  },
]

export function pickRandomIcebreakers(pool: Icebreaker[], count: number): Icebreaker[] {
  const copy = [...pool]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, Math.min(count, copy.length))
}
