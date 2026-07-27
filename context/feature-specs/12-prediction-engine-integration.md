# Prediction Engine Integration Specification

> Version: 1.1.0
> Status: Implementation
> Owner: Prediction Engine / Application Layer
> Depends on: prediction-engine.md, 10-prediction-algorithm.md, database-schema.md, architecture.md, api-contract.md

---

# Overview

This specification defines how the LMSR Prediction Engine algorithm (`lib/prediction-engine/lmsr.ts`) is connected to the rest of the Sheybi application — Server Actions, data persistence, wallet mutations, and UI components.

The algorithm itself is 100% complete and tested. This document covers the **integration layer** that sits between the algorithm and the database.

---

# Market Type Definitions (Confirmed)

Sheybi has three **UI display variants** backed by two **engine market types**:

## Binary Market

- Engine `marketType`: `"binary"`
- Exactly 2 options: YES / NO
- Initial probability: 50% / 50%
- UI: Single card with YES/NO buttons
- Example: "Will a Female Housemate win HoH this week?"

## 1v1 Matchup Market

- Engine `marketType`: `"multi_option"` (treated as multi-option with 4 options)
- Exactly 4 options: Contestant A YES, Contestant A NO, Contestant B YES, Contestant B NO
- Initial probability: 25% / 25% / 25% / 25%
- UI: Side-by-side card showing two contestant avatars, each with YES/NO buttons
- Example: "Mike vs Mercy" → Mike YES (25%), Mike NO (25%), Mercy YES (25%), Mercy NO (25%)
- **Single-Outcome Exposure Invariant applies**: user can only hold ONE of the 4 positions
- **Admin creation**: Admin creates a single "1v1 matchup" and the system auto-generates one market with 4 options

> **Note**: Because all 4 options share one LMSR cost function, buying "Mike YES" will increase Mike YES probability and decrease the other three proportionally. This means "Mike YES" + "Mike NO" will NOT always sum to 100% — they share probability space with Mercy's options. This is the intended behavior as confirmed by the product owner.

## Multi-Option Market

- Engine `marketType`: `"multi_option"`
- 3 or more options (contestant names)
- Initial probability: evenly distributed (e.g. 33.33% each for 3 options)
- UI: Candidate list with probability bars
- Example: "Who will be evicted?" → Seyi (33.33%) / Venita (33.33%) / Adekunle (33.34%)

### How to distinguish 1v1 from standard multi-option

The `marketType` field is `"multi_option"` for both. The UI determines the display variant by checking:
- If `marketType === "binary"` → binary card
- If `marketType === "multi_option"` AND market has a `displayVariant: "1v1"` field → 1v1 matchup card
- If `marketType === "multi_option"` AND no `displayVariant` or `displayVariant: "standard"` → standard multi-option card

The `displayVariant` field is stored on the market record as a UI hint. The engine ignores it completely.

---

# Wallet Balance Model (Confirmed)

## Balance Types

| Balance | Purpose | Changes when... |
|---------|---------|-----------------|
| `availableBalance` | Funds immediately available for trading or withdrawal | Deposit (↑), Buy (↓), Sell (↑), Settlement Win (↑), Withdrawal Request (↓), Withdrawal Rejection (↑) |
| `lockedBalance` | Funds committed to open trading positions | Buy (↑), Sell (↓), Settlement Win (↓), Settlement Loss (↓), Cancellation Refund (↓ locked, ↑ available) |

## Money Flow for Each Operation

### Buy Trade
```
availableBalance -= tradeAmount
lockedBalance    += tradeAmount
```

### Sell Trade
```
lockedBalance    -= proportionalInvestedAmount  (shares sold / total shares * investedAmount)
availableBalance += netProceeds                 (gross proceeds - 2.5% fee)
```

### Settlement (Winner)
```
lockedBalance    -= investedAmount
availableBalance += payout                      (shares * ₦1.00)
```

### Settlement (Loser)
```
lockedBalance    -= investedAmount              (funds are lost)
```

### Cancellation Refund
```
lockedBalance    -= investedAmount
availableBalance += investedAmount              (100% refund)
```

### Deposit
```
availableBalance += depositAmount
```

### Withdrawal Request
```
availableBalance -= withdrawalAmount            (deducted immediately)
```
`lockedBalance` is NEVER touched by withdrawals. It is exclusively for trading positions.

### Withdrawal Rejection (admin rejects)
```
availableBalance += withdrawalAmount            (refunded)
```

---

# Architecture: Repository Pattern

## Why a Repository Pattern

InstantDB is not yet configured. Rather than leaving dead code with TODO comments, we use a **Repository Pattern** that:

1. Defines a strict TypeScript interface for every database operation the engine needs.
2. Implements that interface with an **in-memory mock** using `Map` data structures and realistic seed data.
3. Allows a future developer (or AI) to create an **InstantDB implementation** of the same interface — swapping one import, zero changes to Server Actions or the engine.

## Architectural Diagram

```
┌─────────────────────────────────────────────────┐
│                  UI Components                   │
│  TradeDialog / TradePanel / Portfolio / Admin     │
└─────────────┬───────────────────────────────────┘
              │ calls
              ▼
┌─────────────────────────────────────────────────┐
│              Server Actions                      │
│  buyPositionAction / sellPositionAction           │
│  createMarketAction / resolveMarketAction         │
│  requestWithdrawalAction / processDepositAction   │
└──────┬──────────────────┬───────────────────────┘
       │ delegates to     │ persists via
       ▼                  ▼
┌──────────────┐  ┌───────────────────────────────┐
│  Prediction  │  │     Repository Interface       │
│   Engine     │  │  (IMarketRepository)           │
│  (lmsr.ts)   │  │  (IWalletRepository)           │
│              │  │  (IPositionRepository)          │
│  Pure math.  │  │  (ILedgerRepository)            │
│  No I/O.     │  └───────┬───────────────────────┘
└──────────────┘          │
                          │ implemented by
              ┌───────────┴───────────┐
              ▼                       ▼
┌──────────────────────┐  ┌──────────────────────────┐
│  MockRepository      │  │  InstantDBRepository     │
│  (in-memory Maps)    │  │  (future implementation)  │
│                      │  │                          │
│  Ships with seed     │  │  Uses adminDb.transact() │
│  data for testing.   │  │  for atomic mutations.    │
│                      │  │                          │
│  ✅ Built now        │  │  ⏳ Built when InstantDB  │
│                      │  │     is configured         │
└──────────────────────┘  └──────────────────────────┘
```

## Dependency Rules

- Server Actions depend on the Repository **interface**, never the concrete implementation.
- The Prediction Engine (`lmsr.ts`) depends on nothing — it receives data and returns results.
- The Repository implementations depend on the database layer only.
- UI components depend on Server Actions and reactive hooks only.

---

# Repository Interface Contract

## File: `lib/repositories/types.ts`

This file defines the TypeScript interfaces that every repository implementation must satisfy.

### IMarketRepository

```typescript
interface IMarketRepository {
  /** Fetch a single market by ID, including its options. */
  getMarketById(marketId: string): Promise<Market | null>;

  /** Fetch all markets, optionally filtered by state. */
  getMarkets(filter?: { state?: MarketState; categoryId?: string }): Promise<Market[]>;

  /** Persist a new market and its options. Returns the created market ID. */
  createMarket(marketData: MarketCreateData, optionsData: OptionCreateData[]): Promise<string>;

  /** Update a market's state, closing time, winning option, volume, etc. */
  updateMarket(marketId: string, updates: Partial<MarketUpdateData>): Promise<void>;

  /** Update a specific option's shares, probability, price, and winning flag. */
  updateMarketOption(optionId: string, updates: Partial<OptionUpdateData>): Promise<void>;

  /** Batch update all options for a market (used after trades to update the full probability vector). */
  updateMarketOptions(marketId: string, optionUpdates: OptionBatchUpdate[]): Promise<void>;

  /** Insert a market_activity record. */
  addMarketActivity(marketId: string, activity: MarketActivityData): Promise<void>;
}
```

### IWalletRepository

```typescript
interface IWalletRepository {
  /** Fetch wallet by user ID. */
  getWalletByUserId(userId: string): Promise<Wallet | null>;

  /** Create a new wallet for a user (called during registration). */
  createWallet(userId: string): Promise<string>;

  /** Atomically update wallet balances. Accepts deltas, not absolute values. */
  updateWalletBalance(userId: string, deltas: WalletBalanceDeltas): Promise<void>;
}
```

### IPositionRepository

```typescript
interface IPositionRepository {
  /** Fetch a user's active position in a specific market (any option). */
  getActivePositionInMarket(userId: string, marketId: string): Promise<Position | null>;

  /** Fetch a user's position for a specific option. */
  getPositionByUserAndOption(userId: string, optionId: string): Promise<Position | null>;

  /** Fetch all positions for a market (used during settlement). */
  getPositionsByMarket(marketId: string): Promise<Position[]>;

  /** Fetch all positions for a user (used for portfolio). */
  getPositionsByUser(userId: string): Promise<Position[]>;

  /** Create a new position. */
  createPosition(data: PositionCreateData): Promise<string>;

  /** Update an existing position (shares, state, P&L, etc.). */
  updatePosition(positionId: string, updates: Partial<PositionUpdateData>): Promise<void>;
}
```

### ILedgerRepository

```typescript
interface ILedgerRepository {
  /** Create an immutable ledger entry. */
  createLedgerEntry(entry: LedgerEntryData): Promise<string>;

  /** Fetch ledger entries by user (for transaction history). */
  getLedgerEntriesByUser(userId: string): Promise<LedgerEntry[]>;

  /** Check if an idempotency key already exists (prevents duplicate financial events). */
  idempotencyKeyExists(key: string): Promise<boolean>;
}
```

### IAuditLogRepository

```typescript
interface IAuditLogRepository {
  /** Create an immutable audit log entry. */
  createAuditLog(entry: AuditLogData): Promise<string>;
}
```

---

# Mock Repository Implementation

## File: `lib/repositories/mock-repository.ts`

The mock implementation uses `Map<string, T>` data structures to simulate a database.

### Seed Data

The mock repository ships with pre-populated seed data representing a realistic application state:

#### Users & Wallets
| User ID | Username | Available Balance | Locked Balance |
|---------|----------|-------------------|----------------|
| `user_demo_001` | demoplayer | ₦50,000 | ₦0 |
| `user_demo_002` | bbnaijafan | ₦25,000 | ₦5,000 |
| `user_admin_001` | admin | ₦100,000 | ₦0 |

#### Markets
| Market ID | Title | Type | Display Variant | State | Liquidity | Options |
|-----------|-------|------|-----------------|-------|-----------|---------|
| `mkt_binary_001` | "Will a Female Housemate win HoH this week?" | binary | binary | open | ₦100,000 | YES (50%) / NO (50%) |
| `mkt_1v1_001` | "Mike vs Mercy: Who Survives Eviction?" | multi_option | 1v1 | open | ₦100,000 | Mike YES (25%) / Mike NO (25%) / Mercy YES (25%) / Mercy NO (25%) |
| `mkt_multi_001` | "Who will be evicted from the BBNaija House on Sunday?" | multi_option | standard | open | ₦200,000 | Seyi (33.33%) / Venita (33.33%) / Adekunle (33.34%) |

#### Positions
| User | Market | Option | Shares | Invested | State |
|------|--------|--------|--------|----------|-------|
| `user_demo_002` | `mkt_binary_001` | YES | 8,000 | ₦5,000 | open |

Each seed market must have its LMSR `liquidityParam` ($b$) pre-calculated using `calculateB(liquidity, numOptions)` from `lmsr.ts` so that the math engine works correctly against mock data.

### Key Implementation Rules

1. **All mutations are synchronous in memory** — `Map.set()` operations wrapped in `async` signatures to match the interface contract.
2. **Ledger entries are append-only** — the mock never deletes from the ledger Map.
3. **Idempotency keys are tracked** — a `Set<string>` prevents duplicate financial operations.
4. **Position state transitions are enforced** — mock validates `open → partially_sold → closed` transitions.
5. **UUID generation** — use `crypto.randomUUID()` for all new record IDs.

---

# Server Actions

## Authentication

All Server Actions use real Clerk `auth()` to obtain the authenticated `userId`. Unauthenticated requests are rejected immediately. This is production-ready code, not stubbed.

```typescript
import { auth } from '@clerk/nextjs/server';

const { userId } = await auth();
if (!userId) {
  return { success: false, error: 'Authentication required' };
}
```

---

## File: `lib/actions/trade-actions.ts`

### buyPositionAction

**Purpose:** Execute a complete buy trade from user request to persisted state.

**Execution order (matches prediction-engine.md §Buying Positions):**

1. **Validate authentication** — Clerk `auth()` to get `userId`.
2. **Validate account status** — check user is not suspended.
3. **Fetch market from repository** — `IMarketRepository.getMarketById()`.
4. **Validate market state** — must be `'open'`.
5. **Validate selected option** — must exist in market's options.
6. **Validate trade amount** — must be ≥ MIN_TRADE_AMOUNT, must not exceed MAX_TRADE_LIQUIDITY_RATIO of market liquidity.
7. **Fetch wallet** — `IWalletRepository.getWalletByUserId()`.
8. **Validate wallet balance** — available balance must cover trade amount.
9. **Fetch existing positions** — `IPositionRepository.getActivePositionInMarket()`.
10. **Validate Single-Outcome Exposure Invariant** — if user has active position in a *different* option of this market, reject atomically.
11. **Call `calculateBuyTrade()`** from `lmsr.ts` — get shares received, fee, updated probability vector.
12. **Persist state changes atomically:**
    - Deduct wallet `availableBalance` by `tradeAmount`.
    - Add `tradeAmount` to wallet `lockedBalance`.
    - Update market options with new `sharesOutstanding`, `probability`, `sharePrice`.
    - Create or update user position (increment `sharesOwned`, recalculate `averageEntryPrice`, set `investedAmount`).
    - Create ledger entry for the trade (`eventType: 'TRADE_BUY'`).
    - Create ledger entry for the fee (`eventType: 'TRADING_FEE'`).
    - Increment market `tradingVolume` and `totalTrades`.
    - Insert `market_activity` record.
13. **Return result** — shares received, new probability, estimated payout.

### sellPositionAction

**Purpose:** Execute a complete sell trade.

**Execution order (matches prediction-engine.md §Selling Positions):**

1. **Validate authentication.**
2. **Fetch market** — must be `'open'`.
3. **Fetch position** — `IPositionRepository.getPositionByUserAndOption()`.
4. **Validate share quantity** — `sharesToSell` must be > 0 and ≤ `position.sharesOwned`.
5. **Call `calculateSellTrade()`** from `lmsr.ts`.
6. **Persist state changes atomically:**
    - Calculate proportional invested amount: `(sharesToSell / position.sharesOwned) * position.investedAmount`.
    - Deduct proportional invested amount from wallet `lockedBalance`.
    - Credit wallet `availableBalance` by `netProceeds`.
    - Update market options with new `sharesOutstanding`, `probability`, `sharePrice`.
    - Update position `sharesOwned`, `state` (`'partially_sold'` or `'closed'`), `realizedProfitLoss`.
    - Create ledger entries for proceeds and fee.
    - Increment market volume and trades.
    - Insert market activity.
7. **Return result** — net proceeds, realized P&L.

---

## File: `lib/actions/market-actions.ts` (modifications)

### createMarketAction

Extends existing `prepareMarketCreationData()` with actual persistence:

1. Call `prepareMarketCreationData()` (already implemented).
2. For 1v1 markets: accept two contestant names, auto-generate 4 options (`{name} YES`, `{name} NO` for each).
3. Persist market via `IMarketRepository.createMarket()`.
4. Create audit log via `IAuditLogRepository.createAuditLog()`.
5. Return created market ID.

### resolveMarketAction

1. Validate ALL CAPS title match via `validateResolutionPayload()` (already implemented).
2. Fetch all positions via `IPositionRepository.getPositionsByMarket()`.
3. Call `calculateSettlement()` from `lmsr.ts`.
4. **For each winning position:** move `investedAmount` from `lockedBalance`, credit `availableBalance` with payout, update position state to `'won'`, create settlement ledger entry.
5. **For each losing position:** deduct `investedAmount` from `lockedBalance`, update position state to `'lost'`, create ₦0 settlement ledger entry.
6. Update market state to `'resolved'`, set `winningOptionId` and `resolutionTime`.
7. Create audit log.

### cancelMarketAction

1. Fetch all active positions via `IPositionRepository.getPositionsByMarket()`.
2. Call `calculateRefunds()` from `lmsr.ts`.
3. **For each position:** move `investedAmount` from `lockedBalance` to `availableBalance`, update position state to `'cancelled'`, create refund ledger entry.
4. Update market state to `'cancelled'`.
5. Create audit log.

---

## File: `lib/actions/wallet-actions.ts` (new)

### requestWithdrawalAction

1. Validate authentication.
2. Fetch wallet.
3. Validate `amount` ≤ `availableBalance`.
4. Calculate withdrawal fee: `max(amount * 0.03, 150)`.
5. Deduct `availableBalance` immediately (lockedBalance is NOT touched — it's only for trading).
6. Create ledger entries for withdrawal and fee.
7. Return withdrawal request reference.

### processDepositAction

1. Validate webhook signature (Paystack — stubbed for now).
2. Credit `availableBalance`.
3. Create ledger entry (`eventType: 'DEPOSIT'`).

---

# How to Swap Mock for InstantDB (Future AI Guide)

This section is the **handoff guide** for a future developer or AI that sets up InstantDB and needs to replace the mock layer.

## Step 1: Create `lib/repositories/instantdb-repository.ts`

Implement every interface from `lib/repositories/types.ts` using InstantDB's admin SDK:

```typescript
// Example pattern for a single method:
import { adminDb } from '@/lib/instant-admin';

class InstantDBMarketRepository implements IMarketRepository {
  async getMarketById(marketId: string): Promise<Market | null> {
    const result = await adminDb.query({
      markets: {
        options: {},
        $: { where: { id: marketId } },
      },
    });
    const raw = result.markets?.[0];
    if (!raw) return null;
    return adaptInstantMarketToEngineMarket(raw);
  }

  async updateMarketOptions(marketId: string, updates: OptionBatchUpdate[]): Promise<void> {
    // Use adminDb.transact() for atomic batch:
    await adminDb.transact(
      updates.map((u) =>
        adminDb.tx.market_options[u.optionId].update({
          sharesOutstanding: u.sharesOutstanding,
          probability: u.probability,
          sharePrice: u.sharePrice,
        })
      )
    );
  }
  // ... implement remaining methods
}
```

## Step 2: Create an adapter function

The InstantDB schema stores data in a flat graph structure. The engine expects typed `Market` objects with nested `options: MarketOption[]`. Create adapter functions:

```typescript
function adaptInstantMarketToEngineMarket(raw: InstantMarketRow): Market {
  return {
    id: raw.id,
    title: raw.title,
    // ... map all fields
    options: (raw.options || []).map(adaptInstantOptionToEngineOption),
  };
}
```

> **Important**: The adapter already partially exists in `lib/market-adapter.ts` (`adaptMarketToCardProps`). The new adapter maps to `Market` (engine type) not `MarketCardProps` (UI type). Do not merge them — they serve different architectural layers.

## Step 3: Swap the import

In `lib/repositories/index.ts`, change:

```diff
- export { mockRepository as repository } from './mock-repository';
+ export { instantDbRepository as repository } from './instantdb-repository';
```

Every Server Action imports from `lib/repositories` and will automatically use InstantDB.

## Step 4: Atomic transactions

InstantDB supports `adminDb.transact()` for batched atomic writes. Every trade action (buy/sell/settle/refund) must use a single `transact()` call containing **all** mutations:

```typescript
await adminDb.transact([
  adminDb.tx.wallets[walletId].update({ availableBalance: newBalance }),
  adminDb.tx.market_options[optionId].update({ sharesOutstanding, probability, sharePrice }),
  adminDb.tx.positions[positionId].update({ sharesOwned, state }),
  adminDb.tx.ledger[newLedgerId].update({ ...ledgerEntry }),
  adminDb.tx.market_activity[newActivityId].update({ ...activityRecord }),
  adminDb.tx.markets[marketId].update({ tradingVolume, totalTrades }),
]);
```

This ensures that if any part fails, no partial state is written.

## Step 5: Add displayVariant to InstantDB schema

Add the `displayVariant` field to the `markets` entity in `instant.schema.ts`:

```typescript
markets: i.entity({
  // ... existing fields ...
  displayVariant: i.string().optional(), // "binary" | "1v1" | "standard" — UI hint only
}),
```

## Step 6: Realtime hooks

The existing `useMarkets` hook already queries InstantDB and will automatically receive live updates when Server Actions commit mutations. No hook changes needed.

For portfolio and wallet, create:
- `lib/hooks/use-portfolio.ts` — queries `positions` where `userId` matches current user and joins `market` + `market_options` for live valuation.
- `lib/hooks/use-wallet.ts` — queries `wallets` where `userId` matches current user.

## Step 7: Remove seed data

Once InstantDB is live, the seed data in `mock-repository.ts` is no longer needed for production. However, keep the file for local development and testing.

---

# Verification Checklist

Before considering this integration complete, verify:

- [ ] All repository interfaces are defined in `lib/repositories/types.ts`.
- [ ] Mock repository implements every interface method.
- [ ] Seed data includes 1 binary market, 1 1v1 market (4 options), 1 multi-option market (3 options), 2 user wallets, and 1 existing position.
- [ ] Seed market `liquidityParam` values are calculated via `calculateB()`.
- [ ] `buyPositionAction` follows the exact 15-step order from `prediction-engine.md`.
- [ ] Buy trades move funds from `availableBalance` to `lockedBalance`.
- [ ] Sell trades move proportional invested amount from `lockedBalance` and credit `availableBalance` with net proceeds.
- [ ] `sellPositionAction` follows the exact 12-step order from `prediction-engine.md`.
- [ ] Single-Outcome Exposure Invariant is enforced in `buyPositionAction`.
- [ ] Every successful trade creates exactly one ledger entry for the trade and one for the fee.
- [ ] Wallet balances never go negative.
- [ ] Settlement pays ₦1.00 per winning share and moves `lockedBalance` → `availableBalance`.
- [ ] Settlement losses deduct from `lockedBalance` only.
- [ ] Cancellation refunds 100% of invested capital from `lockedBalance` to `availableBalance`.
- [ ] `resolveMarketAction` requires ALL CAPS title confirmation.
- [ ] Probability sum always equals 100% after every trade.
- [ ] No financial mutation happens without a corresponding ledger entry.
- [ ] Withdrawal requests deduct from `availableBalance` only — never touch `lockedBalance`.
- [ ] Server Actions use real Clerk `auth()`.
- [ ] TypeScript compilation succeeds (`npx tsc --noEmit`).
- [ ] `npm run build` succeeds with zero errors.

---

# File Inventory

| File | Status | Purpose |
|------|--------|---------|
| `lib/repositories/types.ts` | NEW | Repository interface definitions |
| `lib/repositories/mock-repository.ts` | NEW | In-memory mock implementation with seed data |
| `lib/repositories/index.ts` | NEW | Re-exports active repository (mock now, InstantDB later) |
| `lib/actions/trade-actions.ts` | NEW | Buy and sell Server Actions |
| `lib/actions/wallet-actions.ts` | NEW | Deposit and withdrawal Server Actions |
| `lib/actions/market-actions.ts` | MODIFY | Add persistence calls for create, resolve, cancel |
| `lib/prediction-engine/lmsr.ts` | NO CHANGE | Algorithm is complete |
| `lib/prediction-engine/types.ts` | NO CHANGE | Engine types are complete |

---

# Non-Goals

This specification does NOT cover:

- InstantDB setup and configuration (separate task).
- Paystack webhook integration (separate task).
- UI component wiring to Server Actions (separate task, follows this one).
- Reactive hooks for portfolio and wallet (created during UI wiring phase).
- Background jobs for automated market closure (separate task).
