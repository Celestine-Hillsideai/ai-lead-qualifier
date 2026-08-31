# workflows/

This is the **W** in the WAT framework: the instructions the agent (Claude Code)
follows when running the AI Lead Qualifier.

Each file here should describe *how* a piece of the qualification process works —
in plain language, not code. The scripts in [`../tools/`](../tools/) implement
what these docs describe.

## Planned content

- `lead-qualification.md` — the core workflow: how a submitted lead gets scored
  and qualified. **TBD**: the Ideal Customer Profile (ICP) scoring criteria
  (target industries, company size, budget/timeline signals, disqualifiers,
  score bands, etc.) still need to be defined and written up here before the
  matching trigger.dev task can be built.

As more workflows are added (e.g. re-qualification, lead enrichment), give each
its own file.
