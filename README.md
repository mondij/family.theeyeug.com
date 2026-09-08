# Nestward

A family-vacation planning site built with Astro, TypeScript, and
Tailwind CSS. The homepage and the full content system (schemas,
templates, structured data) are built out; deeper listing/index pages
are the next step.

## Getting started

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # outputs to dist/
npm run preview   # serve the production build locally
```

## Content system (`src/content.config.ts`)

Four collections — **articles**, **destinations**, **resorts**,
**products** — share one base schema so the same components and
layouts work across all of them, and across however many hundred
pages get added later:

```
title, description, category, featuredImage, featuredImageAlt,
author { name, role? }, publishDate, updatedDate?, seoKeywords[],
sections[], faq[], relatedArticles[], quickFacts[], prosCons?,
ctas[], featured, slugOverride?
```

Each collection adds only what's genuinely specific to it:
`destinations` (country, region, budgetTier, bestFor, tripStyle),
`resorts` (location, bestForSummary, rating), `products` (price,
rating, buyLinks).

**The key scalability decision is `sections`.** Rather than a
separate schema field for every named block a template needs ("Best
areas to stay", "Kids facilities", "Nearby attractions"...), every
structural block is the same shape — a heading plus prose, a bullet
list, and/or structured sub-items with their own image:

```yaml
sections:
  - heading: "Best areas to stay"
    items:
      - title: "Orlando"
        body: "..."
        image: "../../assets/images/destination-city.jpg"
```

`ContentSection.astro` renders whatever mix of body/bullets/items an
entry provides, in the order the content author wrote them. New
destinations, resorts, guides, or products need new **content**, not
new schema or component code.

`relatedArticles` and `slugOverride`:
- `relatedArticles` is an array of `"collection/id"` strings (e.g.
  `"resorts/coral-lagoon-resort-spa"`) rather than a typed
  `reference()`, since related content can point at any of the four
  collections, not just one. `src/lib/content.ts` (`resolveRelated`)
  resolves these at build time and skips anything that doesn't
  resolve, so a typo'd slug never breaks the build.
- `slugOverride` lets a content file set a custom URL slug instead of
  using the filename. It's named `slugOverride` rather than `slug`
  specifically to avoid colliding with `entry.slug`, a legacy
  property name Astro's content layer still reserves internally.

## Templates (`src/layouts/`)

- **DestinationLayout** — hero, intro, quick summary box, sections
  (why families love it / best areas / things kids can do / travel
  tips), affiliate CTA, FAQ, related content. Quick facts sit in a
  sticky sidebar.
- **ResortLayout** — hero, "best for" line, sections (room options /
  kids facilities / activities / nearby attractions), pros & cons,
  booking CTA, FAQ, related content.
- **TravelGuideLayout** — simpler single-column template for the
  `articles` collection: intro, optional quick facts, sections, an
  optional CTA box, FAQ, related content.
- **ProductReviewLayout** — hero, intro, sections, pros & cons, an
  optional comparison table (passed in by the page route, since it's
  the one structure genuinely specific to product reviews), buy-link
  CTAs, FAQ, related content.

All four share the same structured-data and breadcrumb wiring — see
below — and all four are driven by the matching dynamic route:
`src/pages/{articles,destinations,resorts,products}/[...slug].astro`.
Each uses `getStaticPaths()` over its collection, so adding a new
`.md` file is enough to generate a new page; no route code changes.

## Components (`src/components/`)

New in this pass:

- **ArticleHero** — the content-page hero (category badge, title,
  byline with date/reading time) — distinct from the homepage's
  marketing `Hero`.
- **QuickFacts** — label/value grid, reused for a destination's quick
  summary box, a resort's at-a-glance panel, and a product's spec sheet.
- **ProsCons** — balanced two-column pros/cons list.
- **ComparisonTable** — responsive comparison grid (rooms, products, etc).
- **FAQSection** — native `<details>` accordion, zero JS.
- **AffiliateBox** — the CTA box for booking/buy-link moments. Always
  renders a visible disclosure line by default.
- **RelatedContent** — grid of related items, fed by `resolveRelated()`.
- **Breadcrumbs** — visual trail; pairs with `breadcrumbSchema()` for
  structured data (the layout emits both from the same data).
- **ContentSection** — internal helper (not in the original ask, but
  needed to avoid duplicating the same rendering logic four times)
  that renders one entry from `sections[]`.

## Structured data (`src/lib/schema.ts`)

Three pure functions, each returning a plain object ready for
`JSON.stringify()` into a `<script type="application/ld+json">` tag:

- `articleSchema(...)` — schema.org `Article`
- `faqSchema(faq)` — schema.org `FAQPage` (returns `null` if there's
  no FAQ, so an empty array never emits a broken/empty schema block)
- `breadcrumbSchema(items)` — schema.org `BreadcrumbList`

All three are wired into all four layouts via `BaseLayout`'s
`slot="head"`, using each entry's real data — no per-page manual work.

## Sample content

One real entry per collection, fully cross-linked, to prove the
whole pipeline end-to-end:

- `src/content/destinations/florida.md`
- `src/content/resorts/coral-lagoon-resort-spa.md`
- `src/content/articles/20-minute-packing-list.md`
- `src/content/products/wayfinder-40l-backpack.md`

These reference each other via `relatedArticles` and render correctly
through their respective layouts, including the sticky sidebar, FAQ
accordion, pros/cons, and buy-link CTAs.

## What's deliberately not built yet

- Listing/index pages (`/destinations`, `/resorts`, `/articles`,
  `/products`) — the homepage and content pages link to these paths,
  but only detail pages exist so far
- Real photography and copy (all images remain original illustrated
  placeholders, as in earlier passes)
- Search/filter functionality
- Newsletter and quote-request form submission handling
