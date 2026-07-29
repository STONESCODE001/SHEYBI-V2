'use client';

import { useUser } from '@clerk/nextjs';
import { db } from '@/lib/instant';

export function useWallet() {
  const { user } = useUser();
  const userId = user?.id ?? null;

  const { isLoading, error, data } = db.useQuery(
    userId
      ? {
          wallets: {
            $: { where: { userId } },
          },
        }
      : null
  );

  const wallet = data?.wallets?.[0] ?? null;

  return {
    isLoading,
    error,
    wallet,
    availableBalance: wallet?.availableBalance ?? 0,
    lockedBalance: wallet?.lockedBalance ?? 0,
  };
}
