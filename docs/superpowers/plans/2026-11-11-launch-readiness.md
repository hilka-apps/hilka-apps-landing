# Launch readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hilka branding everywhere, hidden test apps with a tidy "coming soon" state, and per-app Support / Privacy / Terms pages fed by Studio.

**Architecture:** Pure helpers in `src/lib/` (legal content fallback, FAQ collection) drive server pages. `legalDoc` gains an optional `app` reference. New routes `apps/[slug]/support` and `apps/[slug]/[doc]`. `AppStoreBadge` gets explicit states. A brand guard test and a dry-run-first CMS rename script handle the rename.

**Tech Stack:** Next.js 16, next-intl 4, Sanity (next-sanity), Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-11-launch-readiness-design.md`

## Global Constraints

- Brand string: `Hilka Apps`; contact email `hilka.apps@gmail.com`; Resend sender `Hilka Apps <onboarding@resend.dev>`.
- Every new visible string is in both `messages/en.json` and `messages/uk.json` (the parity test enforces this).
- The CMS rename script never writes without `--apply`. It is not run with `--apply` in this plan.
- Empty legal doc (both languages blank) → 404. Never placeholder text.
- Commits: Conventional Commits, no AI attribution. No push without the owner's yes.

## Review Focus

1. A doc filled in only one language → shown in that language for both locales. Pinned by: Task 3 `pickDocContent` tests.
2. An app-specific `privacy` doc must not appear in the site footer, and the site `privacy` doc must not appear on an app page. Pinned by: Task 3 GROQ filters + e2e `/legal/no-such-doc` 404; reviewer checks the queries.
3. Zero visible apps → the home page still renders (teaser + soon pill), no crash. Pinned by: Task 5 home e2e (no card assertion) + Task 2 badge "soon" unit test.
4. Preselected app name not among the options (e.g. a hidden app's support page) → the select falls back to "General". Pinned by: Task 4 ContactForm test.
5. Unknown app slug under `/apps/x/support` or `/apps/x/privacy` → 404, not a crash. Pinned by: Task 5 e2e.

---

### Task 1: Brand rename (code, docs, CMS script)

**Files:** Modify `messages/en.json`, `messages/uk.json`, `src/config/site.ts`, `src/sanity/schemaTypes/siteSettings.ts`, `src/app/globals.css`, `scripts/seed-pages.mjs`, `docs/DESIGN.md`, `docs/STRUCTURE.md`, `docs/CONTENT.md`, `docs/HANDOFF-PROMPT.md`, `vitest.config.mts` (include `scripts/**/*.test.mjs`). Create `src/brand.test.ts`, `scripts/rename-brand.mjs`, `scripts/rename-brand.test.mjs`.

**Interfaces — Produces:** `export function rewriteBrand(value: unknown): unknown` in `scripts/rename-brand.mjs`. It deep-maps strings: `hello@hylkaapps.com` → `hilka.apps@gmail.com`, then `Hylka` → `Hilka`, `hylka` → `hilka`. Keys starting with `_` are left untouched.

- [ ] Step 1 (RED): `src/brand.test.ts` reads every file under `src/` (excluding `*.test.*`) plus `messages/*.json` and expects no `/hylka/i` match (list offending paths). `scripts/rename-brand.test.mjs` covers:
  - `rewriteBrand("Hylka Apps")` → `"Hilka Apps"`;
  - a nested object/array is rewritten;
  - `{_id:"hylka"}` stays unchanged;
  - the email is replaced.

  Run `npm test` → both FAIL.
- [ ] Step 2: replace the brand in code, messages and docs; email `hilka.apps@gmail.com` in `site.ts` and `siteSettings` initialValue; update the `site.ts` TODO to "switch sender once a domain is verified in Resend".
- [ ] Step 3: `scripts/rename-brand.mjs`:
  - load env via `@next/env`'s `loadEnvConfig`;
  - query published docs of type `siteSettings, homeContent, aboutPage, morePage, contactPage, app, legalDoc`;
  - for each doc whose `rewriteBrand(doc)` differs, print the `_id` and the changed paths;
  - with `--apply`, `client.createOrReplace` each changed doc using `SANITY_WRITE_TOKEN`;
  - export `rewriteBrand`; run `main()` only when executed directly.
- [ ] Step 4: `npm test` → PASS. Run `node scripts/rename-brand.mjs` (dry run) → prints the planned changes, writes nothing.
- [ ] Step 5: commit `fix(brand): rename Hylka to Hilka; add CMS rename script (dry-run)`.

### Task 2: AppStoreBadge states, hidden-app noindex, soon fallbacks

**Files:**
- Modify: `src/components/AppStoreBadge.tsx`, `src/app/[locale]/page.tsx`, `src/app/[locale]/apps/[slug]/page.tsx`, `src/components/AppSections.tsx`, messages (`appstore.soon`: EN "Coming soon to the App Store", UK "Незабаром в App Store").
- Test: `src/components/AppStoreBadge.test.tsx`.

**Interfaces — Produces:** `AppStoreBadge({ href?: string; inert?: boolean })`. It needs next-intl, so tests wrap it in `NextIntlClientProvider` with `en.json`.

- [ ] Step 1 (RED) tests:
  - `href` → `a.appstore[href]` with `target=_blank`;
  - `inert` → `span.appstore` with an aria-label, no link;
  - neither → element `.appstore-soon` with text "Coming soon to the App Store", and no Apple glyph `svg`.
- [ ] Step 2: implement the three states; add a `.appstore-soon` pill style in `globals.css` (100px radius, surface background, muted text).
- [ ] Step 3: callers:
  - home card: `<AppStoreBadge inert={!!resolveStoreUrl(app.appStoreUrl)} />` (soon otherwise);
  - `statSection`: render `AppStoreBadge href={appStoreUrl}` instead of the `<a class=btn>` without href;
  - other callers already pass `href` (undefined → soon).
- [ ] Step 4: app page `generateMetadata` adds `robots: { index: false, follow: false }` when `app.hidden`.
- [ ] Step 5: `npm test`, `npm run typecheck`, `npm run lint` green → commit `feat(apps): coming-soon badge state, noindex hidden apps`.

### Task 3: Per-app legal docs (model, queries, routes, placeholder removal)

**Files:**
- Create: `src/lib/legal.ts`, `src/lib/legal.test.ts`, `src/app/[locale]/apps/[slug]/[doc]/page.tsx`.
- Modify: `src/sanity/schemaTypes/legalDoc.ts`, `src/sanity/lib/queries.ts`, `src/app/[locale]/legal/[slug]/page.tsx`, `src/components/Footer.tsx` (drop the hardcoded `/legal/terms`/`/legal/privacy` fallback links), `src/app/[locale]/more/page.tsx` (legal links from site docs only; no messages fallback to dead links).
- Delete: `src/content/terms.md`, `src/content/privacy.md`.

**Interfaces — Produces:**
```ts
// src/lib/legal.ts
export type DocContent = { contentEn?: string | null; contentUk?: string | null };
export function pickDocContent(doc: DocContent | null | undefined, lang: "en" | "uk"): string | null;
export function hasContent(doc: DocContent | null | undefined): boolean;
// src/sanity/lib/queries.ts
export async function getAppLegalDocs(appSlug: string): Promise<SanityLegalLink[]>; // only docs with content
export async function getAppLegalDoc(appSlug: string, docSlug: string): Promise<SanityLegalDoc | null>;
// getAllLegalDocs / getLegalDoc: add `!defined(app)` filter; getAllLegalDocs also requires content
```

- [ ] Step 1 (RED) `legal.test.ts`:
  - `pickDocContent({contentEn:"E",contentUk:"U"},"uk")` → "U";
  - `({contentEn:"E",contentUk:"  "},"uk")` → "E";
  - `({contentUk:"U"},"en")` → "U";
  - `({}, "en")` → null; `null` → null;
  - `hasContent({contentEn:" "})` → false; `hasContent({contentUk:"x"})` → true.
- [ ] Step 2: implement `legal.ts` → GREEN.
- [ ] Step 3: schema changes:
  - `legalDoc.app`: reference to `app`, optional, description "Leave empty for a site-wide document";
  - slug `isUnique`: a custom async check via `getClient({apiVersion})` counting docs with the same slug and the same `app._ref` (or both undefined), excluding draft/published self;
  - slug title updated;
  - preview `select: { title: "title.en", app: "app.name.en", slug: "slug.current" }`, subtitle `${app ?? "Site"} · /${slug}`.
- [ ] Step 4: queries per Interfaces. The content condition in GROQ: `(length(coalesce(contentEn,"")) > 0 || length(coalesce(contentUk,"")) > 0)`.
- [ ] Step 5: `/legal/[slug]`: drop `localFallback`/fs imports; `markdown = pickDocContent(doc, lang)`; `notFound()` when null.
- [ ] Step 6: `apps/[slug]/[doc]/page.tsx`:
  - `generateStaticParams` returns `[]` (rendered on demand, ISR via fetch tags);
  - `generateMetadata`: title `"<doc title> · <app name>"`, and robots noindex when the app is hidden;
  - the page loads the app (404 if missing) and `getAppLegalDoc` (404 if null or no content), then renders `DocPage`.
- [ ] Step 7: Footer/More: remove the dead fallback links; delete the `src/content/*.md` files.
- [ ] Step 8: `npm test`, typecheck, lint, `npm run build` green → commit `feat(legal): per-app legal documents, 404 instead of placeholders`.

### Task 4: Support page + app page links

**Files:**
- Create: `src/lib/faq.ts`, `src/lib/faq.test.ts`, `src/app/[locale]/apps/[slug]/support/page.tsx`, `src/app/[locale]/apps/[slug]/support/support.css`.
- Modify: `src/components/ContactForm.tsx` (+ test), `src/app/[locale]/apps/[slug]/page.tsx` (links row), messages (`support.title`, `support.faqHeading`, `support.contactHeading`, `support.meta.title`, `support.meta.description`, `appPage.support`), `src/app/[locale]/apps/[slug]/app.css` (links row).

**Interfaces:**
- Consumes `getAppLegalDocs` (Task 3).
- Produces:
  - `collectFaq(sections: AppSection[] | undefined, lang: Lang): { q: string; a: string }[]`;
  - `ContactForm` prop `defaultApp?: string`.

- [ ] Step 1 (RED) `faq.test.ts`:
  - two `faqSection`s plus a `ctaSection` → items of both FAQs in order;
  - an item with an empty question is dropped;
  - UK falls back to EN via `pick`;
  - undefined → `[]`.

  `ContactForm.test.tsx` adds:
  - `defaultApp="Arttick"` → the select value is "Arttick";
  - `defaultApp="Ghost"` (not in the options) → the select value is "".
- [ ] Step 2: implement `collectFaq`; ContactForm: `defaultValue={appOptions.includes(defaultApp ?? "") ? defaultApp : ""}` → GREEN.
- [ ] Step 3: support page:
  - page hero (eyebrow = app name, h1 = `support.title`);
  - FAQ via `FaqAccordion` under `support.faqHeading`, only when there are items;
  - `ContactForm` under `support.contactHeading`, with the contact page's `strings` build extracted into `src/lib/contactStrings.ts` (`buildContactStrings(t, email)`) so contact and support share it;
  - `appOptions` = names of all visible apps plus this app if hidden; `defaultApp` = this app's name;
  - metadata noindex when hidden; 404 for an unknown app.
- [ ] Step 4: app page links row before `AppSections` end: `Support` (always) plus each `getAppLegalDocs` doc title → `/apps/{slug}/{doc}`. Class `.fp-links`, centered, muted small text, `·` separators.
- [ ] Step 5: `npm test`, typecheck, lint green → commit `feat(support): per-app support page with FAQ and preselected contact form`.

### Task 5: E2E + docs/roadmap

**Files:**
- Modify: `e2e/home.spec.ts`, `e2e/app-page.spec.ts`.
- Create: `e2e/app-support.spec.ts`, `e2e/brand.spec.ts`.
- Modify: `docs/ROADMAP.md`, `CLAUDE.md` (the e2e note now says the tests tolerate zero visible apps).

- [ ] Step 1: home: drop the "≥1 app card" assertion; assert that `a.appcard.teaser` is visible. app-page: get the first card's href; `test.skip(!href, "no visible apps")`.
- [ ] Step 2: `app-support.spec.ts` for `en`, `uk`, using the first visible card's slug (skip if none):
  - `/{l}/apps/{slug}/support` → `h1` visible; `#cf-app` value equals the app's option (non-empty); `.cf-form` visible.
  - `/{l}/apps/{slug}/definitely-not-a-doc` → status 404.
  - `/{l}/apps/no-such-app/support` → 404.
  - `/{l}/legal/definitely-not-a-doc` → 404.
- [ ] Step 3: `brand.spec.ts`: for `/en`, `/uk` — `.footer-bottom` contains "Hilka Apps" and `page.title()` does not match `/hylka/i` (both code-driven; CMS copy is renamed later by the script).
- [ ] Step 4: ROADMAP:
  - tick F1.1 code items;
  - F1.2 fonts → P0;
  - F1.3 statSection item ticked;
  - add to E9: launch-readiness (done), the disclaimer field (P1), Smart App Banner (P2), the brand-conflict check (P0, owner), and the CMS rename apply (P0, owner yes).
- [ ] Step 5: full gate `npm run lint && npm run typecheck && npm test && npm run build && npm run test:e2e` → green → commit `test(e2e): support/legal routes, brand; docs: roadmap`.
