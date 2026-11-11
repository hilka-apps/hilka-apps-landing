# Prototype handoff brief

> Brief for the design/prototyping phase. Use it together with `DESIGN.md`, `STRUCTURE.md`
> and `CONTENT.md`. All copy is mock (see CONTENT.md) — build with it as-is; the real
> product/email/logo get swapped in later (see "Placeholders" at the end).

---

Build an interactive, multi-page prototype for **Hilka Apps** — a marketing website
for a small indie iOS studio's apps. Three spec files accompany this brief:

- **DESIGN.md** — the visual design system: colors, typography scale, fonts, button
  styles, corner radii, header/footer layout, overall look & feel. Treat this as the
  single source of truth for *how things look*.
- **STRUCTURE.md** — the concrete, section-by-section structure of every page. Treat this
  as the single source of truth for *what each page contains and in what order*.
- **CONTENT.md** — mock example copy for every page (brand "Hilka Apps", example app
  "Focusly"). Use this text in the prototype. It's all placeholder — to be replaced with
  the real product later.

**Follow them exactly.** Do not invent a different visual language. The design is a clean,
light, Apple-style marketing site (white / `#F5F5F7` surfaces, big bold system-font
headings, fully-rounded `#0088FF` blue pill CTAs, colorful 16px-radius cards, colored
UPPERCASE eyebrow labels per section, dark multi-column footer). **Light theme only — no
dark variant.**

**Hard exclusions (do NOT add any of these anywhere):** "building in public" messaging,
spend / installs / revenue metrics or dashboards, open-source-projects sections. They are
out of scope and not planned.

**Scope of the prototype:**
1. **Shared Header + Footer** (STRUCTURE.md §A) — identical on every page, sticky header,
   responsive (hamburger on mobile).
2. **Landing page** (STRUCTURE.md Page 1) — hero + responsive apps grid. The grid is built
   to scale to many cards but is **currently seeded with ONE app card** (a test product).
   No "coming soon" placeholders. + closing CTA.
3. **Product page template** (STRUCTURE.md Page 2) — build it for the **one test product**,
   following the section order. Keep it data-driven so future apps reuse it; show the
   always-present sections and stub the optional ones.
4. **More, About** (Pages 3–4) — content pages.
5. **Contact** (Page 5) — "Get in Touch" with a two-intent selector (Suggest a feature /
   Report a problem) above one shared form; also show the modal variant.
6. **Terms of Use, Privacy Policy** (Pages 6–7) — document layout that renders Markdown.

**Must demonstrate:**
- Full responsive behavior (mobile / tablet / desktop breakpoints in STRUCTURE.md §C).
- The language switcher in the header — **English (default) + Ukrainian**, locale prefix
  in the URL (`/en/...`, `/uk/...`).
- Hover/active states on cards, buttons, nav.
- Eyebrow accent colors rotating per section.

**Deliverables:**
- The interactive prototype (all pages above, navigable).
- A short **HANDOFF.md** describing the component breakdown, the page/route map, and any
  implementation notes for the engineering build step (stack TBD: Next.js / Astro / Nuxt
  + an i18n lib + a no-redeploy content source).

Use realistic placeholder copy where final content isn't provided; mark obvious
placeholders so they're easy to find.

### Confirmed
- Brand: **Hilka Apps**.
- Theme: light "Paste" system only.
- Locales: English (default) + Ukrainian.
- One app — the mock **"Focusly"** (see CONTENT.md): one landing card + one full product page.
- **No social media** anywhere (no footer social column).

### Placeholders (mock now, real later — already filled in CONTENT.md)
- App "Focusly" → real product (name, icon, screenshots, descriptions, App Store link)
- Email `hilka.apps@gmail.com` → real feedback email
- "Hilka Apps" logo asset
- Terms / Privacy markdown → final legal text
