# Hilka Apps Landing — DESIGN.md

> Step-2 deliverable. Defines the design system (from **pasteapp.io**) and the page
> structure/layout (from **nomly.space** + **dream.nomly.space/en**) for the apps
> marketing site. Hand this to the design/prototyping step to iterate a prototype.
>
> **Decision (locked):** visual language follows **Paste** (light, Apple-style).
> **Structure/layout** follows **nomly**. Where dream.nomly.space/en is referenced it
> supplies the *section breakdown and order* of the product page — not its dark styling.

---

## 1. Design System (source: pasteapp.io)

### 1.1 Typography

**Font families**
- **Headings & UI:** native system stack — `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif` (San Francisco on Apple). No custom web font required.
- **Body:** same system stack.
- Rationale: Paste ships no custom web font; the Apple-style feel comes from SF + heavy weights + tight line-height.

**Scale** (desktop; scale down ~0.6–0.7× on mobile)

| Token | Size | Weight | Line-height | Letter-spacing | Use |
|-------|------|--------|-------------|----------------|-----|
| `display` / H1 | 60px | 700 | 62px | +0.6px | Hero headline |
| H2 | 54px | 700 | ~52px | +0.6px | Section headings |
| H3 | 40px | 700 | 42px | +0.4px | Sub-section / card titles |
| Eyebrow | 16px | 700 | — | +1px, UPPERCASE | Colored label above each section heading |
| Body L | 20px | 400–600 | ~1.5 | — | Lead paragraphs |
| Body | 18px | 400 | ~1.6 | — | Default copy |
| Small | 14–16px | 400–600 | — | — | Captions, footer, legal |

Headings are heavy (700), tight line-height, slightly **positive** letter-spacing — very Apple.

### 1.2 Color scheme

| Role | Value | Notes |
|------|-------|-------|
| Primary / CTA | `#0088FF` | Solid blue pill buttons |
| Text (near-black) | `#101010` | Default body/heading text |
| Pure black | `#000000` | |
| Surface (light gray) | `#F5F5F7` | Alternating section backgrounds |
| White | `#FFFFFF` | Default page background |
| Footer background | `#0D0D0D` / `#101010` | Dark footer |
| Accent — green | `#34C759` | iOS green eyebrow (default) |
| Muted text | `#ABABB0`, `#999999` | Secondary copy, footer links |
| Decorative accents | yellow/orange, coral `#E5544B`, blue | Per-card / per-section color pops |

**Eyebrow color is per-section** (green seen live; treat each section's eyebrow as an
opportunity for its own accent). Define a small palette of eyebrow accents and rotate.

### 1.3 Corner radius

| Element | Radius |
|---------|--------|
| Cards / images | 16px |
| Buttons / pills | 30px → 100px (fully rounded pill) |
| Small chips / inputs | 10px |

### 1.4 Buttons

- **Primary:** solid `#0088FF`, white text, fully-rounded pill (radius 100px), padding ~8px 20px.
- **Secondary:** white bg, thin 1px border, pill shape, optional leading icon (e.g. Apple logo).
- **App Store badge:** official black "Download on the App Store" badge where appropriate.

### 1.5 Header (layout)

- Sticky, white / light translucent (`backdrop-blur`) background, thin bottom border.
- **Left:** logo mark (rounded-square) + wordmark (dark).
- **Center:** primary nav links (+ optional ⌄ dropdown for grouped items).
- **Right:** language switcher + primary blue pill CTA.
- **Consistent across every page** (hard requirement from brief).

### 1.6 Footer (layout)

- Dark background (`#0D0D0D`/`#101010`), logo mark top-left.
- **Multi-column** (Paste uses 4; we use 3 — no social column). Our columns below.
- Thin divider above the bottom row.
- **Bottom row:** copyright left (`© 2026 … All rights reserved.`), legal note right.

### 1.7 Overall feel

Clean Apple-style marketing site: white / light-gray surfaces, big bold system-font
headings, colorful rounded cards floating on neutral backgrounds, fully-rounded blue
CTAs, colored uppercase eyebrows per section, dark multi-column footer.

> **Theme decision (locked): light "Paste" system only.** No dark variant.
> The dream.nomly.space/en page is used **only as a structural reference** (what sections
> exist and in what order — see §2.2); its dark lavender styling is **not** adopted.

---

## 2. Page Structure

### 2.1 Main Landing Page (layout source: nomly.space homepage — layout only)

> The apps grid **layout** is modeled on nomly.space. The apps shown on nomly
> (Dream Diary, PAW, etc.) are **NOT ours** — they were only a structural reference.
> Our site currently has **one app** (a test product); the grid is built to scale to
> many, seeded with one card.

Top-to-bottom:

1. **Header** (consistent — §1.5).
2. **Hero** — eyebrow + big headline + subheading + primary CTA. Brand/value statement for
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
2. **Hero** — eyebrow pill (short tagline), H1 headline, sub-copy, App
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
- Theme: light "Paste" system only (no dark variant).
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
- Paste design system: extracted previously via Chrome extension + computed styles (pasteapp.io blog/home/pricing).
- dream.nomly.space/en: section order read live via DOM (structure reference only — not our content/styling).
- nomly.space homepage: apps-grid **layout** captured via WebFetch as a structural reference. The apps listed there belong to nomly, not to us.
