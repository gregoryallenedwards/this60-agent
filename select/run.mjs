// select/run.mjs — thin CLI wrapper the workflow calls.
//
// Reads a working repo's .this60/main.md, applies the tested selection rules,
// and emits the job matrix + has_tasks as GitHub Actions step outputs. All
// real logic lives in parse.mjs (unit-tested); this file is just I/O.
//
//   node run.mjs <path-to-main.md>
//   env: OPEN_PR_BRANCHES (newline-separated), MAX_TASKS (0 = no cap)

import { readFileSync, appendFileSync } from "node:fs";
import { selectTasks, toMatrix } from "./parse.mjs";

const mainPath = process.argv[2];
if (!mainPath) {
  console.error("usage: run.mjs <path-to-main.md>");
  process.exit(2);
}

// A missing main.md means an empty queue, not an error.
let markdown = "";
try {
  markdown = readFileSync(mainPath, "utf8");
} catch {
  markdown = "";
}

const openPrBranches = (process.env.OPEN_PR_BRANCHES || "")
  .split(/\r?\n/)
  .map((s) => s.trim())
  .filter(Boolean);

const rawMax = parseInt(process.env.MAX_TASKS || "0", 10);
const maxTasks = Number.isFinite(rawMax) && rawMax > 0 ? rawMax : Infinity;

const { selected, skipped } = selectTasks({ markdown, openPrBranches, maxTasks });
const matrix = toMatrix(selected);
const hasTasks = selected.length > 0;

const out = process.env.GITHUB_OUTPUT;
if (out) {
  appendFileSync(out, `has_tasks=${hasTasks}\n`);
  appendFileSync(out, `matrix=${JSON.stringify(matrix)}\n`);
}

// Human-readable report — nothing is dropped silently (CONTRACT.md §4).
const lines = [`Selected ${selected.length} task(s):`];
for (const s of selected) lines.push(`  • ${s.id}  "${s.desc}"  → ${s.branch}`);
if (skipped.length) {
  lines.push(`Skipped ${skipped.length}:`);
  for (const s of skipped) {
    const id = s.id || s.task?.id || "(no id)";
    lines.push(`  • ${id}  [${s.reason}]`);
  }
}
const report = lines.join("\n");
console.log(report);

const summary = process.env.GITHUB_STEP_SUMMARY;
if (summary) appendFileSync(summary, "```\n" + report + "\n```\n");
