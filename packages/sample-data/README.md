# @konkan/sample-data

Clearly-labelled sample content so the web, admin and mobile UIs can be designed and
reviewed before the directory API exists (Sprint 3). It is **not** real listing data.

| Kind                 | Rules                                                                                                                |
| -------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Fictional businesses | Names end in "(Sample)" / "(नमुना)" / "(नमूना)"; phones are invalid placeholders `+91 00000 NNNNN`; hours are invented |
| Public landmarks     | Real public places with short generic descriptions only. **No phone numbers, no opening hours** (never invented)     |
| Emergency contacts   | Category only. Official numbers will come from verified government sources                                           |

Every screen showing this data displays `SAMPLE_NOTICE`, contact actions are disabled, and web
pages showing it are `noindex`. Tests (`src/sample-data.test.ts`) enforce these rules.

Helpers: `listCategories`, `listingsByCategory`, `getListing`, `getPlace`, `popularListings`,
`searchListings` (all languages), `openStatus` (evaluated in Asia/Kolkata).

Remove this package's usage once the real API endpoints land; the UI components take the same
shapes, so they can switch to API data.
