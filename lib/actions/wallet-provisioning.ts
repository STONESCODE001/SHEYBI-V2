/**
 * Wallet Provisioning & User Profile Sync Server Action
 * ========================================================
 * Auto-creates a Sheybi wallet entity and updates profile attributes
 * (displayName, avatarUrl, role) in InstantDB $users table upon sign-up or login.
 */

'use server';

import { auth, currentUser } from '@clerk/nextjs/server';
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

    // 1. Sync profile fields to InstantDB $users table if user found by email
    if (primaryEmail) {
      try {
        const queryRes = await adminDb.query({
          $users: {
            $: {
              where: { email: primaryEmail },
            },
          },
        });

        const instantUser = queryRes?.$users?.[0];
        if (instantUser) {
          const displayName =
            clerkUser.fullName ||
            clerkUser.firstName ||
            clerkUser.username ||
            primaryEmail.split('@')[0];

          await adminDb.transact(
            adminDb.tx.$users[instantUser.id].update({
              displayName,
              username: clerkUser.username || primaryEmail.split('@')[0],
              avatarUrl: clerkUser.imageUrl,
              role: (clerkUser.publicMetadata?.role as string) || 'user',
              accountStatus: 'active',
              updatedAt: Date.now(),
            })
          );
          console.log(`[User Sync] Synced profile fields for InstantDB user ${instantUser.id} (${displayName})`);
        }
      } catch (syncErr) {
        console.warn('[User Sync] Note on profile sync:', syncErr);
      }
    }

    // 2. Check if wallet already exists for this Clerk userId
    let wallet = await repository.wallets.getWalletByUserId(userId);
    if (!wallet) {
      // First login — create a wallet and seed with ₦50,000 demo funds
      const walletId = await repository.wallets.createWallet(userId);
      console.log(`[Wallet] Created new wallet ${walletId} for user ${userId}`);
      await processDepositAction(userId, 50000, `demo_seed_${walletId}_${Date.now()}`);
      return { success: true, walletId };
    } else if (wallet.availableBalance === 0) {
      const entries = await repository.ledger.getLedgerEntriesByUser(userId);
      if (entries.length === 0) {
        await processDepositAction(userId, 50000, `demo_seed_${wallet.id}_${Date.now()}`);
      }
    }

    return { success: true, walletId: wallet.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to provision wallet';
    console.error('[Wallet] ensureUserWalletAction error:', message);
    return { success: false, error: message };
  }
}

