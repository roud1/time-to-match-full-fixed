# Time to Match — Core Product Mechanics

**Category:** time-based dating (urgency is the product, not a feature)  
**North star:** maximize *first meaningful interaction* within 24h; minimize dead matches in the inbox.

---

## 1. Core logic

### 1.1 Entities (minimal model)

| Entity | Definition |
|--------|------------|
| **Like** | One-directional interest |
| **Match** | Mutual like; creates a dyad `(userA, userB)` with one shared clock |
| **Connection** | Runtime view of a match: timer, chat thread, bond, freeze |
| **Expired match** | Terminal record; chat read-only or hidden; no re-match without new like flow |

**Invariant:** One active match row per unordered pair. `expires_at` is server-authoritative (UTC). Client clocks are display only.

---

### 1.2 Match lifecycle

#### States

| State | Meaning | Entry condition |
|-------|---------|-----------------|
| `new_match` | Mutual like just created; no messages yet | `created_at`, `expires_at = created_at + 24h`, `message_count = 0` |
| `waiting_reply` | At least one user has messaged; the other has not replied | `message_count >= 1` AND `both_users_sent = false` |
| `active_chat` | Two-way conversation started | `both_users_sent = true` AND `now < expires_at` |
| `expired` | Time or hard-close rule hit | `now >= expires_at` OR admin/policy close |

**Note:** `new_match` and `waiting_reply` both burn the same global deadline. The split exists for UX, notifications, and scoring—not for separate timers.

#### Transitions (strict)

```
[MUTUAL LIKE]
    → new_match

new_match
    → waiting_reply     ON first_message(any_user)
    → expired           ON now >= expires_at
    → expired           ON user_unmatch (either side)
    → expired           ON policy_violation / block

waiting_reply
    → active_chat       ON first_message(other_user)  // second distinct sender
    → expired           ON now >= expires_at
    → expired           ON unmatch / block

active_chat
    → expired           ON now >= expires_at
    → expired           ON unmatch / block
    → waiting_reply     NEVER (conversation does not downgrade)

expired
    → *                 TERMINAL (no resurrection of same dyad)
```

**`first_message` rules:**
- Counts: text, approved icebreaker tap, voice note, GIF/sticker (if enabled).
- Does **not** count: system messages, "Wave" without content, empty drafts.
- Sender records `first_sender_at`; when the other sends, set `both_users_sent = true` → `active_chat`.

**Ignore behavior:**
- No state change until `expires_at`.
- At expiry: `expired`, thread locked, match removed from active inbox, moved to "Lost connections" (optional, 7-day read-only archive) or deleted entirely (stronger scarcity).

**Both inactive:**
- Clock still runs. No pause for offline.
- Optional: at T-6h and T-1h, escalate notifications to both (or only the non-responder in `waiting_reply`).

---

### 1.3 Time rules (single source of truth)

| Rule | Decision |
|------|----------|
| **Clock start** | `expires_at = mutual_match_at + 24h` (fixed anchor) |
| **Reset on message?** | **No full reset.** First message does not extend TTL. |
| **Partial extension** | **Yes, earned only in `active_chat`:** every N messages (e.g. 10) from **combined** count → `+6h` to `expires_at`, cap `+24h` total extensions per match, min 1h cooldown between prolongs. |
| **Freeze (monetized / scarce)** | User spends 1 freeze token → `expires_at += 24h`, `is_frozen = true` once per match window; free freeze max 1 per 24h per user (cooldown). Does not change state name. |
| **Shorten over time?** | **No** on default matches (predictable anxiety). Optional future mode: "Rush hour" events with 6h matches for 2× discover priority. |
| **At T=0** | Server job marks `is_expired = true`, state → `expired`, push websocket `match.expired`, block new sends, schedule deletion of media per retention policy. |

**Server evaluation:** Expiry checked on: message send, inbox fetch, push cron (every 1 min), and lazy read of match row. **Never** trust client `onExpire` alone.

**Last-second message:** If server receives send with `server_received_at < expires_at` (by DB transaction order), message is accepted and state may transition to `waiting_reply` / `active_chat` even if client UI already showed 0:00. If `server_received_at >= expires_at`, reject with `MATCH_EXPIRED` and show expiry screen.

---

### 1.4 User actions → system effects

| Action | Effect |
|--------|--------|
| **User A sends first message** | `new_match` → `waiting_reply`; start response SLA clock for B; notify B (high priority); A gets "Waiting for {name}" in thread |
| **User B ignores until expiry** | `expired`; A sees "Time ran out"; B gets `ghost_penalty` (see §2); match gone from active lists |
| **Both send at least once** | `active_chat`; bond meter visible; prolong rules apply |
| **Unmatch** | Immediate `expired`; no refund of freeze; both lose access |
| **Block** | Immediate `expired` + hide from discover forever for pair |
| **Freeze** | Extend `expires_at`; one celebratory system line; no state rename |
| **Report** | Match frozen for review or immediate `expired` if severe |

---

## 2. Game mechanics

### 2.1 Currencies (abstract)

| Currency | Earned by | Spent on |
|----------|-----------|----------|
| **Momentum** | Fast replies, active_chat streaks | Discover priority (see below) |
| **Freeze tokens** | Streaks, achievements, purchase | +24h on one match |
| **Trust** | Low expiry rate, high reply rate | Unlock features; reduce shadow limits |

No pay-to-win on *getting* matches—only on *keeping* one you already have.

---

### 2.2 Rewards

| Behavior | Reward | Cap |
|----------|--------|-----|
| Reply within **15 min** (first reply in match) | +10 Momentum, "Quick spark" badge on thread | Once per match |
| Reply within **2h** | +5 Momentum | Once per match |
| Reach `active_chat` | +15 Momentum both users | Once per match |
| **7-day** active_chat streak (daily message both sides) | 1 free freeze token | 1/week |
| Bond prolong triggered | In-thread celebration + visible "+6h" on timer | Max +24h extensions/match |
| Complete profile + low expiry rate | **Priority boost** next session: top 20% deck exposure for 2h | Cooldown 48h |

---

### 2.3 Penalties (soft → hard)

| Behavior | Penalty |
|----------|---------|
| Let 1 match expire (you were `waiting_reply` non-responder) | -5 Momentum, -2 Trust |
| Let 3 matches expire in 7 days | -15 Momentum; **discover throttle** (50% impressions) for 24h |
| Never opened app during match window (push delivered, no open) | No extra penalty beyond expiry (avoid punishing life) |
| Expire while you were the only sender (`waiting_reply` you started) | -2 Momentum only (less blame) |
| Spam-open no reply | Trust decay; captcha on send |

**Hard rule:** Expired dyad cannot rematch for **30 days** (prevents endless re-like loops). Optional "Second chance" paid SKU once per pair lifetime.

---

### 2.4 Reputation & priority (simple v1)

**Trust score** (hidden, 0–100, starts 70):

```
trust += quick_reply_bonus
trust -= expired_as_non_responder * weight
trust -= reports * heavy_weight
```

**Discover priority score** (per session):

```
priority = base + momentum_bonus + trust_factor - recent_expiry_penalty
```

Users with Trust < 40: normal deck, no boost.  
Users with Trust > 80 + Momentum > 50: boost window eligible.

---

## 3. UX logic (behavior only)

### 3.1 Surfaces

| Moment | User sees | Can do |
|--------|-----------|--------|
| **New match** | Full-screen or modal: photo, timer **23:59:xx**, CTA "Say something before time runs out", 3 icebreakers | Open chat, dismiss to inbox (timer on row) |
| **Timer running** | Persistent countdown on match card + in chat header; urgency tier: normal (>6h), warning (≤6h), critical (≤1h) | Chat, freeze (if available), unmatch |
| **1 hour left** | Critical styling; haptic on open; inbox row pinned to top | Same; push already sent |
| **Expired** | Thread: "This match dissolved" + timestamp; no composer; CTA "Back to Discover" | Read old messages 7 days (optional), then hidden |
| **Open expired match** | Expiry screen, no input; explain rule once | Leave |

### 3.2 Inbox ordering

1. Critical timer (<1h)  
2. `waiting_reply` where **you** are non-responder  
3. `new_match`  
4. `active_chat` by `expires_at` ASC  
5. Never show `expired` in main inbox (separate archive tab if any)

### 3.3 Notifications (event-driven, max 3 per match per user)

| Trigger | Who | Channel | Copy intent |
|---------|-----|---------|-------------|
| Match created | Both | Push + in-app | "You matched — 24h to connect" |
| First message received | Non-sender | Push (high) | "{name} wrote you — {time} left" |
| T-6h, no `active_chat` | Non-responder if `waiting_reply`; else both | Push | "6 hours left with {name}" |
| T-1h | Same rule | Push + optional SMS tier | "Last hour — reply or lose {name}" |
| T-0 (expired) | Both | Push (once) | "Match with {name} expired" |
| Bond prolong | Both | In-app only | "+6h — you're on a roll" |
| Momentum milestone | Self | In-app | "Discover boost unlocked" |

**Quiet hours:** Respect OS DND; queue non-critical until morning except T-1h.

**Anti-spam:** No notification if user is **in that chat** (foreground) or sent message <5 min ago.

---

## 4. Edge cases

| Case | Behavior |
|------|----------|
| **Deletes app** | Push stops when token invalid; match still expires server-side; on reinstall, expired matches in archive or gone per retention |
| **Offline** | Timer runs; messages queue on sender device; deliver on reconnect if still valid; else bounce with expired |
| **Opens expired match** | Read-only expiry state; composer disabled; API 410 `MATCH_EXPIRED` |
| **Message at last second** | Accepted if DB `received_at < expires_at` in same transaction as expiry check |
| **Both message simultaneously at T-0** | Order by server timestamp; first opens `waiting_reply`, second may open `active_chat` if still before expiry |
| **Freeze at T-0:30** | Allowed if payment/token validates before expiry commit |
| **Double freeze same match** | Second rejected unless first extension consumed and new window policy allows |
| **One user deletes account** | Match → `expired` for survivor; anonymize survivor's thread labels |
| **Clock skew / timezone** | Display local; authority UTC |
| **Mutual like while one already expired pending like** | New row only if no active match; else revive forbidden until cooldown |

---

## 5. State machine (text)

```
                    ┌──────────────────────────────────────┐
                    │           EXPIRED (terminal)          │
                    └──────────────────────────────────────┘
                      ▲      ▲      ▲      ▲      ▲
          unmatch/block│      │      │      │      │
                      │      │      │      │      │time
                      │      │      │      │      │
┌──────────┐  first_msg   ┌──────────────┐ 2nd_distinct ┌─────────────┐
│NEW_MATCH │─────────────►│WAITING_REPLY │────────────►│ ACTIVE_CHAT │
└──────────┘              └──────────────┘   sender    └─────────────┘
     │                            │                            │
     │                            │                            │
     └────────────────────────────┴────────────────────────────┘
                           time >= expires_at
```

**Timers (parallel, not states):**

- `global_expires_at` — always running from match creation  
- `response_sla` — optional analytics: time from first_msg to second distinct sender  
- `bond_prolong_eligible` — only in `active_chat`

---

## 6. Product principles (YC lens)

1. **Scarcity is honest** — expired means gone; no fake "they liked you again" unless policy allows.  
2. **Reward speed, not volume** — Momentum for replies, not for likes spam.  
3. **One clock** — users learn one rule: *24 hours from match*. Extensions are earned, visible, capped.  
4. **Asymmetric urgency** — ping the ghost, not the person who already replied.  
5. **Monetize retention of intent** — freezes and second-chance, not unlimited inbox clutter.

---

## 7. v1 scope vs later

| v1 (ship) | v2+ |
|-----------|-----|
| 4 states, 24h TTL, freeze, bond +6h | Rush-hour 6h matches |
| Momentum + soft throttle | Full Trust leaderboard |
| Push at match, first msg, 6h, 1h | SMS tier |
| 30-day rematch cooldown | Paid second chance |
