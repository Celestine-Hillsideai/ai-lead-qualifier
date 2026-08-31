# Lead Qualification Workflow

Implemented by: [`tools/src/trigger/qualifyLead.ts`](../tools/src/trigger/qualifyLead.ts)
(`qualify-lead` trigger.dev task).

## Goal

Given raw information about a lead, produce an ICP fit score, a qualification
band, and a recommended next action — consistently, in structured form, so the
frontend can render it without post-processing.

## Input

The task's payload type stays a free-form `Record<string, ...>` — it does not
require a fixed schema, and works from whatever fields are present, noting
when key information is missing. The frontend form (`frontend/lib/leadFields.ts`,
the source of truth for the field list) currently collects:

| Field | Required | Informs |
|---|---|---|
| Company name | Yes | — |
| Industry | No | Industry / vertical fit |
| Company size | No | Company size fit |
| Contact name | No | Authority |
| Contact role / title | No | Authority |
| Annual budget range | No | Budget signal |
| Timeline / urgency | No | Timeline / urgency |
| Need / pain point | No | Need / pain-point clarity |
| Lead source | No | (context only) |
| Additional notes | No | (context only) |

Only Company name is required client-side, matching this doc's own guidance
below: missing info should pull a category toward the middle, not zero.

Annual budget range is a fixed dropdown, not free text, so the model always
sees one of: Under $5K, $5K – $25K, $25K – $100K, $100K – $500K, $500K+, or
Not sure / not shared. Keep this list in sync with `BUDGET_RANGE_OPTIONS` in
`frontend/lib/leadFields.ts` if it changes.

## Scoring model: ICP fit, 0-100

Score across five weighted categories. These defaults are a starting point —
tune the weights and the "what good looks like" guidance below to match your
actual ICP as you learn from real leads.

| Category | Points | What good looks like |
|---|---|---|
| Industry / vertical fit | 20 | Lead's industry matches (or is adjacent to) the target verticals for the product |
| Company size fit | 20 | Employee count / revenue falls in the target range — not a solo founder, not enterprise-too-big (unless that IS the target) |
| Budget signal | 20 | Lead has stated or implied budget, has bought comparable tools before, or company size implies ability to pay |
| Timeline / urgency | 15 | Lead has an active project, a stated timeline, or an explicit trigger event (not "just browsing") |
| Authority / decision-making power | 15 | Contact is the decision-maker or has clear influence (title, stated role) |
| Need / pain-point clarity | 10 | Lead articulates a concrete problem the product solves, not just general interest |

Missing information in a category should pull that category's score toward
the middle, not zero — don't penalize a lead just for an incomplete form.
Note missing/uncertain fields explicitly in the reasoning rather than
guessing silently.

## Score bands

| Band | Score | Meaning | Recommended action |
|---|---|---|---|
| Hot | 80-100 | Strong ICP fit across the board | Route to sales immediately, prioritize outreach |
| Warm | 60-79 | Good fit, one or two gaps | Qualify further / schedule a call |
| Cool | 40-59 | Partial fit, real gaps | Add to nurture sequence, revisit later |
| Cold | 0-39 | Poor fit or disqualifying signal | Do not prioritize; log and move on |

## Output shape

The task returns structured JSON:

```json
{
  "score": 0-100,
  "band": "Hot" | "Warm" | "Cool" | "Cold",
  "categoryScores": {
    "industryFit": { "score": 0-20, "reasoning": "..." },
    "companySizeFit": { "score": 0-20, "reasoning": "..." },
    "budgetSignal": { "score": 0-20, "reasoning": "..." },
    "timelineUrgency": { "score": 0-15, "reasoning": "..." },
    "authority": { "score": 0-15, "reasoning": "..." },
    "needClarity": { "score": 0-10, "reasoning": "..." }
  },
  "summary": "one or two sentence overall read on this lead",
  "recommendedAction": "what to do next",
  "missingInfo": ["fields that were absent and affected confidence"],
  "redFlags": ["any disqualifying or concerning signals"]
}
```

## Open TODOs

- Replace the placeholder category weights/guidance above with your actual
  ICP once you have real qualification data (target industries, real company
  size range, price point, etc.).
- ~~If the input lead fields become fixed (a real form schema), update this
  doc and the task's input type together.~~ Resolved: the field list above is
  locked in via `frontend/lib/leadFields.ts`. The task's `LeadInput` type
  stays intentionally loose (see `tools/src/trigger/qualifyLead.ts`) — update
  the table above if `leadFields.ts` changes.
