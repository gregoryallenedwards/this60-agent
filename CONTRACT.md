# This60 Contract

The small, **frozen** interface that the This60 app and the `this60-agent` engine both
depend on. Freeze this first; build either side against it.

**This doc is:** the task format, selection rules, naming, trigger inputs, de-queue
semantics, and the blocked/cowork output shape.

**This doc is *not*:** playbook contents, engine internals, or app UI. Those can change
freely as long as they keep speaking this contract.

---

## 1. The task line

Tasks live as markdown checklist lines in a working repo's **`.this60/main.md`**. Each
line carries a trailing HTML comment holding its machine-readable fields:

```
- [ ] Add CSV export  <!-- id:t_4f2a desc:Add CSV export queue:agent -->
```

| Field        | Meaning                                                                 |
|--------------|-------------------------------------------------------------------------|
| `- [ ]`/`- [x]` | Checkbox. Unchecked = open. Checked = done.                          |
| `id`         | Stable, unique key for the task. Never reused. Drives branch/PR linkage.|
| `desc`       | Human-readable description. The agent classifies the work from this.     |
| `queue:agent`| **Authoritative** "act on this" marker. Its presence = the user wants it done. |
| `stub:true`  | **App-side only** (see below). Not a selection criterion.                |

### `stub` is app-side only

A stub means the user jotted a reminder, not a real prompt yet. **The app prevents a stub
from ever arming `queue:agent`.** The engine therefore never selects *on* stub.

If the engine ever sees `queue:agent` **and** `stub:true` together, that is not "skip" — it
means the agent earlier fleshed a stub into a real task that got queued but forgot to strip
the stale flag. The engine **proceeds with the task and strips the stale `stub:true`** as
part of its work.

---

## 2. Selection rules

The engine's `select` step picks up a task **iff all three hold**:

1. the checkbox is **unchecked** (`- [ ]`), **and**
2. the line carries **`queue:agent`**, **and**
3. there is **no open PR** for the task (see §3 for the link).

`stub` is **not** part of this predicate.

---

## 3. Branch & PR naming

- **One PR per task.** Disparate tasks are never batched into one commit.
- **Branch name:** `this60/<id>` — e.g. `this60/t_4f2a`.
- The branch name is the link the app and engine both use to answer **"is there an open PR
  for this task?"**: a task has an open PR iff an open PR's head branch is `this60/<id>`.
- The PR body carries the agent's **self-QA** (what it changed, how it tested).

---

## 4. Trigger

- **Default trigger:** `workflow_dispatch` — the app presses "Run queue" on the user's
  behalf. No mandatory cron. (Per-repo opt-in schedule is allowed but off by default.)
- **Dispatch input — `max_tasks`:** app-supplied cap on how many tasks one run handles.
  **Default = infinite** (no cap → every eligible task runs) when the app sends nothing.
  Throttling is a conscious app-side UI choice; the engine does not impose a default cap.
  Remaining automatic cost guards are `--max-turns` per task and the opt-in per-repo daily cap.

---

## 5. De-queue semantics

The agent does **all** of the following **on the task's branch** when it completes a task:

- check the box (`- [ ]` → `- [x]`),
- strip `queue:agent`,
- strip any stale `stub:true` (see §1).

**Merging the PR is what lands these on `main`** — the change and the de-queue arrive
together, atomically. The agent **never auto-merges**; a human one-tap merge is required.

---

## 6. Decompose: blocked-code & cowork outputs

A playbook sorts its steps into **CODE** / **BLOCKED CODE** / **COWORK**. When the agent
runs a task it **does the CODE it can**, and for the parts it cannot do it **writes the
remainder out as new tasks in `.this60/main.md`** so nothing is lost:

- **BLOCKED CODE** — a guardrail stopped the agent. Emitted as a new task, **not enqueued**
  (no `queue:agent`), carrying a note of *what* blocked it.
- **COWORK** — human-only console steps. Emitted as a new task, **not enqueued** (human-only
  by definition).

Rules:

1. **The emitted tasks ride the same PR branch.** Merging the one PR lands the CODE change
   *and* the new blocked/cowork tasks on `main` together.
2. **Neither kind is enqueued by default.** Re-queuing a blocked-code task is the user's
   decision once the blocker clears; cowork tasks stay human-only.
3. Each emitted task **links back to the parent task `id` and the PR**, so context is kept.

> **Boundary:** decomposition above happens when the agent **has a matching playbook**. When
> there is **no** matching playbook ("novel"), the agent does not invent one — it stops and
> surfaces the task to the user for a hand-authored playbook. (No automated write-back to the
> public `this60-agent` repo.)

---

## 7. Enqueue-time cheap checks (app side)

At enqueue the app may rely on these without spending a runner:

- the subscription secret **exists**, and
- its **`updated_at` age** (→ surface "renew soon" as the one-year token ages).

**Existence ≠ validity.** The real **auth-ping** is the first step of the user-triggered run,
so a dead key surfaces within seconds of "Run queue" — never as a silently-missing day of work.
