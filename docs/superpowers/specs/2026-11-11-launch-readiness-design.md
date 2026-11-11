# Launch readiness — design

Date: 2026-11-11 · Branch: `feat/launch-readiness` (stacked on `chore/agent-setup`, PR #5)

## Goal

Get the site ready for the studio's first official iOS app: a Ukrainian driving-theory (ПДР)
test-prep app. The app is not on the site yet. Apple App Review opens the app's **Support** and
**Privacy Policy** URLs at submission, before release. The site must therefore:

1. say **Hilka Apps** everywhere (the "Hylka" spelling was a mistake);
2. hide the test apps (Arttick, Focusly) without deleting them, and stay tidy with zero visible apps;
3. give every app its own Support, Privacy and Terms pages, filled in later from Studio by a
   developer, and never showing empty or placeholder pages.

## Decisions (agreed with the owner)

- Public contact email: `hilka.apps@gmail.com`. No domain yet: none was found in Vercel, and
  `hilka.app` belongs to an unrelated developer. The Resend sender stays `onboarding@resend.dev`
  (test sender) until a domain is verified; only its display name changes to "Hilka Apps".
- Legal text is **not** written here. A developer fills it in Studio later.
- Hidden apps stay reachable by direct URL (with the existing "Preview" banner) for the owner,
  but are `noindex` and are never linked.
- One branch and one PR for all three parts, with separate commits.

## Part A — Brand: Hylka → Hilka

- Code: `messages/en.json`, `messages/uk.json` (copyright, meta titles/descriptions, home sub,
  About/More/Contact copy), `src/config/site.ts` (`brand.name` "Hilka Apps", `brand.email`
  `hilka.apps@gmail.com`, `emailFrom` "Hilka Apps <onboarding@resend.dev>"),
  `src/sanity/schemaTypes/siteSettings.ts` initial values, `src/app/globals.css` header comment,
  `scripts/seed-pages.mjs`.
- Docs: `docs/DESIGN.md`, `STRUCTURE.md`, `CONTENT.md`, `HANDOFF-PROMPT.md`: brand and
  `hello@hylkaapps.com` → `hilka.apps@gmail.com`.
- Guard test: no `hylka` (case-insensitive) in `messages/*.json` or `src/**`.
- **CMS content** (published Sanity documents: homeContent, aboutPage, morePage, siteSettings,
  legalDoc texts) contains "Hylka" and `hello@hylkaapps.com`. New script
  `scripts/rename-brand.mjs`: dry run by default, lists every field it would change; `--apply`
  writes, using `SANITY_WRITE_TOKEN`. **Run with `--apply` only after the owner's explicit yes.**
- Out of scope: the GitHub/Vercel project names (already `hilka-apps`), the local folder name, and
  the old Vercel project `hylka-apps-landing` (the owner deletes it in Vercel).

## Part B — Hiding test apps and "Coming soon"

- The visibility toggle already exists (`app.hidden`, eye icon in Studio). Hidden apps already
  drop out of the grid, footer and More page.
- **New:** a hidden app's page gets `robots: { index: false, follow: false }` metadata. The same
  applies to its Support and document pages (Part C).
- **`AppStoreBadge` gets three states:**
  - `href` set → link (as today);
  - `inert` → non-link badge, used inside the app card, which is itself a link;
  - neither → a "Coming soon to the App Store" pill (new i18n keys `appstore.soon` EN/UK). Apple's
    badge is never shown for an app that is not in the store.
- Callers:
  - Home app card: `inert` when the app has a real store URL, otherwise soon.
  - Home CTA band, app hero and the `ctaSection` pass `resolveStoreUrl(...)`; undefined → soon.
  - `statSection`'s download button (today an `<a>` with no `href`) renders the soon pill when
    there is no URL.
- **Zero visible apps:** the home grid shows only the existing CMS teaser card ("What's next"),
  and the CTA band shows the soon pill. No new copy is needed.
- **E2E** stops assuming a visible app exists:
  - home asserts `#apps` and the teaser card;
  - app-page, support and document specs take the first visible card's slug and `test.skip` when
    there is none.

## Part C — Per-app Support, Privacy and Terms

**Content model**
- `legalDoc` gets an optional `app` reference (to `app`):
  - set → the document belongs to that app;
  - empty → a document of the site itself (today's `/legal/privacy`, `/legal/terms`).
- Slug uniqueness becomes per app: the same `privacy` slug may exist once per app and once for
  the site. Implemented as custom slug `isUnique` validation.
- The slug field title becomes "Slug (URL: /legal/<slug> or /apps/<app>/<slug>)". Preview subtitle:
  app name or "Site".

**Routes**

| Route | Shows | 404 when |
|---|---|---|
| `/{locale}/apps/{app}/support` | app name + "Support" heading, the app's FAQ items (from its `faqSection`, if any), `ContactForm` with the app preselected, contact email | app not found |
| `/{locale}/apps/{app}/{doc}` | the app's legal doc (e.g. `privacy`, `terms`) rendered with `DocPage` | app not found, no doc with that slug for that app, or both `contentEn` and `contentUk` empty |
| `/{locale}/legal/{doc}` | site docs only (`!defined(app)`) | no such site doc or both contents empty |

- Language fallback: UK falls back to EN content and vice versa (one language filled is enough).
- **Placeholder removal:** the bundled `src/content/terms.md` / `privacy.md` fallback and the
  `localFallback()` reader are deleted. An empty doc is a 404, not placeholder text.
- Footer, More page and the `/legal` static params list **site docs only**.

**Links on the app page**
- A small row at the bottom of `/apps/{app}`: "Support · Privacy Policy · Terms of Use". The
  labels come from the doc titles in the CMS, and "Support" is a new i18n key. Only docs with
  content are linked; Support is always linked.

**Data access** (`src/sanity/lib/queries.ts`)
- `getAppLegalDocs(appSlug): Promise<SanityLegalLink[]>`: docs whose `app->slug.current == appSlug`
  and that have content.
- `getAppLegalDoc(appSlug, docSlug): Promise<SanityLegalDoc | null>`.
- `getAllLegalDocs()` / `getLegalDoc()` filter to `!defined(app)`.

**Pure helpers** (unit-tested)
- `src/lib/legal.ts`:
  - `pickDocContent(doc, lang): string | null` — the requested language, else the other, else null;
  - `hasContent(doc): boolean`.
- `src/lib/faq.ts` — `collectFaq(sections, lang): {q, a}[]`: flattens every `faqSection` of an app.

**Contact form**
- `ContactForm` gets an optional `defaultApp?: string` prop that preselects the `<select>`. The
  support page passes the localized app name.

**i18n:** new keys in `messages/en.json` and `messages/uk.json`: `appstore.soon`, `support.title`,
`support.faqHeading`, `support.contactHeading`, `support.meta.title`, `support.meta.description`,
`appPage.support`.

## Testing

- **Unit:**
  - `legal.ts`: fallback order; both empty → null.
  - `faq.ts`: several sections; empty; missing locale.
  - `AppStoreBadge`: three states.
  - `ContactForm` `defaultApp` preselect.
  - Brand guard.
- **E2E (desktop + mobile, EN + UK):**
  - home renders with or without visible apps;
  - app page (skip if none);
  - `/apps/{first}/support`: the form has the app preselected, and the FAQ shows when the app has one;
  - `/apps/{first}/no-such-doc` → 404;
  - `/legal/no-such-doc` → 404;
  - no "Hylka" text on home, about, contact.

## Out of scope (added to ROADMAP)

- Cyrillic-capable fonts. Raised to **P0**: the audience is Ukrainian.
- An "unofficial app, not affiliated with MVS/HSC" disclaimer field.
- Smart App Banner, sitemap/robots/hreflang, choosing a domain, and checking the "Hilka" name
  conflict (`hilka.app`, another Apple developer) before Apple Developer enrollment.
