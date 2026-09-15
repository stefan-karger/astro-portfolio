# Issue tracker: Local Markdown

Issues and specs for this repository live as Markdown files in `.scratch/`.

This is the repository's only issue tracker. Never create, update, close, label, or comment on issues in GitHub, GitLab, Linear, Jira, or another external tracker, even if the repository later gains a remote.

## Conventions

- Use one directory per feature: `.scratch/<feature-slug>/`.
- Store the feature specification at `.scratch/<feature-slug>/spec.md`.
- Store implementation tickets as separate files at `.scratch/<feature-slug>/issues/<NN>-<slug>.md`.
- Number tickets from `01` in dependency order, with blockers before the tickets they block.
- Never combine multiple implementation tickets into one file.
- Record triage state in a `Status:` line near the top of each ticket.
- Append comments and conversation history under a `## Comments` heading at the bottom of the relevant file.

## Publishing tickets

When a skill says to publish tickets, create the feature directory and write one file per ticket under its `issues/` directory. Do not invoke an external issue-tracker command, API, connector, or tool.

Use this ticket shape:

```markdown
# <NN>: <Ticket title>

**What to build:** <The end-to-end behavior this ticket delivers.>

**Blocked by:** <Numbers and titles of blocking tickets, or "None (can start immediately)".>

**Status:** ready-for-agent

- [ ] Acceptance criterion 1
- [ ] Acceptance criterion 2
```

## Fetching tickets

Read the referenced file from `.scratch/`. The user will normally provide a path, feature slug, or ticket number.
