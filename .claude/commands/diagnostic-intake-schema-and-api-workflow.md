---
name: diagnostic-intake-schema-and-api-workflow
description: Workflow command scaffold for diagnostic-intake-schema-and-api-workflow in Remedys.ai.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /diagnostic-intake-schema-and-api-workflow

Use this workflow when working on **diagnostic-intake-schema-and-api-workflow** in `Remedys.ai`.

## Goal

Introduces or updates a diagnostic intake schema, implements backend logic to accept new payloads, and adds or updates verification scripts/tests.

## Common Files

- `supabase/migrations/*.sql`
- `netlify/functions/remedys-intake.js`
- `scripts/verify-remedys-intake.js`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Add a new migration SQL file in supabase/migrations/ for the diagnostic schema.
- Update backend function (netlify/functions/remedys-intake.js) to handle the new payload.
- Add or update test/verification scripts in scripts/verify-remedys-intake.js.

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.