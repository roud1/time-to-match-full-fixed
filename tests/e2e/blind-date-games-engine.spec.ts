import { test, expect } from "@playwright/test"
import { GAMES, GAME_KEYS, PROMPT_OPTIONS, COMPAT_CATEGORY_KEYS } from "../../server/blind-date/games/catalog"
import { applyAnswer, newGameState, skipRound, summarize, tick, viewFor, type GameState } from "../../server/blind-date/games/engine"
import texts from "../../client/lib/blind-date-games-text.json"

/** Pure engine rules (no server needed). */

const t0 = new Date("2026-01-01T10:00:00Z")
const seq = () => 0.42

function play(state: GameState, side: "a" | "b", answer: object) {
  const r = applyAnswer(state, side, state.current, answer, t0)
  if (!r.ok) throw new Error(r.code)
  return r.state
}

test.describe("Blind Date game engine", () => {
  test("choice rounds stay hidden until both answered, then advance and score", () => {
    let s = newGameState(GAMES.this_or_that.build({ random: seq }), t0)
    expect(s.rounds).toHaveLength(5)
    s = play(s, "a", { choice: 0 })
    // B's view of the current round shows that A answered, never what.
    const viewB = viewFor({ id: "g", key: "this_or_that", status: "active", state: s, result: null }, "b")
    expect(viewB.round?.peerAnswered).toBe(true)
    expect(JSON.stringify(viewB.round)).not.toContain('"choice":0')
    expect(s.current).toBe(0)
    s = play(s, "b", { choice: 0 })
    expect(s.current).toBe(1)
    const viewA = viewFor({ id: "g", key: "this_or_that", status: "active", state: s, result: null }, "a")
    expect(viewA.history[0]).toMatchObject({ matched: true, mine: { choice: 0 }, theirs: { choice: 0 } })
    s = play(s, "a", { choice: 1 })
    s = play(s, "b", { choice: 0 })
    s = skipRound(s, 2, t0).ok ? (skipRound(s, 2, t0) as { state: GameState }).state : s
    for (let i = 0; i < 2; i++) {
      s = play(s, "a", { choice: 1 })
      s = play(s, "b", { choice: 1 })
    }
    expect(summarize(s)).toEqual({ answered: 4, comparable: 4, matches: 3 })
  })

  test("invalid and repeated answers are rejected", () => {
    const s = newGameState(GAMES.this_or_that.build({ random: seq }), t0)
    expect(applyAnswer(s, "a", 0, { choice: 2 }, t0)).toMatchObject({ ok: false, code: "invalid_answer" })
    expect(applyAnswer(s, "a", 1, { choice: 0 }, t0)).toMatchObject({ ok: false, code: "wrong_round" })
    const s2 = play(s, "a", { choice: 1 })
    expect(applyAnswer(s2, "a", 0, { choice: 0 }, t0)).toMatchObject({ ok: false, code: "already_answered" })
  })

  test("mind reader scores each correct guess", () => {
    let s = newGameState(GAMES.mind_reader.build({ random: seq }), t0)
    s = play(s, "a", { choice: 0, guess: 2 })
    s = play(s, "b", { choice: 2, guess: 1 })
    const r = summarize(s)
    expect(r.comparable).toBe(2)
    expect(r.matches).toBe(1) // A guessed B (2), B missed A (0)
  })

  test("two truths: the guesser never sees which statement is the lie", () => {
    let s = newGameState(GAMES.two_truths.build({ random: seq }), t0)
    expect(applyAnswer(s, "b", 0, { guess: 0 }, t0)).toMatchObject({ ok: false, code: "not_your_turn" })
    s = play(s, "a", { statements: ["I lived in Lisbon", "I have a cat", "I can fly a plane"], lie: 2 })
    const viewB = viewFor({ id: "g", key: "two_truths", status: "active", state: s, result: null }, "b")
    expect(viewB.round?.statements).toEqual(["I lived in Lisbon", "I have a cat", "I can fly a plane"])
    expect(JSON.stringify(viewB)).not.toContain('"lie"')
    s = play(s, "b", { guess: 2 })
    expect(s.current).toBe(1)
    expect(s.rounds[1].author).toBe("b")
    // Contact details are blocked here too.
    expect(applyAnswer(s, "b", 1, { statements: ["a", "my insta @someone_x", "c"], lie: 0 }, t0)).toMatchObject({
      ok: false,
      code: "contact_details",
    })
  })

  test("open answers are moderated and revealed together", () => {
    let s = newGameState(GAMES.without_masks.build({ random: seq }), t0)
    expect(applyAnswer(s, "a", 0, { text: "call me +49 151 23456789" }, t0)).toMatchObject({ ok: false, code: "contact_details" })
    s = play(s, "a", { text: "Finishing a marathon" })
    const viewB = viewFor({ id: "g", key: "without_masks", status: "active", state: s, result: null }, "b")
    expect(JSON.stringify(viewB)).not.toContain("marathon")
    s = play(s, "b", { text: "Learning Italian" })
    const viewA = viewFor({ id: "g", key: "without_masks", status: "active", state: s, result: null }, "a")
    expect(viewA.history[0].theirs?.text).toBe("Learning Italian")
  })

  test("spark rounds time out after 15 seconds", () => {
    const s = newGameState(GAMES.spark.build({ random: seq }), t0, { roundSeconds: 15 })
    expect(tick(s, new Date(t0.getTime() + 10_000))).toBe(s)
    const after = tick(s, new Date(t0.getTime() + 31_000))
    expect(after.current).toBe(2)
    expect(after.records[0].skipped && after.records[1].skipped).toBe(true)
  })

  test("every prompt has texts with the right number of options in all 9 languages", () => {
    const all = texts as Record<string, { games: Record<string, unknown>; categories: Record<string, string>; prompts: Record<string, { q: string; o: string[] }> }>
    expect(Object.keys(all).sort()).toEqual(["de", "en", "es", "fr", "it", "pl", "ru", "tr", "uk"])
    for (const [lang, text] of Object.entries(all)) {
      for (const key of GAME_KEYS) expect(text.games[key], `${lang} ${key}`).toBeTruthy()
      for (const c of COMPAT_CATEGORY_KEYS) expect(text.categories[c], `${lang} ${c}`).toBeTruthy()
      for (const [prompt, count] of Object.entries(PROMPT_OPTIONS)) {
        const p = text.prompts[prompt]
        expect(p?.q, `${lang} ${prompt}`).toBeTruthy()
        if (prompt !== "tt") expect(p.o.length, `${lang} ${prompt} options`).toBe(count)
      }
    }
  })
})
