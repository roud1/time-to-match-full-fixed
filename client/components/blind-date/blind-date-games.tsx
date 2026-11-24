"use client"

import { useEffect, useState } from "react"
import { Brain, Check, ChevronRight, Dices, Drama, Flame, HeartHandshake, Scale, SkipForward, Sparkles, Wine, X } from "lucide-react"
import { useI18n, type TranslationKey } from "@/client/lib/i18n"
import { gameText, promptText } from "@/client/lib/blind-date-games-text"
import { blindDateApi, type BlindRoom, type GameAnswer, type GameView } from "@/client/lib/blind-date-client"
import { COMPAT_CATEGORY_KEYS, GAME_KEYS, type GameKey } from "@/server/blind-date/games/catalog"

type RoundView = NonNullable<GameView["round"]>

const ICONS: Record<GameKey, typeof Brain> = {
  this_or_that: Scale,
  mind_reader: Brain,
  two_truths: Drama,
  without_masks: HeartHandshake,
  perfect_date: Wine,
  spark: Flame,
  compat: Dices,
}

function fill(text: string, vars: Record<string, string | number>): string {
  return Object.entries(vars).reduce((acc, [k, v]) => acc.replaceAll(`{${k}}`, String(v)), text)
}

function vibrate(pattern: number | number[]) {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(pattern)
  } catch {
    /* not supported */
  }
}

export function BlindGames(props: {
  room: BlindRoom
  now: number
  onRoom: (r: BlindRoom) => void
  onError: (code: string) => void
}) {
  const { room } = props
  const game = room.game
  const [dismissedId, setDismissedId] = useState<string | null>(null)

  if (game && game.status === "active") return <GamePlay {...props} game={game} />
  if (game && game.status !== "active" && dismissedId !== game.id) {
    return <GameSummary room={room} game={game} onClose={() => setDismissedId(game.id)} />
  }
  return <GamePicker room={room} onRoom={props.onRoom} onError={props.onError} />
}

// ───────────────────────── picker ─────────────────────────

function GamePicker({ room, onRoom, onError }: { room: BlindRoom; onRoom: (r: BlindRoom) => void; onError: (c: string) => void }) {
  const { t, locale } = useI18n()
  const text = gameText(locale)
  const [openCompat, setOpenCompat] = useState(false)
  const [busy, setBusy] = useState(false)
  const played = new Set(room.gamesPlayed.map((g) => (g.key === "compat" ? `compat:${g.category}` : g.key)))

  const start = async (key: GameKey, category?: string) => {
    if (busy) return
    setBusy(true)
    const res = await blindDateApi.startGame(room.id, key, category)
    setBusy(false)
    if (res.ok) onRoom(res.data)
    else onError(res.error)
  }

  return (
    <div className="bd-games">
      <p className="bd-games__intro">{t("bdGamesIntro")}</p>
      <ul className="bd-games__list">
        {GAME_KEYS.map((key) => {
          const Icon = ICONS[key]
          const isCompat = key === "compat"
          return (
            <li key={key}>
              <button
                type="button"
                className="bd-gitem"
                disabled={busy}
                aria-expanded={isCompat ? openCompat : undefined}
                onClick={() => (isCompat ? setOpenCompat((v) => !v) : void start(key))}
              >
                <span className="bd-gitem__icon" aria-hidden>
                  <Icon />
                </span>
                <span className="bd-gitem__text">
                  <span className="bd-gitem__title">
                    {text.games[key].title}
                    {played.has(key) && <Check className="bd-gitem__done" aria-label={t("bdGamePlayed")} />}
                  </span>
                  <span className="bd-gitem__desc">{text.games[key].desc}</span>
                </span>
                <ChevronRight className="bd-gitem__chev" aria-hidden />
              </button>
              {isCompat && openCompat && (
                <div className="bd-compat-cats">
                  {COMPAT_CATEGORY_KEYS.map((c) => (
                    <button key={c} type="button" className="bd-chip bd-chip--btn" disabled={busy} onClick={() => void start("compat", c)}>
                      {text.categories[c]}
                      {played.has(`compat:${c}`) && <Check aria-hidden />}
                    </button>
                  ))}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// ───────────────────────── playing ─────────────────────────

function GamePlay({
  room,
  game,
  now,
  onRoom,
  onError,
}: {
  room: BlindRoom
  game: GameView
  now: number
  onRoom: (r: BlindRoom) => void
  onError: (c: string) => void
}) {
  const { t, locale } = useI18n()
  const title = gameText(locale).games[game.key].title
  const round = game.round
  const last = game.history[game.history.length - 1] ?? null
  const [busy, setBusy] = useState(false)

  // A small buzz when a round is revealed as a match.
  useEffect(() => {
    if (last?.matched) vibrate(25)
  }, [last?.index, last?.matched])

  const send = async (answer: GameAnswer) => {
    if (!round || busy) return
    setBusy(true)
    const res = await blindDateApi.answer(room.id, game.id, round.index, answer)
    setBusy(false)
    if (res.ok) onRoom(res.data)
    else onError(res.error)
  }
  const skip = async () => {
    if (!round || busy) return
    setBusy(true)
    const res = await blindDateApi.skipRound(room.id, game.id, round.index)
    setBusy(false)
    if (res.ok) onRoom(res.data)
    else onError(res.error)
  }
  const end = async () => {
    const res = await blindDateApi.endGame(room.id, game.id)
    if (res.ok) onRoom(res.data)
    else onError(res.error)
  }

  const timeLeft = game.roundEndsAt ? Math.max(0, Date.parse(game.roundEndsAt) - now) : null

  return (
    <div className="bd-games bd-play">
      <div className="bd-play__head">
        <span className="bd-play__title">{title}</span>
        <span className="bd-play__step">
          {Math.min(game.current + 1, game.total)} / {game.total}
        </span>
        <button type="button" className="bd-play__end" onClick={() => void end()}>
          <X aria-hidden />
          {t("bdGameEnd")}
        </button>
      </div>
      {timeLeft !== null && (
        <div className="bd-play__timer" aria-hidden>
          <span style={{ width: `${(timeLeft / 15000) * 100}%` }} />
        </div>
      )}

      {last && <LastRound game={game} round={last} peerName={room.peer.name} />}

      {round && (
        <div className="bd-round">
          <RoundBody round={round} peerName={room.peer.name} busy={busy} onAnswer={(a) => void send(a)} />
          {(round.kind === "two_truths" || !round.mine) && (
            <button type="button" className="bd-round__skip" onClick={() => void skip()} disabled={busy}>
              <SkipForward aria-hidden />
              {t("bdGameSkip")}
            </button>
          )}
        </div>
      )}
      {round === null && <p className="bd-round__wait">{t("bdGameFinishing")}</p>}
    </div>
  )
}

function OptionButtons({
  prompt,
  count,
  selected,
  disabled,
  onPick,
}: {
  prompt: string
  count: number
  selected?: number
  disabled: boolean
  onPick: (i: number) => void
}) {
  const { locale } = useI18n()
  const p = promptText(locale, prompt)
  return (
    <div className={`bd-options bd-options--${count === 2 ? "two" : "list"}`}>
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          className={`bd-option${selected === i ? " is-picked" : ""}`}
          disabled={disabled}
          aria-pressed={selected === i}
          onClick={() => onPick(i)}
        >
          {p.o[i] ?? `#${i + 1}`}
        </button>
      ))}
    </div>
  )
}

function RoundBody({
  round,
  peerName,
  busy,
  onAnswer,
}: {
  round: RoundView
  peerName: string
  busy: boolean
  onAnswer: (a: GameAnswer) => void
}) {
  const { t, locale } = useI18n()
  const p = promptText(locale, round.prompt)
  const [self, setSelf] = useState<number | null>(null)
  const [text, setText] = useState("")
  const [statements, setStatements] = useState(["", "", ""])
  const [lie, setLie] = useState<number | null>(null)

  useEffect(() => {
    setSelf(null)
    setText("")
    setStatements(["", "", ""])
    setLie(null)
  }, [round.index])

  const waiting = <p className="bd-round__wait">{fill(t("bdGameWaiting"), { name: peerName })}</p>

  if (round.kind === "choice") {
    return (
      <>
        <p className="bd-round__q">{p.q}</p>
        <OptionButtons prompt={round.prompt} count={round.options} selected={round.mine?.choice} disabled={busy || Boolean(round.mine)} onPick={(i) => onAnswer({ choice: i })} />
        {round.mine && waiting}
      </>
    )
  }

  if (round.kind === "predict") {
    if (round.mine) {
      return (
        <>
          <p className="bd-round__q">{p.q}</p>
          {waiting}
        </>
      )
    }
    return (
      <>
        <p className="bd-round__q">{p.q}</p>
        <p className="bd-round__label">{self === null ? t("bdGameAboutYou") : fill(t("bdGameGuessPeer"), { name: peerName })}</p>
        {self === null ? (
          <OptionButtons prompt={round.prompt} count={round.options} disabled={busy} onPick={(i) => setSelf(i)} />
        ) : (
          <OptionButtons prompt={round.prompt} count={round.options} disabled={busy} onPick={(i) => onAnswer({ choice: self, guess: i })} />
        )}
      </>
    )
  }

  if (round.kind === "open") {
    return (
      <>
        <p className="bd-round__q">{p.q}</p>
        {round.mine ? (
          <>
            <p className="bd-round__mine">“{round.mine.text}”</p>
            {waiting}
          </>
        ) : (
          <form
            className="bd-round__form"
            onSubmit={(e) => {
              e.preventDefault()
              if (text.trim()) onAnswer({ text })
            }}
          >
            <textarea value={text} onChange={(e) => setText(e.target.value)} maxLength={500} rows={3} placeholder={t("bdGameYourAnswer")} aria-label={t("bdGameYourAnswer")} />
            <p className="bd-round__hint">{t("bdGameHiddenUntilBoth")}</p>
            <button type="submit" className="bd-btn bd-btn--primary" disabled={busy || !text.trim()}>
              {t("bdSend")}
            </button>
          </form>
        )}
      </>
    )
  }

  // two_truths
  if (round.author === "me") {
    if (round.mine) return <p className="bd-round__wait">{fill(t("bdGameTTWaitGuess"), { name: peerName })}</p>
    const ready = statements.every((s) => s.trim()) && lie !== null
    return (
      <form
        className="bd-round__form"
        onSubmit={(e) => {
          e.preventDefault()
          if (ready) onAnswer({ statements, lie: lie! })
        }}
      >
        <p className="bd-round__q">{t("bdGameTTWrite")}</p>
        {statements.map((s, i) => (
          <div key={i} className="bd-tt-row">
            <input
              value={s}
              maxLength={160}
              onChange={(e) => setStatements((prev) => prev.map((x, j) => (j === i ? e.target.value : x)))}
              placeholder={fill(t("bdGameTTFact"), { n: i + 1 })}
              aria-label={fill(t("bdGameTTFact"), { n: i + 1 })}
            />
            <label className={`bd-tt-lie${lie === i ? " is-on" : ""}`}>
              <input type="radio" name="bd-lie" checked={lie === i} onChange={() => setLie(i)} />
              {t("bdGameTTLie")}
            </label>
          </div>
        ))}
        <button type="submit" className="bd-btn bd-btn--primary" disabled={busy || !ready}>
          {t("bdSend")}
        </button>
      </form>
    )
  }
  if (!round.statements) return <p className="bd-round__wait">{fill(t("bdGameTTPeerWriting"), { name: peerName })}</p>
  if (round.mine) return waiting
  return (
    <>
      <p className="bd-round__q">{fill(t("bdGameTTGuess"), { name: peerName })}</p>
      <div className="bd-options bd-options--list">
        {round.statements.map((s, i) => (
          <button key={i} type="button" className="bd-option" disabled={busy} onClick={() => onAnswer({ guess: i })}>
            {s}
          </button>
        ))}
      </div>
    </>
  )
}

/** The result of the round that was just completed. */
function LastRound({ game, round, peerName }: { game: GameView; round: GameView["history"][number]; peerName: string }) {
  const { t, locale } = useI18n()
  const p = promptText(locale, round.prompt)
  if (round.skipped) {
    return <p className="bd-last bd-last--muted">{t("bdGameSkipped")}</p>
  }
  const opt = (i?: number) => (i === undefined ? "—" : (p.o[i] ?? `#${i + 1}`))
  let body: React.ReactNode
  if (round.kind === "choice") {
    body = (
      <>
        <span>{t("bdGameYou")}: <b>{opt(round.mine?.choice)}</b></span>
        <span>{peerName}: <b>{opt(round.theirs?.choice)}</b></span>
      </>
    )
  } else if (round.kind === "predict") {
    body = (
      <>
        <span>{fill(t("bdGamePeerIs"), { name: peerName })}: <b>{opt(round.theirs?.choice)}</b></span>
        <span>{t("bdGameYourGuess")}: <b>{opt(round.mine?.guess)}</b></span>
      </>
    )
  } else if (round.kind === "open") {
    body = (
      <>
        <span className="bd-last__q">{p.q}</span>
        <span>{t("bdGameYou")}: “{round.mine?.text}”</span>
        <span>{peerName}: “{round.theirs?.text}”</span>
      </>
    )
  } else {
    const authorAnswer = round.author === "me" ? round.mine : round.theirs
    const guess = round.author === "me" ? round.theirs?.guess : round.mine?.guess
    const lieText = authorAnswer?.statements?.[authorAnswer.lie ?? 0]
    body = (
      <>
        <span>{t("bdGameTTLieWas")}: <b>{lieText}</b></span>
        <span>{guess === authorAnswer?.lie ? t("bdGameTTGuessed") : t("bdGameTTFooled")}</span>
      </>
    )
  }
  const label: TranslationKey | null = round.matched === null ? null : round.matched ? "bdGameMatch" : "bdGameDifferent"
  return (
    <div className={`bd-last${round.matched ? " bd-last--match" : ""}`} key={`${game.id}-${round.index}`}>
      {label && (
        <span className="bd-last__tag">
          {round.matched ? <Sparkles aria-hidden /> : null}
          {t(label)}
        </span>
      )}
      {body}
    </div>
  )
}

// ───────────────────────── summary ─────────────────────────

function GameSummary({ room, game, onClose }: { room: BlindRoom; game: GameView; onClose: () => void }) {
  const { t, locale } = useI18n()
  const text = gameText(locale)
  const r = game.result
  const name = room.peer.name
  let headline: string
  if (game.status === "abandoned" || !r) headline = t("bdGameNoResult")
  else if (r.comparable === 0) headline = fill(t("bdGameAnsweredBoth"), { n: r.answered })
  else headline = fill(t("bdGameScore"), { m: r.matches, n: r.comparable })

  const pdChoices =
    game.key === "perfect_date"
      ? game.history
          .filter((h) => !h.skipped && h.mine?.choice !== undefined && h.mine.choice === h.theirs?.choice)
          .map((h) => promptText(locale, h.prompt).o[h.mine!.choice!])
      : []

  return (
    <div className="bd-games bd-summary">
      <span className="bd-summary__icon" aria-hidden>
        <Sparkles />
      </span>
      <p className="bd-summary__title">
        {text.games[game.key].title}
        {game.category && game.key === "compat" ? ` · ${text.categories[game.category as keyof typeof text.categories]}` : ""}
      </p>
      <p className="bd-summary__score">{headline}</p>
      {game.key === "perfect_date" && pdChoices.length > 0 && (
        <p className="bd-summary__extra">{fill(t("bdGamePerfectDate"), { plan: pdChoices.join(" · ") })}</p>
      )}
      {game.key === "without_masks" &&
        game.history
          .filter((h) => !h.skipped)
          .map((h) => (
            <div key={h.index} className="bd-last">
              <span className="bd-last__q">{promptText(locale, h.prompt).q}</span>
              <span>{t("bdGameYou")}: “{h.mine?.text}”</span>
              <span>{name}: “{h.theirs?.text}”</span>
            </div>
          ))}
      <p className="bd-summary__note">{t("bdGameDisclaimer")}</p>
      <button type="button" className="bd-btn bd-btn--primary" onClick={onClose}>
        <Dices aria-hidden />
        {t("bdGameAnother")}
      </button>
    </div>
  )
}
