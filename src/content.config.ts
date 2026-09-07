import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Destinations: the core discovery unit (a resort, region, or city
 * families can plan a trip around). Kept intentionally rich so hundreds
 * of entries can be filtered, ranked, and cross-linked later.
 */
const destinations = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/destinations' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      country: z.string(),
      region: z.string().optional(),
      excerpt: z.string().max(220),
      heroImage: image(),
      heroImageAlt: z.string(),
      gallery: z.array(image()).optional(),
      bestFor: z
        .array(z.enum(['toddlers', 'young-kids', 'tweens', 'teens', 'multigenerational']))
        .default([]),
      tripStyle: z
        .array(z.enum(['beach', 'adventure', 'city', 'culture', 'nature', 'ski', 'theme-park']))
        .default([]),
      budgetTier: z.enum(['value', 'mid-range', 'luxury']),
      rating: z.number().min(0).max(5).optional(),
      seasonality: z.string().optional(),
      currency: z.enum(['USD', 'GBP', 'CAD', 'AUD', 'EUR']).default('USD'),
      startingPricePerNight: z.number().optional(),
      featured: z.boolean().default(false),
      publishDate: z.date(),
      updatedDate: z.date().optional(),
    }),
});

/**
 * Journal: editorial long-form content — guides, packing lists, trip
 * reports, advice. Nat-Geo-style storytelling that supports discovery
 * pages via shared tags.
 */
const journal = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/journal' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      dek: z.string().max(240).describe('Short editorial standfirst shown under the title'),
      author: z.string(),
      heroImage: image(),
      heroImageAlt: z.string(),
      tags: z.array(z.string()).default([]),
      relatedDestinations: z.array(z.string()).default([]),
      readingMinutes: z.number().optional(),
      featured: z.boolean().default(false),
      publishDate: z.date(),
      updatedDate: z.date().optional(),
    }),
});

export const collections = { destinations, journal };
