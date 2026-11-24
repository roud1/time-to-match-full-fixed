"use client"

import "./blind-date.css"
import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  ArrowLeft,
  Clock,
  Eye,
  EyeOff,
  Flag,
  Heart,
  HeartHandshake,
  LogOut,
  MessageCircle,
  MoreHorizontal,
  Send,
  ShieldCheck,
  Sparkles,
  VenetianMask,
  X,
} from "lucide-react"
import { useI18n, type TranslationKey } from "@/client/lib/i18n"
import { interestLabelBySlug } from "@/client/lib/interest-labels"
import { blindDateApi, type BlindRoom, type BlindState } from "@/client/lib/blind-date-client"

type View = "loading" | "intro" | "searching" | "room"

const SEARCH_POLL_MS = 3000
const ROOM_POLL_MS = 2000
const REPORT_REASONS: TranslationKey[] = [
  "trustReportHarassment",
  "trustReportSpam",
  "trustReportFake",
  "trustReportInappropriate",
  "trustReportOther",
]

function fill(text: string, vars: Record<string, string | number>): string {
  return Object.entries(vars).reduce((acc, [k, v]) => acc.replaceAll(`{${k}}`, String(v)), text)
}

function mmss(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, "0")}`
}

function vibrate(pattern: number | number[]) {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(pattern)
  } catch {
    /* not supported */
  }
}

export function BlindDatePage() {
  const { t, locale } = useI18n()
  const [view, setView] = useState<View>("loading")
  const [state, setState] = useState<BlindState | null>(null)
  const [room, setRoom] = useState<BlindRoom | null>(null)
  const [roomId, setRoomId] = useState<string | null>(null)
  const [searchSince, setSearchSince] = useState<number | null>(null)
  const [alsoEnglish, setAlsoEnglish] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [offline, setOffline] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const [clockOffset, setClockOffset] = useState(0)
  const version = useRef(0)

  const languages = useMemo(() => (alsoEnglish && locale !== "en" ? ["en"] : []), [alsoEnglish, locale])

  // ── initial state + reconnection ──
  const loadState = useCallback(async () => {
    const res = await blindDateApi.state()
    if (!res.ok) {
      setOffline(res.status === 0)
      setView("intro")
      return
    }
    setState(res.data)
    if (res.data.state === "in_room" && res.data.roomId) {
      setRoomId(res.data.roomId)
      setView("room")
    } else if (res.data.state === "searching") {
      setSearchSince(res.data.since ? Date.parse(res.data.since) : Date.now())
      setView("searching")
    } else {
      setView("intro")
    }
  }, [])

  useEffect(() => {
    void loadState()
  }, [loadState])

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 500)
    return () => window.clearInterval(id)
  }, [])

  // ── searching: keep the queue entry alive and pick up the match ──
  const join = useCallback(async () => {
    setError(null)
    const res = await blindDateApi.join(locale, languages)
    if (!res.ok) {
      if (res.status === 403) {
        setState((s) => (s ? { ...s, eligible: false, reason: res.error as BlindState["reason"] } : s))
        setView("intro")
      } else if (res.status === 0) {
        setOffline(true)
      }
      return
    }
    setOffline(false)
    const data = res.data
    if (data.state === "matched") {
      vibrate([30, 40, 30])
      version.current = 0
      setRoom(null)
      setRoomId(data.roomId)
      setView("room")
    } else {
      setSearchSince((s) => s ?? Date.parse(data.since))
      setView("searching")
    }
  }, [locale, languages])

  useEffect(() => {
    if (view !== "searching") return
    const id = window.setInterval(() => void join(), SEARCH_POLL_MS)
    return () => window.clearInterval(id)
  }, [view, join])

  const startSearch = async () => {
    setSearchSince(Date.now())
    setView("searching")
    await join()
  }

  const cancelSearch = async () => {
    await blindDateApi.cancel()
    setSearchSince(null)
    setView("intro")
  }

  // ── room polling ──
  const applyRoom = useCallback((next: BlindRoom) => {
    setClockOffset(Date.parse(next.serverNow) - Date.now())
    version.current = next.version
    setRoom((prev) => {
      if (prev && prev.outcome === null && next.outcome?.reason === "matched") vibrate([40, 60, 40, 60, 80])
      return next
    })
  }, [])

  const pollRoom = useCallback(async () => {
    if (!roomId) return
    const res = await blindDateApi.room(roomId, version.current || undefined)
    if (!res.ok) {
      if (res.status === 404) {
        setRoomId(null)
        setRoom(null)
        void loadState()
      } else if (res.status === 0) {
        setOffline(true)
      }
      return
    }
    setOffline(false)
    if ("unchanged" in res.data) {
      setClockOffset(Date.parse(res.data.serverNow) - Date.now())
      return
    }
    applyRoom(res.data)
  }, [roomId, applyRoom, loadState])

  useEffect(() => {
    if (view !== "room" || !roomId) return
    void pollRoom()
    if (room?.phase === "closed") return
    const id = window.setInterval(() => void pollRoom(), ROOM_POLL_MS)
    return () => window.clearInterval(id)
  }, [view, roomId, room?.phase, pollRoom])

  const newDate = async () => {
    setRoom(null)
    setRoomId(null)
    version.current = 0
    setView("loading")
    await loadState()
  }

  if (view === "loading") {
    return (
      <main className="bd bd--center" aria-busy>
        <div className="bd-orb bd-orb--pulse" aria-hidden>
          <VenetianMask />
        </div>
      </main>
    )
  }

  if (view === "intro") {
    return (
      <BlindIntro
        state={state}
        offline={offline}
        alsoEnglish={alsoEnglish}
        showEnglishToggle={locale !== "en"}
        onToggleEnglish={() => setAlsoEnglish((v) => !v)}
        onStart={() => void startSearch()}
      />
    )
  }

  if (view === "searching") {
    return (
      <main className="bd bd--center">
        <div className="bd-search">
          <div className="bd-rings" aria-hidden>
            <span />
            <span />
            <span />
            <div className="bd-orb">
              <VenetianMask />
            </div>
          </div>
          <h1 className="bd-title" aria-live="polite">{t("bdSearching")}</h1>
          <p className="bd-sub">{t("bdSearchingHint")}</p>
          {searchSince !== null && (
            <p className="bd-meta">{fill(t("bdSearchingWaited"), { time: mmss(now - searchSince) })}</p>
          )}
          {offline && <p className="bd-warn">{t("bdConnectionLost")}</p>}
          <button type="button" className="bd-btn bd-btn--ghost" onClick={() => void cancelSearch()}>
            {t("bdCancel")}
          </button>
        </div>
      </main>
    )
  }

  if (!room) {
    return (
      <main className="bd bd--center" aria-busy>
        <div className="bd-orb bd-orb--pulse" aria-hidden>
          <VenetianMask />
        </div>
        {offline && <p className="bd-warn">{t("bdConnectionLost")}</p>}
      </main>
    )
  }

  return (
    <BlindRoomView
      room={room}
      now={now + clockOffset}
      offline={offline}
      error={error}
      setError={setError}
      onRoom={applyRoom}
      onNewDate={() => void newDate()}
    />
  )
}

// ───────────────────────── intro ─────────────────────────

function BlindIntro(props: {
  state: BlindState | null
  offline: boolean
  alsoEnglish: boolean
  showEnglishToggle: boolean
  onToggleEnglish: () => void
  onStart: () => void
}) {
  const { t } = useI18n()
  const { state } = props
  const reason = state && !state.eligible ? state.reason : null
  const rules: Array<{ Icon: typeof Clock; key: TranslationKey }> = [
    { Icon: Clock, key: "bdRule1" },
    { Icon: Eye, key: "bdRule2" },
    { Icon: HeartHandshake, key: "bdRule3" },
    { Icon: ShieldCheck, key: "bdRule4" },
  ]
  const reasonAction: Partial<Record<string, { href: string; key: TranslationKey }>> = {
    consent_required: { href: "/app", key: "bdActionConsent" },
    age_unknown: { href: "/profile", key: "bdActionProfile" },
  }
  const action = reason ? reasonAction[reason] : undefined

  return (
    <main className="bd">
      <header className="bd-top">
        <Link href="/app" className="bd-icon-btn" aria-label={t("bdBack")}>
          <ArrowLeft aria-hidden />
        </Link>
      </header>
      <section className="bd-intro">
        <div className="bd-orb bd-orb--hero" aria-hidden>
          <VenetianMask />
        </div>
        <p className="bd-kicker">{t("bdTagline")}</p>
        <h1 className="bd-title bd-title--hero">{t("bdTitle")}</h1>
        <p className="bd-sub">{t("bdIntro")}</p>

        <ul className="bd-rules">
          {rules.map(({ Icon, key }) => (
            <li key={key}>
              <span className="bd-rules__icon" aria-hidden>
                <Icon strokeWidth={1.8} />
              </span>
              <span>{t(key)}</span>
            </li>
          ))}
        </ul>

        {reason ? (
          <div className="bd-notice" role="status">
            <p>{t(`bdIneligible_${reason}` as TranslationKey) || t("bdIneligible_blocked_account")}</p>
            {action && (
              <Link href={action.href} className="bd-btn bd-btn--ghost bd-btn--small">
                {t(action.key)}
              </Link>
            )}
          </div>
        ) : (
          <>
            {props.showEnglishToggle && (
              <label className="bd-switch">
                <input type="checkbox" checked={props.alsoEnglish} onChange={props.onToggleEnglish} />
                <span className="bd-switch__track" aria-hidden />
                <span>{t("bdAlsoEnglish")}</span>
              </label>
            )}
            <button type="button" className="bd-btn bd-btn--primary" onClick={props.onStart} disabled={!state}>
              <Sparkles aria-hidden />
              {t("bdStart")}
            </button>
            {state && <p className="bd-meta">{fill(t("bdFreePerDay"), { n: state.freeDailyDates })}</p>}
          </>
        )}
        {props.offline && <p className="bd-warn">{t("bdConnectionLost")}</p>}
      </section>
    </main>
  )
}

// ───────────────────────── room ─────────────────────────

function BlindRoomView(props: {
  room: BlindRoom
  now: number
  offline: boolean
  error: string | null
  setError: (e: string | null) => void
  onRoom: (r: BlindRoom) => void
  onNewDate: () => void
}) {
  const { t, locale } = useI18n()
  const { room, now, onRoom, setError } = props
  const [draft, setDraft] = useState("")
  const [sending, setSending] = useState(false)
  const [sheet, setSheet] = useState<null | "menu" | "leave" | "report" | "photo">(null)
  const listRef = useRef<HTMLDivElement>(null)
  const peerName = room.peer.name

  const endsAt = Date.parse(room.endsAt)
  const decideUntil = Date.parse(room.decideUntil)
  const total = endsAt - Date.parse(room.startedAt)
  const left = room.phase === "active" ? endsAt - now : room.phase === "deciding" ? decideUntil - now : 0
  const ratio = room.phase === "active" ? Math.max(0, Math.min(1, left / total)) : 0

  // Errors are hints, not permanent banners.
  useEffect(() => {
    if (!props.error) return
    const id = window.setTimeout(() => setError(null), 5000)
    return () => window.clearTimeout(id)
  }, [props.error, setError])

  useEffect(() => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [room.messages.length])

  const errorText = (code: string) => {
    const key = `bdErr_${code}` as TranslationKey
    return t(key) || t("bdErr_generic")
  }

  const send = async () => {
    const body = draft.trim()
    if (!body || sending) return
    setSending(true)
    const res = await blindDateApi.send(room.id, body)
    setSending(false)
    if (res.ok) {
      setDraft("")
      setError(null)
      onRoom(res.data)
    } else {
      setError(errorText(res.error))
    }
  }

  const toggleReveal = async () => {
    const res = await blindDateApi.reveal(room.id, !room.me.revealConsent)
    if (res.ok) onRoom(res.data)
    else setError(errorText(res.error))
  }

  const decide = async (decision: "continue" | "pass") => {
    const res = await blindDateApi.decide(room.id, decision)
    if (res.ok) onRoom(res.data)
    else setError(errorText(res.error))
  }

  const leave = async () => {
    const res = await blindDateApi.leave(room.id)
    setSheet(null)
    if (res.ok) onRoom(res.data)
  }

  if (room.outcome) {
    return <BlindResult room={room} onNewDate={props.onNewDate} />
  }

  return (
    <main className="bd bd--room">
      <header className="bd-room-head">
        {room.revealStage > 0 ? (
          <button type="button" className="bd-avatar-btn" onClick={() => setSheet("photo")} aria-label={t("bdShowPhoto")}>
            <PeerAvatar room={room} />
          </button>
        ) : (
          <PeerAvatar room={room} />
        )}
        <div className="bd-room-head__who">
          <p className="bd-room-head__name">
            {peerName}
            {room.peer.age !== null && <span>, {room.peer.age}</span>}
          </p>
          <p className="bd-room-head__state">
            {room.phase === "deciding" ? t("bdDecideTitle") : t("bdRoomLive")}
          </p>
        </div>
        <div
          className={`bd-timer${room.phase === "active" && left < 60_000 ? " is-low" : ""}`}
          role="timer"
          aria-label={t("bdTimeLeft")}
          style={{ ["--bd-timer" as string]: ratio }}
        >
          <span>{mmss(left)}</span>
        </div>
        <button type="button" className="bd-icon-btn" aria-label={t("bdMenu")} onClick={() => setSheet("menu")}>
          <MoreHorizontal aria-hidden />
        </button>
      </header>

      <section className="bd-panel">
        <div className="bd-progress">
          <div className="bd-progress__row">
            <span>{t("bdProgress")}</span>
            <span>{room.progress}%</span>
          </div>
          <div className="bd-progress__bar" aria-hidden>
            <span style={{ width: `${room.progress}%` }} />
            {[25, 50, 75].map((s) => (
              <i key={s} style={{ left: `${s}%` }} className={room.progress >= s ? "is-on" : undefined} />
            ))}
          </div>
          {room.messages.length < 4 && <p className="bd-progress__hint">{t("bdProgressHint")}</p>}
        </div>

        <RevealControl room={room} onToggle={() => void toggleReveal()} />

        <div className="bd-common">
          {room.peer.commonInterests.length > 0 ? (
            room.peer.commonInterests.map((slug) => (
              <span key={slug} className="bd-chip">
                {interestLabelBySlug(slug, locale)}
              </span>
            ))
          ) : (
            <span className="bd-common__none">{t("bdNoCommon")}</span>
          )}
        </div>
      </section>

      <div className="bd-messages" ref={listRef} aria-live="polite">
        {room.messages.length === 0 ? (
          <p className="bd-messages__empty">{t("bdEmptyChat")}</p>
        ) : (
          room.messages.map((m) => (
            <p key={m.id} className={`bd-msg${m.mine ? " bd-msg--mine" : ""}`}>
              {m.body}
            </p>
          ))
        )}
      </div>

      <footer className="bd-foot">
        {props.offline && <p className="bd-warn">{t("bdConnectionLost")}</p>}
        {props.error && (
          <p className="bd-error" role="alert">
            {props.error}
          </p>
        )}
        {room.phase === "active" ? (
          <form
            className="bd-composer"
            onSubmit={(e) => {
              e.preventDefault()
              void send()
            }}
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={500}
              placeholder={t("bdPlaceholder")}
              aria-label={t("bdPlaceholder")}
              enterKeyHint="send"
            />
            <button type="submit" className="bd-send" disabled={!draft.trim() || sending} aria-label={t("bdSend")}>
              <Send aria-hidden />
            </button>
          </form>
        ) : (
          <div className="bd-decide">
            {room.me.decision ? (
              <p className="bd-decide__wait">{fill(t("bdDecidedWaiting"), { name: peerName })}</p>
            ) : (
              <>
                <p className="bd-decide__q">{fill(t("bdDecideBody"), { name: peerName })}</p>
                {room.peer.decided && <p className="bd-meta">{fill(t("bdPeerDecided"), { name: peerName })}</p>}
                <div className="bd-decide__row">
                  <button type="button" className="bd-btn bd-btn--ghost" onClick={() => void decide("pass")}>
                    <X aria-hidden />
                    {t("bdPass")}
                  </button>
                  <button type="button" className="bd-btn bd-btn--primary" onClick={() => void decide("continue")}>
                    <Heart aria-hidden />
                    {t("bdContinue")}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </footer>

      {sheet && (
        <div className="bd-sheet-backdrop" onClick={() => setSheet(null)}>
          <div className="bd-sheet" role="dialog" aria-modal onClick={(e) => e.stopPropagation()}>
            {sheet === "menu" && (
              <>
                <button type="button" className="bd-sheet__item" onClick={() => setSheet("leave")}>
                  <LogOut aria-hidden />
                  {t("bdLeave")}
                </button>
                <button type="button" className="bd-sheet__item bd-sheet__item--danger" onClick={() => setSheet("report")}>
                  <Flag aria-hidden />
                  {t("bdReport")}
                </button>
                <button type="button" className="bd-sheet__item bd-sheet__item--muted" onClick={() => setSheet(null)}>
                  {t("bdCancel")}
                </button>
              </>
            )}
            {sheet === "leave" && (
              <>
                <p className="bd-sheet__text">{t("bdLeaveConfirm")}</p>
                <button type="button" className="bd-btn bd-btn--primary" onClick={() => void leave()}>
                  {t("bdLeave")}
                </button>
                <button type="button" className="bd-btn bd-btn--ghost" onClick={() => setSheet(null)}>
                  {t("bdCancel")}
                </button>
              </>
            )}
            {sheet === "photo" && (
              <figure className="bd-photo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img key={room.revealStage} src={blindDateApi.photoUrl(room.id, room.revealStage)} alt="" />
                <figcaption>{fill(t("bdRevealBoth"), { n: room.revealStage })}</figcaption>
                <button type="button" className="bd-btn bd-btn--ghost" onClick={() => setSheet(null)}>
                  {t("bdClose")}
                </button>
              </figure>
            )}
            {sheet === "report" && <ReportForm roomId={room.id} onDone={(r) => { setSheet(null); if (r) void blindDateApi.room(room.id).then((x) => { if (x.ok && !("unchanged" in x.data)) onRoom(x.data) }) }} />}
          </div>
        </div>
      )}
    </main>
  )
}

function PeerAvatar({ room }: { room: BlindRoom }) {
  const [failed, setFailed] = useState(false)
  const stage = room.revealStage
  useEffect(() => setFailed(false), [stage])
  if (stage > 0 && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        key={stage}
        className="bd-avatar bd-avatar--photo"
        src={blindDateApi.photoUrl(room.id, stage)}
        alt=""
        onError={() => setFailed(true)}
      />
    )
  }
  return (
    <span className="bd-avatar" aria-hidden>
      <VenetianMask />
    </span>
  )
}

function RevealControl({ room, onToggle }: { room: BlindRoom; onToggle: () => void }) {
  const { t } = useI18n()
  const name = room.peer.name
  let text: string
  if (room.me.revealConsent && room.peer.revealConsent) {
    text = room.revealStage > 0 ? fill(t("bdRevealBoth"), { n: room.revealStage }) : t("bdRevealBothLocked")
  } else if (room.me.revealConsent) {
    text = t("bdRevealWaiting")
  } else if (room.peer.revealConsent) {
    text = fill(t("bdRevealPeerWants"), { name })
  } else {
    text = t("bdRevealHint")
  }
  return (
    <div className={`bd-reveal${room.revealStage > 0 ? " is-open" : ""}`}>
      <span className="bd-reveal__icon" aria-hidden>
        {room.me.revealConsent ? <Eye /> : <EyeOff />}
      </span>
      <p className="bd-reveal__text">{text}</p>
      <button type="button" className="bd-btn bd-btn--small bd-btn--ghost" onClick={onToggle}>
        {room.me.revealConsent ? t("bdRevealWithdraw") : t("bdRevealAgree")}
      </button>
    </div>
  )
}

function ReportForm({ roomId, onDone }: { roomId: string; onDone: (reported: boolean) => void }) {
  const { t } = useI18n()
  const [reason, setReason] = useState<TranslationKey>("trustReportHarassment")
  const [block, setBlock] = useState(true)
  const [busy, setBusy] = useState(false)
  const submit = async () => {
    setBusy(true)
    const res = await blindDateApi.report(roomId, reason, block)
    setBusy(false)
    onDone(res.ok)
  }
  return (
    <div className="bd-report">
      <p className="bd-sheet__title">{t("trustReportTitle")}</p>
      {REPORT_REASONS.map((key) => (
        <label key={key} className="bd-radio">
          <input type="radio" name="bd-reason" checked={reason === key} onChange={() => setReason(key)} />
          <span>{t(key)}</span>
        </label>
      ))}
      <label className="bd-radio">
        <input type="checkbox" checked={block} onChange={(e) => setBlock(e.target.checked)} />
        <span>{t("bdBlockToo")}</span>
      </label>
      <button type="button" className="bd-btn bd-btn--primary" disabled={busy} onClick={() => void submit()}>
        {t("trustReportSubmit")}
      </button>
      <button type="button" className="bd-btn bd-btn--ghost" onClick={() => onDone(false)}>
        {t("bdCancel")}
      </button>
    </div>
  )
}

// ───────────────────────── result ─────────────────────────

function BlindResult({ room, onNewDate }: { room: BlindRoom; onNewDate: () => void }) {
  const { t } = useI18n()
  const outcome = room.outcome!
  const name = room.peer.name
  let title: TranslationKey
  let body: TranslationKey | null
  switch (outcome.reason) {
    case "matched":
      title = "bdResultMatchedTitle"
      body = "bdResultMatchedBody"
      break
    case "no_match":
      title = "bdResultNoMatchTitle"
      body = "bdResultNoMatchBody"
      break
    case "timeout":
      title = "bdResultTimeoutTitle"
      body = "bdResultTimeoutBody"
      break
    case "reported":
      title = outcome.leftByMe ? "bdResultReportedByMe" : "bdResultEndedTitle"
      body = outcome.leftByMe ? null : "bdResultLeftBody"
      break
    default:
      title = outcome.leftByMe ? "bdResultLeftByMeTitle" : "bdResultLeftTitle"
      body = "bdResultLeftBody"
  }
  const matched = outcome.reason === "matched"
  return (
    <main className="bd bd--center">
      <section className={`bd-result${matched ? " bd-result--match" : ""}`}>
        {matched && room.revealStage > 0 ? (
          <PeerAvatar room={room} />
        ) : (
          <div className="bd-orb bd-orb--hero" aria-hidden>
            {matched ? <Heart /> : <VenetianMask />}
          </div>
        )}
        <h1 className="bd-title">{fill(t(title), { name })}</h1>
        {body && <p className="bd-sub">{fill(t(body), { name })}</p>}
        <div className="bd-result__actions">
          {matched && (
            <Link href="/app?tab=chat" className="bd-btn bd-btn--primary">
              <MessageCircle aria-hidden />
              {t("bdOpenChats")}
            </Link>
          )}
          <button type="button" className={`bd-btn ${matched ? "bd-btn--ghost" : "bd-btn--primary"}`} onClick={onNewDate}>
            <Sparkles aria-hidden />
            {t("bdNewDate")}
          </button>
          <Link href="/app" className="bd-btn bd-btn--ghost">
            {t("bdBack")}
          </Link>
        </div>
      </section>
    </main>
  )
}
