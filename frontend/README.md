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
  proxy.ts                    session refresh + route protection (Next's `middleware` convention, renamed)
  components/                 LeadForm, ResultsDisplay, ScoreGauge, UserNav, etc.
  lib/
    leadFields.ts              the lead form's field list (source of truth)
    qualification-types.ts     mirrors the output type in ../tools/src/trigger/qualifyLead.ts
    buildLeadInput.ts          form values -> the LeadInput object sent to trigger.dev
    supabase/                  browser/server Supabase client factories + session refresh helper
  supabase/schema.sql          the lead_scores table + RLS policies (paste into the SQL Editor)
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
   key into `.env.local` (below). Never use the `service_role` key here.
4. SQL Editor: paste and run `supabase/schema.sql`, once.

## Local development

Run **both** of these at the same time — the deployed-looking flow needs a
live worker to actually execute the task:

```bash
# terminal 1 — the trigger.dev worker for the qualify-lead task
cd tools
npx trigger.dev@latest dev

# terminal 2 — this app
cd frontend
npm install
cp .env.local.example .env.local   # fill in TRIGGER_SECRET_KEY and the Supabase vars
npm run dev
```

Get the dev `TRIGGER_SECRET_KEY` from the trigger.dev dashboard → your
project (`proj_jttutwasmhutguvubkcy`) → **API Keys** (pick the Development
environment key). Get the Supabase values from the project setup above.

Open http://localhost:3000 — you'll land on `/login`. Sign up, then fill out
a lead and click Analyze.
