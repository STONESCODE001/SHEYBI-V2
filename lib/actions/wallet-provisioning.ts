/**
 * Wallet Provisioning & User Profile Sync Server Action
 * ========================================================
 * Auto-creates a Sheybi wallet entity and updates profile attributes
 * (displayName, avatarUrl, role) in InstantDB $users table upon sign-up or login.
 */

'use server';

import { auth, currentUser } from '@clerk/nextjs/server';
import { id } from '@instantdb/admin';
import { repository } from '@/lib/repositories';
import { adminDb } from '@/lib/instant-admin';

import { processDepositAction } from '@/lib/actions/wallet-actions';

export async function ensureUserWalletAction(): Promise<{ success: boolean; walletId?: string; error?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'User is not authenticated' };
    }

    const clerkUser = await currentUser();
    const primaryEmail = clerkUser?.emailAddresses?.[0]?.emailAddress;

    // 1. Upsert profile fields & clerkUserId to InstantDB $users table
    try {
      let instantUser = null;
      if (primaryEmail) {
        const queryRes = await adminDb.query({
          $users: {
            $: {
              where: { email: primaryEmail },
            },
          },
        });
        instantUser = queryRes?.$users?.[0];
      }

      if (!instantUser) {
        const queryRes = await adminDb.query({
          $users: {
            $: {
              where: { clerkUserId: userId },
            },
          },
        });
        instantUser = queryRes?.$users?.[0];
      }

      const displayName =
        clerkUser?.fullName ||
        clerkUser?.firstName ||
        clerkUser?.username ||
        (primaryEmail ? primaryEmail.split('@')[0] : 'User');

      const targetUserId = instantUser?.id || id();

      await adminDb.transact([
        adminDb.tx.$users[targetUserId].update({
          clerkUserId: userId,
          email: primaryEmail || undefined,
          displayName,
          username: clerkUser?.username || (primaryEmail ? primaryEmail.split('@')[0] : undefined),
          avatarUrl: clerkUser?.imageUrl,
          role: (clerkUser?.publicMetadata?.role as string) || 'user',
          accountStatus: 'active',
          updatedAt: Date.now(),
          ...(instantUser ? {} : { createdAt: Date.now() }),
        }),
      ]);
      console.log(`[User Sync] Successfully ${instantUser ? 'updated' : 'created'} InstantDB user ${targetUserId} (${displayName})`);
    } catch (syncErr) {
      console.warn('[User Sync] Note on profile sync:', syncErr);
    }

    let wallet = await repository.wallets.getWalletByUserId(userId);
    if (!wallet) {
      // First login — create a wallet
      const walletId = await repository.wallets.createWallet(userId);
      console.log(`[Wallet] Created new wallet ${walletId} for user ${userId}`);
      return { success: true, walletId };
    }

    return { success: true, walletId: wallet.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to provision wallet';
    console.error('[Wallet] ensureUserWalletAction error:', message);
    return { success: false, error: message };
  }
}

