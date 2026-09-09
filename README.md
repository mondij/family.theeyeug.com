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

- Real photography and copy (all images remain original illustrated
  placeholders, as in earlier passes)
- Search/filter functionality on listing pages
- Pagination (not needed yet at one entry per collection, but the
  listing pages already sort by `featured` then `publishDate`, so
  adding a `page` param later is additive, not a rewrite)
- Newsletter and quote-request form submission handling
- A `/trip-styles` section (linked from nav, not part of this content system)

## Listing pages (`src/pages/{collection}/index.astro`)

Each collection now has an index page alongside its `[...slug].astro`
detail route:

- **`/destinations`** — grid of `DestinationCard`s, editorial (no price/rating).
- **`/resorts`** — grid of `ResortCard`s. Derives a short badge phrase
  from `bestForSummary` (a full sentence) rather than adding a second
  schema field just for the listing page.
- **`/articles`** — one featured `ArticleCard` (magazine-style, full
  width) plus a grid of the rest, newest/featured first.
- **`/products`** — grid using `ImageCard` (built during an earlier
  pass, otherwise unused) — its rating/price panel fits a gear-review
  listing better than the more editorial cards used elsewhere.

All four sort `featured` entries first, then by `publishDate`
descending, and all are entirely data-driven — adding a new content
file is enough to add a card, no page code changes needed. Each also
emits its own `breadcrumbSchema()` for SEO.

Two small fixes made alongside this: the header/footer "Journal" links
now point at `/articles` (previously `/journal`, which never existed),
and the homepage's Coral Lagoon resort card now links to the resort's
real slug (`coral-lagoon-resort-spa`) instead of a shortened one that
didn't match the actual content file.

## Content: the first 25 pages

The site now has 28 real content pages (25 newly written plus the
original 3 samples from the previous pass), across all four
collections:

- **7 destinations**: Florida, California, National Parks, European
  Cities, European Beaches, Caribbean Islands, Mexico
- **1 single-property resort review**: Coral Lagoon Resort & Spa
- **15 articles**: the packing/flying/international-travel/planning/
  parent-tips guides, four city/activity guides (theme parks, Orlando,
  Paris, London), and — see below — five "Best X Resorts" roundups
- **5 product reviews**: kids' backpacks, family luggage, travel toys,
  kids' headphones, plus the original Wayfinder 40L sample

### Why the "Best X Resorts" pages live in `articles`, not `resorts`

Five of the requested titles — Best All-Inclusive Family Resorts, Best
Caribbean Family Resorts, Best Beach Resorts For Families, Best Luxury
Family Resorts, Best Resorts With Kids Clubs — are roundups comparing
several properties, not a review of one. `ResortLayout` is built
specifically for a single-property deep dive (one hero, one "who it's
for," one set of room options), so forcing a 5-resort roundup through
it would mean a fake location and a fake rating for something that
isn't one resort.

Instead, these five live in the `articles` collection using
`TravelGuideLayout`, with each candidate resort as a `sections.items`
entry (title, body, optional image) rather than a fake dedicated page.
Coral Lagoon Resort & Spa — the one resort with a real, full review —
is featured in the relevant roundups and linked via `relatedArticles`,
so the roundups and the single review reinforce each other instead of
duplicating content. The `/resorts` listing page surfaces these five
roundups in a dedicated section below the single-resort grid, so the
page isn't a dead end while only one full resort review exists.

This is also why `category` values like "All-Inclusive Resorts" and
"Kids Clubs" appear on `articles` entries — the `/resorts` index page
filters `getCollection('articles')` by that known category list to
build its roundup section. Any future article tagged with one of
those categories will show up there automatically.

### Cross-linking

All 28 pages connect through `relatedArticles`, generally 2–4 links
each, spanning collections deliberately (a destination links to a
resort and a guide, a product links to a guide and another product,
etc.) rather than only linking within its own collection. The two
original sample pages (`destinations/florida.md`,
`articles/20-minute-packing-list.md`) were updated to link into the
new content as well.

### Two real bugs found and fixed while populating this content

1. **Wrong collection prefix.** One `relatedArticles` entry pointed at
   `articles/best-travel-toys-for-long-flights`, but that page lives in
   `products/`. Astro's build caught this as a `[WARN] Entry ... was
   not found` — a good example of why `resolveRelated()` skips
   unresolvable references instead of crashing the build, and also why
   it's still worth reading build output closely.
2. **Duplicated Quick Facts.** `ProductReviewLayout` auto-prepends
   Rating and Price to the sidebar from the top-level `rating`/`price`
   fields — the first four product pages I wrote also added "Rating"
   and "Price" rows inside `quickFacts` manually, so both appeared
   twice. Fixed by removing the redundant manual rows; `quickFacts`
   should only carry facts the layout doesn't already generate.

### Schema addition: `comparisonTable`

Added an optional `comparisonTable` field (`columns`, `rows`,
`caption`) to the `products` schema, so a gear roundup like "Best
Travel Backpacks For Kids" can include a real comparison table from
its own frontmatter. This was originally a route-level prop passed
into `ProductReviewLayout` by hand — moved into the content schema
itself so a new product review can use it without a code change,
consistent with the rest of the system.
