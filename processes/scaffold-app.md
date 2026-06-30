# Scaffold a brand-new app

**When this applies:** The repo is empty or has no Flutter app yet. Stand up the
initial Flutter project and its This60 wiring so future tasks have something to
build on. Targets the Apple App Store and Google Play first; macOS / web can be
enabled later.

## COWORK — human-only (the agent cannot do these; surface them, never attempt)
> The irreducible human setup. The agent emits each as a NEW, non-enqueued task
> linked to the parent (CONTRACT.md §6). The app must also surface + persist
> these per the onboarding requirement in NOTES.md (pop-up + re-findable checklist).

- [ ] **Register the app identity** — choose a bundle id / application id
      (`<your.bundle.id>`) and create the app record in **App Store Connect**
      and the **Google Play Console**.
- [ ] **Signing** — set up the iOS signing certificate & provisioning profile
      (Apple Developer) and the Android upload keystore. Store their references
      as GitHub secrets by NAME; never commit them.
- [ ] **Establish the subscription key** — add the `CLAUDE_CODE_OAUTH_TOKEN`
      secret (repo or org) from `claude setup-token`. Without it, agent runs are
      disabled (lens-only mode).
- [ ] **Enable PR creation** — turn on "Allow GitHub Actions to create and
      approve pull requests" (Settings → Actions → General).

## BLOCKED CODE — code, but a guardrail stops the agent
- [ ] **Release/build wiring that needs the signing secrets** — write it once
      the signing COWORK items exist; until then it cannot run.
- [ ] **Store-identifier-dependent config** — anything keyed to the bundle id /
      application id is blocked until that id is chosen above.

## CODE — the agent does these now
- [ ] Create the Flutter project (`flutter create`) with a sensible package
      name placeholder; keep iOS + Android platforms, add macOS/web only if the
      task asks.
- [ ] Add a minimal first screen and one passing test under `test/`.
- [ ] Scaffold `.this60/`:
      - `main.md` (empty task list)
      - `THIS60.md` from this repo's `templates/THIS60.md`, with the test
        command set to `flutter analyze && flutter test`.
- [ ] Install the caller workflow at `.github/workflows/this60.yml` from this
      repo's `examples/caller/this60.yml`, pinned `@v1`.
- [ ] Add a basic CI check that runs `flutter analyze && flutter test`.

## QA
- `flutter analyze && flutter test` passes on the freshly scaffolded project.
- The repo now satisfies the onboarding checklist except the human COWORK items
  (identity, signing, key, PR permission), which are emitted as tasks.
