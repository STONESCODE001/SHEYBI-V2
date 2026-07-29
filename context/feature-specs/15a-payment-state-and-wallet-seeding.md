# Feature Specification: Payment State, Wallet Seeding & Market Odds Blueprint

> **Spec Number**: 15a  
> **File Path**: `context/feature-specs/15a-payment-state-and-wallet-seeding.md`  
> **Status**: Active Architecture Blueprint  
> **Target Audience**: AI Agents & Engineering Team  
> **Depends On**: Spec 10 (Prediction Engine), Spec 12 (Prediction Engine Integration), Spec 15 (Cycle B)

---

## 1. Executive Summary

This document records the exact **current payment, wallet, ledger, and market odds state** of the Sheybi v2 platform. It serves as an authoritative handoff guide so any AI agent or engineer can instantly understand:
1. How wallets are provisioned and auto-seeded with demo funds for pre-Paystack testing.
2. How the double-entry financial ledger tracks all monetary movements.
3. How market odds and probabilities are seeded and updated dynamically via LMSR.
4. How to seamlessly plug in Paystack for production payments without refactoring core prediction logic.

---

## 2. Current Payment & Wallet Architecture

Sheybi uses a **double-entry financial model** backed by InstantDB graph entities (`wallets` and `ledger`).

### 2.1 Database Entities

```
+------------------------------------+          +------------------------------------+
|             wallets                |          |              ledger                |
+------------------------------------+          +------------------------------------+
| id: string                         |          | id: string                         |
| userId: string (indexed, unique)   | 1      * | userId: string (indexed)           |
| availableBalance: number (₦)      |----------| eventType: string                  |
| lockedBalance: number (₦)         |          | amount: number                     |
| lifetimeDeposits: number           |          | sourceAccountId: string            |
| lifetimeWithdrawals: number        |          | destinationAccountId: string       |
| lifetimeProfit: number             |          | description: string                |
| createdAt: number                  |          | idempotencyKey: string (unique)    |
| updatedAt: number                  |          | balanceAfter: number               |
+------------------------------------+          | referenceId: string (optional)     |
                                                | metadata: json (optional)          |
                                                +------------------------------------+
```

### 2.2 Financial Invariants

- **Available Balance Invariant**: `availableBalance` can NEVER drop below ₦0.00.
- **Locked Balance Invariant**: `lockedBalance` is exclusively reserved for funds committed to active open trading positions.
- **Withdrawal Lock**: Withdrawals deduct directly from `availableBalance` immediately upon request. `lockedBalance` is never touched during withdrawal requests.
- **Double-Entry Trail**: Every change to `availableBalance` or `lockedBalance` MUST produce a corresponding record in the `ledger` table with a unique `idempotencyKey`.

---

## 3. Wallet Provisioning & Demo Seeding Flow

To enable end-to-end testing of market trading, portfolio tracking, and position selling prior to full Paystack API key configuration, Sheybi implements an **automated demo seeding mechanism**.

### 3.1 Provisioning Workflow

1. When a user logs in via Clerk, `ensureUserWalletAction()` (`lib/actions/wallet-provisioning.ts`) checks if a `wallets` entity exists for `userId`.
2. If no wallet exists:
   - A new wallet entity is created in InstantDB with `availableBalance: 0`, `lockedBalance: 0`.
   - `ensureUserWalletAction()` triggers a demo seed deposit of **₦50,000** via `processDepositAction(userId, 50000, "demo_seed_...")`.
3. If a wallet exists with `availableBalance: 0` and zero ledger entries, it automatically receives the ₦50,000 demo seed.

### 3.2 UI Deposit & Withdrawal Action Binding

- **Deposit Dialog** (`components/dialog/features/wallet/deposit-dialog.tsx`):
  - Accepts user amount.
  - Calls `processDepositAction(userId, amount, reference)` on confirmation.
  - Immediately updates `wallets.availableBalance` and appends a `DEPOSIT` ledger entry.
- **Withdrawal Dialog** (`components/dialog/features/wallet/withdraw-dialog.tsx`):
  - Accepts user amount and bank details.
  - Calls `requestWithdrawalAction(amount)`.
  - Calculates 3.0% fee (min ₦150), deducts `availableBalance`, and appends `WITHDRAWAL` and `WITHDRAWAL_FEE` ledger entries.

---

## 4. Market Odds Data Seeding & Dynamic LMSR Flow

### 4.1 Initial Data Seeding (`lib/seed/seed-instantdb.ts`)

Markets and options in InstantDB are seeded with realistic initial probabilities, share prices, liquidity $L$, and LMSR liquidity parameters $b$:

| Market Title | Option Name | Seed Probability | Seed Share Price | Liquidity ($L$) | LMSR Parameter ($b$) |
|---|---|---|---|---|---|
| *Will Kellyrae win BBNaija Season 9?* (Binary) | YES | 65% | ₦0.65 | ₦50,000 | 36,067 |
| | NO | 35% | ₦0.35 | ₦50,000 | 36,067 |
| *Wanni vs Anita HOH Game* (1v1) | Wanni | 58% | ₦0.58 | ₦50,000 | 36,067 |
| | Anita | 42% | ₦0.42 | ₦50,000 | 36,067 |
| *Who would be Evicted First ??* (Multi-Option) | Kassia | 32% | ₦0.32 | ₦50,000 | 18,034 |
| | Ozee | 28% | ₦0.28 | ₦50,000 | 18,034 |
| | Shaun | 22% | ₦0.22 | ₦50,000 | 18,034 |
| | Victoria | 18% | ₦0.18 | ₦50,000 | 18,034 |

### 4.2 Odds Conversion & UI Display

- **Decimal Odds Formula**: $Decimal\ Odds = \frac{100}{Probability\%} = \frac{1}{sharePrice}$
- **Formatting**: `lib/market-adapter.ts` converts option probabilities into odds labels using `formatOddsFromProbability(P)` (e.g. 65% $\rightarrow$ `1.54x`, 35% $\rightarrow$ `2.86x`).

### 4.3 Real-Time Odds Recalculation Loop

```
+-------------------+      +-----------------------+      +-------------------------+
|  User Executes    | ---> |  buyPositionAction()  | ---> |  LMSR Engine            |
|  Trade in UI      |      |  (Server Action)      |      |  calculateBuyTrade()    |
+-------------------+      +-----------------------+      +-------------------------+
                                                                       |
                                                                       v
+-------------------+      +-----------------------+      +-------------------------+
| Real-time UI      | <--- | InstantDB Cloud       | <--- |  Updates market_options |
| Screens Update    |      | Reactive Subscriptions|      |  probability & sharePrice|
+-------------------+      +-----------------------+      +-------------------------+
```

1. **Trade Submission**: User submits a trade for ₦X on an option in `<TradeDialog>`.
2. **LMSR Calculation**: `buyPositionAction` calls `calculateBuyTrade()`. The LMSR engine computes exact shares received $\Delta$, updates the shares outstanding vector $q$, and calculates new normalized probabilities $P_i = \frac{e^{q_i / b}}{\sum e^{q_j / b}}$.
3. **Database Mutation**: `buyPositionAction` updates `market_options.probability` and `market_options.sharePrice` in InstantDB inside an atomic transaction.
4. **Real-time Broadcast**: InstantDB streams the updated `market_options` to all active clients listening via `useMarkets()` or `db.useQuery()`, dynamically shifting the displayed odds across the entire platform in real-time.

---

## 5. Paystack Production Integration Blueprint (Handoff Guide)

When ready to connect live Paystack payments in production:

### 5.1 Step 1: Environment Configuration
Add Paystack credentials to `.env.local`:
```env
PAYSTACK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_PAYSTACK_KEY=pk_live_...
```

### 5.2 Step 2: Paystack Webhook Handler
Create `app/api/webhooks/paystack/route.ts`:
```typescript
import { NextResponse } from "next/server";
import crypto from "crypto";
import { processDepositAction } from "@/lib/actions/wallet-actions";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("x-paystack-signature");
  
  const hash = crypto
    .createHmac("sha256", process.env.PAYSTACK_SECRET_KEY!)
    .update(body)
    .digest("hex");
    
  if (hash !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(body);
  if (event.event === "charge.success") {
    const { reference, amount, metadata } = event.data;
    const userId = metadata.userId;
    const nairaAmount = amount / 100; // Paystack sends kobo
    
    // Calls existing processDepositAction (already fully built!)
    await processDepositAction(userId, nairaAmount, reference);
  }

  return NextResponse.json({ status: "success" });
}
```

### 5.3 Step 3: Frontend Inline Popup Trigger
In `DepositDialog` (`components/dialog/features/wallet/deposit-dialog.tsx`), trigger Paystack Popup SDK on card deposit submit. Upon successful response, the webhook automatically processes `processDepositAction` and credits the InstantDB wallet.

---

## 6. Summary Matrix for Developers & Agents

| Domain | Current Implementation | Production Swap Action Needed |
|---|---|---|
| **Wallet Creation** | `ensureUserWalletAction()` | None (Automatic) |
| **Demo Seeding** | ₦50,000 auto-credited on first login | Disable `demo_seed_` logic when live |
| **Deposits** | `processDepositAction()` via Deposit Dialog | Add `app/api/webhooks/paystack/route.ts` |
| **Withdrawals** | `requestWithdrawalAction()` with 3.0% fee | Connect Paystack Transfers API to Admin Payout |
| **Market Odds** | InstantDB `market_options` + LMSR engine | Fully live & operational (No changes needed) |
| **Ledger Tracking** | Immutable `ledger` entity with idempotency | Fully live & operational (No changes needed) |
