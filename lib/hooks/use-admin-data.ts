'use client';

import { db } from '@/lib/instant';

export function useAdminMarkets() {
  const { isLoading, error, data } = db.useQuery({
    markets: {
      options: {},
      category: {},
      $: { order: { createdAt: 'desc' } },
    },
  });
  return { isLoading, error, markets: data?.markets ?? [] };
}

export function useAdminWithdrawals() {
  const { isLoading, error, data } = db.useQuery({
    withdrawal_requests: {
      $: { order: { createdAt: 'desc' } },
    },
  });
  return { isLoading, error, withdrawals: data?.withdrawal_requests ?? [] };
}

export function useAdminSuggestions() {
  const { isLoading, error, data } = db.useQuery({
    market_suggestions: {
      $: { order: { createdAt: 'desc' } },
    },
  });
  return { isLoading, error, suggestions: data?.market_suggestions ?? [] };
}

export function useAdminAuditLogs() {
  const { isLoading, error, data } = db.useQuery({
    audit_logs: {
      $: { order: { createdAt: 'desc' }, limit: 100 },
    },
  });
  return { isLoading, error, logs: data?.audit_logs ?? [] };
}

export function useAdminCategories() {
  const { isLoading, error, data } = db.useQuery({
    categories: {
      $: { order: { displayOrder: 'asc' } },
    },
  });
  return { isLoading, error, categories: data?.categories ?? [] };
}

export function useAdminLedger() {
  const { isLoading, error, data } = db.useQuery({
    ledger: {
      $: { order: { createdAt: 'desc' }, limit: 500 },
    },
  });
  return { isLoading, error, ledgerEntries: data?.ledger ?? [] };
}

export function useAdminKycRecords() {
  const { isLoading, error, data } = db.useQuery({
    kyc_records: {
      $: { order: { submittedAt: 'desc' } },
    },
  });
  return { isLoading, error, kycRecords: data?.kyc_records ?? [] };
}

export function useAdminPromoters() {
  const { isLoading, error, data } = db.useQuery({
    promoters: {
      $: { order: { createdAt: 'desc' } },
    },
  });
  return { isLoading, error, promoters: data?.promoters ?? [] };
}

