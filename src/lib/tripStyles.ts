/**
 * Shared config for the /trip-styles section — one entry per way
 * families usually start planning (matches the homepage "Vacation
 * Discovery" category tiles). Both the index page and the dynamic
 * [style].astro detail page read from this single list, so adding a
 * seventh trip style later means one new entry here, not two.
 *
 * `tripStyleTag` matches the `tripStyle` enum on the destinations
 * schema; `articleCategories` matches the `category` string on
 * articles. A style page shows whatever real content matches either.
 */
export interface TripStyleConfig {
  slug: string;
  label: string;
  description: string;
  tripStyleTag?: 'beach' | 'adventure' | 'city' | 'culture' | 'nature' | 'ski' | 'theme-park';
  articleCategories: string[];
}

export const tripStyles: TripStyleConfig[] = [
  {
    slug: 'beach',
    label: 'Beach Vacations',
    description: 'Calm water, shallow entry, and towns that don\u2019t require a packed itinerary to enjoy.',
    tripStyleTag: 'beach',
    articleCategories: ['Beach Resorts'],
  },
  {
    slug: 'theme-parks',
    label: 'Theme Parks',
    description: 'From the big names to the parks that deserve to be, matched to the ages that suit them best.',
    tripStyleTag: 'theme-park',
    articleCategories: ['Theme Parks', 'Orlando'],
  },
  {
    slug: 'all-inclusive',
    label: 'All-Inclusive Resorts',
    description: 'Resorts that get the family-specific details right, not just the all-inclusive label.',
    articleCategories: ['All-Inclusive Resorts'],
  },
  {
    slug: 'adventure',
    label: 'Adventure Trips',
    description: 'Real trails, real wildlife, and destinations built for exploring rather than lounging.',
    tripStyleTag: 'adventure',
    articleCategories: [],
  },
  {
    slug: 'city-breaks',
    label: 'City Breaks',
    description: 'Walkable cities that hold up at a family\u2019s pace, without a full museum-and-monument itinerary.',
    tripStyleTag: 'city',
    articleCategories: ['Paris', 'London'],
  },
  {
    slug: 'national-parks',
    label: 'National Parks',
    description: 'The parks that work well with kids in tow, and a few worth saving for when they\u2019re older.',
    tripStyleTag: 'nature',
    articleCategories: [],
  },
];
