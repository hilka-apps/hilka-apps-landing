# Hilka Apps Landing — STRUCTURE.md (page-by-page build spec)

> Companion to [DESIGN.md](DESIGN.md). DESIGN.md = the visual system (colors, type,
> components). **This file = the concrete, unambiguous structure of every page**, section
> by section, so the prototype can be built without guessing.
>
> **Read DESIGN.md first for all tokens** (colors `#0088FF` / `#101010` / `#F5F5F7`,
> system font, 16px card radius, 100px pill buttons, eyebrow labels, etc.). This file
> references those tokens by name instead of repeating values.
>
> Conventions used below:
> - **[Header]** and **[Footer]** are shared components defined once in §A — every page
>   includes them; not repeated per page.
> - Grid columns are stated as `desktop / tablet / mobile` (breakpoints in §C).
> - "Eyebrow" = small UPPERCASE colored label above a heading (DESIGN.md §1.1).
> - Concrete copy below is **mock content** for the example app "Focusly"; full text in
>   [CONTENT.md](CONTENT.md). Replace with the real product later.

---

## A. Shared components (build once, reuse everywhere)

### A.1 Header (identical on every page, sticky)
- Height ~64–72px. Background: white with `backdrop-blur`, 80% opacity, 1px bottom border (`#F5F5F7` tone). Sticky to top, z-index above content.
- **Left:** logo mark (rounded square) + wordmark **"Hilka Apps"** (dark `#101010`). Links to `/`.
- **Center (desktop):** nav links, horizontal, evenly spaced:
  `Apps` · `More` · `About` · `Contact`
- **Right:** language switcher (flag + locale code, dropdown) **+** primary pill button **"Get the Apps"** (solid `#0088FF`, white text, 100px radius) that scrolls to the apps grid on the landing page (or links to `/#apps` from other pages).
- **Mobile (<768px):** logo left, hamburger right → opens full-width drawer with the same nav links stacked + language switcher + CTA.

### A.2 Footer (identical on every page)
- Dark background `#0D0D0D`, white/muted text. Top padding ~64px.
- **Top row:** logo mark + wordmark top-left, then link columns:
  - **Apps** — one link per app (currently one: Focusly)
  - **Company** — About, More, Contact
  - **Legal** — Terms of Use, Privacy Policy
  - *(No social column — no social media in scope.)*
- Contact email shown as a text link: `hilka.apps@gmail.com`.
- Thin 1px divider (`#222`) above the bottom row.
- **Bottom row:** left = `© 2026 Hilka Apps · All rights reserved.` · right = small legal note / locale switch (optional).

### A.3 App Card (reused in the landing apps grid)
A single card, 16px radius, light surface, subtle shadow, hover lift. Contains, top→bottom:
1. **Promotional screenshot** (or app icon) — fills card top, 16px top radius, fixed aspect ratio (e.g. 4:3 or phone mockup).
2. **Status badge** (small pill, optional) — e.g. `Live` / `Beta`, top-corner overlay.
3. **App name** (H3 weight 700).
4. **Short description** — one line, muted text.
5. **Actions row:** App Store badge link **+** "Learn more →" text link to the product page.

### A.4 Buttons (per DESIGN.md §1.4)
- Primary = solid `#0088FF` pill. Secondary = white + 1px border pill. App Store = official black badge.

### A.5 Section wrapper
- Max content width ~1200px, centered, horizontal padding 24px (mobile) / 48px (desktop).
- Vertical rhythm: ~96px section padding desktop / ~56px mobile.
- Sections alternate background: white ↔ `#F5F5F7` for visual separation.
- Each major section starts with an **eyebrow** (colored, rotate accent per section) then the heading.

---

## B. Pages

### PAGE 1 — Main Landing  (`/{locale}/`, e.g. `/en/`, `/uk/`)
Apps-grid **layout** modeled on nomly.space (layout only — not their apps/content). Top→bottom:

1. **[Header]**
2. **Hero** (white bg)
   - Centered. Eyebrow `INDIE iOS STUDIO`. H1 **"Small apps, made with care."** Sub (Body L, muted) "Hilka Apps builds focused, beautifully simple iOS apps that do one thing well — no clutter, no noise." Primary pill CTA "Explore the App" (scrolls to §3) + secondary "About us". *(full copy: CONTENT.md §1)*
   - Optional: a hero visual (app mockup/icon).
3. **Apps grid**  *(the core section — id `#apps`)* (`#F5F5F7` bg)
   - Eyebrow `OUR APPS` + H2 **"One app, done right."**
   - Responsive grid of **[App Card]** — **3 / 2 / 1** columns. Built to scale to many cards,
     **currently seeded with one** (the test product):

     | Card | Name | Description (one line) | Store link | Product page |
     |------|------|------------------------|-----------|--------------|
     | 1 | Focusly *(mock)* | A calm focus timer that turns scattered hours into deep, distraction-free work. | `apps.apple.com/app/id000000000` *(mock)* | `/apps/focusly` |

   > No "coming soon" / roadmap placeholders — show only the one card.
   > All example copy referenced below lives in [CONTENT.md](CONTENT.md).
4. **Closing CTA band** (`#F5F5F7` or accent bg) — H2 **"Less noise. More focus."** + primary CTA "Download on the App Store".
5. **[Footer]**

---

### PAGE 2 — Product Page (template)  (`/{locale}/apps/{slug}`)
Section **order** modeled on dream.nomly.space/en (structure reference only — its dream
content is illustrative, replace with the app's real content). **One reusable
template**, content driven by data so future apps reuse it. Built for the mock app
**Focusly** (full copy: CONTENT.md §2). Mark *optional* blocks as on/off per app:

1. **[Header]**
2. **Hero** (white bg) — eyebrow pill `DEEP WORK, MADE SIMPLE`, H1 **"Focus that finally sticks."**, sub-paragraph, **App Store badge** + secondary "How it works" anchor → §3. App icon / hero visual to one side (or centered).
3. **How It Works** (`#F5F5F7` bg) — H2 + 3-column step row (1 col on mobile). Each step = step number label ("STEP 01"), icon, H3 title, blurb.
4. **(Optional) Interactive / lead block** (white bg) — H2 + large text input with counter + row of feature chips. *Product-specific; off by default.*
5. **App preview** (`#F5F5F7` bg) — H2 + 2–3 device screenshots, 16px radius, in a row / carousel.
6. **(Optional) Content stat band** (white bg) — big number + label + primary CTA. *Off unless the app has a headline stat.*
7. **Feature grid** (`#F5F5F7` bg) — eyebrow `FEATURES` + H2 **"Everything you need to focus"** + **3-col grid of 6 feature cards** (icon + H3 + blurb). 3 / 2 / 1 columns. (6 cards in CONTENT.md §2.7)
8. **(Optional) Showcase gallery** (white bg) — H2 + grid of 6 image tiles (16px radius). For visual apps; off otherwise.
9. **(Optional) Related content grid** (`#F5F5F7` bg) — H2 + grid of 6–8 small cards (icon + title + blurb) + "View all" link.
10. **(Optional) Articles** (white bg) — H2 + 3 article cards (thumb + title + excerpt + "Read more").
11. **FAQ** (`#F5F5F7` bg) — H2 + accordion list (question rows that expand). 4–8 items.
12. **Testimonials** (white bg) — H2 **"What users say"** + 3-col quote cards (quote + name). (3 quotes in CONTENT.md §2.12)
13. **Final CTA band** (accent bg) — H2 **"Start your first focus session today."** + primary App Store CTA.
14. **[Footer]**

> **Template rule:** sections **2, 3, 5, 7, 11, 13 are always present**; sections
> **4, 6, 8, 9, 10, 12 are optional** and toggled per app via content data.

---

### PAGE 3 — More  (`/more`)
Simple index/overflow page.
1. **[Header]**
2. **Page header** (white bg) — eyebrow `MORE` + H1 **"More from Hilka Apps"** + short intro paragraph. (CONTENT.md §3)
3. **Link blocks** (`#F5F5F7` bg) — a set of grouped cards/links: extra apps, resources, open-source tools, press/links. Each block = small heading + list of links. (Use 2–3 column card grid.)
4. **[Footer]**

---

### PAGE 4 — About  (`/about`)
Content/story page.
1. **[Header]**
2. **Hero** (white bg) — eyebrow `ABOUT` + H1 **"An indie iOS studio."** + lead paragraph. (CONTENT.md §4)
3. **Story** (white bg) — one or two prose columns (max-width ~720px for readability): who we are and what we build. Optional inline image.
4. **(Optional) Stats / values row** (`#F5F5F7` bg) — 3–4 stat or value cards (number/icon + label).
5. **CTA band** — "See our apps" → landing apps grid, or "Get in touch" → Contact.
6. **[Footer]**

---

### PAGE 5 — Contact / Get in Touch  (`/contact`)  *(form may also open as a modal)*
Two intents, **one shared form style**.
1. **[Header]**
2. **Page header** (white bg) — eyebrow `GET IN TOUCH` + H1 **"We'd love your feedback."** + short paragraph. (CONTENT.md §5)
3. **Intent selector** — two options, equal weight, same visual style:
   - **(a) Suggest a feature**
   - **(b) Report a problem / complaint**
   Implement as **two tabs** (or two large toggle cards) above one shared form. Selected intent sets the submission `type` field.
4. **The form** (single column, max-width ~560px, inputs 10px radius):
   - **Name** (text, required)
   - **Email** (email, required)
   - **Subject** (text, optional)
   - **Message** (textarea, required, char counter)
   - **Submit** (primary `#0088FF` pill button)
   - Hidden field: `type` = suggestion | complaint (from §3 selector)
   - **Anti-spam:** hidden honeypot field (no user-facing CAPTCHA).
   - On submit → POST to form endpoint; deliver to `hilka.apps@gmail.com` (mock).
   - Success + error states (inline message below the button).
5. **(Optional) Direct email** — line under the form: "Or email us at `hilka.apps@gmail.com`".
6. **[Footer]**

> **Modal variant:** the same intent selector + form rendered inside a centered modal
> (dark overlay, close ✕) when "Contact" / "Get in touch" is triggered from a button
> elsewhere. Same fields, same behavior.

---

### PAGE 6 — Terms of Use  (`/terms`)
1. **[Header]**
2. **Document layout** (white bg, single column, max-width ~760px):
   - H1 "Terms of Use" + "Last updated: 8 June 2026" (mock). Source markdown in CONTENT.md §6.
   - **Body rendered from a stored Markdown file** via a markdown renderer (headings,
     lists, links, paragraphs styled per DESIGN.md type scale).
   - Optional sticky table-of-contents on the side (desktop) generated from H2/H3.
3. **[Footer]**

---

### PAGE 7 — Privacy Policy  (`/privacy`)
Identical mechanism to Page 6, different Markdown source.
1. **[Header]**
2. **Document layout** — H1 "Privacy Policy" + "Last updated: 8 June 2026" (mock) + Markdown-rendered body (max-width ~760px). Source markdown in CONTENT.md §7.
3. **[Footer]**

---

> **Excluded site-wide:** no "building in public" messaging, no spend/installs/revenue
> metrics, no open-source-projects section anywhere. Not in scope, not planned.

## C. Responsive breakpoints
- **Mobile:** < 768px — single column, hamburger nav, stacked grids.
- **Tablet:** 768–1024px — 2-column grids.
- **Desktop:** > 1024px — full multi-column grids, centered nav.
- Max content width 1200px (document pages 760px).

## D. i18n behavior
- **Locales: `en` (default) + `uk`.** Locale prefix in the URL (`/en/...`, `/uk/...`).
- Language switcher in [Header] swaps locale, preserving the current path.
- All visible strings come from translation files; product-page + app content are data-driven (editable without redeploy — DESIGN.md §3.3).

## E. Page inventory (quick map)
| Page | Route | Layout source |
|------|-------|---------------|
| Landing | `/{locale}/` | nomly homepage (layout only) |
| Product (1 app now) | `/{locale}/apps/{slug}` | dream.nomly.space (structure only) |
| More | `/{locale}/more` | new |
| About | `/{locale}/about` | new |
| Contact | `/{locale}/contact` (+ modal) | new, two-intent form |
| Terms | `/{locale}/terms` | Markdown render |
| Privacy | `/{locale}/privacy` | Markdown render |

## F. Locked decisions + mock content
**Locked:** brand **Hilka Apps** · light "Paste" theme only · locales EN + UK · one app ·
no social media · no build-in-public / metrics / open-source sections.

**Mock content (placeholder — replace later):** the app is the example **Focusly**; mock
email `hilka.apps@gmail.com`; full example copy for every page is in [CONTENT.md](CONTENT.md).

**To replace with real assets later:** real product (name/icon/screenshots/descriptions/
App Store link), real feedback email, Hilka Apps logo, final Terms/Privacy markdown.
