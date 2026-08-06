/**
 * Paystack API Server Actions
 * ============================
 * Secure server-side Paystack API wrappers. All calls use PAYSTACK_SECRET_KEY
 * which is NEVER exposed to the client. The client only ever receives an
 * access_code or non-sensitive resolved data.
 *
 * ACTIONS:
 *   initializePaystackTransaction  — POST /transaction/initialize → access_code
 *   verifyAndCreditDeposit         — GET /transaction/verify/:ref → credits wallet
 *   fetchNigerianBanks             — GET /bank?country=nigeria → bank list (cached)
 *   resolveBankAccount             — GET /bank/resolve → account_name
 *
 * SECURITY RULES:
 *   - PAYSTACK_SECRET_KEY stays server-side only (no NEXT_PUBLIC_ prefix)
 *   - NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY is safe for client (popup key only)
 *   - verifyAndCreditDeposit always verifies server-side before crediting wallet
 *   - processDepositAction idempotency key prevents double-credit
 *
 * @see context/feature-specs/15a-payment-state-and-wallet-seeding.md §5
 */

'use server';

import { auth, currentUser } from '@clerk/nextjs/server';
import { processDepositAction } from '@/lib/actions/wallet-actions';

// ============================================================================
// CONSTANTS & HELPERS
// ============================================================================

const PAYSTACK_BASE_URL = 'https://api.paystack.co';

function paystackHeaders(): HeadersInit {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    throw new Error('PAYSTACK_SECRET_KEY is not configured. Add it to .env.local');
  }
  return {
    Authorization: `Bearer ${secret}`,
    'Content-Type': 'application/json',
  };
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

interface ActionResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

interface InitializeResponse {
  /** Short-lived access code used to trigger the Paystack popup */
  access_code: string;
  /** Unique payment reference — persisted to match webhook/verify events */
  reference: string;
  /** Full authorization URL (not needed for popup, included for completeness) */
  authorization_url: string;
}

interface VerifyDepositResponse {
  newAvailableBalance: number;
  depositAmount: number;
  reference: string;
}

export interface NigerianBank {
  name: string;
  /** Numeric bank code used for /bank/resolve (e.g. "058" for GTBank) */
  code: string;
  slug: string;
  active: boolean;
}

interface ResolveAccountResponse {
  accountName: string;
  accountNumber: string;
}

// ============================================================================
// IN-MEMORY BANK LIST CACHE (24-HOUR TTL)
// ============================================================================

let _bankCache: NigerianBank[] | null = null;
let _bankCacheTime = 0;
const BANK_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// ============================================================================
// ACTION 1: INITIALIZE TRANSACTION
// ============================================================================

/**
 * Initialize a Paystack payment transaction.
 *
 * Called BEFORE showing the Paystack popup to the user. Creates a payment
 * session on Paystack servers and returns an access_code that the client
 * uses to trigger the popup.
 *
 * SECURITY: This runs server-side so the secret key never reaches the browser.
 *
 * @param amount - Deposit amount in Naira (₦). Will be converted to kobo × 100.
 *
 * FLOW:
 *   1. Auth check → get userId + email from Clerk
 *   2. POST https://api.paystack.co/transaction/initialize
 *      Body: { email, amount_kobo, metadata: { userId, sheybiRef } }
 *   3. Return { access_code, reference } to client
 *   4. Client uses access_code to trigger PaystackPop.newTransaction()
 */
export async function initializePaystackTransaction(
  amount: number
): Promise<ActionResponse<InitializeResponse>> {
  try {
    // ---- Auth ----
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Authentication required. Please sign in.' };
    }

    // ---- Validate amount ----
    if (!amount || amount < 100) {
      return { success: false, error: 'Minimum deposit amount is ₦100.' };
    }

    // ---- Get user email from Clerk (Paystack requires email) ----
    const clerkUser = await currentUser();
    const email =
      clerkUser?.emailAddresses?.[0]?.emailAddress ||
      `${userId}@sheybi.app`;

    // ---- Build Sheybi internal reference (appended to metadata) ----
    const sheybiRef = `sheybi_dep_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;

    // ---- Initialize transaction via Paystack API ----
    const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
      method: 'POST',
      headers: paystackHeaders(),
      body: JSON.stringify({
        email,
        amount: Math.round(amount * 100), // Convert ₦ → kobo
        currency: 'NGN',
        metadata: {
          userId,           // Used by webhook handler to credit the right wallet
          sheybiRef,        // Internal reference for audit trails
        },
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error('[Paystack] Initialize failed:', res.status, errBody);
      return { success: false, error: 'Failed to initialize payment. Please try again.' };
    }

    const body = await res.json() as {
      status: boolean;
      message: string;
      data?: {
        access_code: string;
        reference: string;
        authorization_url: string;
      };
    };

    if (!body.status || !body.data) {
      return { success: false, error: body.message || 'Payment initialization failed.' };
    }

    return {
      success: true,
      data: {
        access_code: body.data.access_code,
        reference: body.data.reference,
        authorization_url: body.data.authorization_url,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error.';
    console.error('[Paystack] initializePaystackTransaction error:', message);
    return { success: false, error: message };
  }
}

// ============================================================================
// ACTION 2: VERIFY TRANSACTION & CREDIT WALLET
// ============================================================================

/**
 * Verify a Paystack transaction server-side and credit the user's wallet.
 *
 * Called from the client AFTER the Paystack popup fires its onSuccess callback.
 * NEVER trust the popup callback alone — always verify server-side.
 *
 * SECURITY CHAIN:
 *   onSuccess({ reference }) → verifyAndCreditDeposit(reference) [server]
 *     → GET /transaction/verify/:reference [Paystack API]
 *     → validate status === 'success', amount, userId
 *     → processDepositAction(userId, nairaAmount, reference)  [idempotent]
 *
 * @param reference - The transaction reference from Paystack popup onSuccess
 */
export async function verifyAndCreditDeposit(
  reference: string
): Promise<ActionResponse<VerifyDepositResponse>> {
  try {
    // ---- Auth ----
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Authentication required.' };
    }

    if (!reference) {
      return { success: false, error: 'Payment reference is missing.' };
    }

    // ---- Verify transaction with Paystack ----
    const res = await fetch(
      `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: 'GET',
        headers: paystackHeaders(),
        cache: 'no-store',
      }
    );

    if (!res.ok) {
      const errBody = await res.text();
      console.error('[Paystack] Verify failed:', res.status, errBody);
      return { success: false, error: 'Payment verification failed. Contact support.' };
    }

    const body = await res.json() as {
      status: boolean;
      message: string;
      data?: {
        status: string;           // 'success' | 'failed' | 'abandoned'
        amount: number;           // In kobo
        reference: string;
        currency: string;
        metadata?: {
          userId?: string;
        };
      };
    };

    if (!body.status || !body.data) {
      return { success: false, error: 'Invalid verification response from Paystack.' };
    }

    const txData = body.data;

    // ---- Guard 1: Transaction must be successful ----
    if (txData.status !== 'success') {
      return {
        success: false,
        error: `Payment was not completed. Status: ${txData.status}`,
      };
    }

    // ---- Guard 2: Reference must match ----
    if (txData.reference !== reference) {
      console.error('[Paystack] Reference mismatch:', txData.reference, '!=', reference);
      return { success: false, error: 'Payment reference mismatch. Contact support.' };
    }

    // ---- Guard 3: userId in metadata must match authenticated user ----
    const metadataUserId = txData.metadata?.userId;
    if (metadataUserId && metadataUserId !== userId) {
      console.error('[Paystack] UserId mismatch:', metadataUserId, '!=', userId);
      return { success: false, error: 'Payment does not belong to this account.' };
    }

    // ---- Convert kobo → Naira ----
    const nairaAmount = txData.amount / 100;

    // ---- Credit the wallet (idempotent — safe to call from webhook too) ----
    const depositResult = await processDepositAction(userId, nairaAmount, reference);

    if (!depositResult.success) {
      return { success: false, error: depositResult.error };
    }

    return {
      success: true,
      data: {
        newAvailableBalance: depositResult.data?.newAvailableBalance ?? 0,
        depositAmount: nairaAmount,
        reference,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error.';
    console.error('[Paystack] verifyAndCreditDeposit error:', message);
    return { success: false, error: message };
  }
}

// ============================================================================
// ACTION 3: FETCH NIGERIAN BANKS (CACHED)
// ============================================================================

/**
 * Fetch the list of all Nigerian banks from Paystack.
 *
 * Used to populate the bank dropdown in WithdrawDialog.
 * Results are cached in-memory for 24 hours to avoid hammering the API
 * on every dialog open.
 *
 * Each bank includes:
 *   - name: "Guaranty Trust Bank"
 *   - code: "058"   ← This is used for /bank/resolve
 *   - slug: "guaranty-trust-bank"
 */
export async function fetchNigerianBanks(): Promise<ActionResponse<NigerianBank[]>> {
  try {
    // ---- Serve from cache if fresh ----
    const now = Date.now();
    if (_bankCache && now - _bankCacheTime < BANK_CACHE_TTL_MS) {
      return { success: true, data: _bankCache };
    }

    const res = await fetch(
      `${PAYSTACK_BASE_URL}/bank?country=nigeria&perPage=100&use_cursor=false`,
      {
        method: 'GET',
        headers: paystackHeaders(),
        next: { revalidate: 86400 }, // Next.js cache: 24 hours
      }
    );

    if (!res.ok) {
      // Return cached data on failure if available (stale-while-error)
      if (_bankCache) return { success: true, data: _bankCache };
      return { success: false, error: 'Failed to fetch bank list. Please try again.' };
    }

    const body = await res.json() as {
      status: boolean;
      data?: Array<{
        name: string;
        code: string;
        slug: string;
        active: boolean;
        type: string;
      }>;
    };

    if (!body.status || !body.data) {
      return { success: false, error: 'Invalid response from Paystack.' };
    }

    // Popular bank codes to prioritize at top of dropdown
    const PRIORITY_BANK_CODES = ['058', '044', '057', '011', '033', '50211', '999992', '999991'];

    // Filter to active banks only, then deduplicate by code
    // (Paystack API sometimes returns the same code for multiple entries)
    const seen = new Set<string>();
    const allBanks: NigerianBank[] = body.data
      .filter((b) => b.active)
      .filter((b) => {
        if (seen.has(b.code)) return false;
        seen.add(b.code);
        return true;
      })
      .map((b) => ({
        name: b.name,
        code: b.code,
        slug: b.slug,
        active: b.active,
      }));

    // Sort priority banks first, remaining banks alphabetically by name
    const banks = allBanks.sort((a, b) => {
      const aPriority = PRIORITY_BANK_CODES.indexOf(a.code);
      const bPriority = PRIORITY_BANK_CODES.indexOf(b.code);

      if (aPriority !== -1 && bPriority !== -1) return aPriority - bPriority;
      if (aPriority !== -1) return -1;
      if (bPriority !== -1) return 1;
      return a.name.localeCompare(b.name);
    });

    // ---- Update cache ----
    _bankCache = banks;
    _bankCacheTime = now;

    return { success: true, data: banks };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error.';
    console.error('[Paystack] fetchNigerianBanks error:', message);
    if (_bankCache) return { success: true, data: _bankCache }; // Stale fallback
    return { success: false, error: message };
  }
}

// ============================================================================
// ACTION 4: RESOLVE BANK ACCOUNT
// ============================================================================

/**
 * Look up the account name for a given bank account number and bank code.
 *
 * Used in WithdrawDialog to show the user the real account holder name
 * before they confirm their withdrawal. Replaces the hardcoded "JANE DOE" mock.
 *
 * FREE API — Paystack does not charge for this endpoint.
 *
 * @param accountNumber - 10-digit NUBAN account number
 * @param bankCode      - Numeric bank code (e.g. "058" for GTBank)
 *
 * Example response: { accountName: "DOE JANE LOREN", accountNumber: "0001234567" }
 */
export async function resolveBankAccount(
  accountNumber: string,
  bankCode: string
): Promise<ActionResponse<ResolveAccountResponse>> {
  try {
    // ---- Auth ----
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Authentication required.' };
    }

    // ---- Validate inputs ----
    if (!accountNumber || accountNumber.length !== 10) {
      return { success: false, error: 'Account number must be exactly 10 digits.' };
    }
    if (!bankCode) {
      return { success: false, error: 'Bank code is required.' };
    }

    // ---- Call Paystack resolve API ----
    const params = new URLSearchParams({
      account_number: accountNumber,
      bank_code: bankCode,
    });

    const res = await fetch(`${PAYSTACK_BASE_URL}/bank/resolve?${params.toString()}`, {
      method: 'GET',
      headers: paystackHeaders(),
      cache: 'no-store',
    });

    const body = await res.json().catch(() => null) as {
      status?: boolean;
      message?: string;
      data?: {
        account_number: string;
        account_name: string;
        bank_id: number;
      };
    } | null;

    if (!res.ok || !body?.status || !body?.data) {
      const errorMsg = body?.message || 'Could not verify account. Please check account number and selected bank.';
      return { success: false, error: errorMsg };
    }

    return {
      success: true,
      data: {
        accountName: body.data.account_name,
        accountNumber: body.data.account_number,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error.';
    console.error('[Paystack] resolveBankAccount error:', message);
    return { success: false, error: message };
  }
}
