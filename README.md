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

## Production optimization pass (Cloudflare Pages launch prep)

This section documents a full production-readiness pass: SEO
infrastructure, performance, accessibility, broken-link fixes, and
Cloudflare Pages deployment setup. Everything below was verified with
real tooling (a 50-page link crawl, axe-core accessibility audits
across 25 pages, and mobile viewport checks) — not just eyeballed.

### Broken links (the biggest issue found)

The homepage had several hardcoded links to pages that were never
actually built — leftover from before the content collection system
existed (`/journal/packing-list`, `/resorts/alpine-meadow`,
`/destinations/italy` with no content behind it, etc.). Fixed by:

- Rewriting the homepage's Featured Destinations, Family Resorts, and
  Travel Inspiration sections to pull live from `getCollection()`
  instead of hardcoded arrays — it's now structurally impossible for
  these sections to link to a page that doesn't exist.
- Adding the two destinations that were referenced but never written
  (`destinations/italy.md`, `destinations/japan.md`) rather than
  quietly dropping them.
- Building out a full `/trip-styles` section (an index page plus six
  filtered category pages) since primary nav depended on it and it
  didn't exist.
- Creating every page that was linked from the header/footer but
  missing: `/plan`, `/about`, `/contact`, `/editorial-standards`,
  `/partners`, `/privacy`, `/terms`, `/affiliate-disclosure`, and a
  custom `/404`.
- Removing the "Sign in" utility-bar link entirely rather than
  building a fake sign-in page — there's no auth system in this
  project, and a non-functional sign-in link would be actively
  misleading on a real launch.

A full crawl of the built site (`50` reachable pages) now shows **zero
broken internal links**. The only external link found is the
placeholder `https://example.com/buy` used in product `buyLinks` —
intentional until real affiliate/retailer URLs are available.

### SEO

- **Sitemap**: `@astrojs/sitemap` generates `sitemap-index.xml` from
  every static route automatically — no manual maintenance as pages
  are added.
- **robots.txt**: static file in `public/`, points at the sitemap.
- **Canonical URLs**: set on every page from `Astro.url.pathname` in
  `BaseLayout`, including listing and utility pages.
- **Open Graph / Twitter cards**: fixed two real bugs here —
  `/social/og-default.jpg` was referenced but never existed (every
  share fell back to nothing), and no page actually passed a
  page-specific image. Now: (1) a real default share image exists,
  and (2) all four content layouts and the homepage generate a proper
  1200×630 OG image from their own real featured photo via
  `getImage()`, so social previews show the actual destination/resort/
  product photo, not a generic placeholder.
- **Structured data**: Article, FAQPage, and BreadcrumbList JSON-LD on
  every content page (unchanged from the previous pass, but fixed a
  real bug — see below), plus new sitewide Organization and WebSite
  JSON-LD in `BaseLayout` for brand knowledge-panel eligibility.
- **Bug fixed**: the Article schema's `image` field was set to the
  page's own URL instead of an actual photo URL, in all four content
  layouts. Now uses the same real `getImage()` output as the OG tags.
- **Bug fixed**: `favicon.svg` still had the old teal/coral color
  scheme from before a brand redesign, while the actual header logo
  had already moved to the current green mark — the browser tab icon
  and the on-page logo didn't match. Fixed, plus added
  `apple-touch-icon.png`, `icon-192.png`/`icon-512.png`, and
  `site.webmanifest` for full home-screen/PWA-install icon coverage.

### Performance

- **Images**: everything already flowed through `astro:assets`
  `<Image />` for responsive `srcset`/WebP output (from earlier
  passes) — confirmed this is working, with most images optimizing
  down to 5–15KB thanks to the flat-color illustration style.
- **Fonts**: self-hosted via `@fontsource-variable` (no external font
  request), `font-display: swap` confirmed already set by Fontsource,
  loaded in unicode-range subsets so a browser only downloads the
  characters actually used.
- **CSS bundle cut from 48KB → 36KB**: found and removed the Tailwind
  Typography plugin (`@tailwindcss/typography`) — it was loaded but
  its `.prose` class was never used anywhere in the codebase (the
  project uses a custom `.prose-editorial` class instead). Removed
  the plugin, its `@plugin` directive, and the now-unused
  `@fontsource-variable/fraunces` package (dropped when the site
  moved to a single-typeface system in an earlier pass but never
  removed from `package.json`).
- **JavaScript**: confirmed minimal — one ~4KB file, which is Astro's
  own prefetch runtime (no framework/component JS ships at all, since
  every interactive bit — the FAQ accordion — uses native `<details>`).
  Made the prefetch strategy explicit (`defaultStrategy: 'hover'`)
  rather than relying on the default, so links are only prefetched on
  real hover/focus/tap intent, not eagerly for everything that
  scrolls into view on card-heavy pages like `/destinations`.
- **Lazy loading**: confirmed consistent — every image component
  accepts a `priority` prop that controls `loading="eager"` vs
  `"lazy"` and `fetchpriority`, used correctly for above-the-fold vs
  below-the-fold images throughout.

### Accessibility

Ran an automated **axe-core** audit (WCAG 2.0/2.1 A + AA + best
practice rules) across 25 representative pages — every page template,
not just the homepage. Found and fixed:

- **Contrast failure, sitewide**: white text on the primary button
  background measured 3.35:1 (needs 4.5:1) — every "Start planning"—
  style button on the entire site failed this. Fixed by using the
  existing darker `green-dark` token as the button's base color
  (6.5:1) instead of the brighter brand green, reserving the brand
  green for hover/accents where it's not carrying text.
- **Contrast failure, sitewide**: the muted "tertiary text" color used
  for QuickFacts labels and the affiliate disclosure line measured
  ~2.9–3.2:1 against white and tinted backgrounds. Darkened the token
  to `#66716e` (4.4–5.5:1 across every background it's actually used
  on) while keeping it visually lighter than the secondary text color.
- **Missing `<h1>` on 14 pages**: every listing and utility page
  (`/destinations`, `/resorts`, `/articles`, `/products`,
  `/trip-styles` and its sub-pages, `/plan`, `/about`, `/contact`,
  etc.) used a heading component that only ever rendered `<h2>`. Added
  a `level` prop to `SectionTitle` and set it to `h1` on each page's
  main heading.
- **Heading-order skips (h1→h3)**: `AffiliateBox` used `<h3>` as a
  top-level section heading (fixed to `<h2>`); `ProsCons` rendered two
  `<h3>` subheadings with no parent heading of its own, which broke
  whenever it appeared without a preceding section (fixed by wrapping
  it in its own `<h2>"Pros and cons"</h2>`, making it correct
  regardless of what precedes it — important since this component
  will be reused across hundreds of future resort/product pages).
- **Invalid nested interactive markup**: `ImageCard` had a `<button>`
  (a non-functional "save" heart icon) nested inside its own `<a>` —
  invalid HTML, confusing for keyboard/screen-reader navigation, and
  the button didn't actually do anything since there's no save
  feature built. Removed it rather than leave dead, broken markup.
- **Card titles missing semantic headings**: `DestinationCard`,
  `ArticleCard`, `ImageCard`, and `ResortCard` needed their title to
  render as a real heading (for screen-reader users navigating by
  heading) but the *same* component is reused both as a sub-item under
  a section heading (needs `h3`) and as the first heading after a
  page's own `h1` (needs `h2`, or the next h1→h3 skip reappears).
  Added a `headingLevel` prop (default `'h3'`) to all four, set to
  `'h2'` at the specific call sites where each is the first
  heading-bearing element on its page.
- Added a skip-to-content link (visually hidden until focused) as the
  first focusable element on every page.
- **Empty table header**: `ComparisonTable`'s blank corner cell (above
  the row labels) had no accessible name — added visually-hidden text.

Result: **zero axe violations** across all 25 pages sampled, spanning
every page type in the project.

### Mobile

Checked every page type at a 375px viewport for horizontal overflow
(a common and easy-to-miss mobile bug). Found and fixed a real one:

- **`ComparisonTable` broke page layout on mobile** — its wrapper
  correctly had `overflow-x: auto`, but the CSS Grid/Flexbox ancestors
  around it (`DestinationLayout`, `ResortLayout`,
  `ProductReviewLayout`, `TravelGuideLayout`'s two-column content
  grid) didn't have `min-width: 0`, which is required for a
  grid/flexbox item to be allowed to shrink below its content's
  intrinsic width. Without it, the table's 520px minimum width forced
  the entire page 170px wider than the viewport on mobile. Fixed by
  adding `min-w-0` to the grid/flex containers in all four content
  layouts — the correct root-cause fix — plus `overflow-x: hidden` on
  `body` as a defensive safety net against any future wide element
  doing the same thing.

### Cloudflare Pages deployment

This is a fully static site (`getStaticPaths()` everywhere, no
server-rendered routes) — **no Cloudflare adapter is needed**. Astro's
default static output deploys directly.

**Dashboard setup** (Cloudflare Pages → Workers & Pages → Create →
Pages → connect this repository):

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `/` (or wherever this project lives, if part of a monorepo) |
| Node version | Set automatically from `.node-version` (`22`) — added to this project so Cloudflare doesn't fall back to an older default |

No environment variables are required for the build itself. The
`site` value in `astro.config.mjs` is intentionally hardcoded to the
production domain rather than read from an env var — canonical URLs,
the sitemap, and OG tags should point at the real domain even on
Cloudflare's preview-branch deployments (a `*.pages.dev` URL), which
is the standard SEO-safe approach; it avoids search engines ever
indexing a preview URL as canonical.

**Before going live**, two things reference the domain directly and
both need to match if it ever changes:
1. `site` in `astro.config.mjs`
2. The `Sitemap:` line in `public/robots.txt` (a static file — Astro
   doesn't template it)

**Custom domain**: add it under the Pages project's "Custom domains"
tab once deployed; Cloudflare provisions the TLS certificate
automatically.

**`public/_headers`**: Cloudflare Pages reads this file directly (no
extra config) and applies:
- Immutable, one-year caching on `/_astro/*` — safe because every
  filename in that folder is content-hashed by Vite/Astro, so a
  changed file always gets a new filename.
- A short cache on icons/manifest/social images (these aren't
  fingerprinted, so a same-filename update should propagate faster).
- Baseline security headers (`X-Content-Type-Options`,
  `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`) sitewide.

**Local preview of the production build**: `npm run build && npm run
preview` serves the exact static output Cloudflare will deploy.
