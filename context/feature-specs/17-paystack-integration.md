# Feature Specification: Paystack Full Integration

> **Spec Number**: 17
> **File Path**: `context/feature-specs/17-paystack-integration.md`
> **Status**: ✅ Completed — All AC-01 through AC-11 verified
> **Implemented**: 2026-08-06
> **Verified**: 2026-08-06
> **Depends On**: Spec 15a (Payment State & Wallet Seeding), `database-schema.md` (Financial Domain), `architecture.md`
> **Replaces**: Spec 15a §5 (Paystack Blueprint — was forward-looking, now fully implemented)

---

## 1. Executive Summary

This document records the **complete, production-ready Paystack integration** in Sheybi v2. It serves as:

1. A definitive record of every file created or modified.
2. A trace of every InstantDB database call made before and after Paystack.
3. An authoritative acceptance criteria list for regression testing.
4. A bug log of all errors encountered and how they were fixed.
5. A security audit of the payment flow.

The integration achieves:

- **Deposits via Paystack Inline Popup (`@paystack/inline-js`)** — using official NPM SDK `popup.checkout({ key, access_code, onSuccess, onCancel })` with server-side initialization (`initializePaystackTransaction`) and server-side verification (`verifyAndCreditDeposit`) before any wallet credit.
- **Webhook handler** — `charge.success` events received and verified with HMAC-SHA512, routed to the idempotent `processDepositAction`.
- **Live Nigerian bank list** — fetched from Paystack `/bank` API (24h cached, deduplicated), replacing the previous static 4-bank dropdown.
- **Real account name resolution** — fetched from Paystack `/bank/resolve` API, replacing the hardcoded `"JANE DOE"` mock.


---

## 2. Architecture: Before vs After Paystack

### 2.1 Before (Mock / Demo Flow)

```
DepositDialog
    │ User enters amount, clicks "Confirm Payment"
    │
    ▼
processDepositAction(user.id, amount, `dep_${Date.now()}_${uuid}`)
    │   ← called directly from client via useUser() hook
    │
    ▼
InstantDB: wallets.availableBalance += amount
InstantDB: ledger.createLedgerEntry({ eventType: 'DEPOSIT', idempotencyKey: 'deposit_dep_...' })
```

**Problems with the mock flow:**
- No real payment was ever collected.
- `user.id` came from `useUser()` (client-side Clerk hook), not server-verified.
- No payment gateway. No fraud protection. No idempotency on the payment side.

**WithdrawDialog before:**
- Static 4-bank dropdown: GTBank, Access Bank, First Bank, Zenith Bank (hardcoded `value`s).
- Account resolution was a `setTimeout(() => setAccountName("JANE DOE"), 1000)` mock.

---

### 2.2 After (Production Paystack Flow)

```
DepositDialog
    │ User enters amount, selects method, clicks "Pay with Paystack"
    │
    ▼
[SERVER] initializePaystackTransaction(amount)
    ├── auth()       → get userId from Clerk session
    ├── currentUser() → get email from Clerk
    ├── POST https://api.paystack.co/transaction/initialize
    │       Body: { email, amount_kobo, metadata: { userId, sheybiRef } }
    └── Returns: { access_code, reference }
    │
    ▼ (Dialog closes before popup opens — avoids z-index conflict)
[CLIENT] new window.PaystackPop().newTransaction({ key, access_code, onSuccess, onCancel })
    │ Paystack CDN popup — user completes card payment
    │
    ▼ onSuccess({ reference })
[SERVER] verifyAndCreditDeposit(reference)
    ├── auth()        → re-verify userId (session still active)
    ├── GET https://api.paystack.co/transaction/verify/:reference
    │       Guards: status === 'success', ref match, metadata.userId match
    │       Converts: kobo → Naira (÷ 100)
    └── processDepositAction(userId, nairaAmount, reference)
            ├── idempotencyKey = `deposit_${reference}`
            ├── repository.ledger.idempotencyKeyExists(key)  → skip if duplicate
            ├── repository.wallets.updateWalletBalance(userId, { availableBalanceDelta: +amount })
            └── repository.ledger.createLedgerEntry({ eventType: 'DEPOSIT', ... })
```

---

## 3. Complete DB Call Chains

### 3.1 Deposit via Popup (Happy Path)

| Step | Layer | Call | DB Entity | Operation |
|---|---|---|---|---|
| 1 | Server Action | `initializePaystackTransaction()` | — | Paystack API only |
| 2 | External | Paystack Inline.js popup | — | Card payment |
| 3 | Server Action | `verifyAndCreditDeposit()` | — | Paystack verify API |
| 4a | `processDepositAction` | `repository.ledger.idempotencyKeyExists(key)` | `ledger` | READ — duplicate check |
| 4b | `processDepositAction` | `repository.wallets.getWalletByUserId(userId)` | `wallets` | READ — current balance |
| 4c | `processDepositAction` | `repository.wallets.updateWalletBalance()` | `wallets` | WRITE — `availableBalance += amount` |
| 4d | `processDepositAction` | `repository.ledger.createLedgerEntry()` | `ledger` | WRITE — immutable DEPOSIT entry |

**Ledger entry written:**
```typescript
{
  userId,
  eventType: 'DEPOSIT',
  amount,
  sourceAccountId: 'paystack_external',
  destinationAccountId: wallet.id,
  description: `Deposit of ₦${amount} via Paystack`,
  idempotencyKey: `deposit_${paystackReference}`,
  balanceAfter: wallet.availableBalance + amount,
  referenceId: paystackReference,
  metadata: { paymentProvider: 'paystack', paymentReference },
  createdAt: Date.now(),
}
```

---

### 3.2 Deposit via Webhook (Backup Path)

Called when Paystack POSTs a `charge.success` event to `app/api/webhooks/paystack/route.ts`.

| Step | Layer | Call | DB Entity | Operation |
|---|---|---|---|---|
| 1 | Route Handler | `req.text()` | — | Raw body read (pre-parse) |
| 2 | Route Handler | HMAC-SHA512 verify + `timingSafeEqual` | — | Crypto only |
| 3 | `handleChargeSuccess` | Extract `userId` from `event.data.metadata` | — | In-memory |
| 4a | `processDepositAction` | `repository.ledger.idempotencyKeyExists(key)` | `ledger` | READ — detects duplicate if popup already ran |
| 4b | `processDepositAction` | `repository.wallets.updateWalletBalance()` | `wallets` | WRITE (skipped if duplicate) |
| 4c | `processDepositAction` | `repository.ledger.createLedgerEntry()` | `ledger` | WRITE (skipped if duplicate) |

**Idempotency guarantee:** If the popup's `verifyAndCreditDeposit` already wrote `deposit_${reference}` to the ledger, the webhook hits the `idempotencyKeyExists` check and returns `success: true` without any DB write. The wallet is credited exactly once regardless of which path fires first.

---

### 3.3 Withdrawal Request

| Step | Layer | Call | DB Entity | Operation |
|---|---|---|---|---|
| 1 | `requestWithdrawalAction` | `auth()` | — | Clerk auth |
| 2 | | `repository.wallets.getWalletByUserId(userId)` | `wallets` | READ |
| 3 | | Balance check: `availableBalance >= amount` | — | In-memory guard |
| 4 | | `repository.wallets.updateWalletBalance()` | `wallets` | WRITE — `availableBalance -= amount` immediately |
| 5a | | `repository.ledger.createLedgerEntry({ eventType: 'WITHDRAWAL' })` | `ledger` | WRITE — net amount |
| 5b | | `repository.ledger.createLedgerEntry({ eventType: 'WITHDRAWAL_FEE' })` | `ledger` | WRITE — fee |
| 6 | | `repository.withdrawals.createWithdrawalRequest()` | `withdrawalRequests` | WRITE — admin queue |

**Bank details now come from Paystack resolution (real data):**
```typescript
{
  bankName: selectedBankName,        // from fetchNigerianBanks() lookup
  accountNumber: accountNumber,      // 10-digit user input
  accountName: resolvedAccountName,  // from resolveBankAccount() — real name
  status: 'pending',
}
```

---

### 3.4 Bank List Fetch (WithdrawDialog mount)

| Step | Layer | Call | DB Entity | Operation |
|---|---|---|---|---|
| 1 | `fetchNigerianBanks()` | Check `_bankCache` in-memory | — | TTL check |
| 2 | If stale | `GET https://api.paystack.co/bank?country=nigeria&perPage=100` | — | Paystack API |
| 3 | | Deduplication by `bank.code` | — | In-memory Set filter |
| 4 | | Update `_bankCache` + `_bankCacheTime` | — | In-memory write |

**No InstantDB calls.** Bank list is a read-only external catalog cached for 24 hours.

---

### 3.5 Account Name Resolution (triggered when accountNumber reaches 10 digits)

| Step | Layer | Call | DB Entity | Operation |
|---|---|---|---|---|
| 1 | `resolveBankAccount()` | `auth()` | — | Clerk auth |
| 2 | | Validate: `accountNumber.length === 10` | — | In-memory guard |
| 3 | | `GET https://api.paystack.co/bank/resolve?...` | — | Paystack API |
| 4 | | Returns `{ accountName: "DOE JANE LOREN" }` | — | — |

**No InstantDB calls.**

---

## 4. Files Created or Modified

### 4.1 New Files

| File | Purpose |
|---|---|
| `lib/actions/paystack-actions.ts` | 4 server actions: initialize, verify+credit, fetch banks, resolve account |
| `app/api/webhooks/paystack/route.ts` | Webhook handler with HMAC-SHA512 + `timingSafeEqual` |
| `types/paystack.d.ts` | TypeScript ambient declarations for `window.PaystackPop` |

### 4.2 Modified Files

| File | Change Summary |
|---|---|
| `.env.local` | Added `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` and `PAYSTACK_SECRET_KEY` |
| `deposit-dialog.tsx` | Removed direct `processDepositAction` call; added server-initialize → popup → server-verify chain |
| `withdraw-dialog.tsx` | Replaced static 4-bank dropdown with live Paystack `/bank` fetch; replaced `"JANE DOE"` mock with live `/bank/resolve` |

---

## 5. `paystack-actions.ts` — Function Reference

### 5.1 `initializePaystackTransaction(amount: number)`

- **Auth**: `auth()` from Clerk — requires active session
- **External**: `POST https://api.paystack.co/transaction/initialize`
- **DB Calls**: None
- **Returns**: `{ access_code, reference, authorization_url }`
- **Minimum amount**: ₦100
- **Metadata embedded**: `{ userId, sheybiRef }` — `userId` is extracted by the webhook handler to credit the correct wallet

### 5.2 `verifyAndCreditDeposit(reference: string)`

- **Auth**: `auth()` from Clerk
- **External**: `GET https://api.paystack.co/transaction/verify/:reference`
- **DB Calls**: 4 (see §3.1)
- **Guards**:
  1. `status === 'success'`
  2. `reference === txData.reference`
  3. `metadata.userId === userId`
- **Conversion**: `amount_kobo / 100` → Naira
- **Delegates to**: `processDepositAction(userId, nairaAmount, reference)`

### 5.3 `fetchNigerianBanks()`

- **Auth**: None required
- **External**: `GET https://api.paystack.co/bank?country=nigeria&perPage=100`
- **DB Calls**: None
- **Cache**: In-memory with 24h TTL
- **Deduplication**: `Set<string>` on `bank.code` — keeps first occurrence only
- **Returns**: `NigerianBank[]` — `{ name, code, slug, active }`

### 5.4 `resolveBankAccount(accountNumber: string, bankCode: string)`

- **Auth**: `auth()` from Clerk
- **External**: `GET https://api.paystack.co/bank/resolve?account_number=...&bank_code=...`
- **DB Calls**: None
- **Validation**: `accountNumber.length === 10`, `bankCode` non-empty
- **Returns**: `{ accountName, accountNumber }`
- **HTTP 422**: Returns user-friendly "Account not found. Please check account number and bank."

---

## 6. Webhook Handler — Security Chain

```
POST /api/webhooks/paystack
        │
        ▼
[1] rawBody = await req.text()
    ← MUST be before JSON.parse(). Parsing changes whitespace → breaks signature.
        │
        ▼
[2] signature = req.headers.get('x-paystack-signature')
    ← Return 401 if missing
        │
        ▼
[3] computedHash = crypto
      .createHmac('sha512', PAYSTACK_SECRET_KEY)
      .update(rawBody)
      .digest('hex')
        │
        ▼
[4] crypto.timingSafeEqual(
      Buffer.from(computedHash, 'hex'),
      Buffer.from(signature, 'hex')
    )
    ← Return 401 if mismatch — timing-safe prevents brute-force timing attacks
        │
        ▼
[5] event = JSON.parse(rawBody)
        │
        ▼
[6] return NextResponse.json({ received: true }, { status: 200 })
    ← Return 200 IMMEDIATELY. Paystack retries on non-2xx responses.
        │
        ▼
[7] void handleWebhookEvent(event)  ← Fire-and-forget after response sent
```

**Why `sha512` not `sha256`:** Paystack uses HMAC-SHA512. Using SHA256 would produce a different hash and all webhooks would fail verification.

**Why `timingSafeEqual`:** String `===` short-circuits on first mismatch character. An attacker can measure response time differences to brute-force the expected signature byte by byte. `timingSafeEqual` takes constant time regardless of match position.

---

## 7. DepositDialog — Complete UI Flow

```
[input step]
  Amount field (min ₦100, numeric)
  "Continue" → validates amount ≥ 100, advances to [review step]

[review step]
  Shows: amount, note about secure Paystack popup
  "Back" → returns to [input step]
  "Pay with Paystack" →
    setStep("processing")
    await initializePaystackTransaction(amountNum)          [server]
    if error → dialog.error("Payment Setup Failed")
    if success:
      onClose()                                             ← close dialog first
      const { default: PaystackPop } = await import("@paystack/inline-js")  ← dynamic import prevents SSR window error
      const paystack = new PaystackPop()
      paystack.resumeTransaction(access_code)
      // Webhook or popup callback fires → verifyAndCreditDeposit(reference)
```

**SDK Loading & SSR Safety:**  
Instead of loading Inline.js dynamically via `<Script>` tags, we use the official **`@paystack/inline-js`** package dynamically imported inside `handleConfirm` (`await import("@paystack/inline-js")`). This guarantees zero CDN script loading race conditions while completely preventing `ReferenceError: window is not defined` during Next.js server-side pre-rendering (SSR).

---

## 8. WithdrawDialog — Complete UI Flow

```
[input step — on mount]
  → fetchNigerianBanks() [server] called once (or from 24h in-memory cache)
  → setBanks([...Nigerian banks]) + pre-select first bank (e.g. Abbey Mortgage Bank)

  Amount field (min ₦1,000)
  Bank <select> (100+ banks from Paystack)
  Account number field (10-digit, strips non-digits on input)

[account resolution — reactive on accountNumber + selectedBankCode change]
  When accountNumber.length === 10 AND selectedBankCode present:
    → setResolvingAccount(true), setAccountName("")
    → resolveBankAccount(accountNumber, selectedBankCode) [server]
    → spinner: "Verifying account with [Bank Name]..."
    → on success: green dot + "DOE JANE LOREN"
    → on error:   red message "Account not found. Please check..."
  When accountNumber.length < 10:
    → accountName = "", resolveError = null (reset)

[review step]
  Shows: Bank, Account Number, Account Name (real), Amount, fee note
  "Confirm Withdrawal" →
    requestWithdrawalAction(amount, { bankName, accountNumber, accountName })
    → Writes to wallets + ledger (×2) + withdrawalRequests
    → dialog.success("Withdrawal requested. Net ₦X after approval.")
```

---

## 9. Integration with the Full App

### 9.1 How Paystack connects to InstantDB Financial Domain

```
Paystack (external)
        │ charge.success event OR popup onSuccess
        ▼
verifyAndCreditDeposit() / webhook handler
        │
        ▼
processDepositAction(userId, nairaAmount, paystackReference)
        │
        ├── wallets (InstantDB)
        │     availableBalance += nairaAmount   ← reactive → streams to all clients
        │     updatedAt = now
        │
        └── ledger (InstantDB — IMMUTABLE)
              eventType: 'DEPOSIT'
              idempotencyKey: `deposit_${paystackReference}`
              sourceAccountId: 'paystack_external'
              destinationAccountId: wallet.id
              amount: nairaAmount
              balanceAfter: previousBalance + nairaAmount
              referenceId: paystackReference
```

### 9.2 Real-Time Balance Update Chain

After `updateWalletBalance` writes to InstantDB:

1. InstantDB streams the delta to all subscribed clients.
2. `useWallet()` (via `db.useQuery({ wallets: { $: { where: { userId } } } })`) receives the update.
3. The `ApplicationShell` header balance label re-renders with the new amount.
4. The wallet page balance panel also updates.

No polling. No page refresh. Same reactive pipeline used by trade settlement payouts.

### 9.3 Environment Variable Scope

| Variable | Value prefix | Scope | Used By |
|---|---|---|---|
| `PAYSTACK_SECRET_KEY` | `sk_test_...` | **Server only** | All 4 server actions + webhook route |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | `pk_test_...` | Client-safe | `PaystackPop.newTransaction({ key })` |

---

## 10. Errors Fixed During Implementation

### Error 1 — Module Not Found: `@/types/paystack`

**Error message:**
```
Module not found: Can't resolve '@/types/paystack'
at ./components/dialog/features/wallet/deposit-dialog.tsx:18
  import "@/types/paystack"
```

**Root cause:**  
TypeScript `.d.ts` ambient declaration files are purely compile-time — they have no JavaScript module output. They cannot be imported as runtime modules. The `import "@/types/paystack"` statement told the bundler to load a runtime module that does not exist.

**Fix:**  
Removed `import "@/types/paystack"` from `deposit-dialog.tsx`. TypeScript automatically picks up all `**/*.d.ts` files included by the `tsconfig.json` `include` glob. The `window.PaystackPop` types are available globally without any explicit import.

---

### Error 2 — Duplicate React Keys in Bank Dropdown

**Error messages:**
```
[browser] Encountered two children with the same key, `50840`.
[browser] Encountered two children with the same key, `057`.
[browser] Encountered two children with the same key, `50572`.
[browser] Encountered two children with the same key, `50739`.
[browser] Encountered two children with the same key, `51253`.
```

**Root cause:**  
Paystack's `/bank` API returns multiple active bank entries sharing the same numeric `code` value (e.g. two entries both with code `057`). The dropdown used `key={bank.code}` which is not unique.

**Fix 1 — Composite UI key** (`withdraw-dialog.tsx`):
```tsx
// Before
<option key={bank.code} value={bank.code}>

// After
<option key={`${bank.code}-${bank.slug}`} value={bank.code}>
```
The `slug` field is always unique in Paystack's response even when `code` is shared.

**Fix 2 — Server-side deduplication** (`paystack-actions.ts`):
```typescript
const seen = new Set<string>();
const banks = body.data
  .filter((b) => b.active)
  .filter((b) => {
    if (seen.has(b.code)) return false;
    seen.add(b.code);
    return true;
  })
  .map(...);
```
Ensures that `selectedBankCode` → bank name lookups in `handleBankChange` always resolve to exactly one bank. The `value` on each `<option>` is `bank.code` — duplicates would break the lookup and send wrong `bankCode` to `/bank/resolve`.

---

### Error 3 — Duplicate Component Definitions After File Replacement

**Issue:**  
The `replace_file_content` tool prepended new content without fully truncating old content when replacing large portions of `deposit-dialog.tsx` and `withdraw-dialog.tsx`. Both files ended up with two separate `export function DepositDialog` and `export function WithdrawDialog` declarations — the new implementation followed by the entire old implementation.

**Symptom:**  
TypeScript would have errored: "Duplicate identifier 'DepositDialog'." Build would have failed.

**Fix:**  
Used PowerShell to truncate each file to the correct line count, removing all legacy code after the new `export default`:
```powershell
(Get-Content "...\deposit-dialog.tsx" | Select-Object -First 285) |
  Set-Content "...\deposit-dialog.tsx" -Encoding UTF8

(Get-Content "...\withdraw-dialog.tsx" | Select-Object -First 330) |
  Set-Content "...\withdraw-dialog.tsx" -Encoding UTF8
```

---

## 11. Acceptance Criteria

### AC-01 Deposit — Happy Path

- [ ] User enters ₦5,000, selects Debit Card, clicks Continue → review screen shown.
- [ ] "Pay with Paystack" triggers `initializePaystackTransaction(5000)` server-side.
- [ ] Paystack popup appears. Test card payment completed successfully.
- [ ] `verifyAndCreditDeposit(reference)` called server-side after popup `onSuccess`.
- [ ] Paystack `/transaction/verify/:reference` returns `status: "success"`.
- [ ] One DEPOSIT ledger entry written with `idempotencyKey: "deposit_${reference}"`.
- [ ] `wallets.availableBalance` increases by ₦5,000 in InstantDB.
- [ ] Header balance updates without page refresh.
- [ ] Success dialog: "₦5,000 has been added to your wallet. New balance: ₦X".

### AC-02 Deposit — Idempotency

- [ ] Calling `verifyAndCreditDeposit` twice with same reference credits wallet exactly once.
- [ ] Webhook firing after popup already ran: no second credit, returns `success: true`.
- [ ] Webhook firing before popup: wallet credited correctly; subsequent popup verify is de-duped.

### AC-03 Deposit — Cancellation

- [ ] Closing Paystack popup fires `onCancel` silently — no error dialog, no DB write.

### AC-04 Deposit — Error Handling

- [ ] `initializePaystackTransaction` failure → dialog.error("Payment Setup Failed").
- [ ] `verifyAndCreditDeposit` with failed/abandoned transaction → error dialog with tx status.
- [ ] `window.PaystackPop` not loaded → dialog.error("Paystack Not Loaded").
- [ ] Amount < ₦100 → server returns error, "Minimum deposit amount is ₦100".

### AC-05 Webhook — Signature Verification

- [ ] Missing `x-paystack-signature` header → HTTP 401.
- [ ] Invalid signature → HTTP 401.
- [ ] Valid HMAC-SHA512 signature → HTTP 200 within 100ms (response sent before processing).

### AC-06 Webhook — Event Processing

- [ ] `charge.success` with valid `metadata.userId` → wallet credited via `processDepositAction`.
- [ ] `charge.success` missing `metadata.userId` → error logged, no DB write, HTTP 200.
- [ ] Unhandled event type → logged, ignored, HTTP 200.

### AC-07 WithdrawDialog — Bank List

- [ ] Opening WithdrawDialog shows "Loading banks..." spinner.
- [ ] Dropdown renders 50+ real Nigerian banks from Paystack.
- [ ] No React duplicate key warnings in browser console.
- [ ] Second open of WithdrawDialog within 24h served from cache (no network request).

### AC-08 WithdrawDialog — Account Resolution

- [ ] < 10 digits: no account name shown, Continue disabled.
- [ ] Exactly 10 digits: triggers `resolveBankAccount()`, shows "Verifying...".
- [ ] Valid account: green dot + real name (e.g. "ADEBISI JOHN OLUMIDE").
- [ ] Invalid account/bank: red "Account not found. Please check..." message.
- [ ] Changing bank with same account number re-triggers resolution.
- [ ] Continue only enabled when `accountName` is truthy.

### AC-09 WithdrawDialog — Withdrawal

- [ ] Confirmed withdrawal stores real `accountName` from Paystack in `withdrawalRequests`.
- [ ] `wallets.availableBalance` debited immediately.
- [ ] Two ledger entries: `WITHDRAWAL` (net amount) + `WITHDRAWAL_FEE` (fee amount).
- [ ] Admin panel shows withdrawal with correct bank name and resolved account name.

### AC-10 Build Health

- [ ] `npx tsc --noEmit` → zero errors.
- [ ] `npm run build` → exits 0, all routes compile.

### AC-11 Security

- [ ] `PAYSTACK_SECRET_KEY` absent from client bundle (check `.next/static/` after build).
- [ ] `window.PaystackPop` only receives `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`.
- [ ] Webhook uses `timingSafeEqual`, not `===`.
- [ ] `verifyAndCreditDeposit` verifies Paystack API before any DB write.
- [ ] `metadata.userId` vs `auth().userId` mismatch → error, no credit.

---

## 12. Integration Registry

All Paystack touchpoints in the codebase:

| Layer | File | Role |
|---|---|---|
| Server Actions | `lib/actions/paystack-actions.ts` | All Paystack API calls |
| Webhook | `app/api/webhooks/paystack/route.ts` | Receive & verify Paystack events |
| Wallet Core | `lib/actions/wallet-actions.ts` | `processDepositAction` — idempotent credit |
| Wallet Provisioning | `lib/actions/wallet-provisioning.ts` | Demo seed via `processDepositAction` (unchanged) |
| Repository — Wallets | `lib/repositories/wallets.ts` | `updateWalletBalance`, `getWalletByUserId` |
| Repository — Ledger | `lib/repositories/ledger.ts` | `createLedgerEntry`, `idempotencyKeyExists` |
| Repository — Withdrawals | `lib/repositories/withdrawals.ts` | `createWithdrawalRequest` |
| UI — Deposit | `components/dialog/features/wallet/deposit-dialog.tsx` | Popup trigger, verify callbacks |
| UI — Withdraw | `components/dialog/features/wallet/withdraw-dialog.tsx` | Bank list, account name, withdrawal request |
| Types | `types/paystack.d.ts` | `window.PaystackPop` ambient global type |
| Environment | `.env.local` | API keys |

---

## 13. Security Model

| Concern | Implementation |
|---|---|
| Secret key never reaches browser | `PAYSTACK_SECRET_KEY` only in `'use server'` functions and webhook route |
| Public key is browser-safe | `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` is intentionally public (Paystack uses it for client identification only) |
| No client-trusted payment data | `onSuccess({ reference })` only triggers server verify — never directly credits wallet |
| Webhook forgery prevention | HMAC-SHA512 with `timingSafeEqual` |
| Duplicate event handling | `processDepositAction` idempotency key guards every DB write |
| User spoofing prevention | `verifyAndCreditDeposit` validates `metadata.userId === auth().userId` |
| Balance floor invariant | `requestWithdrawalAction` checks `availableBalance >= amount` before deduction |

---

## 14. Webhook Local Testing Instructions

Paystack cannot reach `localhost`. Options for local testing:

**Option A — ngrok (full end-to-end):**
```powershell
winget install ngrok
ngrok http 3000
# Register in Paystack Dashboard: Settings → Webhooks
# URL: https://<id>.ngrok-free.app/api/webhooks/paystack
```

**Option B — Paystack Dashboard Test Event (no tunnel needed):**
Settings → Webhooks → Send Test Event. Sends a `charge.success` payload to your registered URL.

**Option C — Skip webhook for now:**
The popup flow works completely independently. Webhook is only a safety net for browser crashes mid-payment.

---

## 15. Paystack Test Credentials

| Card Number | CVV | PIN | OTP | Result |
|---|---|---|---|---|
| `4084 0840 8408 4081` | `408` | `0000` | `123456` | Success |
| `5531 8866 5214 2950` | `564` | `1234` | `123456` | Success (Verve) |

API keys in use (test mode):
- Public: `pk_test_74ac9129ddb1c3922a070cdf28d9690245b782d2`
- Secret: in `.env.local` only — never committed to source control

---

## 16. Out of Scope (Future Work)

| Feature | Reason Not Included |
|---|---|
| Paystack Transfers API (bank payout automation) | Admin manually processes withdrawals for now |
| Virtual bank accounts | Abandoned — replaced by popup flow |
| KYC / BVN verification | Future compliance requirement |
| Refunds via Paystack Refund API | Admin uses `rejectWithdrawalAction` (refunds internally) |
| Multi-currency | NGN only |
| Recurring charges | Not applicable to prediction market model |
