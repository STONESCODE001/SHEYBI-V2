# Feature Specification: Full InstantDB & Prediction Engine Integration

> **Feature Target**: Complete DB & LMSR Engine Wireup across UI, Trading, Portfolio, Wallet & Admin  
> **Status**: Draft / Spec  
> **Target Version**: 4.0.0  
> **File Location**: `context/feature-specs/13-full-instantdb-prediction-engine-integration.md`  

---

## 1. Goal

The goal of this specification is to transition the Sheybi application from fallback mock datasets to **100% live InstantDB real-time data** and bind the **LMSR Prediction Engine** (`lib/prediction-engine/lmsr.ts`) directly to InstantDB database entities.

### Core Objectives
1. **Live Realtime Feed**: Replace all static mock fallbacks on `/`, `/markets`, `/markets/[id]`, `/wallet`, `/portfolio`, and `/admin` with live InstantDB `useQuery` reactive subscriptions.
2. **LMSR Prediction Engine Binding**: Execute all trade math (shares, probabilities, share prices, 2.5% trading fee) through `lmsr.ts` and commit changes via atomic InstantDB transactions (`adminDb.transact`).
3. **Double-Entry Financial Ledger**: Write immutable accounting journal records (`DEPOSIT`, `WITHDRAWAL`, `TRADE_BUY`, `TRADE_SELL`, `TRADING_FEE`, `SETTLEMENT_WIN`) for every financial action.
4. **Single-Outcome Exposure Invariant**: Enforce at the database level that a user cannot hold opposing active positions in the same market.
5. **Live Admin Management Workspace**: Wire `CreateMarketDialog`, `PauseMarketDialog`, `ReopenMarketDialog`, `ResolveMarketDialog`, and `WithdrawalActionDialog` directly to InstantDB server actions.

---

## 2. Architecture & Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface Layer                     │
│  (Homepage, Markets Feed, Trade Dialog, Wallet, Admin UI)   │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            │                                     │
            ▼                                     ▼
┌───────────────────────┐             ┌───────────────────────┐
│ Realtime Client Hooks │             │    Server Actions     │
│ (db.useQuery react)   │             │ (executeBuyTrade, etc)│
└───────────┬───────────┘             └───────────┬───────────┘
            │                                     │
            │                                     ▼
            │                         ┌───────────────────────┐
            │                         │   Prediction Engine   │
            │                         │       (lmsr.ts)       │
            │                         └───────────┬───────────┘
            │                                     │
            ▼                                     ▼
┌─────────────────────────────────────────────────────────────┐
│                 InstantDB Repository Layer                  │
│       (lib/repositories/instantdb-repository.ts)            │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│               InstantDB Cloud Graph Database                │
│    ($users, markets, market_options, positions, wallets,    │
│           ledger, deposits, withdrawal_requests)            │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Detailed Component Integration Requirements

### 3.1 Market Feed & Category Real-Time Sync
- `useMarkets` hook ([`lib/hooks/use-markets.ts`](file:///c:/Users/THE%20LAPTOP%20STORE/Desktop/SHEYBI-V2/lib/hooks/use-markets.ts)) queries `markets` and `options` via InstantDB `db.useQuery`.
- `useCategories` hook ([`lib/hooks/use-categories.ts`](file:///c:/Users/THE%20LAPTOP%20STORE/Desktop/SHEYBI-V2/lib/hooks/use-categories.ts)) queries active `categories`.
- `adaptMarketToCardProps` converts raw graph objects into `MarketCardProps` (with formatted Naira odds like `₦500` and percentage bars).
- Homepage (`app/page.tsx`) and Markets Page (`app/markets/page.tsx`) display live seeded markets (*Kellyrae BBNaija*, *Wanni vs Anita 1v1*, *Eviction Night Multi-Option*).

### 3.2 Live Trading Panel & TradeDialog
- User opens `TradeDialog` on a market outcome and enters stake amount $S$ (minimum $₦500$).
- Submitting the trade calls `executeBuyTradeAction(marketId, optionId, amount)` Server Action:
  1. Validates user authentication via Clerk `auth()`.
  2. Fetches market and option details from InstantDB (`repository.markets.getMarketById`).
  3. Verifies `availableBalance >= S`.
  4. Runs LMSR math `calculateBuyTrade()` in `lmsr.ts`.
  5. Enforces Single-Outcome Exposure Invariant.
  6. Commits atomic batch to InstantDB via `adminDb.transact()`:
     - `wallets`: `availableBalance -= S`, `lockedBalance += S`.
     - `market_options`: `sharesOutstanding += Δq_i`, `probability = newProb`, `sharePrice = newPrice`.
     - `positions`: Upserts user position (`sharesOwned += Δq_i`, `investedAmount += S`).
     - `ledger`: Creates `TRADE_BUY` and `TRADING_FEE` accounting records.
     - `market_activity`: Logs trade event in market activity feed.

### 3.3 Wallet & Financial Statement Sync
- `/wallet` page queries `repository.wallets.getWalletByUserId(userId)` and `repository.ledger.getLedgerEntriesByUser(userId)`:
  - Renders live **Available Balance** ($₦$), **Locked Balance** ($₦$), and total **Portfolio Value**.
  - Displays immutable Double-Entry Ledger transaction history table (Deposits, Withdrawals, Trades, Fees).
- Paystack Virtual Account Deposits trigger `processDepositAction`:
  - Credits `availableBalance += deposit`.
  - Records `DEPOSIT` ledger entry with payment reference idempotency key.

### 3.4 Portfolio Position & PnL Tracking
- `/portfolio` page queries `repository.positions.getPositionsByUser(userId)`:
  - Displays open positions with current share counts, average entry price, total invested amount, and estimated current payout.
  - Displays closed/settled positions with realized PnL.

### 3.5 Admin Control Workspace Integration
- `/admin` page connects control dialogs directly to server actions:
  - **Create Market**: `createMarketAction` creates `markets` record with initial liquidity $L$ and computes LMSR parameter $b = \frac{L}{N \ln N}$.
  - **Pause/Reopen Market**: `pauseMarketAction` / `reopenMarketAction` updates market state.
  - **Resolve Market**: `resolveMarketAction(marketId, winningOptionId)`:
    1. Computes winning payouts ($₦1.00$ per share).
    2. Credits winning users' `availableBalance += payout`, unlocks `lockedBalance -= investedAmount`.
    3. Unlocks losing users' `lockedBalance -= investedAmount` (zero payout).
    4. Marks positions `settlementStatus = 'settled'`.
    5. Records `SETTLEMENT_WIN` ledger entries.
  - **Withdrawal Requests Review**: `approveWithdrawalAction` / `rejectWithdrawalAction` manages pending withdrawals and refunds.

---

## 4. Verification Checklist

- [ ] **Realtime Data Sync**: Verify that homepage and markets page render live InstantDB markets with zero mock data dependency.
- [ ] **Live Trading Flow**: Execute a ₦1,000 prediction trade on a binary market and verify that option probabilities and share prices adjust instantly according to LMSR formulas.
- [ ] **Wallet Balance Integrity**: Verify that `availableBalance` deducts immediately upon trade and `lockedBalance` increases by exact stake amount.
- [ ] **Ledger Compliance**: Verify that every trade creates `TRADE_BUY` and `TRADING_FEE` journal entries in the `ledger` entity.
- [ ] **Single-Outcome Exposure Safety**: Attempt to purchase an opposing option in a market where the user holds an active position and verify the system blocks the trade.
- [ ] **Admin Resolution & Payout**: Resolve a market in the admin dashboard and verify winning user wallets receive full payouts ($1.00$ per winning share).
