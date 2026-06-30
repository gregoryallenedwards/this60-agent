// select/parse.mjs
//
// Deterministic, AI-free selection of enqueued This60 tasks from a working
// repo's `.this60/main.md`. Pure functions only (no I/O, no network) so the
// selection rules can be unit-tested with zero runner cost. The reusable
// workflow feeds it the markdown plus the set of open-PR head branches and an
// optional max_tasks cap, and turns `selectTasks()` output into a job matrix.
//
// Implements CONTRACT.md §2 selection predicate:
//   eligible iff  unchecked  AND  queue:agent  AND  no open PR (branch this60/<id>)
// `stub` is NOT part of the predicate (CONTRACT.md §1).

const TASK_LINE = /^(\s*)-\s\[([ xX])\]\s+(.*)$/;
const COMMENT = /<!--\s*(.*?)\s*-->/;

// Parse the `key:value` tokens inside a task's trailing HTML comment.
// Tokens are whitespace-delimited and their values carry no spaces
// (`id:t_4f2a`, `queue:agent`, `stub:true`). A bare token (no colon) becomes
// a `true` flag. The human-readable description is the VISIBLE checklist text,
// not a token here — see the note in CONTRACT.md.
export function parseTokens(commentBody) {
  const tokens = {};
  if (!commentBody) return tokens;
  for (const raw of commentBody.split(/\s+/)) {
    if (!raw) continue;
    const i = raw.indexOf(":");
    if (i === -1) {
      tokens[raw] = true;
    } else {
      tokens[raw.slice(0, i)] = raw.slice(i + 1);
    }
  }
  return tokens;
}

// Parse a single line. Returns null if the line is not a markdown task item.
export function parseLine(line, lineNumber = 0) {
  const m = TASK_LINE.exec(line);
  if (!m) return null;
  const checked = m[2].toLowerCase() === "x";
  const rest = m[3];

  const cm = COMMENT.exec(rest);
  const text = (cm ? rest.slice(0, cm.index) : rest).trim();
  const tokens = parseTokens(cm ? cm[1] : "");

  return {
    raw: line,
    lineNumber,
    checked,
    text, // visible description — what the agent classifies from
    tokens,
    id: typeof tokens.id === "string" ? tokens.id : null,
    queued: tokens.queue === "agent",
    stub: tokens.stub === "true" || tokens.stub === true,
  };
}

export function parseTasks(markdown) {
  const out = [];
  const lines = markdown.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const task = parseLine(lines[i], i + 1);
    if (task) out.push(task);
  }
  return out;
}

export function branchFor(id, branchPrefix = "this60/") {
  return `${branchPrefix}${id}`;
}

// Apply the §2 predicate plus the max_tasks cap.
//
//   markdown        : contents of .this60/main.md
//   openPrBranches  : iterable of head-branch names with an OPEN PR
//   maxTasks        : cap per run (default Infinity = no cap, CONTRACT.md §4)
//   branchPrefix    : naming convention (CONTRACT.md §3)
//
// Returns { selected, skipped } where every non-selected-but-noteworthy task
// lands in `skipped` with a reason — nothing is dropped silently (a cap that
// defers work is surfaced, not hidden).
export function selectTasks({
  markdown,
  openPrBranches = [],
  maxTasks = Infinity,
  branchPrefix = "this60/",
} = {}) {
  const openSet = new Set(openPrBranches);
  const selected = [];
  const skipped = [];

  for (const task of parseTasks(markdown)) {
    // Not a candidate at all — ignore silently (checked, or never enqueued).
    if (task.checked || !task.queued) continue;

    // Enqueued but malformed: no id means we cannot form a branch. Surface it.
    if (!task.id) {
      skipped.push({ task, reason: "missing-id" });
      continue;
    }

    const branch = branchFor(task.id, branchPrefix);

    // Already has an open PR → expected skip (CONTRACT.md §2/§3), surfaced.
    if (openSet.has(branch)) {
      skipped.push({ task, branch, reason: "open-pr" });
      continue;
    }

    if (selected.length >= maxTasks) {
      skipped.push({ task, branch, reason: "max-tasks-cap" });
      continue;
    }

    selected.push({
      id: task.id,
      desc: task.text,
      branch,
      stub: task.stub, // engine strips a stale stub flag while working (§1)
      lineNumber: task.lineNumber,
    });
  }

  return { selected, skipped };
}

// Shape consumed by the workflow's `strategy.matrix` (one entry per task).
export function toMatrix(selected) {
  return { include: selected.map(({ id, desc, branch }) => ({ id, desc, branch })) };
}
