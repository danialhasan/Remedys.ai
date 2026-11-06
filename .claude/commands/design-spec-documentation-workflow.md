---
name: design-spec-documentation-workflow
description: Workflow command scaffold for design-spec-documentation-workflow in Remedys.ai.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /design-spec-documentation-workflow

Use this workflow when working on **design-spec-documentation-workflow** in `Remedys.ai`.

## Goal

Adds or updates design specifications and guidelines in the documentation, often as markdown files in a dated, topic-specific folder.

## Common Files

- `docs/superpowers/specs/*.md`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create or update a markdown file in docs/superpowers/specs/ with a dated filename.
- Optionally update related spec files to reflect new decisions or guidelines.

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.