# Prediction Engine

## Overview

The Prediction Engine is the financial and business rules engine that governs every prediction market on Sheybi.

It defines how markets are created, how prices move, how users buy and sell positions, how probabilities change, how liquidity behaves, how markets resolve, how payouts are calculated, and how every movement of money is recorded.

This document is the single source of truth for the business behaviour of the prediction market. It intentionally excludes implementation details such as programming languages, database schemas, API endpoints, or framework-specific concepts.

---

# Core Principles

Every prediction market on Sheybi must follow these principles.

## Fairness

Every participant trades under the same pricing rules, fee structure, and settlement process.

## Transparency

All displayed prices, probabilities, payouts, trading volume, and wallet balances must accurately reflect the current market state.

## Deterministic Behaviour

Given the same market state and user action, the engine must always produce the same result.

## Immutable Financial History

Completed financial records must never be modified or deleted. Every financial event must remain permanently traceable.

## Real-Time Pricing

Market prices and probabilities must update immediately after every successful trade.

## Admin-Controlled Markets

Only administrators can create, schedule, publish, extend, cancel, close, or resolve markets.

## Single Source of Truth

The prediction engine is the authoritative source for market pricing, user positions, wallet movements, and settlement.

---

# Core Concepts

## Market

A prediction event that users can trade before a predefined closing time.

---

## Binary Market

A market containing exactly two mutually exclusive outcomes.

Example:

- Yes
- No

Exactly one option will resolve as the winner.

---

## Multi-option Market

A market containing three or more mutually exclusive outcomes.

Exactly one option can win.

---

## Option

A possible outcome within a market.

Each option has:

- Current probability
- Current share price
- Total shares owned
- Trading volume

---

## Probability

The market's current belief that an option will become the final outcome.

Probability is displayed as a percentage.

The combined probability of every option in a market must always equal 100%.

---

## Share Price

The current market value of one share of an option.

Share prices continuously change as trading occurs.

Higher probability results in a higher share price.

Lower probability results in a lower share price.

---

## Share

The unit of ownership purchased by a user.

Shares represent exposure to one option.

Shares are never transferable between users.

---

## Position

A user's ownership of shares within one option of one market.

A position records:

- Purchased shares
- Average purchase price
- Current value
- Current profit or loss
- Position state

---

## Liquidity

Capital allocated by Sheybi to support market pricing and guaranteed payouts.

Liquidity exists before trading begins.

Liquidity is fixed for the lifetime of the market.

Liquidity cannot change after trading opens.

---

## Liquidity Pool

The backing capital allocated to a market.

The liquidity pool supports pricing stability and settlement.

---

## Trading Volume

The cumulative value of market volume within a market.

Initializes at market creation to the admin seed liquidity amount $L$ (e.g. ₦50,000 or ₦200,000).

In multi-option markets, seed volume is split equally across candidates: $\text{Candidate Seed} = \frac{L}{N}$.

Trading volume continuously increases after every successful buy or sell order.

---

## Wallet

The user's stored account balance.

Wallet funds are used for:

- Buying positions
- Receiving winnings
- Receiving sale proceeds
- Withdrawals

---

## Available Balance

Funds immediately available for trading or withdrawal.

---

## Locked Balance

Funds committed to open positions.

Locked balance cannot be withdrawn.

---

## Ledger

The permanent financial record of every monetary event.

Every completed financial action creates exactly one ledger record.

Ledger records are immutable.

---

## Trade

A completed buy or sell transaction.

---

## Buy Order

A request to purchase shares of one market option.

---

## Sell Order

A request to sell owned shares back into the market.

---

## Settlement

The process of distributing winnings and closing every position after market resolution.

---

## Resolution

The process of selecting the single winning option for a market.

---

## Trading Fee

A platform fee charged on every completed buy and sell order.

Trading Fee = **2.5%** of the trade value.

---

## Withdrawal Fee

A platform fee charged on completed withdrawals.

Withdrawal Fee = **3.0%** of the withdrawal amount.

Minimum fee: **₦150**

Maximum fee: unlimited

---

## Market Creator

An administrator authorized to create prediction markets.

---

## Market Suggestion

A recommendation submitted by a user for future consideration.

Submitting a suggestion does not create a market.

---

## Market State

The current lifecycle stage of a market.

---

## Position State

The current lifecycle stage of a user's position.

---

# Administration

Only administrators may perform administrative actions.

## Create Market

**Preconditions**

- Valid market information.
- Valid closing time.
- Valid resolution source.
- Initial liquidity assigned.

**Validation**

- Market title must be unique among active markets.
- At least two options must exist.

**Result**

- Market enters Draft.

---

## Edit Market

Allowed only before trading begins.

No wallet or ledger changes occur.

---

## Schedule Market

Moves Draft to Scheduled.

No trading allowed.

---

## Close Trading

Moves Open to Closed.

No further buys or sells are accepted.

---

## Pause Market

Allowed only while Open.

Moves Open to Paused.

Temporarily suspends all trading (buys and sells) for exceptional situations.

Unpausing returns market to Open.

---

## Pause Option (Multi-Option Markets)

Allowed for multi-option markets while active.

Sets `isPaused` flag to true on a specific option/candidate (e.g. evicted housemate).

Hides YES and NO trading buttons for that candidate in the user interface and rejects all buy/sell trades targeting that option with `"Trading for this option is currently paused."`.

Remaining options in the multi-option market continue trading without interruption.

Unpausing returns candidate option to active trading.

---

## Extend / Reopen Market

Allowed while Open or Closed before Resolution.

Updates closing time.

Moves state (or returns Closed market) to Open.

---

## Cancel Market

Trading permanently stops.

All open positions are refunded.

Wallets are credited.

Refund ledger entries are created.

Market enters Cancelled.

---

## Resolve Market

Allowed only once.

Administrator must manually type the exact market title in ALL CAPS and confirm via double-confirmation dialog before final submission.

Winning option becomes immutable.

Settlement begins immediately.

---

## Reject Market Suggestion

Suggestion is marked rejected.

No financial effects occur.

---

## Suspend User

Suspended users cannot trade or withdraw.

Existing positions remain unchanged.

---

## Approve Withdrawal

Withdrawal enters payment processing.

Wallet already reflects the withdrawal request.

---

## Reject Withdrawal

Withdrawal amount returns to Available Balance.

Ledger refund entry is created.

---

# Market Types

## Binary Markets

- Two outcomes.
- Initial probability is 50% / 50%.
- Initial liquidity is split equally.
- Buying increases an option's probability.
- Selling decreases an option's probability.
- One option resolves as the winner.

---

## Multi-option Markets

- Three or more outcomes.
- Initial probability is evenly distributed.
- Initial liquidity is distributed evenly.
- Buying one option increases its probability while reducing the others proportionally.
- Only one option may resolve as the winner.

---

# Market Lifecycle

## Draft

Market exists but is not visible.

No trading allowed.

---

## Scheduled

Visible before opening.

No trading allowed.

---

## Open

Trading is active.

Buying and selling are permitted.

---

## Paused

Trading is temporarily suspended for exceptional situations.

No new buys or sells are permitted.

Existing user positions remain unchanged.

Can be unpaused by administrator back to Open.

---

## Closed

Trading stops.

No new trades.

Waiting for resolution or administrative extension/reopening.

---

## Resolved

Winning option declared.

Settlement completed.

Market becomes immutable.

---

## Cancelled

Market permanently ends without a winner.

All eligible users receive refunds.

---

# Position Lifecycle

- Open
- Partially Sold
- Closed
- Won
- Lost
- Cancelled

Transitions are irreversible after settlement.

---

# Market Creation

Only administrators may create markets.

Users may only submit market suggestions.

Every market must include:

- Title
- Description
- Category
- Options
- Opening time
- Closing time
- Resolution source
- Initial liquidity

Binary markets begin at **50% / 50%**.

Multi-option markets begin with equal probability across all options.

---

# Pricing Invariants

- Total probability must always equal 100%.
- Share prices must always remain greater than ₦0 and less than ₦1.
- Buying must never decrease the purchased option's probability.
- Selling must never increase the sold option's probability.
- Liquidity cannot become negative.
- Liquidity cannot change after trading begins.
- Users cannot own negative shares.
- Shares cannot exist without an associated position.

---

# Buying Positions

The engine must execute buying in the following order:

1. Validate authentication.
2. Validate account status.
3. Validate market state.
4. Validate selected option.
5. Validate trade amount.
6. Validate wallet balance.
7. Validate single-outcome exposure invariant (atomically reject purchase if user holds an active position in a different option of the same market; leave wallet, position, price, and ledger state unchanged).
8. Deduct trade amount.
9. Deduct trading fee (2.5%).
10. Calculate purchased shares.
11. Update option probability.
12. Update option share price.
13. Create or update the user's position.
14. Record the ledger entry.
15. Update trading volume.

---

# Selling Positions

The engine must execute selling in the following order:

1. Validate ownership.
2. Validate market state.
3. Validate share quantity.
4. Determine current market price.
5. Calculate sale value.
6. Deduct trading fee (2.5%).
7. Credit available balance.
8. Update position.
9. Update market probability.
10. Update market price.
11. Record ledger entry.
12. Update trading volume.

---

# Position Valuation

The displayed value of a position must update immediately after every successful trade affecting that market.

Position value reflects:

- Current share count
- Current market share price

Unrealized profit or loss equals the difference between the current position value and the user's average entry cost.

Resolved positions no longer fluctuate.

---

# Trading Rules

- Trades execute immediately.
- Partial selling is allowed.
- Users may buy the same option multiple times.
- **Single-Outcome Exposure Invariant**: Users may only hold an active position in ONE outcome of a given market at any time. A user holding YES shares cannot purchase NO shares (or vice versa) without fully exiting their existing position first.
- No order book exists.
- Trades always execute against the current market price.
- Trading automatically stops when a market closes.
- Trading resumes only if an administrator extends the market before resolution.

---

# Dynamic Pricing

Every market begins with equal probability across all options.

Buying an option increases:

- Share price
- Probability

Selling an option decreases:

- Share price
- Probability

The displayed probability always reflects the current share price.

Users always sell at the current market price.

---

# Liquidity

Liquidity is platform-funded capital assigned before trading begins.

Its purposes are to:

- Stabilize pricing.
- Support predictable market behavior.
- Back market settlements.

Liquidity is assigned only once, before the market opens.

Liquidity cannot be increased or decreased after trading begins.

---

# Wallet Behaviour

Deposits increase Available Balance after payment confirmation.

Buying decreases Available Balance.

Selling immediately increases Available Balance after fees.

Winning settlement credits Available Balance.

Losing positions receive no credit.

Withdrawals reduce Available Balance immediately upon request.

---

# Money Movement

Deposit

↓

Available Balance

↓

Buy Position

↓

Open Position

↓

Sell Position (optional)

↓

Market Resolution

↓

Settlement

↓

Available Balance

↓

Withdrawal

Every successful movement creates exactly one immutable ledger entry.

---

# Revenue Model

Sheybi generates revenue through platform fees.

## Trading Fee

- 2.5% on every buy.
- 2.5% on every sell.

Trading fees are deducted immediately when the trade executes.

## Withdrawal Fee

- 3.0% of the withdrawal amount.
- Minimum: ₦150.
- Maximum: unlimited.

Withdrawal fees are deducted before payment is sent.

Fees do not affect market pricing or liquidity.

---

# Market Resolution

Only administrators may resolve markets.
A market may be resolved only after trading has closed.
Exactly one option becomes the winning outcome.
Settlement occurs immediately after resolution.

Winning positions are paid according to the market's settlement rules.

Losing positions become permanently worthless.

Wallet balances are updated.

Settlement ledger entries are created.

Resolved markets become immutable.

Cancelled markets refund eligible positions instead of paying winnings.

---

# Validation Rules

The engine must reject operations when:

- Balance is insufficient.
- Market is closed.
- Market is cancelled.
- Market is resolved.
- User is suspended.
- Trade amount is zero.
- Trade amount is negative.
- Selected option does not exist.
- User is unauthenticated.
- Duplicate market resolution is attempted.

Rejected operations must not modify wallets, positions, markets, probabilities, or ledger records.

---

# Failure Scenarios

The engine must safely handle:

- Failed deposits.
- Delayed payment webhooks.
- Failed withdrawals.
- Invalid withdrawal details.
- Duplicate requests.
- Market cancellation.
- Administrator mistakes before confirmation.
- Network interruptions during processing.

Failed operations must never leave the platform in an inconsistent financial state.

---

# Financial Invariants

- Wallet balances can never become negative.
- Every successful trade creates exactly one ledger entry.
- Closed markets never accept trades.
- Resolved markets cannot reopen.
- Liquidity cannot change after trading begins.
- Every market resolves to exactly one winning outcome or is cancelled.
- Every payout must be traceable through the ledger.
- Financial history is immutable.

---

# Future Improvements ( currently out of scope )

Future versions may introduce:

- Dynamic trading fees.
- Reputation systems.
- Confidence scoring.
- Improved market-making algorithms.
- Dynamic liquidity allocation.
- Automated dispute resolution.

These features are outside the MVP and do not alter the rules defined in this document.

---