# Plan — Studio: legal documents inside each app's folder

Spec: `docs/superpowers/specs/2026-11-21-studio-app-legal-folders-design.md`.
Branch: `feat/studio-app-legal-folders`. Small feature → executed inline (TDD).

1. **Templates** — `src/sanity/templates.ts`: `APP_LEGAL_DOC_TEMPLATE`, `templates(prev)` adds
   the parameterised `legalDoc-for-app` (value `{ app: { _type: "reference", _ref: appId } }`),
   `newDocumentOptions` drops `legalDoc*` templates for `creationContext.type === "global"`.
   Test first: `src/sanity/templates.test.ts`.
2. **Schema** — `legalDoc.app`: `readOnly: true`, `hidden: ({ document }) => !document?.app`,
   description updated. Test first: `src/sanity/schemaTypes/legalDoc.test.ts`.
3. **Structure** — `src/sanity/structure.ts`: `appLegalDocsFilter`, `appFolder(S, id)`
   (published id, two items), `withAppFolders(item, S)` overriding the orderable list's child
   resolver; site Legal documents list filtered to `!defined(app)`. Test first:
   `src/sanity/structure.test.ts` (helper level).
4. **Config** — `sanity.config.ts`: `schema.templates`, `document.newDocumentOptions`.
5. **Manual check** in Studio (local dev server).
6. **Gate** — lint, typecheck, unit, build, e2e. Review, fix, ROADMAP tick, commit.
