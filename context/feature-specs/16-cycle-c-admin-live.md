# Feature Specification: Cycle C — Admin Panel Live Wiring

> **Feature Target**: Replace all mock local state in the admin panel with live InstantDB data and wire every admin dialog to its corresponding server action  
> **Status**: Ready to Implement after Cycle B  
> **Spec Number**: 16  
> **File**: `context/feature-specs/16-cycle-c-admin-live.md`  
> **Depends On**: Cycle A (markets live), Cycle B (trading live), Spec 13 infrastructure (market-actions.ts ✅)

---

## 1. Goal

After this cycle, every section of `app/admin/page.tsx` reads from and writes to InstantDB directly. No local `useState` is used as a data store. Admin actions trigger real server actions that atomically update the database.

---

## 2. What Already Exists (Do NOT recreate)

- `lib/actions/market-actions.ts` — `createMarketAction`, `resolveMarketAction`, `pauseMarketAction`, `unpauseMarketAction`, `reopenMarketAction`, `cancelMarketAction` ✅
- `lib/actions/wallet-actions.ts` — `rejectWithdrawalAction` ✅
- `components/dialog/features/market/pause-market-dialog.tsx` — `PauseMarketDialog` ✅
- `components/dialog/features/market/resolve-market-dialog.tsx` — `ResolveMarketDialog` ✅
- `components/dialog/features/market/reopen-market-dialog.tsx` — `ReopenMarketDialog` ✅
- `components/admin/*` — all admin sub-components ✅

---

## 3. Task 1 — Create `lib/hooks/use-admin-data.ts`

New file. Queries all admin dashboard data in one place.

```typescript
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
```

---

## 4. Task 2 — Add Missing Repository Methods

Add these to `lib/repositories/instantdb-repository.ts`:

### Withdrawal Requests Repository
```typescript
class InstantDbWithdrawalRepository {
  async createWithdrawalRequest(data: WithdrawalRequestCreateData): Promise<string>
  async getWithdrawalRequests(filter?: { status?: string }): Promise<WithdrawalRequest[]>
  async updateWithdrawalRequest(id: string, updates: Partial<WithdrawalRequestUpdateData>): Promise<void>
}
```

### Market Suggestions Repository
```typescript
class InstantDbSuggestionRepository {
  async createMarketSuggestion(data: MarketSuggestionCreateData): Promise<string>
  async getMarketSuggestions(filter?: { status?: string }): Promise<MarketSuggestion[]>
  async updateMarketSuggestion(id: string, updates: Partial<MarketSuggestionUpdateData>): Promise<void>
}
```

Add these to the `IRepository` interface in `lib/repositories/types.ts` and the `instantDbRepository` export object.

---

## 5. Task 3 — Wire Admin Markets Tab to Live Data

In `app/admin/page.tsx`:

**Before (wrong):**
```tsx
const [markets, setMarkets] = React.useState<AdminMarketItem[]>([/* hardcoded */])
```

**After:**
```tsx
const { markets: dbMarkets, isLoading: marketsLoading } = useAdminMarkets()
// Transform dbMarkets → AdminMarketItem[] for the existing AdminMarketsTab component
const markets = dbMarkets.map(m => ({
  id: m.id,
  title: m.title,
  category: m.category?.slug ?? '',
  status: m.state.charAt(0).toUpperCase() + m.state.slice(1) as any,
  closeDate: new Date(m.closingTime).toLocaleString(),
  totalVolume: m.tradingVolume,
  format: m.marketType === 'multi_option' ? 'multi' : 'binary',
  options: (m.options ?? []).map((o: any) => ({ id: o.id, title: o.name })),
}))
```

---

## 6. Task 4 — Wire `CreateMarketDialog` → `createMarketAction`

In the `handleCreateMarketSubmit` handler, call the real server action instead of local `setState`:

```tsx
const handleCreateMarketSubmit = async (marketData: any) => {
  const { userId } = await getAuthForAdmin() // Clerk auth
  
  const result = await createMarketAction({
    title: marketData.title,
    description: marketData.description || marketData.title,
    categorySlug: marketData.category,
    marketType: marketData.format === 'multi' ? 'multi_option' : 'binary',
    displayVariant: marketData.format === 'binary' ? 'binary' : marketData.format,
    openingTime: Date.now(),
    closingTime: new Date(marketData.closeDate).getTime(),
    liquidity: 50000, // ₦50,000 default
    optionNames: marketData.options.map((o: any) => o.title),
    createdBy: userId,
  })

  if (!result.success) {
    // show error toast
    return
  }
  // Markets tab auto-updates via useAdminMarkets() reactive subscription — no setState needed
}
```

---

## 7. Task 5 — Wire `ResolveMarketDialog` → `resolveMarketAction`

```tsx
const handleResolveMarket = async (marketId: string, winningOptionId: string, confirmedTitle: string) => {
  const { userId } = await auth() // admin clerk ID

  const result = await resolveMarketAction({
    marketId,
    winningOptionId,
    confirmedTitleAllCaps: confirmedTitle,
    adminUserId: userId!,
  })

  if (!result.success) {
    throw new Error(result.error)
  }
  // Markets tab auto-updates via reactive subscription
}
```

---

## 8. Task 6 — Wire `PauseMarketDialog` → `pauseMarketAction` / `unpauseMarketAction`

The `PauseMarketDialog` already accepts `onConfirmPauseStateChange: () => Promise<void>`. Pass the real server action call:

```tsx
onConfirmPauseStateChange={async () => {
  const result = market.status === 'paused'
    ? await unpauseMarketAction({ marketId: market.id, adminUserId: userId! })
    : await pauseMarketAction({ marketId: market.id, adminUserId: userId! })

  if (!result.success) throw new Error(result.error)
}}
```

---

## 9. Task 7 — Wire Withdrawals Tab to Live Data

```tsx
const { withdrawals: dbWithdrawals } = useAdminWithdrawals()

// Transform for AdminWithdrawalsTab
const withdrawals = dbWithdrawals.map(w => ({
  id: w.id,
  userName: w.accountName,
  userEmail: '', // not stored in withdrawal_requests — pull from $users if needed
  bankName: w.bankName,
  accountNumber: w.accountNumber,
  accountName: w.accountName,
  amount: w.grossAmount,
  requestDate: new Date(w.createdAt).toLocaleString(),
  status: w.status,
}))

// Handle approve/reject
const handleWithdrawalAction = async (withdrawalId: string, action: 'approve' | 'reject', reason?: string) => {
  if (action === 'reject') {
    const withdrawal = dbWithdrawals.find(w => w.id === withdrawalId)
    await rejectWithdrawalAction(withdrawal.userId, withdrawal.grossAmount, withdrawalId, adminUserId!)
  }
  // approve: integrate Paystack payout (out of Cycle C scope — mark as approved in DB)
}
```

---

## 10. Task 8 — Wire Audit Logs Tab to Live Data

```tsx
const { logs: dbLogs } = useAdminAuditLogs()

const auditLogs = dbLogs.map(log => ({
  id: log.id,
  action: log.actionType,
  performedBy: log.adminUserId,
  targetId: log.targetEntityId,
  details: typeof log.details === 'string' ? log.details : JSON.stringify(log.details),
  timestamp: new Date(log.createdAt).toLocaleString(),
}))
```

---

## 11. Verification Checklist

- [ ] Admin markets tab shows the 3 seeded live markets
- [ ] Create Market dialog submits → new market appears in table (no page refresh needed)
- [ ] Pause Market action updates market state in real-time
- [ ] Resolve Market dialog requires ALL CAPS confirmation → triggers LMSR settlement → winning users' wallets credited
- [ ] Withdrawal requests tab shows any pending withdrawals
- [ ] Audit Logs tab shows real log entries from server actions
- [ ] `npx tsc --noEmit` passes with zero errors

---

## 12. What Cycle C Completes

After Cycle C is done, **the entire Sheybi platform is live**:
- Admin can create, manage, pause, and resolve prediction markets in real-time
- The LMSR settlement engine pays out winners automatically
- Financial audit trail is immutable and queryable
- **All three cycles together = the full DB + Prediction Engine integration is complete**

---

## 13. Answer to "Is the App Complete After All 3 Cycles?"

**Yes.** After Cycles A + B + C:

| Feature | Status |
|---|---|
| Live prediction markets feed | ✅ Complete (Cycle A) |
| Market detail with real options/probabilities | ✅ Complete (Cycle A) |
| Place a real trade (LMSR math, atomic DB write) | ✅ Complete (Cycle B) |
| Wallet shows real balance + transaction history | ✅ Complete (Cycle B) |
| Portfolio shows real positions + sell positions | ✅ Complete (Cycle B) |
| Admin creates/pauses/resolves real markets | ✅ Complete (Cycle C) |
| Settlement pays winners, unlocks losers | ✅ Complete (Cycle C) |
| Double-entry financial ledger for all events | ✅ Complete (Cycle B + C) |
| Single-Outcome Exposure Invariant enforced | ✅ Complete (Cycle B — in buyPositionAction) |
| Real-time sync across all clients | ✅ Complete (InstantDB reactive subscriptions throughout) |

The only things NOT in these cycles (by design, out of scope):
- Paystack payment integration (deposits via virtual account, actual payouts)
- KYC verification flow
- Notifications system
- Community/social features

These are explicitly listed as future phases in the project-overview.
