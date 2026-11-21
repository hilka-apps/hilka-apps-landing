# Visual refresh — design spec (2026-11-21)

Brief from the owner: the site looks generated. Make it human, beautiful and simple,
with solutions that actually work. Ukrainian readers matter as much as English ones.

## 1. What read as generated, and why

| Pattern | Why it reads as a template |
|---|---|
| Gradient-filled italic serif on one headline word (`*care*`) | The single most common hero treatment of AI landing pages. It also broke in Ukrainian: Instrument Serif has no Cyrillic, so the accent word fell back to Times. |
| Tilted, floating "glass" plates with emoji, fake timers and animated bars | Decoration that pretends to be product UI. It moves all the time and says nothing about the apps. |
| Pill eyebrows with a glowing dot, ALL CAPS and wide tracking above every heading | Template chrome. Repeats the heading it sits on. |
| Display type at 132px with -3px tracking, "scroll" mouse cue | Size standing in for hierarchy. The hero pushed the actual apps below the fold. |
| Blue / purple / green gradient washes on cards, step numbers, avatars, CTA bands | One gradient per surface, chosen for "pop", not for meaning. None of these colours belong to the brand. |
| Emoji as feature icons, five gold stars on testimonials | Stock filler. |
| Radial glow + grid background in every hero | Same backdrop as thousands of SaaS pages. |
| Rounded-card-with-soft-shadow on everything | Every block looks equally important. |

Typography bug: both web fonts were loaded with `subsets: ["latin"]`; Bricolage Grotesque
and Instrument Serif have no Cyrillic at all, so every Ukrainian page rendered in the
system fallback.

## 2. Direction

**Grounded in the brand itself.** "Гілка" means a twig. The logo in Sanity is an
olive-black twig on a pale chartreuse tile. The palette comes straight from it. The
first real product is a study app (driving-theory test prep), so the type leans
toward a well-made textbook: a sturdy book serif for headings, a warm sans for reading
and UI. Calm white pages, one dark olive ink, one chartreuse highlight. No gradients.

**The one bold thing:** the chartreuse highlighter. `*accent*` words in CMS headings are
drawn as a marker stroke behind the text (like highlighting a rule in a textbook),
in the logo's colour. Everything else stays quiet.

### Type (both families have full Cyrillic incl. ґ є і ї)

| Role | Family | Notes |
|---|---|---|
| Headings, big numbers, about story | **Literata** (variable, `opsz` 7–72, 200–900) | TypeTogether. Low-contrast book serif, excellent Cyrillic. Set at 600, optical size follows the font size automatically. |
| Body, UI, buttons, forms | **Commissioner** (variable, 100–900) | Kostas Bartsokas. Humanist grotesque, reads well in long Ukrainian paragraphs. |

Loaded with `next/font/google`, `subsets: ["latin", "cyrillic"]`. Both are from
non-Russian foundries on purpose (no PT / Paratype / Golos) — a reasonable sensitivity
for a Ukrainian audience.

Scale (desktop → mobile via `clamp`): display 72→40, h1 page 56→36, h2 40→28,
h3 22→20, lead 20→18, body 17, small 15, caption 13. Sentence case everywhere; no
uppercase labels, no negative tracking beyond -0.02em on the largest sizes.

### Colour tokens

| Token | Hex | Use |
|---|---|---|
| `--paper` | `#FFFFFF` | Page |
| `--paper-2` | `#F3F4EE` | Bands, chips, form backgrounds (faint sage, from the logo tile) |
| `--ink` | `#23261A` | Text, primary buttons, footer (the logo's olive-black) |
| `--ink-2` | `#565B48` | Secondary text (7.0:1 on white) |
| `--line` | `#DCDFD2` | Hairlines, borders |
| `--lime` | `#E3EF7E` | Highlighter, selection, active marks (the logo tile) |
| `--link` | `#3D5A12` | Inline links (deep olive green, 8:1 on white) |
| `--danger` / `--ok` | `#B3261E` / `#2F6B2F` | Form states |

Per-app accent colours (Sanity) are used only as **solid tints**: the icon tile on the
home card and the phone screen on the app page. No accent → neutral `--paper-2`.

### Shape and spacing

- Radius has hierarchy: 8px chips/inputs, 10px buttons, 16px cards, iOS squircle
  (22.5%) for app icons. No pills except the language toggle.
- No drop shadows except a small one under app icons (that's how icons look on a phone).
- Spacing scale 4 / 8 / 12 / 16 / 24 / 32 / 48 / 72 / 112. Sections 72px (mobile 48px).
- Content width 1120px; reading width 34em for leads, 68ch for documents.
- Layout is left-aligned. The one exception is the contact page's form column (§7).

### Components

- **Header:** solid white, hairline under it, no blur. Nav in `--ink-2`, current page in
  `--ink`, weight 600, with an ink underline (was a lime bar — colour alone, see §7). Language switch is a two-button toggle
  **EN / УКР** (was a flag-emoji dropdown labelled "UK", which also reads as
  "United Kingdom"). One click instead of two. Mobile drawer kept, restyled.
- **Buttons:** primary = ink fill, white text, 10px radius. Secondary = ink outline.
  No arrows glued to labels, no hover lift.
- **Section heads:** the CMS eyebrow is rendered as a small sentence-case caption in
  `--ink-2` next to (desktop) or above (mobile) the heading — a section name in the
  margin, not a pill.
- **App card (home):** a row, not a gradient poster: accent-tinted tile with the app
  icon, name, kicker, description, chips, a clear status ("Coming soon" or
  "On the App Store") and a "Learn more" link. Whole card is one link.
- **"In the works" card:** dashed outline, no fake colour dots.
- **CTA blocks:** quiet `--paper-2` panel, left-aligned, no gradient.
- **Footer:** ink background (the logo glyph colour), sentence-case column titles.
- **Focus:** 2px ink outline with 2px offset on every interactive element. Lime is never
  used as a focus colour (fails 3:1 on white).

Motion: only in response to the user (drawer, FAQ, language toggle). All ambient motion
(floating plates, bobbing chips, equaliser bars, scroll-mouse cue) is gone.
`prefers-reduced-motion` still disables the rest.

## 3. Per page

- **Home:** compact text hero (caption, headline with highlighter, lead, two actions)
  so the first app card sits in the first viewport on a 1280×800 laptop. Apps list,
  "in the works" card, closing CTA panel.
- **App page:** two-column hero (copy | phone). Phone screen = CMS screenshot/video or
  the CMS screen text on a solid accent tint. How-it-works = a real 1-2-3 sequence with
  serif numerals. Features = three-column text list with top rules. Stat = big serif
  number. Testimonials = plain quotes, name below. FAQ = side heading + accordion.
  Support / legal links as a plain underlined row.
- **Support, contact:** same page header pattern; form with a segmented control for the
  two intents, 48px-tall inputs, ink submit button.
- **About:** the story is set as a large serif paragraph — the human voice of the page.
  Values as a three-column text list (the per-index icons assumed a fixed CMS order and
  were dropped).
- **More:** three link columns with hairline separators.
- **Legal docs:** reading column 68ch, serif headings.

## 4. CMS content: what still renders, what doesn't

Schema is untouched; nothing in Sanity was edited.

| Field | Now |
|---|---|
| `*accent*` in any heading | Lime highlighter behind the words (was gradient italic serif). |
| Home `heroPlates` (timer / bars / wave / icon, incl. media) | **Not rendered.** Purely decorative; the hero is text-only and the real app cards follow immediately. Re-enable by rendering `home.heroPlates` again. |
| App `heroChips` ("🔥 12-day streak") | **Not rendered.** Floating fake stats. Same reversal. |
| Feature / article `icon` (emoji) | **Not rendered.** Title + text carry the meaning. |
| Testimonial stars / gradient avatars | Stars removed (they weren't data). Name kept. |
| App `accent` colour | Solid tint on icon tile and phone screen. |
| Eyebrows / kicker | Small sentence-case captions. CMS text that is ALL CAPS stays as typed. |

## 5. Left alone on purpose

- Page structure, section order, routes, CMS queries, i18n setup, contact API.
- Apple's official badge for released apps (it's Apple's artwork; only its container
  styling changed).
- The phone mockup on app pages — it's the slot for real screenshots.
- Copy. Fallback strings stay as they were except "LIVE" → "On the App Store" and the
  new short "Coming soon" status. Suggested copy edits for Studio are below.
- Dark mode: not added. Light theme is primary and a correct dark theme would double
  the surface to test.

## 6. Suggestions for the owner (Studio, not code)

- "Small apps, made with care" is the generic part of the hero. Something specific to
  the studio (who makes it, for whom, in which language) will do more than any styling.
- Replace the placeholder apps (Focusly, Arttick) with the driving-theory app when ready;
  set its accent colour — it tints the icon tile and phone screen.
- Upload a real screenshot as the app's "screen media"; the phone mockup is designed for it.

## 7. App tabs + contact centring (follow-up, same day)

**App tabs.** Every per-app page (`/apps/[slug]`, `/apps/[slug]/[doc]`,
`/apps/[slug]/support`) gets a tab row directly under the site header:
`<App name>:  Overview  <doc titles…>  Support`. It replaces the underlined
Support / legal links row at the bottom of the overview page.

- Each tab is a real link to its existing page; no URL changed (they are in App Store
  Connect). Doc tabs = `getAppLegalDocs(slug)` (filled-in docs only, same order),
  labelled `pick(doc.title, lang)`.
- Current tab: `aria-current="page"` plus ink text, weight 600 and a 2px ink underline,
  so it never relies on colour. Quiet band: white, hairline bottom, no pills.
- Narrow screens: one row that scrolls sideways inside itself; the page never scrolls
  horizontally; the current tab is scrolled into view on load.
- `<nav aria-label>` reuses `appPage.linksLabel`; the new string is `appPage.overview`
  (Overview / Огляд).
- Component: `src/components/AppTabs.tsx` (+ `AppTabs.css`, unit test). E2E:
  `e2e/app-tabs.spec.ts`; doc-tab checks run only when the CMS has filled-in docs.

**Contact centring.** On `/contact` the intro (caption, h1, lead) and the form sit in
one centred column (form max 640px). This is the one centred layout on the site: a
single form reads better as a centred column than as a narrow block hugging the left
edge of a wide page. Field labels inside the form stay left-aligned. The support page
keeps the left-aligned layout (the form follows a left-aligned FAQ there).

**Review fixes in the same batch.** `--line-input` (#7D8270, 3.96:1) for form-field
borders; non-colour cues on every selected state (header nav, drawer, contact intent
tabs); h1–h4 wrap long words (`overflow-wrap: break-word; hyphens: auto`); header
language toggle hidden under 360px (the drawer has it); translated nav label; Literata
italic no longer loaded; home app cards read in full with one store status.
