'use client';

import { useUser } from '@clerk/nextjs';
import { db } from '@/lib/instant';

export function useLedger(limit = 50) {
  const { user } = useUser();
  const userId = user?.id ?? null;

  const { isLoading, error, data } = db.useQuery(
    userId
      ? {
          ledger: {
            $: {
              where: { userId },
              order: { createdAt: 'desc' },
              limit,
            },
          },
        }
      : null
  );

  return {
    isLoading,
    error,
    entries: data?.ledger ?? [],
  };
}
