---
name: add-feature
description: Use when asked to add, implement or build a feature (or a ROADMAP subtask) in the Hilka landing (Next.js + Sanity + next-intl). Runs brainstorm → spec → plan → TDD via subagents → full verification → code review as final QA.
---

# Add a feature — Hilka landing

Every feature goes through all seven stages. Skipping a stage needs the owner's explicit OK.

## 1. Brainstorm
Invoke `superpowers:brainstorming`. Read `CLAUDE.md`, the relevant part of `docs/ROADMAP.md`,
`docs/STRUCTURE.md` and `docs/DESIGN.md` first. Settle: which pages/locales, which content
comes from Sanity (new fields?), what the user sees in EN and UK, how it degrades when the CMS
field is empty.

## 2. Spec
Write `docs/superpowers/specs/YYYY-MM-DD-<feature>-design.md`, commit, get owner approval.

## 3. Plan
Invoke `superpowers:writing-plans` → `docs/superpowers/plans/YYYY-MM-DD-<feature>.md`.
Work on a branch off `main` (`feat/<feature>`), not on `main`.

## 4. Implement — TDD via subagents
Invoke `superpowers:subagent-driven-development` (each task: implementer subagent following
`superpowers:test-driven-development`, then a reviewer subagent). For small features the owner
may pick `superpowers:executing-plans` instead.

Test placement:
- pure logic → `src/**/<name>.test.ts` (Vitest)
- client component behaviour → `src/components/<Name>.test.tsx` (Testing Library)
- user-visible flow → `e2e/<flow>.spec.ts` (Playwright, both `desktop` and `mobile` projects;
  cover `/en` and `/uk`; mock `/api/*` side effects with `page.route`)

## 5. Verification
Invoke `superpowers:verification-before-completion`. Run and paste real output of:

```bash
npm run lint && npm run typecheck && npm test && npm run build && npm run test:e2e
```

Feature checklist (each must be true, with evidence):
- [ ] Every new visible string is in `messages/en.json` **and** `messages/uk.json`
- [ ] New CMS fields: schema + GROQ projection + TS type + `pickOr` fallback; page renders with the field empty
- [ ] No hardcoded copy/URLs/images that belong in Sanity
- [ ] No secrets in code; new env vars documented in `.env.local.example`
- [ ] e2e covers the new user-visible flow in both locales
- [ ] Mobile (<768px) checked via the `mobile` Playwright project

## 6. Code review (final QA)
Invoke `superpowers:requesting-code-review` on the whole branch (use `/code-review` too if
available; `security-review` when touching `/api/*`, env or auth). Fix every Critical and
Important finding with a failing test first, re-run stage 5. List deferred Minor findings.

## 7. Close out
Tick the subtask in `docs/ROADMAP.md`. Commit with Conventional Commits and **no AI
attribution** (no `Co-Authored-By`, no "Generated with …"). Do not push or open a PR until the
owner says yes.
