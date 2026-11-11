# Agent-ready setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Agent scaffolding, unit + e2e tests, CI gate and a roadmap for the Hilka Apps landing.

**Architecture:** Vitest (jsdom) for pure logic and one client component; Playwright against
`next start` for smoke flows; one GitHub Actions job chaining lint → typecheck → unit →
build → e2e. Two small behaviour-preserving extractions (`lib/contact.ts`, `i18n/merge.ts`)
make logic testable.

**Tech Stack:** Next.js 16, React 19, next-intl 4, Sanity, Vitest, Testing Library, Playwright, GitHub Actions (Node 24).

**Spec:** `docs/superpowers/specs/2026-11-11-agent-setup-design.md`

## Global Constraints

- Dev/start port: `3001`.
- Never stage `.env.local`; no secrets in any committed file.
- Commit messages: Conventional Commits, **no `Co-Authored-By` or any AI attribution**.
- Every visible string exists in both `messages/en.json` and `messages/uk.json`.
- Product behaviour unchanged (except: server now trims before validating, matching the form).
- CI env: `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET` from GitHub Variables only.

## Review Focus

1. Sanity unconfigured (CI without variables) → `next build` still succeeds; home renders with an empty grid. Pinned by: Task 6 note + CI step order (build runs before e2e).
2. UK page with a key missing in `uk.json` → falls back to EN string, never a raw key. Pinned by: Task 4 `deepMerge` tests + parity test.
3. Whitespace-only name/message or email with surrounding spaces → same verdict on client and server. Pinned by: Task 3 `validateContact` tests.
4. Mobile drawer: Esc closes it and body scroll lock is released. Pinned by: Task 5 mobile spec asserts `body` overflow is `""` after Esc.
5. Language switch on a deep page (`/en/contact`) keeps the path (`/uk/contact`). Pinned by: Task 5 locale spec.

---

### Task 1: Agent scaffolding

**Files:**
- Modify: `.gitignore` (replace `.claude/` line; add Playwright dirs)
- Modify: `eslint.config.mjs` (add `test-results/**`, `playwright-report/**`, `blob-report/**` to `globalIgnores`)
- Create: `CLAUDE.md`, `.claude/settings.json`, `.claude/skills/add-feature/SKILL.md`

- [ ] **Step 1:** `.gitignore`: remove `.claude/`; add `.claude/settings.local.json`, `.claude/worktrees/`, `/test-results/`, `/playwright-report/`, `/blob-report/`, `/playwright/.cache/`.
- [ ] **Step 2:** Verify: `git check-ignore -v .env.local .claude/settings.local.json` → both ignored; `git check-ignore .claude/settings.json` → exit 1 (not ignored).
- [ ] **Step 3:** `.claude/settings.json`:
  - `enabledPlugins`: `superpowers@claude-plugins-official`, `code-review@claude-plugins-official`, `security-guidance@claude-plugins-official` → `true`
  - `attribution`: `{ "commit": "", "pr": "" }`
  - `permissions.allow`: `Bash(npm run:*)`, `Bash(npm ci)`, `Bash(npm install:*)`, `Bash(npm test:*)`, `Bash(npx vitest:*)`, `Bash(npx playwright:*)`, `Bash(npx tsc:*)`, `Bash(npx eslint:*)`, `Bash(npx next:*)`, `Bash(gh pr view:*)`, `Bash(gh pr list:*)`, `Bash(gh pr diff:*)`, `Bash(gh pr checks:*)`, `Bash(gh run view:*)`, `Bash(gh run list:*)`, `Bash(gh repo view:*)`
  - `permissions.deny`: `Read(./.env.local)`, `Read(./.env)`
- [ ] **Step 4:** `CLAUDE.md` with sections: Stack · Commands (`dev`, `build`, `start`, `lint`, `typecheck`, `test`, `test:watch`, `test:e2e` — note: e2e needs `npm run build` first or a running server on :3001) · `src/` map · Docs links (DESIGN, STRUCTURE, CONTENT, ROADMAP) · Rules (i18n EN+UK; content from Sanity via `pick`/`pickOr`, `messages/*.json` only as fallbacks/UI chrome; secrets only in env, never `NEXT_PUBLIC_` for secrets; no AI attribution in commits/PRs/code/docs) · Mandatory workflow (feature → `add-feature`; bug → `superpowers:systematic-debugging`; any change → `superpowers:test-driven-development`; before "done" → `superpowers:verification-before-completion` with the full check list; before merge → `superpowers:requesting-code-review` / `/code-review`) · Git (branch per task off `main`, Conventional Commits, no push/PR without owner's explicit yes).
- [ ] **Step 5:** `.claude/skills/add-feature/SKILL.md` (frontmatter `name: add-feature`, description "Use when asked to add, implement or build a feature in the Hilka landing"). Pipeline: 1 brainstorming → 2 spec in `docs/superpowers/specs/` → 3 writing-plans → 4 subagent-driven-development with TDD per task → 5 verification: `npm run lint && npm run typecheck && npm test && npm run build && npm run test:e2e` (paste real output) → 6 requesting-code-review as final QA, fix Critical/Important → 7 update `docs/ROADMAP.md` checkbox. Checklist: new strings in EN+UK; new CMS fields added to schema + query + type + `pickOr` fallback; e2e covers the new user-visible flow; no secrets.
- [ ] **Step 6:** Commit `chore: agent scaffolding (CLAUDE.md, settings, add-feature skill)`.

### Task 2: Vitest setup + characterization tests for helpers

**Files:**
- Modify: `package.json` (devDeps + scripts)
- Create: `vitest.config.mts`, `vitest.setup.ts`
- Test: `src/lib/i18n.test.ts`, `src/lib/accent.test.ts`, `src/lib/accentText.test.tsx`, `src/lib/text.test.tsx`, `src/config/site.test.ts`

**Interfaces:** Produces scripts `test` = `vitest run`, `test:watch` = `vitest`, `typecheck` = `tsc --noEmit`.

- [ ] **Step 1:** `npm i -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event`; add scripts.
- [ ] **Step 2:** `vitest.config.mts`: plugin react, `resolve.alias['@'] = ./src`, `test.environment = 'jsdom'`, `include: ['src/**/*.test.{ts,tsx}']`, `setupFiles: ['./vitest.setup.ts']`. Setup imports `@testing-library/jest-dom/vitest`.
- [ ] **Step 3:** Write tests (these characterize existing code, so they pass on first run — run them once with a deliberately wrong expectation to see a red failure, then correct it):
  - `pick({en:'Hi',uk:'Привіт'},'uk') === 'Привіт'`; `pick({en:'Hi'},'uk') === 'Hi'`; `pick(undefined,'en') === ''`; `pickOr({en:'  '},'en','fb') === 'fb'`; `pickOr({uk:'X'},'uk','fb') === 'X'`.
  - `accentGradient(null) === undefined`; `accentGradient('#112233')` contains `150deg`, `#112233 0%`, `color-mix(in srgb, #112233 52%, #fff)`; angle arg `90` → `90deg`.
  - `renderAccent('Made with *care*.')` rendered → `span.serif` text `care`; `renderAccent('')` → `null`; custom class `fp-serif` applied.
  - `preserveCase('Built for iOS and macOS')` → two `span.keep-case` with `iOS`, `macOS`; plain text → no `.keep-case`.
  - `resolveStoreUrl(undefined)`, `resolveStoreUrl('https://apps.apple.com/app/id000000000')` → `undefined` (fallback is `null`); real URL returned unchanged.
- [ ] **Step 4:** Run `npm test` → all pass. Run `npm run typecheck` → exit 0.
- [ ] **Step 5:** Commit `test: add Vitest and helper unit tests`.

### Task 3: Shared contact validation (TDD)

**Files:**
- Create: `src/lib/contact.ts`
- Modify: `src/components/ContactForm.tsx`, `src/app/api/contact/route.ts`
- Test: `src/lib/contact.test.ts`, `src/components/ContactForm.test.tsx`

**Interfaces — Produces:**
```ts
export const EMAIL_RE: RegExp;            // /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const MESSAGE_MAX = 500;
export type ContactField = "name" | "email" | "message";
export type ContactErrorCode = "required" | "invalidEmail";
export type ContactErrors = Partial<Record<ContactField, ContactErrorCode>>;
export function validateContact(data: Record<string, unknown>): ContactErrors;
```

- [ ] **Step 1: Failing tests** `contact.test.ts`: `{}` → `{name:'required',email:'required',message:'required'}`; `{name:'  ',email:'a@b.co',message:'x'}` → `{name:'required'}`; `email:'nope'` → `{email:'invalidEmail'}`; `email:' a@b.co '` with valid name/message → `{}`; non-string `email: 42` → `{email:'invalidEmail'}`.
- [ ] **Step 2:** `npx vitest run src/lib/contact.test.ts` → FAIL (module not found).
- [ ] **Step 3:** Implement `src/lib/contact.ts` (trim via `String(v ?? '').trim()`).
- [ ] **Step 4:** Run → PASS.
- [ ] **Step 5: Failing component test** `ContactForm.test.tsx` (render with a full `strings` fixture, `appOptions=['Arttick']`, `email='hello@x.com'`, `global.fetch = vi.fn()`):
  - click submit on empty form → 3 elements with text `strings.form.required`; `fetch` not called.
  - type name/message + email `bad` → `strings.form.invalidEmail` shown.
  - valid fill, select "Complaint" tab, submit → `fetch` called once with `/api/contact`, body JSON has `type:'complaint'`, `name`, `email`, `message`; resolves `{ok:true}` → `strings.success` visible.
  - `MESSAGE_MAX` drives the counter: textarea `maxLength === 500`.
- [ ] **Step 6:** Refactor `ContactForm.tsx`: drop local `EMAIL_RE`/`MAX_CHARS`/`validate`; use `validateContact` and map codes → `strings.form[code]`; `MESSAGE_MAX` for counter/maxLength. Refactor `route.ts`: `validateContact(body)`; any `required` → 400 `"Missing required fields"`, else `invalidEmail` → 400 `"Invalid email address"` (same messages as today). Use trimmed `name`/`email` when building the email.
- [ ] **Step 7:** `npm test` → all PASS; `npm run lint && npm run typecheck` → clean.
- [ ] **Step 8:** Commit `refactor(contact): share validation between form and API, add tests`.

### Task 4: i18n merge extraction + message parity

**Files:**
- Create: `src/i18n/merge.ts`
- Modify: `src/i18n/request.ts` (import `deepMerge`)
- Test: `src/i18n/merge.test.ts`, `src/i18n/messages.test.ts`

**Interfaces — Produces:** `export type Messages = Record<string, unknown>; export function deepMerge(base: Messages, override: Messages): Messages;`

- [ ] **Step 1: Failing tests:** nested override keeps sibling base keys (`{a:{x:1,y:2}}` + `{a:{y:3}}` → `{a:{x:1,y:3}}`); arrays are replaced not merged; base object not mutated. `messages.test.ts`: flattened key set of `en.json` equals `uk.json`; no UK value is an empty string.
- [ ] **Step 2:** Run → merge tests FAIL (module missing); parity test passes (currently 91/91 keys).
- [ ] **Step 3:** Move `deepMerge` to `src/i18n/merge.ts`; import in `request.ts`.
- [ ] **Step 4:** `npm test` → PASS; `npm run typecheck` → clean.
- [ ] **Step 5:** Commit `refactor(i18n): extract deepMerge, add EN/UK parity test`.

### Task 5: Playwright e2e smoke

**Files:**
- Modify: `package.json` (devDep `@playwright/test`, script `test:e2e` = `playwright test`)
- Create: `playwright.config.ts`, `e2e/home.spec.ts`, `e2e/app-page.spec.ts`, `e2e/locale.spec.ts`, `e2e/mobile-menu.spec.ts`, `e2e/contact.spec.ts`

**Config:** `testDir: 'e2e'`, `baseURL: 'http://localhost:3001'`, `retries: CI ? 1 : 0`, `reporter: CI ? [['github'],['html',{open:'never'}]] : 'list'`, `trace: 'on-first-retry'`; projects `desktop` (Desktop Chrome) and `mobile` (Pixel 7); `webServer: { command: 'npm run start', url: 'http://localhost:3001/en', reuseExistingServer: !CI, timeout: 120_000 }`. Mobile-menu spec runs only in `mobile`; locale-dropdown spec only in `desktop` (`test.skip` by `testInfo.project.name`).

- [ ] **Step 1:** Install `@playwright/test`, `npx playwright install chromium`, write config.
- [ ] **Step 2:** Specs (selectors are existing classes/ids — no product markup changes):
  - home: for `en`,`uk`: `goto('/{l}')` → `html[lang={l}]`, `.lp-h1` visible, `#apps` visible, ≥1 `a.appcard:not(.teaser)`.
  - app-page: from `/{l}`, click first `a.appcard:not(.teaser)` → URL matches `/{l}/apps/[^/]+$`, `.fp-h1` visible, `html[lang={l}]`.
  - locale (desktop): `/en/contact` → click `.lang-btn` → click `.lang-menu button:has-text("Українська")` → URL `/uk/contact`, `html[lang=uk]`.
  - mobile-menu (mobile): `/en` → `.hamburger` click → `.drawer.open` visible; Esc → `.drawer.open` count 0 and `document.body.style.overflow === ''`; reopen, click drawer link to `/about` → URL `/en/about`.
  - contact: `/en/contact` → submit → `.cf-error` count 3; fill name/message, email `bad` → one `.cf-error`; `page.route('**/api/contact', r => r.fulfill({json:{ok:true}}))`, valid fill, submit → `.cf-success` visible.
- [ ] **Step 3:** Verify red: temporarily expect `.cf-error` count 4 → FAIL; revert.
- [ ] **Step 4:** `npm run build && npm run test:e2e` → all PASS in both projects.
- [ ] **Step 5:** Commit `test: add Playwright e2e smoke tests`.

### Task 6: CI workflow

**Files:** Create `.github/workflows/ci.yml`

- [ ] **Step 1:** Workflow `CI`: `on: pull_request` + `push: branches [main]`; `concurrency: { group: ci-${{ github.ref }}, cancel-in-progress: true }`; `permissions: contents: read`; job `verify` on `ubuntu-latest`, `timeout-minutes: 20`, env `NEXT_PUBLIC_SANITY_PROJECT_ID: ${{ vars.NEXT_PUBLIC_SANITY_PROJECT_ID }}`, `NEXT_PUBLIC_SANITY_DATASET: ${{ vars.NEXT_PUBLIC_SANITY_DATASET }}`, `NEXT_TELEMETRY_DISABLED: 1`. Steps: checkout → setup-node 24 with `cache: npm` → `npm ci` → `npm run lint` → `npm run typecheck` → `npm test` → `npm run build` → cache `~/.cache/ms-playwright` keyed on lockfile → `npx playwright install --with-deps chromium` → `npm run test:e2e` → on failure upload `playwright-report/` (7 days).
- [ ] **Step 2:** Validate YAML: `npx --yes yaml-lint .github/workflows/ci.yml` (or `node -e` parse via `yaml` pkg) → no errors. Simulate CI locally: `CI=1 npm run test:e2e` against fresh build → PASS.
- [ ] **Step 3:** Commit `ci: add GitHub Actions verify workflow`.

### Task 7: Audit + `docs/ROADMAP.md`

**Files:** Create `docs/ROADMAP.md`; Modify `README.md` (link ROADMAP + Development section with commands).

- [ ] **Step 1:** Audit `src/`, `docs/*`, Sanity schemas, `site.ts`, API routes. Record findings with file:line.
- [ ] **Step 2:** Write ROADMAP: legend (P0 = before/at next release, P1 = next, P2 = later), "How agents use this" (pick an unchecked subtask → `add-feature`), then epics (at minimum: E1 Landing corrections, E2 Contact & email reliability, E3 SEO & sharing, E4 Accessibility & performance, E5 Content/CMS, E6 Quality & DevEx, E7 Observability) → features → `- [ ]` subtasks each with priority and file reference. Plan only.
- [ ] **Step 3:** Commit `docs: add audit-based ROADMAP`.

### Task 8: Final verification

- [ ] **Step 1:** `npm run lint && npm run typecheck && npm test && npm run build && npm run test:e2e` — paste real output.
- [ ] **Step 2:** `git log main..HEAD --format='%an %s%n%b'` → no AI trailers; `git ls-files | grep -E '\.env\.local$'` → empty.
- [ ] **Step 3:** Whole-branch code review; fix Critical/Important, re-run Step 1.
