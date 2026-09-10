// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Production domain. Canonical URLs, the sitemap, and OG/Twitter
  // tags are all generated from this — update it when the real
  // domain is connected in Cloudflare Pages (see README's Cloudflare
  // Pages section). Also update public/robots.txt's Sitemap line to
  // match, since that one is a static file Astro doesn't template.
  site: 'https://www.nestward.com',
  trailingSlash: 'never',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  image: {
    responsiveStyles: true,
  },
  prefetch: {
    prefetchAll: true,
    // 'hover' (and touch/focus) only — avoids the bandwidth cost of
    // eagerly prefetching every link that scrolls into view, which
    // matters on card-heavy pages like /destinations or /articles.
    defaultStrategy: 'hover',
  },
});
