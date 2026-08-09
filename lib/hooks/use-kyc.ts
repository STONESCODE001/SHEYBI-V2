'use client';

import { db } from '@/lib/instant';
import { useUser } from '@clerk/nextjs';

export type KycStatus = 'none' | 'pending' | 'approved' | 'rejected';

export interface KycRecord {
  id: string;
  userId: string;
  verificationStatus: string;
  nin?: string;
  documentImageUrl?: string;
  legalName?: string;
  dateOfBirth?: string;
  documentType?: string;
  submittedAt?: number;
  reviewedAt?: number;
  reviewedBy?: string;
  rejectionReason?: string;
}

export function useKyc() {
  const { user, isLoaded } = useUser();
  const userId = user?.id;

  const { isLoading, error, data } = db.useQuery(
    userId
      ? {
          kyc_records: {
            $: {
              where: { userId },
            },
          },
        }
      : null
  );

  const kycRecord = ((data as any)?.kyc_records?.[0] as KycRecord) || null;

  let kycStatus: KycStatus = 'none';
  if (kycRecord) {
    if (kycRecord.verificationStatus === 'approved') kycStatus = 'approved';
    else if (kycRecord.verificationStatus === 'pending') kycStatus = 'pending';
    else if (kycRecord.verificationStatus === 'rejected') kycStatus = 'rejected';
  }

  return {
    kycRecord,
    isLoading: !isLoaded || (userId ? isLoading : false),
    error,
    kycStatus,
  };
}
