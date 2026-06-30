<!--
Copy this to a working repo at .this60/THIS60.md and fill in the blanks.
It tells the This60 engine how to QA this repo and where the brain lives.
PUBLIC-SAFE: no secrets, no real bundle ids — references only.
-->

# THIS60

## Test command
The engine runs this for repo-aware QA (CONTRACT.md / agent-loop.yml).

```
flutter analyze && flutter test
```

## Stack
- Framework: Flutter
- Targets: App Store, Google Play <!-- add macOS / web / other stores as enabled -->

## Brain pointer
Before acting on an enqueued task, resolve its activity against
`gregoryallenedwards/this60-agent/index.json@v1` and follow the matched
playbook. No confident match → treat the task as **novel** and stop for a human
(do not invent a process; do not write back to the public agent repo).

## Notes
<!-- Anything repo-specific the agent should know: non-standard layout,
     special build steps, platforms that need manual verification, etc. -->
