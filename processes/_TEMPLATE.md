<!--
Playbook template. Copy to processes/<activity-id>.md and fill in.

Rules:
- COWORK comes FIRST — it is the expensive, repeatedly-rediscovered, human-only
  knowledge and must be surfaced before any code.
- Every step belongs to exactly one bucket: COWORK / BLOCKED CODE / CODE.
- Keep it stack-honest but extensible: per-store / per-platform subsections so a
  new store, web, or desktop target is an added section, not a rewrite.
- PUBLIC REPO: no secrets, no real bundle IDs, no internal hostnames. Use
  placeholders like <your.bundle.id> and reference secret NAMES only.
-->

# <Activity title>

**When this applies:** <one sentence — should echo the `match` line in index.json>

## COWORK — human-only (the agent cannot do these; surface them, never attempt)
> Console / account / signing work. The agent emits each unfinished item as a
> NEW, non-enqueued task linked to the parent (CONTRACT.md §6).

- [ ] <step> — where (which console), why it's human-only

## BLOCKED CODE — code, but a guardrail stops the agent
> Usually needs a secret, a signing identity, or a store identifier that does
> not exist yet. Emit as a NEW non-enqueued task noting what would unblock it.

- [ ] <step> — what blocks it, what unblocks it

## CODE — the agent does these now
- [ ] <step>

## QA
- Run the repo's test command from `.this60/THIS60.md` (default: `flutter analyze && flutter test`).
- <activity-specific checks, if any>
