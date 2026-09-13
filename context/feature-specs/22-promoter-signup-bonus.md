# Feature Specification: Capped Promoter Signup Bonus & Non-Withdrawable Playable Balance

> **Spec Number**: 22  
> **File Path**: `context/feature-specs/22-promoter-signup-bonus.md`  
> **Status**: 🟢 Approved & In Planning  
> **Depends On**: Spec 08 (Clerk Real-Time Authentication), Spec 09 (Lean Admin Spec), Spec 12 (Prediction Engine Integration), Spec 17 (Paystack Integration), Spec 21 (Promoter Referral Tracking System)

---

## 1. Executive Summary & Product Objectives

This specification defines the functional, financial, data, and user interface rules for delivering a **Capped Promoter Signup Bonus System** with **Non-Withdrawable Playable Balance** protection on Sheybi V2.

### Core Objectives:
1. **Configurable Signup Incentives**: Enable administrators to attach an optional signup bonus (e.g. ₦300) and a maximum claim cap (e.g. first 100 signups) to any promoter referral link (`sheybi.app/f/[slug]`).
2. **Non-Withdrawable Playable Credit Enforcement**: Signup bonuses are added to the user's spendable `availableBalance` and tracked under `bonusBalance`. Bonus funds **cannot** be withdrawn directly to a bank account.
3. **Withdrawal Protection Guard**: Enforce `maxWithdrawable = Math.max(0, wallet.availableBalance - wallet.bonusBalance)` during withdrawal requests. Any request attempting to cash out active bonus funds is blocked with a clear user error.
4. **Trading Play-Through Conversion**: When a user places predictions, trade amounts consume `bonusBalance` first. When predictions win, payout proceeds enter standard withdrawable balance, enabling users to convert prediction wins into real withdrawable cash.
5. **Strict Bonus Cap Enforcement**: Once `bonusSignupsCount` reaches `maxBonusSignups` (e.g. 100), subsequent users registering with the link are still attributed to the promoter for conversion tracking (`totalSignups`), but do **not** receive the ₦300 bonus.
6. **Admin Workspace Integration**: Extend the Admin Control Center Promoters workspace (`/admin`) to configure bonus parameters (`signupBonusAmount`, `maxBonusSignups`) during link creation and monitor real-time bonus claim progress (e.g. `₦300 (12/100 claimed)`).

---

## 2. System Architecture & Lifecycle

```
   [User Clicks sheybi.app/f/launch100]
                 │
                 ▼
   Next.js Middleware (middleware.ts)
   └── Sets HTTP Cookie: sheybi_ref = "launch100" (30 days)
                 │
                 ▼
   [User Onboards & Creates Clerk Account]
                 │
                 ▼
   ensureUserWalletAction() (wallet-provisioning.ts)
   ├── Verifies promoter "launch100" status == "active"
   ├── Checks bonus eligibility: bonusAmount > 0 && bonusSignupsCount < maxBonusSignups
   ├── If Eligible:
   │   ├── Updates $users: signupBonusAmount = 300, signupBonusClaimed = true
   │   ├── Updates promoters: bonusSignupsCount += 1, totalSignups += 1
   │   ├── Updates wallets: availableBalance += 300, bonusBalance += 300
   │   ├── Inserts wallet_transactions (Type: "Deposit", Amount: ₦300, Status: "Completed")
   │   └── Inserts ledger (Type: "REFERRAL_BONUS", Source: "PLATFORM_PROMO_RESERVE")
   └── If Cap Exceeded (e.g. Signup #101):
       └── Updates promoters: totalSignups += 1 (No bonus added)
```

---

## 3. Financial Invariants & Wallet Mechanics

### 3.1 Wallet Balance Structure
A user's wallet contains the following financial fields:
- `availableBalance`: Total funds available for placing prediction trades on live markets.
- `lockedBalance`: Capital currently reserved in open active prediction positions.
- `bonusBalance`: Non-withdrawable playable bonus portion of `availableBalance`.

### 3.2 Withdrawal Constraint Rule
$$\text{Max Withdrawable Amount} = \max\left(0, \text{availableBalance} - \text{bonusBalance}\right)$$

When `requestWithdrawalAction(requestedAmount)` executes:
1. Compute $\text{maxWithdrawable}$.
2. If $\text{requestedAmount} > \text{maxWithdrawable}$, reject immediately:
   > *"Cannot withdraw playable bonus funds (₦[bonusBalance]). Bonus funds can only be used to make predictions on live markets."*

### 3.3 Trading Bonus Consumption Rule
When `buyPositionAction(tradeAmount)` executes:
$$\text{bonusDeduction} = \min\left(\text{wallet.bonusBalance}, \text{tradeAmount}\right)$$
$$\text{newBonusBalance} = \text{wallet.bonusBalance} - \text{bonusDeduction}$$

This ensures that trading consumes non-withdrawable credits first.

---

## 4. Database Schema Extensions (`instant.schema.ts`)

### 4.1 `promoters` Entity Additions
```typescript
promoters: i.entity({
  name: i.string(),
  slug: i.string().unique().indexed(),
  status: i.string().indexed(), // "active" | "paused"
  notes: i.string().optional(),
  totalSignups: i.number().indexed(),
  totalDepositedVolume: i.number(),
  signupBonusAmount: i.number().optional(), // e.g. 300 (₦)
  maxBonusSignups: i.number().optional(),   // e.g. 100 (Max claim limit)
  bonusSignupsCount: i.number().optional(), // Tracked claimed count
  createdBy: i.string().indexed(),
  createdAt: i.number().indexed(),
  updatedAt: i.number(),
})
```

### 4.2 `$users` Entity Additions
```typescript
$users: i.entity({
  // ... existing fields ...
  signupBonusAmount: i.number().optional(), // Bonus ₦ received
  signupBonusClaimed: i.boolean().optional(), // Claimed status flag
})
```

### 4.3 `wallets` Entity Additions
```typescript
wallets: i.entity({
  userId: i.string().unique().indexed(),
  availableBalance: i.number(),
  lockedBalance: i.number(),
  bonusBalance: i.number().optional(), // Non-withdrawable playable bonus balance
  lifetimeDeposits: i.number(),
  lifetimeWithdrawals: i.number(),
  lifetimeProfit: i.number(),
  createdAt: i.number(),
  updatedAt: i.number(),
})
```

---

## 5. Server Actions API Specifications

### 5.1 `createPromoterAction(input)` (`lib/actions/promoter-actions.ts`)
- **Inputs**: `name`, `slug`, `notes`, `signupBonusAmount?: number`, `maxBonusSignups?: number`.
- **Logic**: Sanitizes numbers (`signupBonusAmount >= 0`, `maxBonusSignups >= 0`). Sets `bonusSignupsCount: 0`.

### 5.2 `ensureUserWalletAction()` (`lib/actions/wallet-provisioning.ts`)
- **Logic**: Matches `sheybi_ref` cookie against active promoters.
- If eligible (`promoter.signupBonusAmount > 0 && promoter.bonusSignupsCount < promoter.maxBonusSignups`):
  - Atomically updates `$users`, `promoters`, `wallets`, `wallet_transactions`, and `ledger` records.

### 5.3 `requestWithdrawalAction(amount)` (`lib/actions/wallet-actions.ts`)
- **Logic**: Enforces `amount <= availableBalance - bonusBalance`. Blocks illegal bonus cash-outs.

### 5.4 `buyPositionAction(...)` (`lib/actions/trade-actions.ts`)
- **Logic**: Decrements `bonusBalance` by $\min(\text{bonusBalance}, \text{tradeAmount})$ upon successful trade execution.

---

## 6. Admin Interface Specification

### 6.1 `CreatePromoterDialog` (`components/admin/create-promoter-dialog.tsx`)
- Form inputs for:
  - **Signup Bonus (₦)**: Number input (default `300`).
  - **Max Bonus Signups Limit**: Number input (default `100`).
- Displays helper banner explaining non-withdrawable terms.

### 6.2 `AdminPromotersTab` (`components/admin/admin-promoters-tab.tsx`)
- Includes **Bonus Campaign** column displaying e.g. `₦300 (12/100 claimed)` or `None`.

---

## 7. Verification Criteria

- [ ] `npx tsc --noEmit` passes cleanly with zero errors.
- [ ] `npm run build` succeeds with zero errors.
- [ ] Creating promoter link with ₦300 bonus and max 100 signups saves correctly in InstantDB.
- [ ] Onboarding via referral link credits ₦300 to `availableBalance` and `bonusBalance`.
- [ ] Withdrawal of ₦300 bonus is blocked with error *"Cannot withdraw playable bonus funds (₦300)"*.
- [ ] Placing a prediction trade reduces `bonusBalance` accordingly.
- [ ] Signup #101 via same link registers signup count but awards no bonus.
