# Agent-ready setup — design

Date: 2026-11-11 · Branch: `chore/agent-setup`

## Goal

Make the repo workable by coding agents end to end: a roadmap of epics → features →
subtasks, a mandatory workflow (brainstorm → plan → TDD → verification → code review),
automated tests, and a CI gate on every PR. Vercel Git integration (preview on PR,
prod on `main`) stays the CD and is not touched.

## Constraints

- Never commit `.env.local` or any secret.
- No AI attribution anywhere: no `Co-Authored-By` trailers, no "Generated with …" lines
  in PRs, no author mentions in code/docs. Enforced via `attribution` in
  `.claude/settings.json` and stated in `CLAUDE.md`.
- No push, no PR, no GitHub/Vercel settings changes without explicit owner approval.
- Product behaviour must not change (refactors for testability only).

## Components

### 1. Agent scaffolding

- `.gitignore`: replace the blanket `.claude/` ignore with `.claude/settings.local.json`
  and `.claude/worktrees/`, so shared settings and skills are versioned. Add Playwright
  output dirs (`test-results/`, `playwright-report/`, `blob-report/`).
- `CLAUDE.md`: stack, commands (dev on :3001, build, lint, typecheck, test, test:e2e),
  `src/` map, links to `docs/DESIGN.md`, `docs/STRUCTURE.md`, `docs/CONTENT.md`,
  `docs/ROADMAP.md`; rules (EN+UK for every visible string, content via Sanity with
  `pickOr` fallbacks only, secrets only in env, no attribution); mandatory workflow
  (feature → `add-feature`, bug → `systematic-debugging`, any change → TDD,
  before "done" → `verification-before-completion`, before merge → code review).
- `.claude/settings.json`: enable `superpowers`, `code-review`, `security-guidance`
  from `claude-plugins-official`; allow `npm run *`, `npm ci`, `npm install`,
  `npx vitest/playwright/tsc/eslint/next`, read-only `gh` (`pr view/list/diff/checks`,
  `run view/list`, `repo view`); `attribution` empty for commits and PRs.
  `git push` and `gh pr create` are intentionally not pre-allowed.
- `.claude/skills/add-feature/SKILL.md`: Next.js-specific pipeline — brainstorm →
  spec → plan → TDD via subagents → verification (`lint`, `typecheck`, `test`, `build`,
  `test:e2e`) → code review as final QA; includes i18n/Sanity checklist.

### 2. Unit tests (Vitest + Testing Library, jsdom)

Refactors (TDD, behaviour-preserving):
- `src/lib/contact.ts`: `EMAIL_RE`, `MESSAGE_MAX`, `validateContact(data)` returning
  field-level error codes (`required` / `invalidEmail`). Used by both
  `ContactForm.tsx` (maps codes to translated strings) and `api/contact/route.ts`.
- `src/i18n/merge.ts`: `deepMerge` extracted from `src/i18n/request.ts`.

Test files (`src/**/*.test.ts(x)`): `contact`, `i18n` (`pick`/`pickOr`), `merge`,
`site` (`resolveStoreUrl`), `accent`, `accentText`, `text` (`preserveCase`),
`messages` (EN/UK key parity), `ContactForm` (empty submit shows required errors,
bad email shows invalid-email, valid submit POSTs payload with `type`).

### 3. E2E smoke (Playwright)

Runs against `next build && next start -p 3001` (`webServer` in config; reuses a
running server locally). Projects: `desktop` (Desktop Chrome), `mobile` (Pixel 7).
Specs:
- home renders on `/en` and `/uk` (`<html lang>`, hero `h1`, apps grid);
- app page: open the first app card from home (no hardcoded slug), `h1` visible, EN and UK;
- language switch preserves path;
- mobile menu: open, Esc closes, link navigates (mobile project only);
- contact form: empty submit → 3 required errors; bad email → invalid error;
  valid submit with `/api/contact` mocked → success state (no real email sent).

### 4. CI — `.github/workflows/ci.yml`

Triggers: `pull_request`, `push` to `main`; concurrency cancels stale runs.
Single job, Node 24, npm cache, Playwright browser cache:
`npm ci → lint → typecheck → test → build → playwright install → test:e2e`.
Uploads `playwright-report` on failure. Env from GitHub **Variables**:
`NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET` (dataset is public — no
token needed). Resend/Sentry are not needed in CI.

### 5. `docs/ROADMAP.md`

Audit of code + docs → epics → features → subtasks with P0/P1/P2, including
corrections to the current landing. Plan only, no implementation.

## Error handling

CI fails on any step; e2e retries once on CI only. Missing Sanity vars → build still
succeeds (queries return empty), but e2e app-page test would fail loudly, which is the
desired signal that CI variables are missing.

## Out of scope

Branch protection, GitHub secrets/variables, Vercel settings, `claude-code-action` —
listed as manual steps for the owner.
