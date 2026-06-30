#!/usr/bin/env bash
# Phase 2 plumbing smoke test setup.
#
# Writes a minimal Flutter app + This60 wiring into a target repo so we can
# prove the engine end-to-end (auth-ping, select, agent edit, de-queue,
# commit/push/PR) WITHOUT needing the Flutter SDK in CI. QA is a trivial
# always-pass command on purpose; real flutter analyze/test is a later test.
#
# Usage:
#   ./setup.sh /path/to/your/clone/of/delmethis60agenttest
# Then in that repo:  git add -A && git commit -m "this60 smoke test" && git push
# Then on GitHub:     Actions tab → "This60 Agent" → Run workflow.

set -euo pipefail
TARGET="${1:?usage: setup.sh <path-to-test-repo-clone>}"
BRANCH="claude/intent-review-wzjo42"   # engine pinned to the dev branch (no @v1 yet)
ENGINE="gregoryallenedwards/this60-agent"

mkdir -p "$TARGET/.this60" "$TARGET/.github/workflows" "$TARGET/lib" "$TARGET/test"

# --- caller workflow (pinned at the dev branch) ---------------------------
cat > "$TARGET/.github/workflows/this60.yml" <<YAML
name: This60 Agent
on:
  workflow_dispatch:
    inputs:
      max_tasks:
        description: "Max tasks this run (0 = no cap)"
        type: number
        default: 0
jobs:
  loop:
    uses: ${ENGINE}/.github/workflows/agent-loop.yml@${BRANCH}
    with:
      max_tasks: \${{ inputs.max_tasks || 0 }}
    secrets:
      CLAUDE_CODE_OAUTH_TOKEN: \${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}
YAML

# --- one hand-queued task (simulating the app's enqueue) ------------------
cat > "$TARGET/.this60/main.md" <<'MD'
# This60 tasks

- [ ] Add an About dialog that shows the app name  <!-- id:t_smoke1 queue:agent -->
MD

# --- THIS60.md: trivial QA + a note steering the agent off Flutter build ---
cat > "$TARGET/.this60/THIS60.md" <<MD
# THIS60

## Test command
\`\`\`
echo "smoke test: no automated tests yet"
\`\`\`

## Stack
- Framework: Flutter
- Targets: App Store, Google Play

## Brain pointer
Before acting on an enqueued task, resolve its activity against
\`${ENGINE}/index.json@${BRANCH}\` and follow the matched playbook. No confident
match → treat the task as novel and stop.

## Notes
- SMOKE TEST REPO: the Flutter SDK is NOT installed in CI. Do not run
  \`flutter\` commands. QA is the test command above only. Make the Dart change,
  run the test command, de-queue, and finish.
MD

# --- minimal Flutter app so 'add-feature' matches -------------------------
cat > "$TARGET/pubspec.yaml" <<'YAML'
name: delmethis60agenttest
description: Throwaway This60 engine smoke test.
publish_to: "none"
version: 0.1.0+1
environment:
  sdk: ">=3.0.0 <4.0.0"
dependencies:
  flutter:
    sdk: flutter
dev_dependencies:
  flutter_test:
    sdk: flutter
flutter:
  uses-material-design: true
YAML

cat > "$TARGET/lib/main.dart" <<'DART'
import 'package:flutter/material.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Delme This60 Test',
      home: Scaffold(
        appBar: AppBar(title: const Text('Delme This60 Test')),
        body: const Center(child: Text('Hello')),
      ),
    );
  }
}
DART

echo "Wrote smoke-test files into: $TARGET"
echo "Next:"
echo "  cd \"$TARGET\""
echo "  git add -A && git commit -m 'this60 smoke test' && git push"
echo "  GitHub → Actions → 'This60 Agent' → Run workflow"
