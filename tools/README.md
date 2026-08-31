# tools/

This is the **T** in the WAT framework: the scripts the agent (Claude Code)
invokes to actually execute a workflow.

This folder is a self-contained trigger.dev project.

## Layout

```
tools/
  trigger.config.ts        trigger.dev project config (set your project ref here)
  src/trigger/
    qualifyLead.ts          the qualify-lead task — implements workflows/lead-qualification.md
  .env.example               copy to .env and fill in OPENAI_API_KEY for local dev
  package.json
```

## qualify-lead task

Takes a loosely-typed lead object (whatever fields the frontend form sends),
calls a GPT model (OpenAI API) with the scoring rubric from
[`../workflows/lead-qualification.md`](../workflows/lead-qualification.md),
and returns a structured `QualificationResult` (score, band, per-category
reasoning, summary, recommended action, missing info, red flags).

Keep the category weights/guidance in `SYSTEM_PROMPT` (in `qualifyLead.ts`)
in sync with `workflows/lead-qualification.md` — the doc is the source of
truth, the prompt is its implementation.

## Local development

```bash
cd tools
npm install
cp .env.example .env   # then fill in OPENAI_API_KEY
npx trigger.dev@latest login
npx trigger.dev@latest dev
```

See the root [`CLAUDE.md`](../CLAUDE.md) for the full deploy guide.
