# Roadmap — Hilka Apps landing

Audit date: 2026-11-11 (code at `chore/agent-setup`). **Plan only — nothing here is implemented yet.**

## How to use this file

- **Priorities:** **P0** — do before/with the next release (visible bug, brand, security, data
  loss). **P1** — next iteration. **P2** — later / nice to have.
- An agent picks one unchecked subtask (P0 first), runs the `add-feature` skill (or
  `superpowers:systematic-debugging` for bugs), and ticks the box in the same branch.
- Subtasks name the files they touch so work can be split without overlap.
- New epics from the owner go to the bottom under **E9** until prioritised.

---

## E1 · Landing corrections (current site)

### F1.1 Brand rename Hylka → Hilka · P0
Visible on the live site: footer copyright and the home `<title>`/description.
- [x] P0 `messages/en.json`, `messages/uk.json`: `footer.copyright`, `home.meta.title`, `home.meta.description` → Hilka
- [x] P0 `src/config/site.ts`: `brand.name`, `emailFrom` display name; `src/sanity/schemaTypes/siteSettings.ts` `initialValue`
- [x] P1 Bundled legal fallbacks (deleted), `scripts/seed-pages.mjs`, `globals.css` header comment, docs
- [ ] P0 Apply the CMS rename: `node scripts/rename-brand.mjs` (dry run shows before/after) → `--apply` after the owner's yes (7 docs incl. the open `drafts.homeContent`)
- [ ] P1 Decide the studio domain (none owned in Vercel; `hilka.app` belongs to another developer) — blocks F2.1

### F1.2 Cyrillic typography · P0 (audience is Ukrainian)
`Bricolage_Grotesque` and `Instrument_Serif` are loaded with `subsets: ["latin"]` in
`src/app/[locale]/layout.tsx`. Confirmed from next/font data: Bricolage Grotesque has
latin/latin-ext/vietnamese, Instrument Serif latin/latin-ext — no Cyrillic, so `/uk` headings
fall back to system fonts and look different from `/en`.
- [ ] P0 Pick display + serif fonts with Cyrillic (or a per-locale pairing), update layout + `DESIGN.md`
- [ ] P0 Add a Playwright check that `/uk` `h1` computed `font-family` resolves to the display font

### F1.3 Small UI defects · P1
- [x] P1 `AppSections.tsx` `statSection`: download button renders `<a>` without `href` when the App Store URL is unset — now a "Coming soon" pill
- [ ] P1 Testimonials always show ★★★★★ (hardcoded) — make rating a CMS field or drop stars
- [ ] P2 `global-error.tsx` is English-only — localise via `navigator.language` or neutral bilingual copy
- [ ] P2 Header has no primary CTA ("Get the App") that `STRUCTURE.md §A.1` specifies — decide: add or update the spec

### F1.4 Content still in code instead of Sanity · P1
- [ ] P1 More page link groups other than apps/legal come from `messages/*.json` (`more.sections`) — move to `morePage` schema
- [ ] P1 Home `<title>`/description come from `messages` — add SEO fields to `homeContent`/`siteSettings` (ties into E3)
- [x] P2 Legal pages: empty docs are 404; one filled language serves both locales

---

## E2 · Contact & email reliability

### F2.1 Production email sending · P0
- [ ] P0 Verify the sending domain in Resend; switch `emailFrom` off `onboarding@resend.dev` (test sender only delivers to the Resend account owner)
- [ ] P0 Move `notifyEmails` (personal address, public repo) to env `CONTACT_NOTIFY_EMAILS`; document in `.env.local.example`

### F2.2 `/api/contact` hardening · P0
- [ ] P0 Server-side honeypot: reject when `_gotcha` is filled (today only the client checks it — direct POSTs bypass it)
- [ ] P0 Return 400 on malformed JSON instead of an unhandled 500 (`request.json()` is not guarded)
- [ ] P1 Enforce `MESSAGE_MAX` and length caps on `subject`/`app`/`name` server-side; validate `type` ∈ {suggestion, complaint}
- [ ] P1 Rate limiting (Vercel Firewall rule or Upstash ratelimit by IP)
- [ ] P2 Bot protection (Vercel BotID / Turnstile) if spam appears
- [ ] P2 Send the sender an auto-reply confirmation (EN/UK)

### F2.3 Contact UX · P2
- [ ] P2 Contact modal variant from `STRUCTURE.md` page 5 — implement or remove from spec
- [ ] P2 Pre-select the app in the form when coming from an app page (`/contact?app=<slug>`)

---

## E3 · SEO & sharing

### F3.1 Crawlability · P0
- [ ] P0 `src/app/sitemap.ts` — both locales, apps, legal docs, from Sanity
- [ ] P0 `src/app/robots.ts` — allow site, disallow `/studio`, `/api`
- [ ] P0 `metadataBase` + `alternates.languages` (hreflang en/uk/x-default) on every page

### F3.2 Social previews · P1
- [ ] P1 Open Graph / Twitter metadata per page; app pages use app name, subtitle, icon
- [ ] P1 Generated OG images (`opengraph-image.tsx`) for home and app pages
- [ ] P2 JSON-LD `SoftwareApplication` on app pages, `Organization` on home

### F3.3 Not found · P1
- [ ] P1 Localised `src/app/[locale]/not-found.tsx` (today Next's default 404)

---

## E4 · Accessibility & performance

### F4.1 Accessibility · P1
- [ ] P1 Add `@axe-core/playwright` scan to e2e for home, app, contact (both locales)
- [ ] P1 Language dropdown: `role="menu"` without `menuitem`s, no Esc / arrow-key support (`Header.tsx`)
- [ ] P2 Respect `prefers-reduced-motion` for floating plates and autoplay videos (`HeroMedia`)

### F4.2 Performance · P1
- [ ] P1 Replace raw `<img>` (eslint-disabled) with `next/image` for Sanity assets (icons, logos, plates)
- [ ] P1 Measure LCP/CLS on `/en` and an app page (Lighthouse); set a budget
- [ ] P2 `favicon.ico/route.ts`: handle failed upstream fetch; `force-dynamic` + `revalidate` conflict
- [ ] P2 Add Vercel Speed Insights (needs privacy-policy update, see E7)

---

## E5 · CMS & content model

### F5.1 Type safety · P1
- [ ] P1 Sanity TypeGen for GROQ results instead of hand-written types in `src/sanity/lib/queries.ts`
- [ ] P1 Required-field validation in schemas for `Loc` fields (both `en` and `uk`) on publish

### F5.2 Editor experience · P2
- [ ] P2 Live preview / draft mode for Studio editors
- [ ] P2 Clean up the hidden mock app `focusly` in the dataset (content task)

---

## E6 · Quality & developer experience

### F6.1 CI/CD follow-ups · P1
- [ ] P1 Branch protection on `main` requiring the `CI` check (owner action)
- [ ] P1 Dependabot (npm + GitHub Actions), weekly, grouped
- [ ] P2 Optional e2e smoke against the Vercel Preview URL (`deployment_status` event) in addition to local `next start`
- [ ] P2 Automated PR review action (owner decision; must not add AI attribution)

### F6.2 Tests · P1
- [ ] P1 Unit tests for `src/sanity/lib/queries.ts` `getBrand` fallbacks (mock client)
- [ ] P1 e2e for legal pages and More page in both locales
- [ ] P2 Visual regression snapshots for home + app page (desktop/mobile)

### F6.3 Docs · P1
- [ ] P1 Update `DESIGN.md`, `STRUCTURE.md`, `CONTENT.md`: Focusly mock → real apps, `/terms` → `/legal/<slug>`, brand
- [ ] P2 Archive `docs/HANDOFF-PROMPT.md` (prototype-phase brief)

---

## E7 · Observability & privacy

### F7.1 Sentry tuning · P1
- [ ] P1 `tracesSampleRate: 1` in all three Sentry configs — lower for production (e.g. 0.1) to stay in quota
- [ ] P1 Set `environment` (preview/production) and release from Vercel env
- [ ] P2 Alert rule for `/api/contact` failures

### F7.2 Privacy · P1
- [ ] P1 Privacy policy: mention Sentry, Resend and any analytics actually used

---

## E8 · Growth (ideas, not committed)
- [ ] P2 Newsletter / "notify me" for upcoming apps (teaser card)
- [ ] P2 Press kit page (icons, screenshots, short bios)

## E9 · First official app launch (Ukrainian driving-theory test prep, iOS)

### F9.1 Launch readiness · P0 — done in `feat/launch-readiness`
- [x] P0 Brand Hylka → Hilka in code/docs; contact email `hilka.apps@gmail.com`
- [x] P0 Hidden apps: `noindex`; "Coming soon to the App Store" instead of Apple's badge without a store link
- [x] P0 Per-app Support page `/apps/<app>/support` (FAQ + preselected contact form)
- [x] P0 Per-app legal docs `/apps/<app>/<slug>` via `legalDoc.app`; empty → 404, no placeholders

### F9.2 Owner / content tasks · P0
- [ ] P0 Hide Arttick and Focusly in Studio (eye toggle) once the new app is added
- [ ] P0 Add the new app in Studio (EN + UK), its FAQ section, then Privacy/Terms docs with `App` set
- [ ] P0 Site legal docs in Studio (`/legal/privacy`, `/legal/terms`, `App` empty) still hold prototype placeholder text ("This is placeholder text…", "Focusly stores…") and are linked in every footer — replace with real text or clear both languages (empty → 404 and the footer link disappears) before App Review
- [ ] P0 Check the "Hilka" name conflict (another Apple developer at `hilka.app`) before Apple Developer enrollment

### F9.3 Follow-ups
- [ ] P1 "Unofficial app, not affiliated with MVS/HSC" disclaimer field on the app page (+ source of rules/questions)
- [ ] P2 Smart App Banner (`apple-itunes-app` meta) once the app has a store ID
- [ ] P2 Store links in the support page header once live
