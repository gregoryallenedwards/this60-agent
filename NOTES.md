# Captured requirements & notes

Durable home for decisions and requirements that aren't code yet, so they
aren't rediscovered later. App-side items live here until the onboarding phase
is built; engine/brain items link to where they're implemented.

---

## Onboarding: surface & persist manual steps (app)

**Requirement.** Some onboarding steps cannot be automated — they are console /
account / settings actions only a human can do. For every such step the This60
app must:

1. **Prompt at the moment it's needed** — a pop-up / inline note when the step
   becomes relevant (e.g. during repo onboarding), not buried in docs.
2. **Persist it re-findably** — record it in an onboarding checklist the user
   can return to, showing done / not-done, so an interrupted setup is never
   lost and the user can look it up again.

**First/known instances (the human-only onboarding steps):**

- [ ] **Allow GitHub Actions to create and approve pull requests** —
      repo (or org) **Settings → Actions → General → Workflow permissions →**
      check *"Allow GitHub Actions to create and approve pull requests"* → Save.
      Without it, the agent's PR step fails.
- [ ] **Establish the subscription key** — add `CLAUDE_CODE_OAUTH_TOKEN`
      (repo or org) from `claude setup-token`. The app can only *guide + verify
      existence*, never hold the token. No key → lens-only mode.
- [ ] **Signing** — iOS certificate/profile (Apple Developer) and Android
      upload keystore; store references as GitHub secrets by NAME only.
- [ ] **App identity** — choose bundle id / application id and create the app
      record in App Store Connect and Google Play Console.

These are also the COWORK items the `scaffold-app` playbook emits as tasks; the
app is responsible for surfacing + persisting them per the requirement above.
