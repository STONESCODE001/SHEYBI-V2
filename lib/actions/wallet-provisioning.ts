/**
 * Wallet Provisioning & User Profile Sync Server Action
 * ========================================================
 * Auto-creates a Sheybi wallet entity and updates profile attributes
 * (displayName, avatarUrl, role) in InstantDB $users table upon sign-up or login.
 */

'use server';

import { auth, currentUser } from '@clerk/nextjs/server';
import { cookies } from 'next/headers';
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

    // Check referral cookie sheybi_ref
    let refCookie: string | undefined;
    try {
      const cookieStore = await cookies();
      refCookie = cookieStore.get('sheybi_ref')?.value?.toLowerCase()?.trim();
    } catch {
      // Cookie read fallback
    }

    let targetUserId = '';
    let awardedBonusAmount = 0;

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

      targetUserId = instantUser?.id || id();

      // Referral attachment check
      let referredBy = (instantUser as { referredBy?: string })?.referredBy;
      let referredAt = (instantUser as { referredAt?: number })?.referredAt;
      let signupBonusAmount = (instantUser as { signupBonusAmount?: number })?.signupBonusAmount;
      let signupBonusClaimed = (instantUser as { signupBonusClaimed?: boolean })?.signupBonusClaimed;

      if (!referredBy && refCookie) {
        try {
          const promoterRes = await adminDb.query({
            promoters: {
              $: {
                where: { slug: refCookie, status: 'active' },
              },
            },
          });
          const promoter = promoterRes?.promoters?.[0];
          if (promoter) {
            referredBy = promoter.slug;
            referredAt = Date.now();

            const currentSignups = promoter.totalSignups || 0;
            const bonusAmount = promoter.signupBonusAmount || 0;
            const maxSignups = promoter.maxBonusSignups || 0;
            const currentBonusCount = promoter.bonusSignupsCount || 0;
            const isBonusEligible = bonusAmount > 0 && currentBonusCount < maxSignups;

            if (isBonusEligible) {
              awardedBonusAmount = bonusAmount;
              signupBonusAmount = bonusAmount;
              signupBonusClaimed = true;
            }

            await adminDb.transact([
              adminDb.tx.promoters[promoter.id].update({
                totalSignups: currentSignups + 1,
                ...(isBonusEligible ? { bonusSignupsCount: currentBonusCount + 1 } : {}),
                updatedAt: Date.now(),
              }),
            ]);
            console.log(`[Referral Sync] User ${targetUserId} referred by ${promoter.slug}${isBonusEligible ? ` with ₦${bonusAmount} bonus` : ''}`);
          }
        } catch (refErr) {
          console.warn('[Referral Sync] Error matching promoter cookie:', refErr);
        }
      }

      await adminDb.transact([
        adminDb.tx.$users[targetUserId].update({
          clerkUserId: userId,
          email: primaryEmail || undefined,
          displayName,
          username: clerkUser?.username || (primaryEmail ? primaryEmail.split('@')[0] : undefined),
          avatarUrl: clerkUser?.imageUrl,
          role: (clerkUser?.publicMetadata?.role as string) || 'user',
          accountStatus: 'active',
          referredBy: referredBy || undefined,
          referredAt: referredAt || undefined,
          signupBonusAmount: signupBonusAmount || undefined,
          signupBonusClaimed: signupBonusClaimed || undefined,
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
      wallet = await repository.wallets.getWalletByUserId(userId);
    }

    if (wallet && awardedBonusAmount > 0) {
      try {
        const currentAvailable = wallet.availableBalance || 0;
        const currentBonus = wallet.bonusBalance || 0;
        const now = Date.now();
        const txId = id();
        const ledgerId = id();
        const refCode = `REF-BONUS-${targetUserId.slice(0, 8)}`;

        await adminDb.transact([
          adminDb.tx.wallets[wallet.id].update({
            availableBalance: currentAvailable + awardedBonusAmount,
            bonusBalance: currentBonus + awardedBonusAmount,
            updatedAt: now,
          }),
          adminDb.tx.wallet_transactions[txId].update({
            userId,
            transactionType: 'Deposit',
            amount: awardedBonusAmount,
            status: 'Completed',
            reference: refCode,
            createdAt: now,
          }),
          adminDb.tx.ledger[ledgerId].update({
            userId,
            eventType: 'REFERRAL_BONUS',
            amount: awardedBonusAmount,
            sourceAccountId: 'PLATFORM_PROMO_RESERVE',
            destinationAccountId: wallet.id,
            description: `Referral signup bonus (₦${awardedBonusAmount.toLocaleString()}) - Non-withdrawable`,
            idempotencyKey: `ref_bonus_${targetUserId}`,
            balanceAfter: currentAvailable + awardedBonusAmount,
            createdAt: now,
          }),
        ]);
        console.log(`[Wallet Bonus] Credited ₦${awardedBonusAmount} bonus funds to wallet ${wallet.id}`);
      } catch (bonusErr) {
        console.error('[Wallet Bonus] Error crediting signup bonus:', bonusErr);
      }
    }

    return { success: true, walletId: wallet?.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to provision wallet';
    console.error('[Wallet] ensureUserWalletAction error:', message);
    return { success: false, error: message };
  }
}

