# Feature Specification: Paystack Live Mode & Financial State Reset

> **Spec Number**: 18
> **File Path**: `context/feature-specs/18-paystack-live-and-financial-reset.md`
> **Status**: 📝 Planned
> **Depends On**: Spec 17 (Paystack Integration), Spec 15a (Wallet Seeding)

---

## 1. Executive Summary

This specification outlines the transition of the Sheybi application from a "Demo/Seeded" financial state into a "Production/Live" state using the fully integrated Paystack flow. 

Because early testing and development involved seeding user wallets with fake funds (₦50,000) and creating ledger entries/positions using that fake money, a clean slate is required before going live. 

This spec covers:
1. Disabling the automatic ₦50,000 demo seed for new and existing users.
2. Implementing an Admin-only "Wipe Financial State" tool accessible via the UI.
3. Defining the exact database mutation that executes a full financial wipe.

---

## 2. Disabling Demo Seeding

### 2.1 Current State (Spec 15a)
In `lib/actions/wallet-provisioning.ts`, the `ensureUserWalletAction` creates a new wallet for a user and instantly credits it with ₦50,000 via `processDepositAction`.

### 2.2 Future State
- The `processDepositAction` calls will be removed from `wallet-provisioning.ts`.
- When a user signs in, if they don't have a wallet, one will be created with `availableBalance: 0`, `lockedBalance: 0`.
- Users must explicitly deposit real funds via the Paystack flow (`DepositDialog`) to acquire a balance.

---

## 3. The "Wipe Financial State" Admin Tool

To clear out the fake money generated during testing, an admin tool will be introduced.

### 3.1 Admin UI Addition (`app/admin/page.tsx`)
- A new "System" or "Settings" section/tab will be added to the Admin Control Center, OR a prominent "Danger Zone" button will be placed in the admin layout.
- **Action**: "Wipe Demo Financial State"
- **Confirmation**: A Dialog (e.g., `FinancialWipeDialog`) will prompt the admin to type "CONFIRM WIPE" to prevent accidental clicks.

### 3.2 Backend Action (`lib/actions/admin-actions.ts`)
A new server action `wipeFinancialStateAction` will be created. It will execute the following via the InstantDB Admin SDK (`adminDb.transact`):

1. **Delete all Ledger Entries**: Remove every record in the `ledger` table.
2. **Delete all Positions**: Remove every record in the `positions` table (since they represent shares bought with fake money).
3. **Reset all Wallets**: 
   - `availableBalance = 0`
   - `lockedBalance = 0`
   - `lifetimeDeposits = 0`
   - `lifetimeWithdrawals = 0`
   - `lifetimeProfit = 0`
4. **Audit Log**: Append an `AUDIT_LOG` entry: `ADMIN_WIPED_FINANCIAL_STATE`.

### 3.3 Considerations
- We are **not** deleting user accounts or wallets, just resetting the numerical balances and clearing the transaction/position history.
- Market states (probabilities, liquidity pools) will remain intact, or they can optionally be reset if we want a complete wipe of the application. For now, the focus is on the user financial tables (`wallets`, `ledger`, `positions`).

---

## 4. Implementation Steps

1. **Update `lib/actions/wallet-provisioning.ts`**: Remove demo seed logic.
2. **Create `wipeFinancialStateAction`**: Add this to `lib/actions/admin-actions.ts`.
3. **Build `FinancialWipeDialog`**: Create a strict confirmation modal.
4. **Update `app/admin/page.tsx`**: Add the trigger button and mount the dialog.
5. **Update `context/progress-tracker.md`**: Mark the transition to Live Mode as complete.
6. **Deprecate Spec 15a**: Update `15a-payment-state-and-wallet-seeding.md` to indicate it has been replaced.

---

## 5. Security Model
- The `wipeFinancialStateAction` must verify `auth().userId` and ensure the user has an `admin` role (using existing admin guards).
- The action will only be available to platform operators.

---

## 6. Architecture Note: Paystack Verification Lifecycle (For Engineers)

To ensure payment reliability, our Paystack integration is built with a dual-verification architecture (Frontend + Webhook). Junior engineers must understand the specific React lifecycle constraints we encountered and solved:

### 6.1 The "Unmounted Component" Bug
When using `@paystack/inline-js`, if you unmount the component that invoked the popup (e.g., by calling `onClose()` on a Dialog) *before* the popup finishes, Next.js will aggressively cancel any Server Actions triggered by the `onSuccess` closure because the React tree context is gone. 
**The Fix**: In `DepositDialog`, we introduced a `step = "waiting"` state. The dialog stays mounted *behind* the Paystack popup until verification is fully completed by the server, ensuring `verifyAndCreditDeposit` never fails silently.

### 6.2 The Aggressive Redirect Bug
If a `callback_url` is configured in the Paystack Dashboard, Paystack's servers will force the user's browser to redirect to that URL immediately upon successful payment. This full-page navigation instantly kills our frontend verification process, resulting in an `unhandledRejection: [object Event]` in the browser console.
**The Fix**: In `lib/actions/paystack-actions.ts`, we explicitly pass `callback_url: ''` in the initialization payload. This overrides the dashboard setting, forces the inline popup to behave normally (it stays open and shows a success screen), and hands control safely back to our React `onSuccess` callback.

### 6.3 The Webhook Safety Net
Even with the frontend fixed, users can still lose connection. Our Webhook (`app/api/webhooks/paystack/route.ts`) acts as an indestructible backend safety net. Because `processDepositAction` uses the Paystack `reference` as an idempotency key, both the frontend and the webhook can attempt to credit the wallet simultaneously without any risk of double-crediting. Whichever request reaches InstantDB first will succeed; the second will safely exit.
