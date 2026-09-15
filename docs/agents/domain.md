# Domain docs

How agent skills should consume this repository's domain documentation when exploring the codebase.

## Before exploring

Read these files when they exist:

- `CONTEXT.md` at the repository root.
- `docs/adr/` entries that affect the area being changed.

If either location does not exist, proceed silently. Do not propose creating domain documentation before the work exposes a term or decision worth recording.

## File structure

This repository uses a single-context layout:

```text
/
|-- CONTEXT.md
|-- docs/
|   `-- adr/
`-- src/
```

## Use the glossary's vocabulary

When output names a domain concept in a ticket, proposal, hypothesis, or test, use the term defined in `CONTEXT.md`. Do not replace established terms with synonyms.

If a needed concept is absent, reconsider whether it belongs to the domain. If it does, note the gap for later domain modeling.

## Flag ADR conflicts

If proposed work conflicts with an existing ADR, state the conflict instead of silently overriding the decision.
