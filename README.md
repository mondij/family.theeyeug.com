# Nestward

A family-vacation planning site built with Astro, TypeScript, and
Tailwind CSS. This is a **foundation** — the design system,
components, and content architecture are in place; destination and
journal content is intentionally not written yet.

## Direction

The design leans into a bright, trust-driven travel-**search** look
(rating bubbles, review counts, a search-first hero, dense listing
grids) rather than a moody editorial-magazine look. White surfaces, a
confident brand green, and scannable cards — prioritizing "can I
trust this and book it quickly" over "beautiful photography essay."

Warm coral/sand accents are kept as a minority color (family-friendly
badges, a couple of illustrations) so the system still reads as its
own brand rather than a straight reskin of a single competitor.

## Getting started

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # outputs to dist/
npm run preview   # serve the production build locally
```

## Design system

All tokens live in `src/styles/global.css` under `@theme`, so every
value below is also a Tailwind utility (e.g. `bg-green`, `text-ink-soft`).

### Color

| Token | Hex | Use |
|---|---|---|
| `ink` | `#1A1A1A` | Primary text |
| `ink-soft` | `#5F6B68` | Secondary / meta text |
| `green` | `#0AA06E` | Primary brand — CTAs, links, rating bubbles |
| `green-dark` | `#086B4A` | Hover / pressed states |
| `green-deeper` | `#0D3D2E` | Dark sections (utility bar, CTA band) |
| `green-light` | `#E4F6EE` | Tints, hover chips |
| `coral` | `#E8794E` | Minority warm accent — family-only badges |
| `bg-subtle` | `#F4F6F5` | Alternating section background |
| `border` | `#E3E7E5` | Card / input borders |
| `linen` / `white` | `#FFFFFF` | Page background (no longer cream) |

### Type

Both display and body text use **Work Sans** (self-hosted via
`@fontsource-variable`) — one clean, humanist sans rather than a
serif/sans pairing, matching the more utilitarian search-site tone.

### Layout

- Containers: `.container-narrow` / `.container-content` / `.container-wide`.
- `.section` sets vertical rhythm.
- Grids are uniform (`sm:grid-cols-2 lg:grid-cols-4`), not asymmetric
  — cards are meant to be scanned and compared, not admired one at a time.

### Components (`src/components/`)

- **Container**, **Button**, **Badge**, **Card**, **SectionTitle** — as before.
- **RatingBubbles** — the 5-circle rating pattern (with half-fills)
  plus review count, used on every listing card.
- **CategoryIcon** — small inline icon set (bed, ticket, fork, home,
  ship, plane) for the homepage category strip.
- **ImageCard** — photo on top, details in a white panel below
  (title, location, rating, tags, price) rather than text overlaid on
  the image — keeps trust signals visible regardless of the photo.
- **Header** — white sticky bar: a dark utility strip (sign in / list
  your property), logo + primary nav + CTA, and a separate horizontal-
  scroll nav row for mobile (kept as its own element rather than a
  wrapped flex row, which is what caused a layout bug in an earlier pass).
- **Footer** — unchanged structurally; wordmark and link colors updated to match.

## Content collections, images, and SEO

Unchanged from the initial foundation — see `src/content.config.ts`
for the `destinations` and `journal` schemas (no entries yet), and
`src/assets/images/` for the placeholder illustrations (a new bright
daytime hero — `hero-search.jpg` — was added for this direction).
`astro.config.mjs` still has a placeholder `site` URL to update
before launch.

## What's deliberately not built yet

- Destination/journal listing and detail page templates
- Real search functionality behind the search bar (currently static)
- Real photography and copy
- Affiliate link handling/disclosure components
