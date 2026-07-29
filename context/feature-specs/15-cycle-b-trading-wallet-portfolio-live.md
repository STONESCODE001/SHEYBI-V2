# Feature Specification: Cycle B — Trading, Wallet & Portfolio Live

> **Feature Target**: Wire the `TradeDialog` to `buyPositionAction`, create live wallet/ledger/positions hooks, and connect wallet + portfolio pages to real InstantDB data  
> **Status**: Ready to Implement after Cycle A  
> **Spec Number**: 15  
> **File**: `context/feature-specs/15-cycle-b-trading-wallet-portfolio-live.md`  
> **Depends On**: Cycle A complete (markets are live), Spec 13 infrastructure (actions exist ✅, LMSR engine verified ✅)

---

## 1. Goal

After this cycle:
- A signed-in user can place a **real prediction trade** that writes to InstantDB atomically (wallet balance deducted, position created, ledger entries written, option probabilities updated by LMSR)
- The **wallet page** shows the user's real available balance and real transaction history from the ledger
- The **portfolio page** shows the user's real open/closed positions and a working "Sell Position" button

---

## 2. What Already Exists (Do NOT recreate)

- `lib/actions/trade-actions.ts` — `buyPositionAction`, `sellPositionAction` (full 15-step LMSR flow) ✅
- `lib/actions/wallet-actions.ts` — `processDepositAction`, `requestWithdrawalAction`, `rejectWithdrawalAction` ✅
- `lib/repositories/instantdb-repository.ts` — all 5 repos wired to InstantDB ✅
- `components/dialog/features/market/trade-dialog.tsx` — full UI, accepts `onExecuteTrade` prop ✅
- `components/parent/market-details/` — `BinaryMarketView`, `VersusMarketView`, `MultiOptionMarketView` ✅

---

## 3. Task 1 — Create `lib/hooks/use-wallet.ts`

New file. Queries the user's wallet in real-time.

```typescript
'use client';

import { useUser } from '@clerk/nextjs';
import { db } from '@/lib/instant';

export function useWallet() {
  const { user } = useUser();
  const userId = user?.id ?? null;

  const { isLoading, error, data } = db.useQuery(
    userId
      ? {
          wallets: {
            $: { where: { userId } },
          },
        }
      : null // don't query if not signed in
  );

  const wallet = data?.wallets?.[0] ?? null;

  return {
    isLoading,
    error,
    wallet,
    availableBalance: wallet?.availableBalance ?? 0,
    lockedBalance: wallet?.lockedBalance ?? 0,
  };
}
```

---

## 4. Task 2 — Create `lib/hooks/use-ledger.ts`

New file. Queries the user's double-entry ledger in real-time.

```typescript
'use client';

import { useUser } from '@clerk/nextjs';
import { db } from '@/lib/instant';

export function useLedger(limit = 50) {
  const { user } = useUser();
  const userId = user?.id ?? null;

  const { isLoading, error, data } = db.useQuery(
    userId
      ? {
          ledger: {
            $: {
              where: { userId },
              order: { createdAt: 'desc' },
              limit,
            },
          },
        }
      : null
  );

  return {
    isLoading,
    error,
    entries: data?.ledger ?? [],
  };
}
```

---

## 5. Task 3 — Create `lib/hooks/use-positions.ts`

New file. Queries the user's open and closed positions in real-time.

```typescript
'use client';

import { useUser } from '@clerk/nextjs';
import { db } from '@/lib/instant';

export function usePositions() {
  const { user } = useUser();
  const userId = user?.id ?? null;

  const { isLoading, error, data } = db.useQuery(
    userId
      ? {
          positions: {
            $: { where: { userId } },
          },
        }
      : null
  );

  const positions = data?.positions ?? [];
  const openPositions = positions.filter((p: any) =>
    ['open', 'partially_sold'].includes(p.state)
  );
  const closedPositions = positions.filter((p: any) =>
    ['closed', 'won', 'lost', 'cancelled'].includes(p.state)
  );

  return {
    isLoading,
    error,
    positions,
    openPositions,
    closedPositions,
  };
}
```

---

## 6. Task 4 — Wire `app/wallet/page.tsx` to Live Data

Replace the hardcoded balance string and static activity cards.

```tsx
"use client"

import * as React from "react"
import { AuthenticatedLayout } from "@/components/layouts"
import { WalletCard, ActivityCard } from "@/components/parent"
import { useDialog } from "@/components/dialog"
import { useWallet } from "@/lib/hooks/use-wallet"
import { useLedger } from "@/lib/hooks/use-ledger"
import { History } from "lucide-react"

// Maps ledger eventType → ActivityCard activityType
function ledgerEventToActivityType(eventType: string): "deposit" | "withdrawal" | "trade" | "settlement" {
  if (eventType === "DEPOSIT") return "deposit"
  if (eventType === "WITHDRAWAL" || eventType === "WITHDRAWAL_REFUND") return "withdrawal"
  if (eventType === "SETTLEMENT_WIN") return "settlement"
  return "trade"
}

export default function WalletPage() {
  const dialog = useDialog()
  const { wallet, availableBalance, isLoading: walletLoading } = useWallet()
  const { entries, isLoading: ledgerLoading } = useLedger(20)

  const formattedBalance = walletLoading
    ? "Loading..."
    : `₦${availableBalance.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`

  return (
    <AuthenticatedLayout>
      <div className="mx-auto max-w-4xl flex flex-col gap-8 py-2">
        <div className="w-full">
          <WalletCard
            availableBalance={formattedBalance}
            status={wallet ? "Active" : "Loading"}
            onDeposit={() => dialog.open("wallet/deposit")}
            onWithdraw={() => dialog.open("wallet/withdraw")}
          />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
              <History className="size-5 text-[var(--text-secondary)]" />
              <span>Transaction History</span>
            </h2>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 shadow-sm">
            {ledgerLoading ? (
              <p className="text-sm text-[var(--text-muted)] text-center py-4">Loading transactions...</p>
            ) : entries.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)] text-center py-4">No transactions yet.</p>
            ) : (
              entries.map((entry: any) => (
                <ActivityCard
                  key={entry.id}
                  activityType={ledgerEventToActivityType(entry.eventType)}
                  username={entry.eventType}
                  description={entry.description}
                  timestamp={new Date(entry.createdAt).toLocaleString("en-NG")}
                  amount={`${entry.amount >= 0 ? "+" : ""}₦${Math.abs(entry.amount).toLocaleString()}`}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
```

---

## 7. Task 5 — Wire `app/portfolio/page.tsx` to Live Data

Replace hardcoded position cards with live `usePositions()` data. Connect "Sell Position" button.

Key changes:
1. Import and call `usePositions()` hook
2. Render `openPositions` array dynamically instead of 2 hardcoded cards
3. Render `closedPositions` array dynamically
4. "Sell Position" button calls `sellPositionAction(marketId, optionId, sharesToSell, idempotencyKey)`

For each open position, display:
- Option name badge (from `optionId` — resolve via market query or store name in position)
- Market title (from `marketId` — resolve via market query)
- Shares owned, invested amount, average entry price
- Estimated current value (shares × current sharePrice from market)
- PnL vs invested

---

## 8. Task 6 — Wire `TradeDialog` to `buyPositionAction`

The `TradeDialog` has this prop: `onExecuteTrade?: (order: TradeOrderPayload) => Promise<void>`

In each market detail view (`BinaryMarketView`, `VersusMarketView`, `MultiOptionMarketView`), when opening the `TradeDialog`, pass a real handler:

```tsx
import { buyPositionAction } from "@/lib/actions/trade-actions"

const handleExecuteTrade = async (order: TradeOrderPayload) => {
  const idempotencyKey = `trade_${order.marketId}_${order.optionId}_${Date.now()}`
  const result = await buyPositionAction(
    order.marketId!,
    order.optionId!,
    order.amount,
    idempotencyKey
  )
  if (!result.success) {
    throw new Error(result.error ?? "Trade failed")
  }
}
```

Pass this as `onExecuteTrade={handleExecuteTrade}` to `<TradeDialog>`.

---

## 9. Verification Checklist

- [ ] Sign in as a test user → wallet page shows ₦0.00 balance (newly provisioned wallet)
- [ ] Open a market detail page → `TradeDialog` appears
- [ ] Place a ₦1,000 trade on a binary market → success toast appears
- [ ] Check wallet page — balance deducted by ₦1,000 (now shows ₦0 or the loaded test balance)
- [ ] Check portfolio page — new position appears in "Open Positions" tab with shares and invested amount
- [ ] Check wallet page transaction history — `TRADE_BUY` and `TRADING_FEE` ledger entries visible
- [ ] Attempt to buy opposing outcome in same market → error shown (Single-Outcome Exposure Invariant enforced)
- [ ] "Sell Position" button in portfolio triggers `sellPositionAction` and position updates
- [ ] `npx tsc --noEmit` passes with zero errors

---

## 10. What Cycle B Completes

After Cycle B is done, **the core trading loop is live end-to-end**:
- Real money (simulated ₦ balance) moves through the prediction engine
- LMSR probabilities update in real-time as trades happen
- Users have real positions and a real transaction ledger
- The Sheybi prediction market engine is **fully operational for users**
