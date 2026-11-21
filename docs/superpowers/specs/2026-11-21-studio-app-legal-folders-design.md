# Studio: legal documents inside each app's folder

**Goal:** editors find and create an app's Privacy/Terms inside that app, so a document can
never end up "site-wide" by forgetting the `App` field. Studio-only change: data shape, GROQ
queries, routes and the website stay as they are.

## Decisions (agreed with the owner)

- **Data model unchanged.** `legalDoc.app` (reference) stays — the website reads it to serve
  `/apps/<app>/<slug>` vs `/legal/<slug>`. Embedding documents inside the `app` document was
  rejected: a huge form, re-publishing the whole app for a typo, and a query/route rewrite.
- **Apps list.** Still drag-to-reorder (`@sanity/orderable-document-list`). Clicking an app
  opens a folder instead of the editor:
  - **App details** → the app document editor (as before)
  - **Legal documents** → `legalDoc` where `app._ref == <app id>`; "Create" uses the template
    `legalDoc-for-app`, which pre-fills `app` with that app.
- **Site content → Legal documents** lists only site documents (`!defined(app)`); "Create"
  makes a site document (`app` empty).
- **`app` field:** read-only in the form; hidden when empty (site documents), shown as the
  app's name otherwise.
- **Global "+" (top bar)** does not offer Legal documents at all — the only ways to create one
  are the two folders above.
- App ids from the list may be draft ids; the folder always uses the published id, so the
  reference points at the app, not its draft.

## Out of scope

- Moving an existing document between owners (the field is read-only; an admin can still
  patch it via the API). No such documents exist today.
- Studio label translation (Studio UI is English, like the rest of the Studio).

## Testing

- Unit (Vitest): the template builds the reference from `appId`; the global new-document menu
  drops every `legalDoc` template while structure menus keep them; the `app` field is read-only
  and hidden only when empty; the structure helper strips `drafts.` and filters per app.
- Manual in the running Studio: open an app folder, create a doc (App pre-filled, read-only),
  site list shows only site docs, top-bar "+" has no Legal document.
