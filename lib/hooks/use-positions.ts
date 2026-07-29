'use client';

import { useUser } from '@clerk/nextjs';
import { db } from '@/lib/instant';

export function usePositions() {
  const { user } = useUser();
  const userId = user?.id ?? null;

  const { isLoading, error, data } = db.useQuery(
    userId
      ? {
          positions: {
            $: { where: { userId } },
            market: {
              options: {},
            },
          },
        }
      : null
  );

  const positions = data?.positions ?? [];
  const openPositions = positions.filter((p: any) =>
    ['open', 'partially_sold'].includes(p.state)
  );
  const closedPositions = positions.filter((p: any) =>
    ['closed', 'won', 'lost', 'cancelled'].includes(p.state)
  );

  return {
    isLoading,
    error,
    positions,
    openPositions,
    closedPositions,
  };
}
