/**
 * Admin Server Actions
 * =====================
 * Server Actions for administrative control center operations:
 * - updateSuggestionStatusAction: Approve or reject market suggestions
 * - approveWithdrawalAction: Approve pending withdrawal requests
 * - createCategoryAction: Add new category taxonomy entries
 *
 * All functions execute strictly on the server ('use server') and use
 * the repository pattern / adminDb safely without bundling Node modules to client.
 */

'use server';

import { auth } from '@clerk/nextjs/server';
import { id } from '@instantdb/admin';
import { adminDb } from '@/lib/instant-admin';
import { repository } from '@/lib/repositories';

interface ActionResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface UpdateSuggestionInput {
  suggestionId: string;
  status: 'approved' | 'rejected';
  convertedMarketId?: string;
  rejectionReason?: string;
}

/**
 * Approve or reject a user market suggestion.
 */
export async function updateSuggestionStatusAction(
  input: UpdateSuggestionInput
): Promise<ActionResponse> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Authentication required.' };
    }

    await repository.suggestions.updateMarketSuggestion(input.suggestionId, {
      status: input.status,
      reviewedBy: userId,
      reviewedAt: Date.now(),
      convertedMarketId: input.convertedMarketId,
      rejectionReason: input.rejectionReason,
    });

    await repository.auditLogs.createAuditLog({
      adminUserId: userId,
      actionType: input.status === 'approved' ? 'OPEN_MARKET' : 'CLOSE_MARKET',
      targetEntityId: input.suggestionId,
      details: {
        action: `SUGGESTION_${input.status.toUpperCase()}`,
        convertedMarketId: input.convertedMarketId,
        rejectionReason: input.rejectionReason,
      },
      createdAt: Date.now(),
    });

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { success: false, error: message };
  }
}

export interface ApproveWithdrawalInput {
  withdrawalId: string;
}

/**
 * Approve a pending withdrawal request.
 */
export async function approveWithdrawalAction(
  input: ApproveWithdrawalInput
): Promise<ActionResponse> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Authentication required.' };
    }

    const requests = await repository.withdrawals.getWithdrawalRequests();
    const target = requests.find((w) => w.id === input.withdrawalId);
    if (!target) {
      return { success: false, error: 'Withdrawal request not found.' };
    }

    await repository.withdrawals.updateWithdrawalRequest(input.withdrawalId, {
      status: 'Approved',
      approvedBy: userId,
      updatedAt: Date.now(),
    });

    await repository.auditLogs.createAuditLog({
      adminUserId: userId,
      actionType: 'APPROVE_WITHDRAWAL',
      targetEntityId: input.withdrawalId,
      details: { amount: target.grossAmount, userId: target.userId },
      createdAt: Date.now(),
    });

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { success: false, error: message };
  }
}

/**
 * Create a new category taxonomy entry.
 */
export async function createCategoryAction(
  name: string
): Promise<ActionResponse<{ categoryId: string }>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Authentication required.' };
    }

    const slug = name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (!slug) {
      return { success: false, error: 'Invalid category name.' };
    }

    const newCatId = id();
    const now = Date.now();

    await adminDb.transact([
      adminDb.tx.categories[newCatId].update({
        name: name.trim(),
        slug,
        displayOrder: now,
        isActive: true,
        createdAt: now,
      }),
    ]);

    await repository.auditLogs.createAuditLog({
      adminUserId: userId,
      actionType: 'CREATE_MARKET',
      targetEntityId: newCatId,
      details: { action: 'CREATE_CATEGORY', name, slug },
      createdAt: now,
    });

    return { success: true, data: { categoryId: newCatId } };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { success: false, error: message };
  }
}
