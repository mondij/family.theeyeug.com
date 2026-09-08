# Nestward

A family-vacation planning site built with Astro, TypeScript, and
Tailwind CSS. The homepage is now built out end-to-end; deeper pages
(destination detail, resort detail, journal listing) are the next step.

## Direction

Bright, trust-driven travel-search foundations (green brand, white
surfaces, clean cards) from an earlier pass, now expressed through a
warmer, more premium homepage: a cinematic emotional hero, editorial
destination cards, and a curated (not algorithmic-feeling) resort
shortlist — built to read as a trusted travel brand, not an affiliate
listings site. No prices, review-bait, or urgency copy on the homepage.

## Getting started

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # outputs to dist/
npm run preview   # serve the production build locally
```

## Homepage sections (`src/pages/index.astro`)

1. **Hero** — cinematic full-bleed image, headline, supporting line, two CTAs.
2. **Vacation Discovery** — six image-led category tiles (Beach, Theme
   Parks, All-Inclusive, Adventure, City Breaks, National Parks).
3. **Featured Destinations** — five editorial destination cards
   (Florida, Caribbean, Italy, Mexico, Japan), photo + one-line "why here".
4. **Family Resorts** — a short shortlist of resort cards: image,
   name, location, a "best for" badge, one CTA. No price/review clutter.
5. **Travel Inspiration** — one large featured article + two
   supporting ones, magazine-style.
6. **Family Travel Tips** — four short, concrete tips in a card grid.
7. **Newsletter** — a single, calm email capture (the footer no
   longer duplicates this — it previously had its own signup form,
   which was removed once this section existed).
8. **Footer** — link columns + legal links.

## Components (`src/components/`)

New in this pass:

- **Hero** — `image`, `imageAlt`, `headline`, `supporting`,
  `primaryCta`/`secondaryCta` (`{ label, href }`). No search fields —
  this is a brand moment, not a booking widget.
- **TravelCategoryCard** — `href`, `image`, `imageAlt`, `label`. Deliberately minimal.
- **DestinationCard** — `href`, `image`, `imageAlt`, `name`, `teaser`.
  Full-bleed photo with a text scrim, editorial tone.
- **ResortCard** — `href`, `image`, `imageAlt`, `name`, `location`,
  `bestFor`, `ctaLabel?`. Panel layout, one CTA, no price/rating.
- **ArticleCard** — `href`, `image`, `imageAlt`, `category`, `title`,
  `excerpt`, `meta?`, `featured?`. Magazine kicker + headline + excerpt.
- **Newsletter** — `heading?`, `supporting?`. Calm copy, explicit
  no-spam line, no discount bait.

Carried over from the previous pass and still used elsewhere in the
system (not on the homepage currently): **ImageCard** and
**RatingBubbles** — kept for a future search/listing page where
rating + price + review count are appropriate. **Container**,
**Button**, **Badge**, **Card**, **SectionTitle**, **Header**,
**Footer** are unchanged in API, with Footer's old inline newsletter
form removed (see above).

## Images

`src/assets/images/` now includes, in addition to the earlier set:
`hero-family.jpg`, six `cat-*.jpg` category tiles, five `dest-*.jpg`
destination illustrations (Florida/Caribbean/Italy/Mexico/Japan),
`resort-lagoon.jpg`, and two `article-*.jpg` banners. All are original
abstract/illustrative placeholders (not photography) generated for
this foundation — swap them for real photography via `astro:assets`
whenever that's ready; every image already flows through `<Image />`
for responsive `srcset`/WebP, so no component code needs to change.

## What's deliberately not built yet

- Destination/resort/journal detail page templates and listing pages
- Real search/filter functionality
- Real photography and copy
- Newsletter form submission handling (currently a static form)
