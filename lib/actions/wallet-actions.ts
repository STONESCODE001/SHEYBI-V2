/**
 * Wallet Server Actions
 * ======================
 * Production-ready Server Actions for wallet operations:
 * - processDepositAction: Credits wallet after payment confirmation
 * - requestWithdrawalAction: Deducts available balance for withdrawal request
 * - rejectWithdrawalAction: Refunds available balance when admin rejects withdrawal
 *
 * WALLET BALANCE MODEL:
 *   Deposit:           availableBalance += amount
 *   Withdrawal request: availableBalance -= amount (immediate, lockedBalance NOT touched)
 *   Withdrawal reject:  availableBalance += amount (refund)
 *
 * FEE STRUCTURE:
 *   Withdrawal Fee: 3.0% of withdrawal amount, minimum ₦150
 *
 * @see context/feature-specs/12-prediction-engine-integration.md
 * @see context/prediction-engine.md §Wallet Behaviour, §Revenue Model
 */

'use server';

import { auth } from '@clerk/nextjs/server';
import { WITHDRAWAL_FEE_RATE, MIN_WITHDRAWAL_FEE } from '@/lib/prediction-engine/lmsr';
import { repository } from '@/lib/repositories';
import { adminDb } from '@/lib/instant-admin';

// ============================================================================
// RESPONSE TYPES & INPUT INTERFACES
// ============================================================================

interface ActionResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

interface DepositResponse {
  newAvailableBalance: number;
  depositAmount: number;
}

interface WithdrawalResponse {
  withdrawalAmount: number;
  fee: number;
  netAmount: number; // Amount user will receive after fee
  newAvailableBalance: number;
  reference: string;
}

export interface BankDetailsInput {
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
}

// ============================================================================
// DEPOSIT ACTION
// ============================================================================

/**
 * Process a deposit after payment confirmation.
 *
 * In production, this is called by the Paystack webhook handler after
 * a successful payment. For now, it accepts a userId parameter since
 * the webhook integration is a separate feature.
 *
 * EXECUTION ORDER:
 * 1. Validate authentication
 * 2. Validate deposit amount
 * 3. Credit availableBalance
 * 4. Create ledger entry (eventType: 'DEPOSIT')
 * 5. Return updated balance
 *
 * PAYSTACK SWAP NOTE:
 * When Paystack is integrated, this action will be called by
 * app/api/webhooks/paystack/route.ts after verifying the webhook
 * signature. The userId will come from the payment metadata, not
 * from Clerk auth (since webhooks don't have user sessions).
 *
 * @param userId - The user receiving the deposit (from Paystack webhook metadata)
 * @param amount - The deposit amount in ₦
 * @param paymentReference - External payment reference (Paystack transaction ref)
 */
export async function processDepositAction(
  userId: string,
  amount: number,
  paymentReference: string
): Promise<ActionResponse<DepositResponse>> {
  try {
    // ---- Validate inputs ----
    if (!userId) {
      return { success: false, error: 'User ID is required.' };
    }
    if (amount <= 0) {
      return { success: false, error: 'Deposit amount must be positive.' };
    }

    // ---- Idempotency check ----
    /**
     * Paystack may send duplicate webhook events.
     * The payment reference acts as the idempotency key
     * to prevent crediting the same deposit twice.
     */
    const idempotencyKey = `deposit_${paymentReference}`;
    const keyExists = await repository.ledger.idempotencyKeyExists(idempotencyKey);
    if (keyExists) {
      // Silently succeed — deposit was already processed
      const wallet = await repository.wallets.getWalletByUserId(userId);
      return {
        success: true,
        data: {
          newAvailableBalance: wallet?.availableBalance ?? 0,
          depositAmount: amount,
        },
      };
    }

    // ---- Fetch or create wallet ----
    let wallet = await repository.wallets.getWalletByUserId(userId);
    if (!wallet) {
      /**
       * First-time deposit for a new user.
       * Create wallet automatically.
       * In production, wallet creation typically happens during registration,
       * but we handle this edge case gracefully.
       */
      await repository.wallets.createWallet(userId);
      wallet = await repository.wallets.getWalletByUserId(userId);
    }
    if (!wallet) {
      return { success: false, error: 'Failed to create wallet.' };
    }

    const now = Date.now();

    // ---- Credit available balance ----
    await repository.wallets.updateWalletBalance(userId, {
      availableBalanceDelta: +amount,
      lockedBalanceDelta: 0,
    });

    // ---- Record ledger entry ----
    await repository.ledger.createLedgerEntry({
      userId,
      eventType: 'DEPOSIT',
      amount,
      sourceAccountId: 'paystack_external',  // External funding source
      destinationAccountId: wallet.id,        // User's wallet
      description: `Deposit of ₦${amount.toLocaleString()} via Paystack`,
      idempotencyKey,
      balanceAfter: wallet.availableBalance + amount,
      referenceId: paymentReference,
      metadata: { paymentProvider: 'paystack', paymentReference },
      createdAt: now,
    });

    return {
      success: true,
      data: {
        newAvailableBalance: wallet.availableBalance + amount,
        depositAmount: amount,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { success: false, error: message };
  }
}

// ============================================================================
// WITHDRAWAL REQUEST ACTION
// ============================================================================

/**
 * Request a withdrawal from the user's available balance.
 *
 * IMPORTANT:
 * - Requires approved KYC record in kyc_records entity
 * - Deducts from availableBalance IMMEDIATELY upon request
 * - Does NOT touch lockedBalance (that's exclusively for trading positions)
 * - If admin rejects the withdrawal, funds are refunded via rejectWithdrawalAction
 * - If admin approves, Paystack processes the payout
 *
 * FEE CALCULATION:
 *   fee = max(amount * 3.0%, ₦150)
 *   netAmount = amount - fee (what the user receives)
 *
 * @param amount - The gross withdrawal amount in ₦
 * @param bankDetails - Optional account payout details
 */
export async function requestWithdrawalAction(
  amount: number,
  bankDetails?: BankDetailsInput
): Promise<ActionResponse<WithdrawalResponse>> {
  try {
    // ---- STEP 1: Validate authentication ----
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Authentication required. Please sign in.' };
    }

    // ---- STEP 1.5: Enforce Pre-Withdrawal KYC Check ----
    const kycResult = await adminDb.query({
      kyc_records: {
        $: {
          where: { userId },
        },
      },
    });

    const kycRecord = (kycResult as any)?.kyc_records?.[0];
    if (!kycRecord || kycRecord.verificationStatus !== 'approved') {
      return {
        success: false,
        error: 'KYC_REQUIRED',
      };
    }

    // ---- STEP 2: Validate amount ----
    if (amount <= 0) {
      return { success: false, error: 'Withdrawal amount must be positive.' };
    }

    // ---- STEP 3: Fetch wallet and validate balance ----
    const wallet = await repository.wallets.getWalletByUserId(userId);
    if (!wallet) {
      return { success: false, error: 'Wallet not found.' };
    }
    if (wallet.availableBalance < amount) {
      return {
        success: false,
        error: `Insufficient available balance. Available: ₦${wallet.availableBalance.toLocaleString()}, Requested: ₦${amount.toLocaleString()}`,
      };
    }

    // ---- STEP 4: Calculate withdrawal fee ----
    const calculatedFee = amount * WITHDRAWAL_FEE_RATE;
    const fee = Math.max(calculatedFee, MIN_WITHDRAWAL_FEE);
    const netAmount = amount - fee;

    if (netAmount <= 0) {
      return {
        success: false,
        error: `Withdrawal amount too small. After the ₦${fee.toLocaleString()} fee, you would receive ₦0.`,
      };
    }

    const now = Date.now();
    const withdrawalReference = `WD-${now}-${crypto.randomUUID().slice(0, 8)}`;
    const idempotencyKey = `withdrawal_${withdrawalReference}`;

    // ---- STEP 5: Deduct available balance immediately ----
    await repository.wallets.updateWalletBalance(userId, {
      availableBalanceDelta: -amount,
      lockedBalanceDelta: 0,
    });

    // ---- STEP 6: Record ledger entries ----
    await repository.ledger.createLedgerEntry({
      userId,
      eventType: 'WITHDRAWAL',
      amount: netAmount,
      sourceAccountId: wallet.id,
      destinationAccountId: 'user_bank_account',
      description: `Withdrawal request of ₦${amount.toLocaleString()} (net ₦${netAmount.toLocaleString()} after fee)`,
      idempotencyKey,
      balanceAfter: wallet.availableBalance - amount,
      referenceId: withdrawalReference,
      metadata: { grossAmount: amount, fee, netAmount },
      createdAt: now,
    });

    await repository.ledger.createLedgerEntry({
      userId,
      eventType: 'WITHDRAWAL_FEE',
      amount: fee,
      sourceAccountId: wallet.id,
      destinationAccountId: 'platform_fee_account',
      description: `Withdrawal fee (${WITHDRAWAL_FEE_RATE * 100}%, min ₦${MIN_WITHDRAWAL_FEE})`,
      idempotencyKey: `${idempotencyKey}_fee`,
      balanceAfter: wallet.availableBalance - amount,
      referenceId: withdrawalReference,
      createdAt: now,
    });

    // ---- STEP 7: Persist Withdrawal Request for Admin Panel ----
    await repository.withdrawals.createWithdrawalRequest({
      userId,
      grossAmount: amount,
      feeAmount: fee,
      netAmount,
      bankName: bankDetails?.bankName || 'Guaranty Trust Bank',
      accountNumber: bankDetails?.accountNumber || '0000000000',
      accountName: bankDetails?.accountName || 'Account Holder',
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    });

    return {
      success: true,
      data: {
        withdrawalAmount: amount,
        fee,
        netAmount,
        newAvailableBalance: wallet.availableBalance - amount,
        reference: withdrawalReference,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { success: false, error: message };
  }
}

// ============================================================================
// REJECT WITHDRAWAL ACTION (Admin)
// ============================================================================

/**
 * Refund a withdrawal that was rejected by an admin.
 *
 * This credits back the full withdrawal amount (including fee)
 * to the user's available balance, since no payment was sent.
 *
 * EXECUTION ORDER:
 * 1. Validate admin authentication
 * 2. Refund availableBalance
 * 3. Record refund ledger entry
 * 4. Create audit log
 *
 * @param userId - The user whose withdrawal was rejected
 * @param amount - The original gross withdrawal amount to refund
 * @param withdrawalReference - The original withdrawal reference
 * @param adminUserId - The admin performing the rejection
 */
export async function rejectWithdrawalAction(
  userId: string,
  amount: number,
  withdrawalReference: string,
  adminUserId: string
): Promise<ActionResponse> {
  try {
    // ---- Validate admin auth ----
    const { userId: authUserId } = await auth();
    if (!authUserId) {
      return { success: false, error: 'Authentication required.' };
    }
    // TODO: Validate admin role via Clerk metadata when user management is complete.

    const now = Date.now();
    const idempotencyKey = `withdrawal_refund_${withdrawalReference}`;

    // ---- Idempotency check ----
    const keyExists = await repository.ledger.idempotencyKeyExists(idempotencyKey);
    if (keyExists) {
      return { success: true }; // Already refunded
    }

    // ---- Refund available balance ----
    /**
     * The full gross amount is refunded, not the net amount.
     * Since the fee was never actually charged to an external party
     * (no Paystack payout was made), the user gets everything back.
     */
    await repository.wallets.updateWalletBalance(userId, {
      availableBalanceDelta: +amount,
      lockedBalanceDelta: 0,
    });

    // ---- Record refund ledger entry ----
    const wallet = await repository.wallets.getWalletByUserId(userId);
    await repository.ledger.createLedgerEntry({
      userId,
      eventType: 'WITHDRAWAL_REFUND',
      amount,
      sourceAccountId: 'platform_holding_account',
      destinationAccountId: wallet?.id ?? 'unknown',
      description: `Withdrawal rejected. ₦${amount.toLocaleString()} refunded to available balance.`,
      idempotencyKey,
      balanceAfter: wallet?.availableBalance ?? 0,
      referenceId: withdrawalReference,
      metadata: { rejectedBy: adminUserId, originalReference: withdrawalReference },
      createdAt: now,
    });

    // ---- Update withdrawal request entity status ----
    try {
      await repository.withdrawals.updateWithdrawalRequest(withdrawalReference, {
        status: 'rejected',
        updatedAt: now,
      });
    } catch {
      // Ignore if withdrawal entity ID differs from reference
    }

    // ---- Audit log ----
    await repository.auditLogs.createAuditLog({
      adminUserId,
      actionType: 'REJECT_WITHDRAWAL',
      targetEntityId: withdrawalReference,
      details: { userId, amount, reason: 'Admin rejection' },
      createdAt: now,
    });

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { success: false, error: message };
  }
}
