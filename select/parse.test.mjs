// select/parse.test.mjs — run with: node --test
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parseLine, parseTokens, selectTasks, toMatrix } from "./parse.mjs";

const fixture = readFileSync(
  fileURLToPath(new URL("./fixtures/sample-main.md", import.meta.url)),
  "utf8",
);
const legacy = readFileSync(
  fileURLToPath(new URL("./fixtures/legacy-main.md", import.meta.url)),
  "utf8",
);

test("parseTokens: key:value, flags, and queue:agent", () => {
  const t = parseTokens("id:t_4f2a queue:agent stub:true bare");
  assert.equal(t.id, "t_4f2a");
  assert.equal(t.queue, "agent");
  assert.equal(t.stub, "true");
  assert.equal(t.bare, true);
});

test("parseLine: visible text is the description, comment holds tokens", () => {
  const t = parseLine("- [ ] Add CSV export  <!-- id:t_4f2a queue:agent -->");
  assert.equal(t.checked, false);
  assert.equal(t.text, "Add CSV export");
  assert.equal(t.id, "t_4f2a");
  assert.equal(t.queued, true);
  assert.equal(t.stub, false);
});

test("parseLine: checked box detected (case-insensitive)", () => {
  assert.equal(parseLine("- [x] done <!-- id:a queue:agent -->").checked, true);
  assert.equal(parseLine("- [X] done <!-- id:a queue:agent -->").checked, true);
});

test("parseLine: non-task lines return null", () => {
  assert.equal(parseLine("# heading"), null);
  assert.equal(parseLine("just prose"), null);
  assert.equal(parseLine(""), null);
});

test("selectTasks: applies the §2 predicate over the fixture", () => {
  const { selected, skipped } = selectTasks({ markdown: fixture });
  // Eligible: t_4f2a, t_2f30 (stub ignored), t_5b7e, t_7a21
  assert.deepEqual(selected.map((s) => s.id), ["t_4f2a", "t_2f30", "t_5b7e", "t_7a21"]);
  // Not enqueued (t_88c1) and checked (t_1009) are ignored silently.
  // The blank queued line with no id is surfaced as missing-id.
  assert.deepEqual(skipped.map((s) => s.reason), ["missing-id"]);
});

test("selectTasks: stub:true is selected but flagged for cleanup", () => {
  const { selected } = selectTasks({ markdown: fixture });
  const stubbed = selected.find((s) => s.id === "t_2f30");
  assert.equal(stubbed.stub, true);
});

test("selectTasks: branch naming follows this60/<id>", () => {
  const { selected } = selectTasks({ markdown: fixture });
  assert.equal(selected[0].branch, "this60/t_4f2a");
});

test("selectTasks: an open PR for the task's branch is skipped", () => {
  const { selected, skipped } = selectTasks({
    markdown: fixture,
    openPrBranches: ["this60/t_5b7e"],
  });
  assert.ok(!selected.some((s) => s.id === "t_5b7e"));
  assert.ok(skipped.some((s) => s.reason === "open-pr" && s.branch === "this60/t_5b7e"));
});

test("selectTasks: max_tasks caps and surfaces the overflow", () => {
  const { selected, skipped } = selectTasks({ markdown: fixture, maxTasks: 2 });
  assert.equal(selected.length, 2);
  assert.deepEqual(selected.map((s) => s.id), ["t_4f2a", "t_2f30"]);
  const capped = skipped.filter((s) => s.reason === "max-tasks-cap").map((s) => s.id ?? s.task.id);
  assert.deepEqual(capped, ["t_5b7e", "t_7a21"]);
});

test("selectTasks: default is no cap (infinite)", () => {
  const { selected } = selectTasks({ markdown: fixture });
  assert.equal(selected.length, 4);
});

test("backward-compat: legacy desc:-in-comment format still selects", () => {
  const { selected } = selectTasks({ markdown: legacy });
  // t_4f2a selected; t_1009 checked → ignored; t_2f30 selected (stub ignored);
  // t_9090 not enqueued → ignored.
  assert.deepEqual(selected.map((s) => s.id), ["t_4f2a", "t_2f30"]);
});

test("backward-compat: description comes from visible text, not the desc: token", () => {
  const t = parseLine(
    "- [ ] Add CSV export  <!-- id:t_4f2a desc:Add CSV export queue:agent -->",
  );
  assert.equal(t.text, "Add CSV export"); // visible text, not the spilled token
  assert.equal(t.id, "t_4f2a");
  assert.equal(t.queued, true);
});

test("edge: a colon-word in the visible text cannot inject a token", () => {
  // The comment is the only token source; visible text is never parsed for tokens.
  const t = parseLine("- [ ] document the queue:agent marker  <!-- id:t_x -->");
  assert.equal(t.queued, false); // 'queue:agent' in the prose does NOT enqueue it
  assert.equal(t.id, "t_x");
});

test("toMatrix: emits include[] with id/desc/branch only", () => {
  const { selected } = selectTasks({ markdown: fixture });
  const matrix = toMatrix(selected);
  assert.equal(matrix.include.length, 4);
  assert.deepEqual(Object.keys(matrix.include[0]).sort(), ["branch", "desc", "id"]);
});
