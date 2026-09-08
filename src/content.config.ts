import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Shared content architecture
 * ----------------------------
 * All four collections (articles, destinations, resorts, products)
 * share one base schema so the same components and layouts can be
 * reused across hundreds of future pages without new schema work per
 * page type. Each collection then extends the base with the handful
 * of fields that are genuinely specific to it.
 *
 * The biggest scalability decision here is `sections`: rather than
 * hard-coding "Best areas to stay" / "Kids facilities" / "Activities"
 * etc. as separate schema fields (which would mean a schema change
 * every time a new page type or section is needed), every structural
 * block of a page is one shape: a heading plus prose, a bullet list,
 * and/or a set of sub-items (each optionally with its own image).
 * Layouts render whatever mix of `sections` an entry provides, in
 * the order the content author wrote them.
 */

const sectionSchema = (image: (schema?: z.ZodTypeAny) => z.ZodTypeAny) =>
  z.object({
    heading: z.string(),
    body: z.array(z.string()).optional(), // one entry per paragraph
    bullets: z.array(z.string()).optional(), // simple bullet list (e.g. travel tips)
    items: z
      .array(
        z.object({
          title: z.string(),
          body: z.string().optional(),
          image: image().optional(),
          imageAlt: z.string().optional(),
        }),
      )
      .optional(), // structured sub-cards (areas to stay, room options, activities...)
  });

const faqSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

const quickFactSchema = z.object({
  label: z.string(),
  value: z.string(),
});

const ctaSchema = z.object({
  label: z.string(),
  href: z.string(),
  description: z.string().optional(),
  style: z.enum(['primary', 'secondary']).default('primary'),
});

const prosConsSchema = z.object({
  pros: z.array(z.string()),
  cons: z.array(z.string()),
});

const authorSchema = z.object({
  name: z.string(),
  role: z.string().optional(),
});

/**
 * Base fields every content type supports, per the content-system spec:
 * title, description, slug, category, featuredImage, author,
 * publishDate, updatedDate, seoKeywords, sections, faq, relatedArticles.
 *
 * `quickFacts`, `prosCons`, and `ctas` are also on the shared base
 * (rather than duplicated per collection) since QuickFacts, ProsCons,
 * and AffiliateBox are reusable components any of the four templates
 * may use.
 */
const baseSchema = (image: (schema?: z.ZodTypeAny) => z.ZodTypeAny) =>
  z.object({
    title: z.string(),
    description: z.string().max(300),
    // Optional override — defaults to the file-based id when omitted.
    // Named `slugOverride` (not `slug`) to avoid colliding with the
    // legacy `entry.slug` property name Astro's content layer still
    // reserves for backward-compat warnings.
    slugOverride: z.string().optional(),
    category: z.string(),
    featuredImage: image(),
    featuredImageAlt: z.string(),
    author: authorSchema,
    publishDate: z.date(),
    updatedDate: z.date().optional(),
    seoKeywords: z.array(z.string()).default([]),
    sections: z.array(sectionSchema(image)).default([]),
    faq: z.array(faqSchema).default([]),
    // Cross-collection references stored as "collection/id" strings
    // (e.g. "articles/20-minute-packing-list") and resolved at render
    // time — kept as plain strings rather than a single-collection
    // `reference()` because related content can span any of the four
    // collections.
    relatedArticles: z.array(z.string()).default([]),
    quickFacts: z.array(quickFactSchema).default([]),
    prosCons: prosConsSchema.optional(),
    ctas: z.array(ctaSchema).default([]),
    featured: z.boolean().default(false),
  });

const articles = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/articles' }),
  schema: ({ image }) =>
    baseSchema(image).extend({
      readingMinutes: z.number().optional(),
    }),
});

const destinations = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/destinations' }),
  schema: ({ image }) =>
    baseSchema(image).extend({
      country: z.string(),
      region: z.string().optional(),
      budgetTier: z.enum(['value', 'mid-range', 'luxury']),
      bestFor: z
        .array(z.enum(['toddlers', 'young-kids', 'tweens', 'teens', 'multigenerational']))
        .default([]),
      tripStyle: z
        .array(z.enum(['beach', 'adventure', 'city', 'culture', 'nature', 'ski', 'theme-park']))
        .default([]),
    }),
});

const resorts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/resorts' }),
  schema: ({ image }) =>
    baseSchema(image).extend({
      location: z.string(),
      bestForSummary: z.string().max(200),
      rating: z.number().min(0).max(5).optional(),
    }),
});

const products = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/products' }),
  schema: ({ image }) =>
    baseSchema(image).extend({
      price: z.string().optional(),
      rating: z.number().min(0).max(5).optional(),
      buyLinks: z
        .array(
          z.object({
            retailer: z.string(),
            url: z.string().url(),
            price: z.string().optional(),
          }),
        )
        .default([]),
    }),
});

export const collections = { articles, destinations, resorts, products };
