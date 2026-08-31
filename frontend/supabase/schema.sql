-- Run once in the Supabase project's SQL Editor (dashboard -> SQL Editor).
-- Not applied automatically — this repo doesn't use the Supabase CLI/migrations,
-- this file is just the source of truth to paste in by hand.

create table public.lead_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_name text not null,
  score smallint not null check (score >= 0 and score <= 100),
  band text not null check (band in ('Hot', 'Warm', 'Cool', 'Cold')),
  lead_fields jsonb not null,   -- raw submitted LeadFormValues (frontend/lib/leadFields.ts)
  result jsonb not null,        -- full QualificationResult, verbatim (frontend/lib/qualification-types.ts)
  created_at timestamptz not null default now()
);

create index lead_scores_user_id_created_at_idx
  on public.lead_scores (user_id, created_at desc);

alter table public.lead_scores enable row level security;

create policy "Users can view their own lead scores"
  on public.lead_scores for select
  using (auth.uid() = user_id);

create policy "Users can insert their own lead scores"
  on public.lead_scores for insert
  with check (auth.uid() = user_id);

-- No update/delete policy: rows are immutable history, so those stay
-- default-denied under RLS.
--
-- score/band are denormalized from inside `result` purely so the /history
-- list page can select/order without unpacking JSONB per row. lead_fields
-- and result stay JSONB so the still-placeholder category weights/bands
-- (see ../../workflows/lead-qualification.md) can change later without a
-- migration.

-- profiles: one row per user tracking Stripe subscription state. Written
-- exclusively by the Stripe webhook route (frontend/app/api/stripe/webhook/route.ts)
-- via the service-role client, which bypasses RLS entirely — there are
-- intentionally no insert/update/delete policies below for anon/authenticated.
-- A user with no row here has never checked out; app code treats that as the
-- free plan by default (see frontend/lib/subscription.ts) rather than
-- pre-creating a row per signup.
create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text,
  subscription_status text,  -- raw Stripe Subscription.status; null until first checkout
  plan text not null default 'free' check (plan in ('free', 'paid')),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

-- No insert/update/delete policy: all writes happen via the service-role
-- webhook client, which bypasses RLS entirely.
