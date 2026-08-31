# AI Lead Qualifier

## Project overview

A tool that qualifies sales leads with AI. A user fills out a lead form on a
web frontend and clicks **Analyze**; that triggers a backend workflow which
scores/qualifies the lead against an Ideal Customer Profile (ICP) and returns
a result that the frontend displays.

## The WAT framework

This repo is organized around **W-A-T**:

- **W — [`workflows/`](workflows/)**: instructions, in plain language, for how
  the qualification process should work — criteria, scoring logic, playbooks.
  This is the "what should happen."
- **A — Agent**: Claude Code (you, running in this repo). No folder — the
  agent reads the workflows and writes/maintains the tools that implement
  them.
- **T — [`tools/`](tools/)**: the actual runnable implementation — trigger.dev
  tasks and helper scripts. This is the "what actually happens."

When starting work in this repo, read `workflows/` first to understand intent,
then `tools/` to see what's implemented, and keep the two in sync as you make
changes.

## Architecture

Single monorepo. Two deployable pieces:

- **Frontend** — a Next.js (App Router, TypeScript) web form, living in
  [`frontend/`](frontend/). Runs locally today (`frontend/README.md`); not yet
  deployed to Vercel.
- **Backend** — a **trigger.dev** project containing the lead-qualification
  task(s), living in [`tools/`](tools/). Scaffolded: `tools/src/trigger/qualifyLead.ts`
  implements the `qualify-lead` task described in
  [`workflows/lead-qualification.md`](workflows/lead-qualification.md), calling
  a GPT model via the OpenAI SDK. See `tools/README.md` for local dev, and
  "Deploying to trigger.dev" below for deployment.

**Communication**: on "Analyze," the frontend POSTs the form to its own
server-side API route (`frontend/app/api/qualify-lead/route.ts`), which holds
the trigger.dev secret key (`TRIGGER_SECRET_KEY`, never sent to the browser),
calls `tasks.trigger("qualify-lead", ...)`, polls for the run's result with
`runs.poll(...)`, and returns the final JSON to the client. (`tasks.triggerAndWait`
was considered but only works from inside another trigger.dev task, not an
external Next.js route — see the SDK's `docs/triggering.mdx`.)

**Billing**: `frontend/app/api/stripe/` (`checkout`, `portal`, `webhook`
routes) handles the free (2/day) vs. paid ($29/mo unlimited) tiers via
Stripe Checkout/Billing Portal, with usage enforced in `qualify-lead/route.ts`.
See [`workflows/billing.md`](workflows/billing.md).

## Lead data contract

Locked in. The frontend form's field list — company name (required),
industry, company size, contact name/role, annual budget range (a dropdown,
not free text), timeline, need/pain point, lead source, notes — is defined in
`frontend/lib/leadFields.ts` (the source of truth) and mirrored in
[`workflows/lead-qualification.md`](workflows/lead-qualification.md)'s
"Input" section. The task's `LeadInput` payload type
(`tools/src/trigger/qualifyLead.ts`) stays an intentionally loose
`Record<string, ...>` — update the field list in `leadFields.ts` and the
workflow doc together if it changes; the task itself doesn't need to change.

## Qualification method

Custom **ICP (Ideal Customer Profile) scoring** — the model scores each lead 0-100
across six weighted categories (industry fit, company size fit, budget signal,
timeline/urgency, authority, need clarity), bucketed into Hot/Warm/Cool/Cold
bands. Full rubric: [`workflows/lead-qualification.md`](workflows/lead-qualification.md).

**Still placeholder**: the category weights and "what good looks like"
guidance are sensible defaults, not your real ICP. Tune them in
`workflows/lead-qualification.md` (and mirror the change into the
`SYSTEM_PROMPT` in `tools/src/trigger/qualifyLead.ts`) once you have real
qualification criteria.

## Deploying to trigger.dev

See the step-by-step guide below (also mirrored in `tools/README.md`'s local
dev section). Short version:

1. `cd tools && npm install`
2. `npx trigger.dev@latest login` (opens a browser to authenticate)
3. Create a project in the trigger.dev dashboard, copy its **project ref**
   into `tools/trigger.config.ts` (`project: "proj_..."`)
4. Set `OPENAI_API_KEY` as an environment variable in the trigger.dev
   dashboard (Environment Variables page) for each environment you deploy to
5. `npx trigger.dev@latest deploy` from `tools/`

## Conventions for future sessions

- A workflow doc and its implementing tool script should stay in sync — if you
  change qualification logic, update both `workflows/` and `tools/`.
- New qualification criteria or new workflows (e.g. re-qualification, lead
  enrichment) get their own file in `workflows/`, not piled into one doc.
- Repo subfolder names and the lead field list are resolved (see
  "Architecture" and "Lead data contract" above). ICP criteria (category
  weights, band thresholds) are still placeholder — tune them in
  `workflows/lead-qualification.md` as real qualification data comes in, and
  mirror changes into `tools/src/trigger/qualifyLead.ts`'s `SYSTEM_PROMPT`.
