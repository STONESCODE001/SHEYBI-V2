/**
 * Paystack Webhook Handler
 * =========================
 * Receives and verifies Paystack webhook events server-side.
 *
 * SECURITY MODEL:
 *   - Raw body must be read as text BEFORE any parsing (JSON.parse changes format)
 *   - Signature verified with HMAC-SHA512 using PAYSTACK_SECRET_KEY
 *   - timingSafeEqual used to prevent timing attacks on signature comparison
 *   - Returns 200 immediately after verification (Paystack retries on non-2xx)
 *
 * SUPPORTED EVENTS:
 *   - charge.success → credits user wallet via processDepositAction (idempotent)
 *
 * IDEMPOTENCY:
 *   processDepositAction uses the Paystack reference as an idempotency key.
 *   Duplicate webhook deliveries are silently de-duped — the wallet is only
 *   credited once per unique reference.
 *
 * WEBHOOK REGISTRATION:
 *   Register this URL in Paystack Dashboard → Settings → Webhooks:
 *   https://yourdomain.com/api/webhooks/paystack
 *
 * @see context/feature-specs/15a-payment-state-and-wallet-seeding.md §5.2
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { processDepositAction } from '@/lib/actions/wallet-actions';

// ============================================================================
// PAYSTACK WEBHOOK EVENT TYPES
// ============================================================================

interface PaystackChargeSuccessEvent {
  event: 'charge.success';
  data: {
    id: number;
    status: string;             // 'success'
    reference: string;          // Unique transaction reference
    amount: number;             // Amount in KOBO (divide by 100 for Naira)
    currency: string;           // 'NGN'
    paid_at: string;
    created_at: string;
    channel: string;            // 'card' | 'bank' | 'ussd' | etc.
    customer: {
      id: number;
      email: string;
      customer_code: string;
    };
    metadata?: {
      userId?: string;          // Sheybi Clerk userId embedded at initialization
      sheybiRef?: string;       // Internal Sheybi reference
      [key: string]: unknown;
    };
  };
}

type PaystackWebhookEvent = PaystackChargeSuccessEvent | { event: string; data: unknown };

// ============================================================================
// WEBHOOK HANDLER
// ============================================================================

export async function POST(req: NextRequest): Promise<NextResponse> {
  // ---- Step 1: Read raw body as text (MUST be before any JSON parsing) ----
  // Paystack computes the signature against the exact raw bytes it sends.
  // Parsing to JSON first changes whitespace/ordering and breaks verification.
  const rawBody = await req.text();

  // ---- Step 2: Get signature from headers ----
  const signature = req.headers.get('x-paystack-signature');
  if (!signature) {
    console.warn('[Paystack Webhook] Missing x-paystack-signature header');
    return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
  }

  // ---- Step 3: Validate environment ----
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    console.error('[Paystack Webhook] PAYSTACK_SECRET_KEY not configured');
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
  }

  // ---- Step 4: Compute HMAC-SHA512 of raw body using secret key ----
  const computedHash = crypto
    .createHmac('sha512', secret)
    .update(rawBody)
    .digest('hex');

  // ---- Step 5: Timing-safe comparison (prevents timing attacks) ----
  let isValid = false;
  try {
    isValid = crypto.timingSafeEqual(
      Buffer.from(computedHash, 'hex'),
      Buffer.from(signature, 'hex')
    );
  } catch {
    // Buffer lengths differ — signature is definitely invalid
    isValid = false;
  }

  if (!isValid) {
    console.warn('[Paystack Webhook] Signature verification FAILED');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // ---- Step 6: Parse the verified body ----
  let event: PaystackWebhookEvent;
  try {
    event = JSON.parse(rawBody) as PaystackWebhookEvent;
  } catch {
    console.error('[Paystack Webhook] Failed to parse body as JSON');
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // ---- Step 7: Return 200 IMMEDIATELY (Paystack retries on non-2xx) ----
  // Process the event asynchronously after acknowledging receipt.
  // This prevents Paystack from timing out and sending duplicate events.
  const response = NextResponse.json({ received: true }, { status: 200 });

  // ---- Step 8: Handle events ----
  // Using void to explicitly not await (fire-and-forget pattern)
  void handleWebhookEvent(event);

  return response;
}

// ============================================================================
// EVENT HANDLER
// ============================================================================

async function handleWebhookEvent(event: PaystackWebhookEvent): Promise<void> {
  console.log('[Paystack Webhook] Received event:', event.event);

  switch (event.event) {
    case 'charge.success': {
      await handleChargeSuccess(event as PaystackChargeSuccessEvent);
      break;
    }

    // Add more event handlers here as needed:
    // case 'transfer.success': await handleTransferSuccess(...); break;
    // case 'refund.processed': await handleRefund(...); break;

    default: {
      // Unhandled events are safely ignored
      console.log('[Paystack Webhook] Unhandled event type:', event.event);
    }
  }
}

// ============================================================================
// CHARGE SUCCESS HANDLER
// ============================================================================

async function handleChargeSuccess(event: PaystackChargeSuccessEvent): Promise<void> {
  const { reference, amount, metadata, customer } = event.data;

  // ---- Extract userId ----
  // userId is embedded in the metadata when we initialize the transaction.
  // See: initializePaystackTransaction in lib/actions/paystack-actions.ts
  const userId = metadata?.userId;

  if (!userId) {
    console.error(
      '[Paystack Webhook] charge.success missing userId in metadata.',
      'Reference:', reference,
      'Customer:', customer.email
    );
    // Cannot credit without a userId — log and skip
    // In production: alert the ops team (e.g., send a Slack notification)
    return;
  }

  // ---- Convert kobo → Naira ----
  const nairaAmount = amount / 100;

  console.log(
    `[Paystack Webhook] Processing charge.success:`,
    `userId=${userId}`,
    `amount=₦${nairaAmount}`,
    `reference=${reference}`
  );

  // ---- Credit the wallet ----
  // processDepositAction is idempotent — if the popup's verifyAndCreditDeposit
  // already ran, the idempotency key guard will detect the duplicate and skip.
  const result = await processDepositAction(userId, nairaAmount, reference);

  if (result.success) {
    console.log(
      `[Paystack Webhook] ✓ Wallet credited: userId=${userId}`,
      `+₦${nairaAmount}`,
      `newBalance=₦${result.data?.newAvailableBalance}`
    );
  } else {
    console.error(
      `[Paystack Webhook] ✗ Failed to credit wallet: userId=${userId}`,
      `error=${result.error}`
    );
  }
}
