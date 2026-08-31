# frontend/

The web form: a user fills out lead info, clicks **Analyze**, and sees the
ICP qualification result. A Next.js app, self-contained (independent of the
`tools/` npm project — no shared workspace).

## Layout

```
frontend/
  app/
    (protected)/page.tsx        the form + results, single-page state machine
    (protected)/history/         a signed-in user's past qualifications (list + drill-down)
    (auth)/login, (auth)/signup  email/password sign-in and sign-up forms
    auth/confirm/route.ts        email-confirmation link handler (Supabase Auth)
    api/qualify-lead/route.ts   server-side proxy: triggers qualify-lead, waits for the result
    api/stripe/                 checkout, portal, and webhook routes (billing)
    (protected)/billing/         current plan + upgrade/manage-billing UI
  proxy.ts                    session refresh + route protection (Next's `middleware` convention, renamed)
  components/                 LeadForm, ResultsDisplay, ScoreGauge, UserNav, etc.
  lib/
    leadFields.ts              the lead form's field list (source of truth)
    qualification-types.ts     mirrors the output type in ../tools/src/trigger/qualifyLead.ts
    buildLeadInput.ts          form values -> the LeadInput object sent to trigger.dev
    supabase/                  browser/server Supabase client factories + session refresh helper
  supabase/schema.sql          the lead_scores + profiles tables and RLS policies (paste into the SQL Editor)
  .env.local.example           copy to .env.local and fill in the vars below
```

## How it talks to trigger.dev

`app/api/qualify-lead/route.ts` is the only place that touches trigger.dev.
It reads `TRIGGER_SECRET_KEY` (never sent to the browser), calls
`tasks.trigger("qualify-lead", ...)`, then `runs.poll(...)` to wait for the
result, and returns JSON to the client. See the root
[`CLAUDE.md`](../CLAUDE.md) for the full architecture.

## Auth & lead history (Supabase)

Sign-up/login is Supabase Auth, email/password only. All routes except
`/login` and `/signup` require a session (enforced in `proxy.ts`). Every
successful qualification is saved to a `lead_scores` table, scoped per-user
via Postgres Row Level Security — see `supabase/schema.sql`.

**One-time project setup:**

1. Create a project at [supabase.com/dashboard](https://supabase.com/dashboard).
2. Authentication → Providers → Email: leave Email enabled. **Turn "Confirm
   email" off** for local dev, so signing up returns a session immediately
   with no inbox needed — turn it back **on** before any real/public
   deployment (shipping password auth with email confirmation off lets
   anyone sign up with an email address they don't own).
3. Project Settings → API: copy the **Project URL** and **`anon public`**
   key into `.env.local` (below). Also copy the **`service_role`** key into
   `.env.local` as `SUPABASE_SERVICE_ROLE_KEY` — this key bypasses RLS, so
   it must **never** be committed, sent to the browser, or used anywhere
   except that one env var (it's read only by the Stripe webhook route).
4. SQL Editor: paste and run `supabase/schema.sql`, once.

## Billing (Stripe)

Free tier: 2 qualifications/day. Paid tier: $29/month, unlimited — see
[`../workflows/billing.md`](../workflows/billing.md) for the full rule set.
Checkout and the billing portal are handled by `app/api/stripe/`; a webhook
keeps plan status in `profiles` in sync with Stripe.

**One-time setup:**

1. Stripe dashboard → Product catalog: create a $29/month recurring Price,
   copy its `price_...` id into `.env.local` as `STRIPE_PRICE_ID`.
2. Developers → API keys: copy a **test-mode** secret key into
   `STRIPE_SECRET_KEY`.
3. Settings → Billing → Customer portal: enable it (allow at least
   "Cancel subscription").

## Local development

Run all three of these at the same time — the deployed-looking flow needs a
live worker to actually execute the task, and a live webhook forwarder to
sync Stripe events:

```bash
# terminal 1 — the trigger.dev worker for the qualify-lead task
cd tools
npx trigger.dev@latest dev

# terminal 2 — forwards Stripe webhook events to your local server.
# --api-key pins this to the same Stripe account as STRIPE_SECRET_KEY in
# .env.local — the CLI's default OAuth context can silently point at a
# different account/sandbox otherwise, which forwards events that never
# match what the app actually created.
stripe listen --api-key sk_test_... --forward-to localhost:3000/api/stripe/webhook

# terminal 3 — this app
cd frontend
npm install
cp .env.local.example .env.local   # fill in TRIGGER_SECRET_KEY, Supabase, and Stripe vars
npm run dev
```

Get the dev `TRIGGER_SECRET_KEY` from the trigger.dev dashboard → your
project (`proj_jttutwasmhutguvubkcy`) → **API Keys** (pick the Development
environment key). Get the Supabase values from the project setup above.

`stripe listen` prints a webhook signing secret (`whsec_...`) on startup —
copy it into `.env.local` as `STRIPE_WEBHOOK_SECRET`. It's a different,
ephemeral secret each time you run the command — not the same as a
dashboard-registered production endpoint's signing secret.

Open http://localhost:3000 — you'll land on `/login`. Sign up, then fill out
a lead and click Analyze. Visit `/billing` to test the upgrade flow with
Stripe's test card `4242 4242 4242 4242`.
