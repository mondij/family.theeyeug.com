# Nestward

A premium, editorial family-vacation planning site. Built with Astro,
TypeScript, and Tailwind CSS as a **foundation** — the design system,
components, and content architecture are in place; destination and
journal content is intentionally not written yet.

## Brand identity

**Nestward** — family travel planned properly. The name pairs "nest"
(home, family) with "ward" (direction of travel), and sits between
TripAdvisor's discovery breadth, Airbnb's visual warmth, and National
Geographic Travel's editorial credibility, without copying any of them.

Tone: adventurous but never chaotic, warm but not saccharine, premium
but not stuffy. Copy is written from the parent's point of view —
plain, specific, sentence case, no tracked-out eyebrow labels.

## Getting started

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # outputs to dist/
npm run preview   # serve the production build locally
```

## Design system

All tokens live in `src/styles/global.css` under `@theme`, so every
value below is also a Tailwind utility (e.g. `bg-lagoon`, `text-coral-deep`).

### Color

| Token | Hex | Use |
|---|---|---|
| `ink` | `#10222B` | Body text, dark surfaces |
| `ink-soft` | `#2C3E46` | Secondary text |
| `lagoon` | `#0E6B72` | Primary brand — ocean/tropical teal |
| `lagoon-deep` | `#0A4C52` | Dark sections, pressed states |
| `palm` | `#3C7A5D` | Secondary accent — tropical green |
| `coral` | `#E8794E` | Primary CTA — sunset orange |
| `gold` | `#C9973F` | Ratings, highlights |
| `sand` | `#F1E6D2` | Warm section backgrounds |
| `linen` | `#FBF7F0` | Default page/card background |

### Type

- **Display — Fraunces** (`font-display`): headings, the wordmark. A
  warm, slightly editorial serif with real personality — used at
  large sizes as a design element, not just a headline font.
- **Body — Work Sans** (`font-body`): everything else. Humanist,
  warm, highly legible at small sizes.

Both are self-hosted via `@fontsource-variable`, so there's no
external font request and no layout shift from a late-loading webfont.

### Layout

- Containers: `.container-narrow` (68ch reading), `.container-content`
  (1152px, default sections), `.container-wide` (1408px, magazine grids).
- `.section` sets consistent vertical rhythm (`clamp()`-based, so it
  scales with viewport instead of jumping at breakpoints).
- Grids are intentionally asymmetric (see the homepage "Editor's
  picks" section) rather than uniform card grids — lead with one
  larger, more considered placement per section.

### Components (`src/components/`)

- **Container** — width wrapper, `size="narrow" | "content" | "wide"`.
- **Button** — `variant="primary" | "secondary" | "ghost" | "on-dark"`.
  Renders an `<a>` when given `href`, otherwise a `<button>`.
- **Badge** — small pill for tags/ratings, `variant="sand" | "coral" | "palm" | "on-dark"`.
- **SectionTitle** — the recurring kicker + heading + supporting-line
  pattern. Sentence-case kicker (not tracked-out caps) by design.
- **Card** — general text-led surface (advice, stats, quotes).
- **ImageCard** — the primary discovery card (destinations, journal).
  Image-led with a bottom scrim for legible text over any photo,
  optional `badge` slot, and `aspect="portrait" | "square" | "wide"`.
- **Header** — fixed nav, transparent over the hero and solid on
  scroll (see the `<script>` in `Header.astro`).
- **Footer** — magazine-style multi-column footer with a newsletter form.

### Motion

Kept deliberately restrained: a hover lift + image scale on cards,
a smooth header transition on scroll, and nothing else. All
transitions respect `prefers-reduced-motion` (see `global.css`).

## Content collections (`src/content.config.ts`)

Two collections, defined with the Astro 5+ content layer (`glob`
loader) so they scale to hundreds of entries without any code change:

- **`destinations`** — the core discovery unit. Includes `bestFor`
  (age groups), `tripStyle`, `budgetTier`, pricing, and rating, so
  listing/filter pages can be built directly off the schema.
- **`journal`** — long-form editorial content (guides, packing lists,
  advice), with `relatedDestinations` for cross-linking.

No entries exist yet — add `.md`/`.mdx` files under
`src/content/destinations/` and `src/content/journal/` and they'll be
picked up automatically and type-checked against the schema.

## Images

`src/assets/images/` currently contains original, abstract editorial
illustrations (not photography) generated as placeholders for the
hero and destination cards, so the layout can be reviewed without
stock photography. Swap these for real photography via `astro:assets`
— every image already flows through the `<Image />` component for
automatic responsive `srcset`/WebP output, so no component code needs
to change when real photos are dropped in.

## SEO foundation

- `astro.config.mjs` sets `site` (update this to the real domain
  before launch) and includes `@astrojs/sitemap`, which generates
  `sitemap-index.xml` on every build automatically.
- `BaseLayout.astro` sets canonical URL, description, Open Graph, and
  Twitter card meta on every page from two required props (`title`,
  `description`).
- `public/robots.txt` points to the sitemap.

## What's deliberately not built yet

- Destination/journal listing and detail page templates
- Search/filtering UI
- Real photography and copy
- Affiliate link handling/disclosure components

The system above is built so those are additive — new pages and
content types can reuse `Container`, `Button`, `Card`, `ImageCard`,
and `SectionTitle` without introducing new patterns.
