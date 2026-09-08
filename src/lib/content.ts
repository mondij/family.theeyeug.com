import { getEntry } from 'astro:content';

/**
 * relatedArticles entries are plain "collection/id" strings (e.g.
 * "articles/20-minute-packing-list") rather than a typed reference(),
 * since related content can point at any of the four collections.
 * This resolves those strings into the shape RelatedContent.astro
 * expects, skipping anything that doesn't resolve (a typo'd slug
 * should never break a build).
 */

const routePrefix: Record<string, string> = {
  articles: '/articles',
  destinations: '/destinations',
  resorts: '/resorts',
  products: '/products',
};

const categoryLabel: Record<string, string> = {
  articles: 'Journal',
  destinations: 'Destination',
  resorts: 'Resort',
  products: 'Gear guide',
};

type ValidCollection = 'articles' | 'destinations' | 'resorts' | 'products';

export interface ResolvedRelatedItem {
  href: string;
  image: any;
  imageAlt: string;
  category: string;
  title: string;
}

export async function resolveRelated(refs: string[]): Promise<ResolvedRelatedItem[]> {
  const items = await Promise.all(
    refs.map(async (ref): Promise<ResolvedRelatedItem | null> => {
      const [collection, ...rest] = ref.split('/');
      const id = rest.join('/');
      if (!collection || !id || !(collection in routePrefix)) return null;
      try {
        const entry = await getEntry(collection as ValidCollection, id);
        if (!entry) return null;
        return {
          href: `${routePrefix[collection]}/${entry.data.slugOverride ?? entry.id}`,
          image: entry.data.featuredImage,
          imageAlt: entry.data.featuredImageAlt,
          category: categoryLabel[collection] ?? entry.data.category,
          title: entry.data.title,
        };
      } catch {
        return null;
      }
    }),
  );
  return items.filter((item): item is ResolvedRelatedItem => item !== null);
}
