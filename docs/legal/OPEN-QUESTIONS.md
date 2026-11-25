# Legal drafts — what the owner must decide or confirm

The drafts `privacy-policy-en.md` and `terms-of-service-en.md` were written from the source code. Before
they replace the pages `/privacy` and `/terms`, these points need an answer (and ideally a lawyer's review).

## Who you are
1. Legal entity that runs Luvia (company or sole trader), address, registration number.
2. Contact emails: privacy, abuse/reports (DSA contact point), support. Today the app uses
   `support@timetomatch.app` and the old page `privacy@timetomatch.app` — do these mailboxes exist?
3. If the entity is outside the EU (e.g. Ukraine): an **EU representative** (Art. 27 GDPR) is required.
4. Governing law / country for the terms.

## Which services are on in production (Render → Environment)
5. Database: Neon — which region? (EU region recommended.)
6. Photos: AWS S3 enabled (`AWS_*`)? Region?
7. Email: Resend or SMTP (`RESEND_API_KEY` / `SMTP_*`)?
8. AI: `OPENROUTER_API_KEY` set? Which model/provider?
9. Real-time: Pusher (`PUSHER_*`) or Ably (`ABLY_API_KEY`)?
10. Upstash Redis (`UPSTASH_*`)? Sentry (`SENTRY_DSN`)?
11. Google AdSense: recommendation — keep it **off** (it would need a cookie-consent banner).
12. Is there also a **production deployment on Vercel** using the same database? `vercel.json` schedules a
    weekly cleanup job; see "Data retention" below.

## Decisions
13. ✅ **Done (opt-in for both):** Settings → Privacy → "AI tips in chats". The transcript is sent to the AI
    provider only when both people turned it on; otherwise insights are computed locally.
    Original note — **AI connection insights.** When AI is configured, the server sends the **chat transcript of both people**
    to the AI provider to compute "connection" insights. Under the GDPR this needs a clear legal basis and,
    because it includes the other person's messages, it is safest to make it **opt-in for both users** — or
    to switch it off for EU launch. Luvia AI (the assistant chat) only sends what the user writes to it.
14. ✅ **Done:** a separate required checkbox at sign-up stores `profile.sensitiveDataConsentAt`; existing
    accounts are asked once when they open the app (agree, or go to Settings to delete the account).
    Original note — **Sensitive data.** Gender + "looking for" can reveal sexual orientation (Art. 9 GDPR). The draft relies on
    explicit consent at sign-up — the registration checkbox should then say so explicitly (separate
    checkbox: "I agree that Luvia processes my gender and who I'm looking for to match me").
15. **Retention.** How long to keep chat messages of expired matches, and when to delete inactive
    accounts (suggestion: 24 months of inactivity, with an email warning first).
16. Content licence: "only to run Luvia" or also "to promote Luvia" (using profile photos in marketing is
    not recommended).
17. Withdrawal right wording for Premium — depends on the payment provider (Paddle as merchant of record
    has its own terms).

## Found while drafting (code)
- `server/db-cleanup.ts` (`/api/v1/cron/cleanup`) deletes **user accounts** whose 72-hour feed visibility
  expired. The GitHub cron does not call it, but `vercel.json` schedules it weekly. If any Vercel
  production deployment uses the same database, inactive users are silently deleted. Fixed in the same
  PR: the job no longer deletes accounts.
- The current `/privacy` page says expired match conversations are deleted after 24 hours and names
  Sentry/Stripe/Pusher; the code does not delete match messages on expiry, and the service list differs.

## Blind dates (added with the Blind Date feature)

- **Retention of blind dates without a match** — rooms, anonymous messages, game answers and date reports are
  currently kept until the account is deleted. Decide a shorter period (for example 30 days after the date) and
  we add a cleanup job.
- **AI date reports** use the same "AI tips" consent as match chats (both people must turn it on). Confirm
  this wording is acceptable or whether a separate consent for blind dates is wanted.
