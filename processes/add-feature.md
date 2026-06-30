# Add a feature to an existing app

**When this applies:** Add or change a user-facing capability in a Flutter app
that already exists and builds. Ships to the Apple App Store and Google Play
today; may also target macOS / web — keep platform-specific work in its own
subsection.

## COWORK — human-only (the agent cannot do these; surface them, never attempt)
> Console / account / signing work. The agent emits each unfinished item as a
> NEW, non-enqueued task linked to the parent (CONTRACT.md §6).

- [ ] **New paid capability / IAP or subscription** — create the product in
      **App Store Connect** *and* the **Google Play Console**, set price tiers,
      and fill localized metadata. (Code can reference a product id; only a
      human can create it and agree to the financial terms.)
- [ ] **Store listing impact** — if the feature changes what the listing
      promises (screenshots, description, "what's new", privacy questions),
      update **App Store Connect** and **Play Console** listings.
- [ ] **New permission / data use** — if the feature collects new data or uses
      a sensitive permission, update the **App privacy** / **Data safety**
      questionnaires in both consoles before the next submission.
- [ ] **New native capability / entitlement** — enabling an entitlement
      (push, iCloud, sign-in, etc.) requires the **Apple Developer** portal and
      matching **Play Console** declarations; a human enables it there first.

## BLOCKED CODE — code, but a guardrail stops the agent
> Needs a secret, a signing identity, or a store identifier that does not yet
> exist. Emit as a NEW non-enqueued task noting what would unblock it.

- [ ] **Wiring to an IAP/entitlement that isn't created yet** — write the code
      once the COWORK item above exists; until then it cannot be tested.
- [ ] **Native platform-channel code needing signing/Xcode to verify** — Dart
      is fine; native iOS/macOS changes that require a signed local build or
      Apple Developer config are blocked in CI.
- [ ] **Anything requiring a new GitHub secret** — the agent cannot create
      secrets; note the secret NAME the human must add.

## CODE — the agent does these now
- [ ] Implement the feature in Dart following the app's existing patterns
      (state management, navigation, folder layout already in the repo).
- [ ] Add or update user-facing strings (and localization entries if the app is
      localized).
- [ ] **Add a test** for the new behavior (widget or unit test). If the repo has
      no tests yet, create the first one under `test/`.
- [ ] Keep changes scoped to THIS task only — one feature, one PR.
- [ ] If the feature is platform-specific (macOS/web), guard it appropriately
      and note any platform that still needs manual verification as COWORK.

## QA
- Run the repo's test command from `.this60/THIS60.md` (default:
  `flutter analyze && flutter test`). Both must pass.
- Do not assume an iOS/macOS device build in CI; if the change needs a signed
  device build to truly verify, say so in the outcome summary and emit a COWORK
  verification task.
