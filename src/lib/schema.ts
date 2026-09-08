/**
 * Structured data (schema.org JSON-LD) helpers.
 *
 * Each function returns a plain object ready to be serialized with
 * JSON.stringify() into a <script type="application/ld+json"> tag —
 * see BaseLayout.astro / the content layouts for usage. Keeping these
 * as small pure functions means every new page type (there will be
 * hundreds) gets correct structured data for free, without repeating
 * the shape inline on every layout.
 */

export interface ArticleSchemaInput {
  title: string;
  description: string;
  imageUrl: string;
  url: string;
  authorName: string;
  publishDate: Date;
  updatedDate?: Date;
}

export function articleSchema({
  title,
  description,
  imageUrl,
  url,
  authorName,
  publishDate,
  updatedDate,
}: ArticleSchemaInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    image: [imageUrl],
    author: {
      '@type': 'Person',
      name: authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Nestward',
    },
    datePublished: publishDate.toISOString(),
    dateModified: (updatedDate ?? publishDate).toISOString(),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  };
}

export interface FaqItem {
  question: string;
  answer: string;
}

export function faqSchema(items: FaqItem[]) {
  if (items.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
