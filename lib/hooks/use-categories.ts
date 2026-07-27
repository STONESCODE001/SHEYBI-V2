'use client';

import { db } from '@/lib/instant';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  displayOrder: number;
  isActive: boolean;
}

export function useCategories() {
  const { isLoading, error, data } = db.useQuery({
    categories: {
      $: {
        where: { isActive: true },
      },
    },
  });

  const rawCategories = data?.categories as any[];
  const categories: Category[] = (rawCategories || [
    { id: 'cat-all', name: 'All Markets', slug: 'all', displayOrder: 1, isActive: true },
    { id: 'cat-trending', name: 'Trending', slug: 'trending', displayOrder: 2, isActive: true },
    { id: 'cat-weekly', name: 'Weekly Eviction', slug: 'weekly-eviction', displayOrder: 3, isActive: true },
    { id: 'cat-hoh', name: 'Head of House', slug: 'head-of-house', displayOrder: 4, isActive: true },
    { id: 'cat-finale', name: 'Finale Winner', slug: 'finale-winner', displayOrder: 5, isActive: true },
  ]).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  return {
    isLoading,
    error,
    categories,
  };
}
