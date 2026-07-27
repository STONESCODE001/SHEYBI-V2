# Prediction Algorithm Specification

> Version: 1.0.0
> Status: Draft
> Owner: Prediction Engine
> Depends on: prediction-engine.md, database-schema.md, architecture.md

---

# Overview

This document defines the **mathematical algorithm** that powers the Sheybi Prediction Engine.

It specifies every formula, calculation step, and numerical invariant required to implement:

- Dynamic market pricing
- Share calculation (buy and sell)
- Probability updates
- Position valuation
- Settlement payouts
- Fee integration
- Trade previews

This document is the single source of truth for **how** the Prediction Engine performs calculations.

**Business rules** (what the engine does, when, and under what conditions) belong to `prediction-engine.md`.

**Database persistence** belongs to `database-schema.md`.

**Communication contracts** belong to `api-contracts.md`.

This document defines only the mathematical model and its computational procedures.

---



# Pricing Model

## Algorithm: LMSR (Logarithmic Market Scoring Rule)

Sheybi uses the **Logarithmic Market Scoring Rule (LMSR)** as its automated market maker.

LMSR was created by Robin Hanson and is the industry standard for prediction market pricing. It is used by Polymarket, Manifold Markets, and most production prediction platforms.

### Why LMSR

- **Mathematically proven** to produce coherent probabilities that always sum to 100%.
- **Smooth price curves** — prices change gradually, not in steps.
- **Bounded loss** — the platform's maximum loss is bounded and predictable.
- **Deterministic** — identical inputs always produce identical outputs.
- **Works for both binary and multi-option markets** without modification.
- **Resistant to manipulation** — large trades become progressively more expensive.

---

# Core Parameters

## Liquidity Parameter (b)

The liquidity parameter `b` controls how sensitive market prices are to trades.

- **Higher b** → prices move less per trade → more stable market → requires larger trades to move prices significantly.
- **Lower b** → prices move more per trade → more volatile market → small trades cause large price swings.

### Admin-Facing Liquidity

Administrators configure liquidity as a **Naira amount** (the `liquidity` field on the Market entity).

The system converts this Naira amount into the LMSR `b` parameter automatically.

### Conversion Formula

For a market with `N` options and admin-assigned liquidity `L` (in Naira):

```
b = L / (N * ln(N))
```

Where `ln` is the natural logarithm.

**Examples:**

| Market Type | Options (N) | Admin Liquidity (L) | b |
|-------------|-------------|---------------------|---|
| Binary | 2 | ₦10,000 | ₦10,000 / (2 × ln(2)) ≈ ₦7,213 |
| Binary | 2 | ₦50,000 | ₦50,000 / (2 × ln(2)) ≈ ₦36,067 |
| Binary | 2 | ₦100,000 | ₦100,000 / (2 × ln(2)) ≈ ₦72,135 |
| Multi (3) | 3 | ₦50,000 | ₦50,000 / (3 × ln(3)) ≈ ₦15,172 |
| Multi (4) | 4 | ₦100,000 | ₦100,000 / (4 × ln(4)) ≈ ₦18,033 |
| Multi (5) | 5 | ₦100,000 | ₦100,000 / (5 × ln(5)) ≈ ₦12,426 |

### Liquidity Invariant

Once a market enters the `Open` state, the `b` parameter is fixed for the lifetime of the market. It cannot change.

### Recommended Liquidity Range

| Market Size | Recommended Liquidity |
|-------------|----------------------|
| Small / Low interest | ₦10,000 – ₦25,000 |
| Medium / Standard | ₦25,000 – ₦75,000 |
| Large / Featured | ₦75,000 – ₦200,000 |

Administrators should choose higher liquidity for high-profile markets to prevent excessive price swings from individual trades.

---

## Outstanding Shares Vector (q)

Each market maintains a vector `q` of outstanding shares, one entry per option.

```
q = [q₁, q₂, ..., qₙ]
```

Where `qᵢ` is the total number of shares outstanding for option `i`.

### Initial State

When a market is created, all outstanding shares start at zero:

```
q = [0, 0, ..., 0]
```

### Update Rules

- **Buying** `Δ` shares of option `i` → `qᵢ = qᵢ + Δ`
- **Selling** `Δ` shares of option `i` → `qᵢ = qᵢ - Δ`
- `qᵢ` must never become negative.

---

# LMSR Cost Function

The LMSR cost function `C(q)` represents the total amount the market maker has collected from all trades, given the current outstanding shares vector `q`.

## Formula

```
C(q) = b × ln(Σ e^(qᵢ / b))
```

Where:
- `b` is the liquidity parameter
- `qᵢ` is the outstanding shares for option `i`
- `Σ` sums over all options `i = 1` to `N`
- `e` is Euler's number (≈ 2.71828)
- `ln` is the natural logarithm

### Initial Cost

When all shares are zero:

```
C([0, 0, ..., 0]) = b × ln(N)
```

Where `N` is the number of options.

This value represents the initial subsidy provided by the platform's liquidity.

---

# Price (Instantaneous)

The **instantaneous price** of option `i` is the partial derivative of the cost function with respect to `qᵢ`.

## Formula

```
price(i) = e^(qᵢ / b) / Σ e^(qⱼ / b)
```

Where the sum `Σ` is over all options `j = 1` to `N`.

### Properties

- Price is always between 0 and 1 (exclusive, enforced by probability bounds).
- The sum of all option prices always equals exactly 1.
- Price equals the market's implied probability for that option.
- Price increases when shares of option `i` are purchased.
- Price decreases when shares of option `i` are sold.

### Display Conversion

- **Probability display**: `price(i) × 100` → shown as a percentage (e.g., 65.3%).
- **Share price display**: `price(i) × 1` → shown in Naira (e.g., ₦0.653).

Since winning shares pay ₦1.00, the share price IS the probability expressed in Naira.

---

# Probability

## Definition

Probability and price are identical in LMSR:

```
probability(i) = price(i) = e^(qᵢ / b) / Σ e^(qⱼ / b)
```

## Probability Sum Invariant

```
Σ probability(i) = 1.0000   (for all i = 1 to N)
```

This invariant must hold after every trade, without exception.

If floating-point arithmetic causes the sum to deviate, the implementation must normalize probabilities to restore the invariant before persisting.

## Probability Bounds

Probabilities are clamped to the range `[0.01, 0.99]` (1% to 99%).

No option may reach exactly 0% or 100% probability before market resolution.

### Enforcement

If a trade would cause any option's probability to fall below 1% or exceed 99%, the trade is rejected.

The trade does not partially execute. The entire trade is rejected.

This prevents:
- Options from becoming untradeable.
- Share prices from reaching ₦0.00 or ₦1.00 (which would make settlement undefined).
- Probability sum invariant violations.

---

# Buying Shares

## Overview

When a user buys shares, they pay the **cost difference** — the change in the LMSR cost function before and after adding their shares.

## Input

- `optionIndex`: which option to buy (index `i`)
- `tradeAmount`: the total Naira amount the user wants to spend (gross)

## Calculation Steps

### Step 1: Deduct Trading Fee

```
fee = tradeAmount × 0.025
netAmount = tradeAmount - fee
```

The `netAmount` is the actual Naira used to purchase shares.

### Step 2: Calculate Shares Received

The number of shares `Δ` purchased with `netAmount` of Naira is found by solving:

```
C(q + Δeᵢ) - C(q) = netAmount
```

Where `eᵢ` is the unit vector for option `i` (adding `Δ` shares only to option `i`).

Expanding:

```
b × ln(Σⱼ e^((qⱼ + Δ × δᵢⱼ) / b)) - b × ln(Σⱼ e^(qⱼ / b)) = netAmount
```

Where `δᵢⱼ` is the Kronecker delta (1 if j = i, 0 otherwise).

This simplifies to solving for `Δ`:

```
b × ln((Σⱼ≠ᵢ e^(qⱼ / b) + e^((qᵢ + Δ) / b)) / (Σⱼ e^(qⱼ / b))) = netAmount
```

### Closed-Form Solution

Let:
```
S = Σⱼ e^(qⱼ / b)          (sum of all exponentials, before trade)
Eᵢ = e^(qᵢ / b)             (exponential for option i, before trade)
R = S - Eᵢ                   (sum of exponentials excluding option i)
```

Then the shares received `Δ` can be solved in closed form:

```
Δ = b × ln((S × e^(netAmount / b) - R) / Eᵢ)
```

### Validity Check

After computing `Δ`:

1. `Δ` must be positive. If `Δ ≤ 0`, the trade is invalid — reject.
2. The new probability for option `i` must not exceed 99%. If it does — reject the entire trade.
3. No other option's probability may fall below 1%. If any does — reject the entire trade.

### Step 3: Update Outstanding Shares

```
qᵢ_new = qᵢ + Δ
```

### Step 4: Recalculate All Probabilities

For every option `j`:

```
probability(j) = e^(qⱼ_new / b) / Σₖ e^(qₖ_new / b)
```

### Step 5: Calculate Average Purchase Price

```
averagePurchasePrice = netAmount / Δ
```

This represents the average cost per share for this specific trade.

### Step 6: Calculate Estimated Payout (for display)

```
estimatedPayout = Δ × 1.00
```

Since each winning share pays ₦1.00.

### Step 7: Calculate Estimated Profit (for display)

```
estimatedProfit = estimatedPayout - tradeAmount
```

Note: Uses `tradeAmount` (gross), not `netAmount`, because the fee is a real cost to the user.

---

# Selling Shares

## Overview

When a user sells shares, they receive the **reverse cost difference** — the change in the LMSR cost function from removing their shares. The fee is then deducted from the proceeds.

## Input

- `optionIndex`: which option to sell (index `i`)
- `sharesToSell`: the number of shares `Δ` to sell

## Validation

- `sharesToSell` must be positive.
- `sharesToSell` must not exceed the user's current shares for that option.
- The resulting probability for option `i` must not fall below 1%.
- No other option's probability may exceed 99%.

## Calculation Steps

### Step 1: Calculate Gross Sale Proceeds

The gross proceeds from selling `Δ` shares of option `i`:

```
grossProceeds = C(q) - C(q - Δeᵢ)
```

Expanding:

```
grossProceeds = b × ln(Σⱼ e^(qⱼ / b)) - b × ln(Σⱼ e^((qⱼ - Δ × δᵢⱼ) / b))
```

Simplified:

Let:
```
S = Σⱼ e^(qⱼ / b)
Eᵢ = e^(qᵢ / b)
R = S - Eᵢ
Eᵢ_new = e^((qᵢ - Δ) / b)
S_new = R + Eᵢ_new
```

```
grossProceeds = b × ln(S / S_new)
```

### Step 2: Deduct Trading Fee

```
fee = grossProceeds × 0.025
netProceeds = grossProceeds - fee
```

The user receives `netProceeds` in their Available Balance.

### Step 3: Update Outstanding Shares

```
qᵢ_new = qᵢ - Δ
```

### Step 4: Recalculate All Probabilities

Same formula as buying:

```
probability(j) = e^(qⱼ_new / b) / Σₖ e^(qₖ_new / b)
```

### Step 5: Calculate Realized Profit/Loss

```
costBasis = Δ × averageEntryPrice
realizedPL = netProceeds - costBasis
```

Where `averageEntryPrice` is the user's weighted average purchase price for the shares being sold.

---

# Trade Preview

Before executing a trade, the system provides a preview showing expected outcomes.

## Buy Preview

Given `tradeAmount` and `optionIndex`:

Calculate (without persisting):

| Field | Formula |
|-------|---------|
| Fee | `tradeAmount × 0.025` |
| Net Amount | `tradeAmount - fee` |
| Shares Received | `Δ` (from buy formula) |
| Average Price Per Share | `netAmount / Δ` |
| New Probability | `probability(i)` after adding `Δ` shares |
| Estimated Payout | `Δ × 1.00` |
| Estimated Profit | `estimatedPayout - tradeAmount` |
| Potential ROI | `(estimatedProfit / tradeAmount) × 100` |

## Sell Preview

Given `sharesToSell` and `optionIndex`:

Calculate (without persisting):

| Field | Formula |
|-------|---------|
| Gross Proceeds | From reverse LMSR cost difference |
| Fee | `grossProceeds × 0.025` |
| Net Proceeds | `grossProceeds - fee` |
| New Probability | `probability(i)` after removing shares |
| Cost Basis | `sharesToSell × averageEntryPrice` |
| Realized P/L | `netProceeds - costBasis` |

---

# Position Valuation

## Current Market Value

The current market value of a user's position is:

```
currentMarketValue = sharesOwned × currentSharePrice
```

Where `currentSharePrice` is the instantaneous LMSR price for that option.

## Unrealized Profit/Loss

```
unrealizedPL = currentMarketValue - investedAmount
```

Where `investedAmount` is the total gross amount (including fees) the user has spent to acquire their current shares.

## Position Display Values

| Display Field | Formula |
|---------------|---------|
| Current Value | `sharesOwned × price(optionIndex)` |
| Cost Basis | `investedAmount` (stored on Position) |
| Unrealized P/L | `currentValue - costBasis` |
| P/L Percentage | `(unrealizedPL / investedAmount) × 100` |
| Shares Held | `sharesOwned` (stored on Position) |
| Avg Entry Price | `averageEntryPrice` (stored on Position) |

---

# Settlement

## Trigger

Settlement occurs immediately after an administrator resolves a market by selecting the winning option.

## Settlement Process

### Step 1: Identify Winning Option

```
winningOptionId = market.winningOptionId
```

### Step 2: Identify All Positions

Query all positions where `marketId = market.id`.

### Step 3: Settle Winning Positions

For each position where `optionId = winningOptionId`:

```
payout = position.sharesOwned × 1.00
```

Each winning share pays exactly **₦1.00**.

- Credit `payout` to the user's Available Balance.
- Set `position.state = "Won"`.
- Set `position.settlementStatus = "Settled"`.
- Set `position.realizedProfitLoss = payout - position.investedAmount`.
- Create a Wallet Transaction (type: Settlement, amount: payout).
- Create a Ledger Entry.
- Create a Notification.

### Step 4: Settle Losing Positions

For each position where `optionId ≠ winningOptionId`:

```
payout = 0
```

- Set `position.state = "Lost"`.
- Set `position.settlementStatus = "Settled"`.
- Set `position.realizedProfitLoss = 0 - position.investedAmount`.
- Create a Notification.

No wallet credit occurs for losing positions.

### Step 5: Update Market

- Set `market.state = "Resolved"`.
- Set `market.winningOptionId`.
- Set winning `marketOption.isWinningOption = true`.
- Set `market.resolutionTime = currentTimestamp`.

### Settlement Invariants

- Every position in the market must be settled. No position may remain in `Open` or `Partially Sold` state after settlement.
- Settlement executes exactly once per market.
- Settlement is irreversible.
- Total payouts ≤ total collected from trades + platform liquidity. (The LMSR guarantees this.)

---

# Market Cancellation Refund

When a market is cancelled, all users with open positions receive full refunds of their invested amount.

## Refund Calculation

For each position in the cancelled market:

```
refundAmount = position.investedAmount
```

- Credit `refundAmount` to the user's Available Balance.
- Set `position.state = "Cancelled"`.
- Set `position.settlementStatus = "Settled"`.
- Create a Wallet Transaction (type: Refund).
- Create a Ledger Entry.
- Create a Notification.

### Refund Invariant

Refunds return the user's original invested amount. Trading fees are **not** refunded.

---

# Trade Limits

## Minimum Trade Amount

```
MINIMUM_TRADE_AMOUNT = ₦500
```

Any trade below ₦500 is rejected.

## Maximum Trade Amount

Trade size is subject to two limits, whichever is lower:

### 1. Wallet Balance Limit

The user cannot spend more than their Available Balance.

### 2. Liquidity-Relative Cap

```
MAX_TRADE_PER_TRANSACTION = market.liquidity × 0.20
```

No single trade may exceed **20% of the market's assigned liquidity**. This prevents a single trade from excessively skewing the market.

**Example:**

| Market Liquidity | Max Trade Per Transaction |
|------------------|--------------------------|
| ₦10,000 | ₦2,000 |
| ₦50,000 | ₦10,000 |
| ₦100,000 | ₦20,000 |
| ₦200,000 | ₦40,000 |

Users may place multiple trades to exceed the per-transaction limit, but each trade independently moves the price, providing natural cost averaging.

### Configurable Override

The 20% cap percentage is stored as a System Setting (`maxTradePercentage`). Administrators may adjust this value without code changes.

---

# Numerical Precision

## Decimal Rules

| Value | Precision |
|-------|-----------|
| Naira amounts | `Decimal(18, 4)` — 4 decimal places |
| Probabilities | `Decimal(7, 4)` — 4 decimal places (e.g., 0.6530) |
| Share quantities | `Decimal(18, 4)` — 4 decimal places |
| Share prices | `Decimal(18, 4)` — 4 decimal places |
| LMSR `b` parameter | `Decimal(18, 4)` |
| Intermediate calculations | `Float64` (double precision) minimum |

## Rounding Rules

- All stored Naira values are rounded to 4 decimal places using **banker's rounding** (round half to even).
- Probabilities are rounded to 4 decimal places after every calculation.
- After rounding, the probability sum invariant must be restored by adjusting the largest probability value.
- Share quantities are rounded to 4 decimal places.
- Fees are rounded **up** to the nearest 4th decimal place (ceiling). This ensures the platform never under-collects fees.

## Numerical Overflow Protection

- The LMSR exponential `e^(qᵢ / b)` can overflow for large `qᵢ`. Implementations must use the **log-sum-exp trick**:

```
max_q = max(q₁/b, q₂/b, ..., qₙ/b)
C(q) = b × (max_q + ln(Σ e^(qᵢ/b - max_q)))
```

This keeps all exponents within a safe numerical range.

- All probability calculations must use the same log-sum-exp stabilization.

---

# Invariant Summary

Every implementation of the Prediction Algorithm must satisfy these invariants at all times.

## Probability Invariants

| # | Invariant |
|---|-----------|
| P1 | Sum of all option probabilities equals exactly 1.0000 |
| P2 | Every option probability is between 0.01 and 0.99 inclusive |
| P3 | Buying increases the purchased option's probability |
| P4 | Selling decreases the sold option's probability |
| P5 | Probability equals instantaneous LMSR price |

## Financial Invariants

| # | Invariant |
|---|-----------|
| F1 | Wallet balances never become negative |
| F2 | Shares owned never become negative |
| F3 | Total settlement payouts ≤ total collected + platform liquidity |
| F4 | Every trade creates exactly one ledger entry |
| F5 | Fees are always deducted (never skipped) |
| F6 | Fee = trade value × 0.025 |
| F7 | Winning shares pay exactly ₦1.00 each |
| F8 | Losing shares pay exactly ₦0.00 |

## Market Invariants

| # | Invariant |
|---|-----------|
| M1 | Liquidity parameter `b` is fixed after market opens |
| M2 | Outstanding shares vector `q` is updated atomically with every trade |
| M3 | No trade executes on closed, resolved, or cancelled markets |
| M4 | Settlement processes every position exactly once |
| M5 | Refunds return investedAmount (fees not refunded) |

## Determinism Invariants

| # | Invariant |
|---|-----------|
| D1 | Identical inputs + identical market state = identical outputs |
| D2 | Trade preview calculations match execution calculations exactly |
| D3 | All formulas use the same precision rules |

---

# Worked Examples

## Example 1: Binary Market — First Trade

**Setup:**
- Binary market (YES / NO)
- Liquidity: ₦50,000
- `b = 50000 / (2 × ln(2)) ≈ 36,067.38`
- Initial: `q = [0, 0]`
- Initial probabilities: `[50%, 50%]`

**Trade:** User buys ₦1,000 worth of YES shares.

**Step 1 — Fee:**
```
fee = 1000 × 0.025 = ₦25.00
netAmount = 1000 - 25 = ₦975.00
```

**Step 2 — Calculate shares:**
```
S = e^(0/b) + e^(0/b) = 1 + 1 = 2
Eᵢ = e^(0/b) = 1
R = 2 - 1 = 1

Δ = b × ln((S × e^(netAmount/b) - R) / Eᵢ)
Δ = 36067.38 × ln((2 × e^(975/36067.38) - 1) / 1)
Δ = 36067.38 × ln(2 × 1.02740 - 1)
Δ = 36067.38 × ln(1.05481)
Δ = 36067.38 × 0.05334
Δ ≈ 1923.81 shares
```

**Step 3 — New state:**
```
q = [1923.81, 0]
```

**Step 4 — New probabilities:**
```
p(YES) = e^(1923.81/36067.38) / (e^(1923.81/36067.38) + e^(0/36067.38))
p(YES) = 1.05481 / (1.05481 + 1)
p(YES) ≈ 0.5134 → 51.34%

p(NO) = 1 / 2.05481 ≈ 0.4866 → 48.66%
```

**Step 5 — Average price:**
```
averagePrice = 975 / 1923.81 ≈ ₦0.5068
```

**Step 6 — Estimated payout:**
```
estimatedPayout = 1923.81 × 1.00 = ₦1,923.81
```

**Step 7 — Estimated profit:**
```
estimatedProfit = 1923.81 - 1000 = ₦923.81
```

---

## Example 2: Selling Shares

**Setup (continuing from Example 1):**
- `q = [1923.81, 0]`
- User owns 1923.81 YES shares
- User sells 500 shares

**Step 1 — Gross proceeds:**
```
S = e^(1923.81/36067.38) + e^(0/36067.38) = 1.05481 + 1 = 2.05481
Eᵢ = e^(1923.81/36067.38) = 1.05481
Eᵢ_new = e^((1923.81 - 500)/36067.38) = e^(1423.81/36067.38) = e^(0.03947) ≈ 1.04027
S_new = (2.05481 - 1.05481) + 1.04027 = 1 + 1.04027 = 2.04027

grossProceeds = 36067.38 × ln(2.05481 / 2.04027)
grossProceeds = 36067.38 × ln(1.00713)
grossProceeds = 36067.38 × 0.007104
grossProceeds ≈ ₦256.21
```

**Step 2 — Fee:**
```
fee = 256.21 × 0.025 = ₦6.41
netProceeds = 256.21 - 6.41 = ₦249.80
```

**Step 3 — New state:**
```
q = [1423.81, 0]
```

**Step 4 — New probabilities:**
```
p(YES) = 1.04027 / 2.04027 ≈ 0.5099 → 50.99%
p(NO) = 1 / 2.04027 ≈ 0.4901 → 49.01%
```

---

## Example 3: Multi-Option Market

**Setup:**
- 4-option market (A, B, C, D)
- Liquidity: ₦100,000
- `b = 100000 / (4 × ln(4)) ≈ 18,033.69`
- Initial: `q = [0, 0, 0, 0]`
- Initial probabilities: `[25%, 25%, 25%, 25%]`

**Trade:** User buys ₦2,000 worth of option A.

```
fee = 2000 × 0.025 = ₦50
netAmount = 2000 - 50 = ₦1,950

S = 4 × e^(0/b) = 4
Eᵢ = 1
R = 3

Δ = 18033.69 × ln((4 × e^(1950/18033.69) - 3) / 1)
Δ = 18033.69 × ln(4 × 1.11438 - 3)
Δ = 18033.69 × ln(4.45754 - 3)
Δ = 18033.69 × ln(1.45754)
Δ = 18033.69 × 0.37775
Δ ≈ 6,812.45 shares
```

**New probabilities:**
```
e^(6812.45/18033.69) = e^(0.37775) ≈ 1.45917
S_new = 1.45917 + 1 + 1 + 1 = 4.45917

p(A) = 1.45917 / 4.45917 ≈ 0.3272 → 32.72%
p(B) = p(C) = p(D) = 1 / 4.45917 ≈ 0.2243 → 22.43%

Sum: 32.72 + 22.43 + 22.43 + 22.43 = 100.01%
(After normalization: 32.71 + 22.43 + 22.43 + 22.43 = 100.00%)
```

---

## Example 4: Settlement

**Setup:**
- Binary market resolved with YES as winner.
- User A: 1923.81 YES shares, invested ₦1,000
- User B: 3500 NO shares, invested ₦2,000

**Settlement:**

User A (Winner):
```
payout = 1923.81 × ₦1.00 = ₦1,923.81
realizedPL = 1923.81 - 1000 = +₦923.81
```

User B (Loser):
```
payout = ₦0.00
realizedPL = 0 - 2000 = -₦2,000.00
```

---

# Position Average Price Update

When a user buys additional shares of an option they already hold, the average entry price must be recalculated.

## Formula

```
newAverageEntryPrice = (existingInvestedAmount + newNetAmount) / (existingShares + newShares)
```

Where:
- `existingInvestedAmount` = `position.investedAmount` before this trade
- `newNetAmount` = the `netAmount` from this trade (after fee deduction)
- `existingShares` = `position.sharesOwned` before this trade
- `newShares` = `Δ` from this trade

The `investedAmount` is updated:

```
position.investedAmount = existingInvestedAmount + tradeAmount
```

Note: `investedAmount` tracks the **gross** amount spent (including fees), because fees are a real cost to the user.

---

# Fee Accounting

## Trading Fee

```
feeRate = 0.025 (2.5%)
```

### On Buy

```
fee = tradeAmount × feeRate
netAmount = tradeAmount - fee
```

The `netAmount` purchases shares.

### On Sell

```
fee = grossProceeds × feeRate
netProceeds = grossProceeds - fee
```

The user receives `netProceeds`.

### Fee Destination

Trading fees are credited to the **Platform Fee Account** in the Ledger.

Each fee generates its own Ledger entry with:
- `sourceAccountId` = user's wallet
- `destinationAccountId` = platform fee account
- `eventType` = `TRADING_FEE`
- `debit` = fee amount
- `credit` = fee amount

---

# Edge Cases

## Trade That Would Breach Probability Bounds

If a buy would push any option above 99% or below 1%, the trade is **rejected entirely**. No partial execution.

## User Sells All Shares

If a user sells 100% of their shares for an option:
- `position.state` transitions to `Closed`.
- `position.sharesOwned = 0`.
- `position.currentMarketValue = 0`.
- The position remains in the database permanently.

## Market With No Trades

If a market resolves with zero trades:
- No positions exist.
- No settlements occur.
- Market transitions to `Resolved` with no financial side effects.

## Numerical Precision Edge Case

If the computed fee rounds to ₦0.0000 (e.g., on a very small trade), enforce the minimum fee:

```
fee = max(fee, 0.0001)
```

This prevents zero-fee trades.

---

# Implementation Notes

These notes guide implementation without prescribing specific code.

## Log-Sum-Exp Stability

Always implement LMSR using the log-sum-exp trick to prevent overflow:

```
function logSumExp(values: number[]): number {
  const max = Math.max(...values);
  return max + Math.log(values.reduce((sum, v) => sum + Math.exp(v - max), 0));
}
```

## Atomic Transactions

Every trade must be executed as a single atomic transaction:

1. Validate inputs
2. Calculate shares/proceeds
3. Update wallet
4. Update position
5. Update market option (shares, probability, price)
6. Update trading volume
7. Create wallet transaction
8. Create ledger entry
9. Create position history

If any step fails, the entire transaction rolls back. No partial state changes.

## Concurrency

The Prediction Engine must handle concurrent trades safely. Two users buying the same option simultaneously must produce correct results as if the trades were serialized.

Recommended: Serialize trades per market using database-level locking or optimistic concurrency with retry.

---

# Glossary

| Term | Definition |
|------|------------|
| LMSR | Logarithmic Market Scoring Rule — the automated market maker algorithm |
| b | Liquidity parameter — controls price sensitivity |
| q | Outstanding shares vector — tracks total shares per option |
| C(q) | Cost function — total amount collected by the market maker |
| Δ (Delta) | Number of shares bought or sold in a single trade |
| Instantaneous price | The marginal cost of the next infinitesimal share |
| Probability bounds | Enforced range [1%, 99%] for all option probabilities |
| Settlement | The process of paying winning positions after market resolution |
| Fixed payout | Each winning share pays exactly ₦1.00 |
| Net amount | Trade amount after fee deduction |
| Gross proceeds | Sale value before fee deduction |
| Log-sum-exp trick | Numerical stabilization technique for LMSR calculations |

---

# Document Boundaries

This document defines:

- The LMSR pricing algorithm
- Share calculation formulas (buy and sell)
- Probability update formulas
- Settlement payout formulas
- Fee integration with pricing
- Trade preview calculations
- Position valuation formulas
- Trade limits
- Numerical precision rules
- Mathematical invariants
- Worked examples

This document does NOT define:

- Business rules (→ `prediction-engine.md`)
- Database schema (→ `database-schema.md`)
- API communication (→ `api-contracts.md`)
- Architecture (→ `architecture.md`)
- Market lifecycle (→ `prediction-engine.md`)
- Wallet lifecycle (→ `prediction-engine.md`)
- UI behaviour (→ `design-system.md`)
- Source code (→ `engine/`)

---

# Acceptance Criteria

This specification is complete when:

- Every pricing calculation has an explicit formula.
- Every trade type (buy, sell) has step-by-step calculation procedures.
- Every invariant is enumerated.
- Settlement is fully defined.
- Fee integration is unambiguous.
- Numerical precision rules prevent implementation drift.
- Worked examples verify the formulas.
- A developer can implement the complete algorithm using only this document and `prediction-engine.md`.
