# Hilka Apps Landing — DESIGN.md

> Defines the design system (§1) and the page structure (§2) of the apps marketing site.
>
> **Visual language:** the studio's own (2026-11-21 refresh, §1) — replaces the earlier
> Paste/Apple-style system. **Structure/layout** still follows **nomly**; where
> dream.nomly.space/en is referenced it supplies the *section breakdown and order* of the
> product page — not its styling.

---

## 1. Design System

> Rebuilt on 2026-11-21 (visual refresh). Rationale, rejected patterns and the list of
> CMS fields that are no longer rendered:
> [superpowers/specs/2026-11-21-visual-refresh-design.md](superpowers/specs/2026-11-21-visual-refresh-design.md).
> Tokens live in `src/app/globals.css` (`:root`), fonts in `src/app/fonts.ts`.

**Idea:** calm white pages, one dark olive ink, one chartreuse highlighter — all taken
from the logo (an olive twig on a chartreuse tile; "гілка" = twig). A book serif for
headings, a warm sans for reading. No gradients, no ambient motion, no emoji icons.

### 1.1 Typography

Both families cover Ukrainian Cyrillic (ґ є і ї). Loaded via `next/font/google` with
`subsets: ["latin", "cyrillic"]` — `src/app/fonts.test.ts` fails if a font loses Cyrillic.

| Role | Family | CSS var |
|---|---|---|
| Headings, big numerals, About story, drawer nav | **Literata** (variable wght + opsz) | `--serif` |
| Body, UI, buttons, forms, captions | **Commissioner** (variable wght) | `--sans` |

| Token / class | Size (desktop → mobile) | Weight | Line-height |
|---|---|---|---|
| Home hero `.lp-h1` | 68 → 40 | 600 serif | 1.06 |
| App hero `.fp-h1` | 64 → 38 | 600 serif | 1.06 |
| `.h1` (page titles) | 56 → 36 | 600 serif | 1.08 |
| `.h2` | 40 → 28 | 600 serif | 1.12 |
| Card / item titles (`.info-card h3`, `.ac-name`) | 20–22 | 600 serif | 1.25–1.3 |
| `.lead` | 20 → 18 | 400 sans, `--ink-2` | 1.55 |
| Body | 17 | 400 sans | 1.6 |
| `.eyebrow` (caption) | 15 | 600 sans, `--ink-2` | 1.4 |

Rules: sentence case everywhere (no uppercase labels), tracking only on the biggest
sizes (≤ −0.025em), leads ≤ 34em, documents ≤ 68ch. Headings (h1–h4) use
`overflow-wrap: break-word; hyphens: manual` so long Ukrainian words wrap at 320px
(no automatic hyphenation — it splits Ukrainian words in odd places).

### 1.2 Color

| Token | Hex | Use |
|---|---|---|
| `--paper` | `#FFFFFF` | Page |
| `--paper-2` | `#F3F4EE` | Alternate bands, chips, CTA panels |
| `--ink` | `#23261A` | Text, primary buttons, footer, focus ring |
| `--ink-2` | `#565B48` | Secondary text (7:1 on white) |
| `--line` / `--line-strong` | `#DCDFD2` / `#B9BDAB` | Hairlines / FAQ dividers, dashed outlines (decorative only) |
| `--line-input` | `#7D8270` | Form-field borders (3.96:1 on white — WCAG 1.4.11 needs 3:1) |
| `--lime` | `#E3EF7E` | Highlighter, selection, "On the App Store" tag |
| `--link` | `#3D5A12` | Inline links (8:1 on white) |
| `--danger` / `--ok` | `#B3261E` / `#2F6B2F` | Form states |
| `--on-ink` / `--on-ink-2` | `#F1F2EA` / `#B4B8A4` | Text on the ink footer |

Lime is never text, never a focus colour and never the only mark of a selected
state (too light on white). Selected / current states always add a non-colour cue:
weight 600, an ink underline or an ink outline.
Per-app accent (Sanity) → `accentTint()` in `src/lib/accent.ts`: a **solid** tint used
on the home icon tile and the app-page phone screen.

### 1.3 Highlighter (`*accent*`)

Any `*words*` in a CMS heading render as `<span class="hl">` (`renderAccent`): a lime
marker band behind the lower half of the letters, `box-decoration-break: clone` so it
wraps cleanly. This is the one decorative gesture on the site — keep it to one accent
per heading.

### 1.4 Shape, spacing, elevation

| Element | Radius |
|---|---|
| Chips, status tags | 8px (`--r-chip`) |
| Buttons, inputs, App Store badge | 10px (`--r-btn`, `--r-input`) |
| Cards, CTA panels, media | 16px (`--r-card`) |
| App icons | ~22.5% of size (iOS) |
| Language toggle | full pill (the only one) |

Spacing: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 72. Sections 72px (48px mobile).
Content width 1120px (`--maxw` includes gutters), gutters 20px mobile / 40px desktop.
Shadows: none, except under app icons and the phone mockup.

### 1.5 Components

- **Buttons:** `.btn-primary` ink fill; `.btn-secondary` ink outline; `.btn-ghost` underlined
  text. Min height 48px. No arrows in labels, no hover lift.
- **App Store:** Apple's black badge only for released apps; otherwise `.appstore-soon`
  (dashed outline status, same height).
- **Section head:** `.section-split` puts the CMS eyebrow as a caption in a 220px left
  column and the heading on the right (stacked under 960px). Content below lines up via
  `.indent`.
- **Lists of items** (features, values, steps, articles): `.info-card` = 2px ink rule on
  top + serif title + text. No card box, no icon. Steps are numbered (they are a sequence).
- **App card (home):** `a.appcard` — tinted icon tile | name, status tag, kicker,
  description, chips, "Learn more". One link, no `aria-label` override (its whole text
  is read); the store status appears once (the tag — no badge inside the card). `.teaser` = dashed empty slot.
- **CTA panel:** `.cta-band` — `--paper-2` panel, heading left, action right.
- **FAQ:** hairline accordion, ink plus/minus.
- **Forms:** segmented control for intent (selected = white tile with a 1.5px ink
  outline), 48px inputs with `--line-input` borders, ink focus outline, errors in
  `--danger` text under the field. On `/contact` the intro and the form share one
  centred 640px column; field labels stay left-aligned.
- **App tabs** (`AppTabs`): on every per-app page (overview, legal docs, support), right
  under the header: `<App name>:  Overview  <doc titles…>  Support`. Each tab is a real
  link to its own page (URLs are fixed — they are entered in App Store Connect). Doc
  tabs are the app's filled-in legal docs (`getAppLegalDocs`). White band, hairline
  bottom, 15px sans in `--ink-2`, 48px targets; current tab = `aria-current="page"`,
  ink text, weight 600 and a 2px ink underline sitting on the hairline. Under ~768px
  the row scrolls sideways inside itself (no wrap, no page scroll) and the current tab
  is scrolled into view. Wrapped in `<nav>` labelled `appPage.linksLabel`.
- **Focus:** `:focus-visible` → 2px ink outline, 2px offset (lime on the dark footer).

### 1.6 Header & footer

- **Header:** sticky, solid white, hairline bottom, 64px. Logo + name left; nav right in
  `--ink-2`, current page in `--ink`, weight 600, with a 2px ink underline; nav
  labelled `header.navLabel`. Language toggle **EN / УКР** (each label in its own
  language, no flags; the accessible name is the visible label, the group label and
  `lang` give context). Under 920px: toggle + menu button; under 360px the toggle is
  hidden so the header fits 320px. The full-screen drawer lists the nav in the serif
  (current item underlined in ink) and the two languages by full name.
- **Footer:** ink background, logo + tagline, columns Apps / Company / Legal
  (sentence-case titles), bottom row with copyright and note.

### 1.7 Motion

Only in response to the user: drawer fade, FAQ expand, anchor-target flash.
`prefers-reduced-motion` disables those. No ambient or scroll-triggered animation.

> **Theme:** light only. Dark mode was considered and left out (see the spec).

---

## 2. Page Structure

### 2.1 Main Landing Page (layout source: nomly.space homepage — layout only)

> The apps grid **layout** is modeled on nomly.space. The apps shown on nomly
> (Dream Diary, PAW, etc.) are **NOT ours** — they were only a structural reference.
> Our site currently has **one app** (a test product); the grid is built to scale to
> many, seeded with one card.

Top-to-bottom:

1. **Header** (consistent — §1.5).
2. **Hero** — caption + headline + subheading + primary CTA (text only; compact so the
   first app card is visible on a laptop screen). Brand/value statement for
   the studio's apps (no metrics, no "building in public" framing).
3. **Apps grid** — the core. Responsive grid of **app cards**, currently **one card**. Each card holds:
   - **Promotional screenshot** (16px radius) *and/or* app icon
   - **App name**
   - Optional **status badge** (e.g. "Live", "Beta")
   - **Short description** (one line)
   - **App Store link** + a **"Learn more"** link to the product page
4. **Closing CTA band** — brand statement + primary CTA.
5. **Footer** (consistent — §1.6).

**App to feature** — **mock example "Focusly"** (placeholder; replace with the real product). Full content in [CONTENT.md](CONTENT.md).

| App | One-line description | Store | Product page |
|-----|----------------------|-------|--------------|
| Focusly | A calm focus timer that turns scattered hours into deep, distraction-free work. | `https://apps.apple.com/app/id000000000` (mock) | `/apps/focusly` (full page) |

### 2.2 Product Page (source: dream.nomly.space/en — replicate section order)

Reusable product-page template. Sections in live order:

1. **Header** (consistent).
2. **Hero** — app icon + name + kicker, H1 headline, sub-copy, App
   Store CTA + "How It Works" anchor button, app icon/visual.
3. **How It Works** — 3-step row (STEP 01 · 02 · 03), each = icon + H3 + blurb.
4. **Interactive try / lead capture** — prompt heading + free-text input
   (0/500), feature chips. *(Product-specific; optional/templated.)*
5. **App Preview** — 2 device screenshots.
6. **Content stat band** — "300+ Dream Meanings" + CTA ("Explore 300+ Symbols").
7. **Feature grid** — "Everything You Need…" → 6 feature cards (icon + H3 + blurb).
8. **Showcase gallery** — "Transform Dreams Into Art" → 6 styled image tiles.
9. **Popular-content grid** — "Most Searched…" → 8 emoji+title+blurb cards linking out + "View all".
10. **Articles** — 3 article cards (emoji/thumb + title + excerpt + "Read more").
11. **FAQ** — accordion.
12. **Testimonials** — "What Dreamers Say".
13. **Final CTA band** — "Start … Tonight" + primary CTA.
14. **Footer** (consistent).

> Generalize: hero → how-it-works → preview → feature grid → gallery → related content →
> FAQ → testimonials → final CTA. Sections 4/8/9 are content-heavy and product-specific;
> make them optional blocks so other apps can use a leaner version of the template.

### 2.3 Supporting pages (all with consistent header — §1.5)

- **More** — overflow/index page (extra apps, links, resources). Define content with brief owner.
- **About** — company/indie-publisher story. Plain content page.
- **Contact** — **"Get in Touch"** with **two entry points** sharing one form style:
  **(a) Feature suggestion**, **(b) Complaint**. Implement as a single form with a
  type selector (or two tabs); opens as a **new page or modal**. Submissions →
  dedicated feedback email (see §3.2).
- **Terms of Use** — render a stored **Markdown** document via a markdown renderer.
- **Privacy Policy** — same mechanism as Terms.

### 2.4 Footer columns (proposed)

- **Apps** — list of apps / product pages
- **Company** — About, More, Contact
- **Legal** — Terms of Use, Privacy Policy
- *(No "Follow"/social column — no social media in scope.)*
- Contact email surfaced in the footer: `hilka.apps@gmail.com` (mock — replace with real).

---

## 3. Features / Functional Requirements

### 3.1 Internationalisation (i18n)
- **Locales: English (`en`, default) + Ukrainian (`uk`).** Architecture stays i18n-ready for adding more later.
- Research + pick the localisation solution that best fits the chosen stack (see §4).
- Locale-prefixed routes (`/en/...`, `/uk/...`).
- Language switcher lives in the header (§1.5), preserves the current path on switch.

### 3.2 Contact form
- Two intents (feature suggestion / complaint), one shared form style.
- Delivers submissions to a **dedicated feedback email address** (mock: `hilka.apps@gmail.com`).
- Needs spam protection (honeypot / lightweight challenge — **not** a CAPTCHA the user must solve on our behalf) and a server endpoint or form service.

### 3.3 Content customisation (no redeploy)
- **App licenses/listings** and **product-page content** must be editable **without redeployment**.
- Implies content sourced from an external store (CMS / headless / hosted Markdown/JSON)
  rather than hardcoded — decide concrete mechanism alongside the stack.

---

## 4. Stack (to decide before build — Step 5)

Candidates from the brief: **Next.js / Astro / Nuxt** + an i18n library, plus a
content source that satisfies §3.3. Pick during the handoff-to-build step; this doc is
framework-agnostic.

---

## 5. Decisions locked + open items

**Locked (2026-06-08):**
- Brand name: **Hilka Apps**.
- Theme: light only (no dark variant). Visual system replaced on 2026-11-21 (§1).
- Locales: EN (default) + UK.
- Scope: **one app** — currently the **mock example "Focusly"** (placeholder content, to be replaced). Landing card + one full product page. More apps later.
- **No social media** (no footer social column).
- **Removed entirely:** any "building in public" framing, spend/installs/revenue metrics, and open-source-projects section. Not present and not planned.

**Mock placeholders to replace with real content later** (all example copy lives in [CONTENT.md](CONTENT.md)):
1. The real product (replaces "Focusly"): name, icon, promo screenshots, descriptions, App Store link.
2. Real feedback email (mock used: `hilka.apps@gmail.com`).
3. Logo asset for "Hilka Apps".
4. Final Terms / Privacy markdown text.

---

### Capture provenance
- Paste design system (superseded 2026-11-21): extracted previously via Chrome extension + computed styles (pasteapp.io).
- dream.nomly.space/en: section order read live via DOM (structure reference only — not our content/styling).
- nomly.space homepage: apps-grid **layout** captured via WebFetch as a structural reference. The apps listed there belong to nomly, not to us.
