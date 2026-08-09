/**
 * Identity Verification (KYC) Server Actions
 * ============================================
 * Production server actions governing KYC submissions and administrative approvals:
 * - submitKycAction: Accepts 11-digit NIN or Document Image URL submission.
 * - adminApproveKycAction: Approves user KYC submission with audit logging.
 * - adminRejectKycAction: Rejects user KYC submission with mandatory rejection reason and audit logging.
 */

'use server';

import { auth } from '@clerk/nextjs/server';
import { adminDb } from '@/lib/instant-admin';
import { id } from '@instantdb/admin';

export interface SubmitKycInput {
  nin?: string;
  documentImageUrl?: string;
  legalName?: string;
  dateOfBirth?: string;
  documentType?: string;
}

export interface KycActionResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Submit user KYC identification (NIN or Document Image Upload)
 */
export async function submitKycAction(
  input: SubmitKycInput
): Promise<KycActionResponse> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Authentication required. Please log in.' };
    }

    const { nin, documentImageUrl, legalName, dateOfBirth, documentType } = input;

    // Validate inputs: either NIN (11 digits) OR documentImageUrl must be provided
    const cleanNin = nin?.trim();
    if (cleanNin) {
      if (!/^\d{11}$/.test(cleanNin)) {
        return { success: false, error: 'National Identification Number (NIN) must be an 11-digit numeric string.' };
      }
    } else if (!documentImageUrl?.trim()) {
      return { success: false, error: 'Please provide either an 11-digit NIN or upload a document image.' };
    }

    // Check for existing pending or approved KYC records to prevent duplicate submissions
    const existingResult = await adminDb.query({
      kyc_records: {
        $: {
          where: { userId },
        },
      },
    });

    const existingRecord = (existingResult as any)?.kyc_records?.[0];
    if (existingRecord) {
      if (existingRecord.verificationStatus === 'approved') {
        return { success: false, error: 'Your identity verification (KYC) is already approved.' };
      }
      if (existingRecord.verificationStatus === 'pending') {
        return { success: false, error: 'Your identity verification (KYC) submission is currently under review.' };
      }
    }

    const recordId = existingRecord?.id || id();
    const now = Date.now();

    await adminDb.transact([
      adminDb.tx.kyc_records[recordId].update({
        userId,
        verificationStatus: 'pending',
        nin: cleanNin || null,
        documentImageUrl: documentImageUrl?.trim() || null,
        legalName: legalName?.trim() || null,
        dateOfBirth: dateOfBirth?.trim() || null,
        documentType: documentType || (cleanNin ? 'NIN' : 'IMAGE'),
        submittedAt: now,
        reviewedAt: null,
        reviewedBy: null,
        rejectionReason: null,
      }),
    ]);

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'KYC submission failed.';
    return { success: false, error: message };
  }
}

/**
 * Admin: Approve a submitted KYC record
 */
export async function adminApproveKycAction(
  kycRecordId: string
): Promise<KycActionResponse> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Admin authentication required.' };
    }

    const userRes = await adminDb.query({
      $users: {
        $: { where: { id: userId } },
      },
    });
    const callerRole = (userRes as any)?.$users?.[0]?.role;
    if (callerRole !== 'admin' && callerRole !== 'superadmin') {
      return { success: false, error: 'Unauthorized. Admin access required.' };
    }

    const now = Date.now();

    await adminDb.transact([
      adminDb.tx.kyc_records[kycRecordId].update({
        verificationStatus: 'approved',
        reviewedAt: now,
        reviewedBy: userId,
        rejectionReason: null,
      }),
      adminDb.tx.audit_logs[id()].update({
        adminUserId: userId,
        actionType: 'KYC_APPROVED',
        targetEntityId: kycRecordId,
        details: { reviewedAt: now, approvedBy: userId },
        createdAt: now,
      }),
    ]);

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to approve KYC record.';
    return { success: false, error: message };
  }
}

/**
 * Admin: Reject a submitted KYC record with mandatory reason
 */
export async function adminRejectKycAction(
  kycRecordId: string,
  rejectionReason: string
): Promise<KycActionResponse> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Admin authentication required.' };
    }

    const userRes = await adminDb.query({
      $users: {
        $: { where: { id: userId } },
      },
    });
    const callerRole = (userRes as any)?.$users?.[0]?.role;
    if (callerRole !== 'admin' && callerRole !== 'superadmin') {
      return { success: false, error: 'Unauthorized. Admin access required.' };
    }

    if (!rejectionReason || !rejectionReason.trim()) {
      return { success: false, error: 'A rejection reason is mandatory when rejecting KYC.' };
    }

    const now = Date.now();
    const reasonText = rejectionReason.trim();

    await adminDb.transact([
      adminDb.tx.kyc_records[kycRecordId].update({
        verificationStatus: 'rejected',
        rejectionReason: reasonText,
        reviewedAt: now,
        reviewedBy: userId,
      }),
      adminDb.tx.audit_logs[id()].update({
        adminUserId: userId,
        actionType: 'KYC_REJECTED',
        targetEntityId: kycRecordId,
        details: { reviewedAt: now, rejectedBy: userId, rejectionReason: reasonText },
        createdAt: now,
      }),
    ]);

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to reject KYC record.';
    return { success: false, error: message };
  }
}
