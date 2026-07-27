'use client';

import { db } from '@/lib/instant';

export interface UseMarketsOptions {
  categorySlug?: string;
  state?: string;
  featuredOnly?: boolean;
  searchQuery?: string;
  limit?: number;
}

export function useMarkets(options: UseMarketsOptions = {}) {
  const { categorySlug = 'all', state = 'open', featuredOnly = false, searchQuery = '', limit = 20 } = options;

  const queryObj: any = {
    markets: {
      options: {},
      category: {},
      $: {
        order: { createdAt: 'desc' },
      },
    },
  };

  const { isLoading, error, data } = db.useQuery(queryObj);

  let markets = ((data as any)?.markets as any[]) || [];

  // Filter by State
  if (state !== 'all') {
    markets = markets.filter((m) => m.state === state);
  }

  // Filter by Featured
  if (featuredOnly) {
    markets = markets.filter((m) => m.isFeatured === true);
  }

  // Filter by Category Slug
  if (categorySlug && categorySlug !== 'all' && categorySlug !== 'trending') {
    markets = markets.filter((m) => m.category?.slug === categorySlug);
  }

  // Filter by Search Query
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    markets = markets.filter(
      (m) => m.title.toLowerCase().includes(q) || m.description.toLowerCase().includes(q)
    );
  }

  // Apply Limit
  if (limit > 0) {
    markets = markets.slice(0, limit);
  }

  return {
    isLoading,
    error,
    markets,
    totalCount: markets.length,
  };
}
