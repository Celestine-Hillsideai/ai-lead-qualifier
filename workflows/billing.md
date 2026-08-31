# Billing & Usage Limits Workflow

Implemented by: `frontend/app/api/qualify-lead/route.ts` (quota check),
`frontend/app/api/stripe/*` (Stripe integration), `frontend/lib/subscription.ts`
(shared plan/quota helpers).

## Goal

Gate lead qualification behind a usage limit, with a paid upgrade path for
unlimited use — enforced server-side so it can't be bypassed from the
client.

## Tiers

| Tier | Price | Limit |
|---|---|---|
| Free | $0 | 2 lead qualifications per day |
| Paid | $29/month | Unlimited lead qualifications |

The daily limit resets at UTC midnight, not the user's local midnight —
simpler and consistent server-side.

## How plan status is determined

Each user's plan lives in the `profiles` table
(`frontend/supabase/schema.sql`), keyed by `user_id`, with a `plan` column
of `'free'` or `'paid'`. **A user with no row is treated as free** — a row
is only ever created once they complete a Stripe Checkout, not at signup.

`profiles` is written **exclusively** by the Stripe webhook
(`frontend/app/api/stripe/webhook/route.ts`), using a Supabase service-role
client that bypasses Row Level Security — regular user sessions can only
read their own row. This is the only table in the app not managed via the
user's own RLS-scoped writes; see the comment above the table in
`schema.sql` for why.

The webhook keeps `plan` in sync from Stripe subscription events:

- `checkout.session.completed` / `customer.subscription.{created,updated}` →
  `plan = 'paid'` when the Stripe subscription status is `active` or
  `trialing`, else `'free'` (this also covers `past_due` after a failed
  renewal payment — access is revoked without a dedicated
  `invoice.payment_failed` handler).
- `customer.subscription.deleted` → `plan = 'free'`.

## Enforcement

`frontend/app/api/qualify-lead/route.ts` checks the caller's plan
immediately after the existing auth check, before triggering the
qualification task. Free-plan users get a live count of today's
`lead_scores` rows; at 2 or more, the request is rejected with
`402 QUOTA_EXCEEDED` rather than being triggered. Paid-plan users skip the
count entirely.

## Upgrade / manage flow

- **Upgrade**: `frontend/app/api/stripe/checkout/route.ts` creates a Stripe
  Checkout Session (redirect-based, no client-side Stripe.js) for the single
  $29/mo Price (`STRIPE_PRICE_ID`), tagged with the Supabase user id so the
  webhook can map events back without a customer-id lookup.
- **Manage/cancel**: `frontend/app/api/stripe/portal/route.ts` creates a
  Stripe Billing Portal session for the user's existing Stripe customer.
- Both live behind the `/billing` page (`frontend/app/(protected)/billing/page.tsx`).

## Open TODOs

- No public/marketing pricing page — the whole app is already behind the
  auth gate, so `/billing` is the only place plan/pricing is shown.
- No proactive notification on payment failure beyond access reverting to
  free; add an `invoice.payment_failed` handler if a user-facing warning
  becomes worth the complexity.
