# Luvia — Privacy Policy (DRAFT)

> **Draft for legal review — not yet published.** Items in `[square brackets]` must be filled in by the
> owner. Sections marked **CHECK** depend on how production is configured. See
> `docs/legal/OPEN-QUESTIONS.md`. This draft was prepared from the app's source code; it is not legal advice.

_Last updated: [date]_

## 1. Who we are

Luvia ("we", "us") is a dating app available at [https://luvia.app / current URL] and as an app for Android
and iPhone. The controller of your personal data is:

[Legal name of the company or sole trader]
[Address]
[Company / registration number]
Email: [privacy@…]

[If required: Data Protection Officer — name and contact.]
[If the controller is established outside the EU: EU representative under Art. 27 GDPR — name and contact.]

## 2. Who can use Luvia

Luvia is only for people aged **18 or over**. We ask for your date of birth at sign-up and do not knowingly
process data of minors. If you believe a minor uses Luvia, contact us and we will delete the account.

## 3. What data we collect

**Account data you give us**
- name, email address, password (stored only as a one-way hash), date of birth
- gender, who you are looking for, dating goal, preferred age range and distance
- profile content: photos, "about me" text, city, interests and the optional personality answers
  (vibes, energy, intention, mood, communication style, a short favourite detail)

**Data created when you use Luvia**
- likes and passes you give, super likes, matches and their timers, freezes
- messages you send and receive in chats
- conversations with Luvia AI (the in-app assistant)
- blind dates (if you use them): who you were paired with and when, the anonymous messages you exchanged,
  your answers in the mini-games, your reveal and continue/pass choices, and the date report shown to you
- blocks and reports you make
- photo verification requests (selfie and gesture), if you use verification
- subscription status, if you buy Premium (payment details are handled by the payment provider — we do not
  see your full card number)

**Location**
- if you allow it, your device location (latitude/longitude) to show people nearby and distances; you can
  also enter a city instead
- to show the name of your city, your browser sends your coordinates to OpenStreetMap's Nominatim service

**Technical and usage data**
- log data (IP address, device and browser type, time of requests) for security and abuse prevention
- product events (for example "opened chat", "paywall shown") linked to your account
- error reports (crash diagnostics) — **CHECK** whether Sentry is enabled in production

**Scores we calculate about you (profiling)** — see section 6.

**Sensitive data.** Information such as your gender and the gender you are looking for can reveal your
sexual orientation, which is a special category of data under Art. 9 GDPR. We process it only to provide the
matching service, based on your **explicit consent** given at sign-up, which you can withdraw at any time by
deleting your account.

## 4. Why we use your data and on what legal basis

| Purpose | Data | Legal basis (GDPR) |
|---|---|---|
| Creating and running your account, showing your profile to others, matching, chat | account, profile, likes, matches, messages | Contract (Art. 6(1)(b)); explicit consent for sensitive data (Art. 9(2)(a)) |
| Showing people nearby and distances | location | Consent (Art. 6(1)(a)) — you can turn it off |
| Ranking the feed and match suggestions | usage data, scores | Legitimate interest in a useful feed (Art. 6(1)(f)) |
| Luvia AI assistant | messages you send to Luvia AI | Consent (Art. 6(1)(a)) — you choose to write to it |
| AI connection tips in chats and blind date reports | the chat transcript of a match or of a blind date (names replaced by "Me" / "Them") | Consent of **both** people (Art. 6(1)(a)) — Settings → Privacy → "AI tips in chats and dates", off by default; without it tips and reports are computed on our server only, from facts such as message counts and game answers |
| Blind dates: pairing, 10-minute anonymous chat, mini-games, progressive photo reveal | profile data used for matching (age, gender and who you look for, language, distance, interests), messages and game answers in the date | Contract (Art. 6(1)(b)); explicit consent for sensitive data (Art. 9(2)(a)). Your photo is shown to the other person only after **both** agreed, and only as a blurred copy rendered by our server until the last stage |
| Safety: moderation, reports, blocks, fraud and abuse prevention, photo verification | reports, logs, verification selfies | Legitimate interest (Art. 6(1)(f)); legal obligations |
| Emails about your account (verification, password reset) and push notifications you turned on | email, push subscription | Contract; consent for push |
| Payments and subscriptions | subscription status | Contract; legal obligations (tax, accounting) |
| Product statistics and error monitoring | product events, error reports | Legitimate interest (Art. 6(1)(f)) |

We do **not** sell your data and do **not** share it with advertisers. **CHECK**: Google AdSense must stay
disabled, or this section and a consent banner must be added before enabling it.

## 5. Who we share data with

- **Other users** see your profile (name, age, photos, city or distance, "about me", interests and the
  optional personality answers). People you match with can chat with you.
- **Service providers (processors)** that run Luvia for us, under data processing agreements:

| Provider | Purpose | Location |
|---|---|---|
| Render Services, Inc. | app hosting | EU (Frankfurt) — **CHECK** region |
| Cloudflare, Inc. (via Render) | network edge / security | global |
| Neon, Inc. | database (PostgreSQL) | **CHECK** region |
| Amazon Web Services (S3) | photo storage | **CHECK** whether enabled and region |
| Resend, Inc. / SMTP provider | sending emails | **CHECK** |
| OpenRouter, Inc. and the AI model provider it routes to | Luvia AI replies; connection insights | USA — **CHECK** whether enabled |
| Pusher (MessageBird) / Ably | real-time chat delivery | **CHECK** whether enabled |
| Upstash, Inc. | rate limiting (abuse prevention) | **CHECK** whether enabled |
| Functional Software, Inc. (Sentry) | error monitoring | **CHECK** whether enabled |
| [Payment provider: Paddle / Stripe / …] | payments | [to be added when payments launch] |
| Apple, Google, Mozilla push services; Google Firebase Cloud Messaging (Android app) | delivering push notifications you enabled (likes, matches, new messages — never the message text) | global |
| OpenStreetMap Foundation (Nominatim) | turning coordinates into a city name | EU/UK |

- **Authorities**, when the law requires it, or to protect users' safety.

**International transfers.** Some providers process data outside the EU/EEA (for example in the USA). We rely
on adequacy decisions (including the EU–US Data Privacy Framework where the provider is certified) or the
European Commission's Standard Contractual Clauses.

## 6. Automated decisions and profiling

To order the feed we calculate scores from how you use Luvia (for example response time, activity,
conversation depth and how often matches expire without a reply). These scores only change the order in
which profiles are shown; they do not decide whether you can use Luvia and have no legal or similarly
significant effect on you. You can see these scores in your data export (section 8).

## 7. How long we keep data

- **Account and profile data:** while your account exists. When you delete your account in
  Settings → Account → Delete account, we delete your profile, photos, likes, matches and messages
  immediately from our database; copies in backups expire within [30] days.
- **Matches:** a match lasts 24 hours unless someone writes or uses a freeze. **CHECK** how long chat
  messages of expired matches are kept: [retention period].
- **Inactive accounts:** [policy — e.g. deleted after 24 months of inactivity, with an email warning first].
- **Blind dates:** rooms, messages, game answers and date reports are deleted with your account. **CHECK**:
  retention for dates that did not lead to a match — [period, e.g. 30 days].
- **Reports and safety records:** up to [12] months after the case is closed, or longer if required by law.
- **Logs:** up to [30] days.
- **Payment records:** as long as tax and accounting laws require (usually up to 10 years).

## 8. Your rights

Under the GDPR you can:
- **access** your data and **take it with you** — Settings → Account → **Download my data** gives you a file
  with everything we store about you;
- **correct** your data — edit your profile at any time;
- **delete** your account and data — Settings → Account → **Delete account**;
- **object** to processing based on legitimate interest, and **restrict** processing;
- **withdraw consent** at any time (location, push notifications, AI features) without affecting earlier
  processing;
- **complain** to a data protection authority, in particular in the EU country where you live or work.
  [Name of the lead supervisory authority, if any.]

Contact us at [privacy@…]. We answer within one month.

## 9. Cookies and local storage

We use only what is needed for the app to work:
- `ttm_session` and `ttm_refresh` — keep you signed in (strictly necessary);
- `ttm-locale` — remembers your language;
- the browser's local storage — remembers app settings on your device (for example your language and
  dismissed tips).

We do not use advertising or cross-site tracking cookies. **CHECK** before enabling ads or third-party
analytics: a consent banner would then be required.

## 10. Security

Passwords are stored as one-way hashes, connections use HTTPS, access to the database is restricted, and
sign-in, sign-up and password reset are rate limited. No system is perfectly secure; if a breach affects your
data, we will inform you and the authorities as the law requires.

## 11. Changes

We will announce important changes in the app or by email before they take effect.
