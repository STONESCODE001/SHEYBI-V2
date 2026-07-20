# prediction-engine.md

Help me write a `prediction-engine.md` file for my project.

This document is the functional specification for Sheybi's prediction market engine.

It defines every business rule that governs how prediction markets work. It is **not** a technical implementation document and must not contain programming language, pseudocode, database schemas, API routes, or framework-specific details.

The goal is to produce a document that allows a software engineer to build the entire prediction engine correctly without asking additional business questions.

---

## Include the following sections

# Overview

Explain the purpose of the prediction engine and its responsibility within the Sheybi ecosystem.

---

# Core Principles

Define the guiding principles that every market must follow.

Examples include:

- Fairness
- Transparency
- Deterministic behaviour
- Immutable financial history
- Real-time pricing
- Admin-controlled market creation

---

# Core Concepts

Define every business concept exactly once.

Each definition must be short, precise and unambiguous.

Include (but do not limit to):

- Market
- Binary Market
- Multi-option Market
- Option
- Probability
- Share Price
- Share
- Position
- Liquidity
- Liquidity Pool
- Trading Volume
- Wallet
- Available Balance
- Locked Balance
- Ledger
- Trade
- Buy Order
- Sell Order
- Settlement
- Resolution
- Trading Fee
- Withdrawal Fee
- Market Creator
- Market Suggestion
- Market State
- Position State

No definition may rely on another undefined concept.

# Administration

Define every action an administrator can perform.

Include:

- Create Market
- Edit Market before opening
- Schedule Market
- Close Trading
- Extend Market
- Cancel Market
- Resolve Market
- Reject Market Suggestion
- Suspend User
- Approve Withdrawal
- Reject Withdrawal

For every action specify:

- Preconditions
- Validation
- Resulting market state
- Resulting wallet changes
- Resulting ledger changes




# Market Types

Define every market type supported by Sheybi.

## Binary Markets

Explain:

- Structure
- Supported outcomes
- Default probability
- Initial liquidity allocation
- Price behaviour
- Resolution behaviour
- Settlement behaviour

## Multi-option Markets

Explain:

- Structure
- Supported outcomes
- Initial probability distribution
- Initial liquidity allocation
- Price behaviour
- Resolution behaviour
- Settlement behaviour

Document the differences between Binary and Multi-option markets.

Document any rules that both market types must always follow.

---

# Market Lifecycle

Describe the complete lifecycle of a market from creation until settlement.

Document every state.

Example:

- Draft
- Scheduled
- Open
- Closed
- Resolved
- Cancelled

Explain:

- how a market enters the state
- what actions are allowed
- what actions are forbidden
- what causes the next transition

---

# Position Lifecycle

Define every possible position state.

Include:

- Open
- Partially Sold
- Closed
- Won
- Lost
- Cancelled

Explain how transitions occur.

---

# Market Creation

Define:

- who can create markets
- who can suggest markets
- required market information
- default probability
- default liquidity
- validation rules
- scheduling rules

---

# Pricing Invariants

Document rules that the pricing engine must never violate.

Examples:

- Share prices must always remain between ₦0.0001 and ₦0.9999.
- The displayed market probability must always equal the current share price.
- Buying an option must never decrease its probability.
- Selling an option must never increase its probability.
- The total market probability must always equal 100%.
- A market cannot have negative liquidity.
- Liquidity cannot change after trading begins.
- A user cannot own negative shares.
- Shares cannot exist without a corresponding position.

---

# Trading Rules

Define platform-wide trading rules.

Include:

- Minimum trade amount.
- Maximum trade amount.
- Whether partial selling is allowed.
- Whether users may buy multiple times.
- Whether users may own opposing outcomes.
- Whether trades execute immediately.
- Whether pending orders exist.
- Whether trading pauses automatically.
- Whether trading resumes after extension.

Every rule must define exactly one deterministic behaviour.

# Buying Positions

Explain the buying process from beginning to end.

Include:

- validation
- wallet deduction
- fee deduction
- share calculation
- price update
- probability update
- position creation
- ledger entry

Every step must be described in order.

---

# Selling Positions

Explain the selling process from beginning to end.

Include:

- validation
- current market price
- share valuation
- fee deduction
- wallet credit
- position update
- ledger entry

---

# Position Valuation

Define how an open position is valued while a market remains open.

Include:

- Current position value.
- Unrealized profit.
- Unrealized loss.
- Average entry price.
- Current market price.
- Current share count.
- Partially sold positions.
- Fully sold positions.
- Resolved positions.

Define exactly when position values update and what causes them to change.

Do not describe mathematical implementation details.

---

# Dynamic Pricing

Define how prices behave.

Explain:

- initial market price
- initial probability
- effect of buying
- effect of selling
- effect of liquidity
- effect of market imbalance
- Why markets begin at 50/50.
- How buying shifts probabilities.
- How selling shifts probabilities.
- Why prices are always derived from market state.
- Why users always sell at current market price.
Binary market: 50% / 50%
3-option market: 33.33% / 33.33% / 33.33%
4-option market: 25% each
N-option market: 100% ÷ N for each option

Do not include implementation formulas.

Only define business behaviour.

---

# Liquidity

Define:

- what liquidity is
- why liquidity exists
- who provides liquidity
- when liquidity is added
- whether liquidity can change
- how liquidity affects pricing
- how liquidity affects payouts

---

# Wallet Behaviour

Explain:

- deposits
- available balance
- locked balance
- buying
- selling
- winnings
- withdrawals

Document exactly when balances increase or decrease.

---

# Money Movement

Describe every movement of money.

Include:

Deposit

↓

Wallet

↓

Buy Position

↓

Sell Position

↓

Settlement

↓

Withdrawal

Explain every state change.

---

# Fees

Document every fee.

Include:

Trading Fee

- 2.5% charged on every buy order
- 2.5% charged on every sell order

Withdrawal Fee

- 2.5% of withdrawal amount
- Minimum withdrawal fee: ₦150
- Maximum withdrawal fee: ₦2,500

Explain exactly when every fee is deducted.

---

# Revenue Model

Define how Sheybi earns revenue.

Include:

- Trading fee.
- Withdrawal fee.
- When each fee is charged.
- Whether fees are refundable.
- Whether fees are recorded in the ledger.
- Whether fees affect market pricing.
- Whether fees affect liquidity.

Document the revenue model independently from trading behaviour.

---

# Market Resolution

Define the complete settlement process for a market.

Include:

- Who can resolve a market.
- When a market becomes eligible for resolution.
- How the winning option is selected.
- How losing options are handled.
- How winning positions are identified.
- How payouts are calculated.
- How trading permanently ends.
- How wallets are updated.
- How ledger entries are created.
- What happens to cancelled markets.
- What information becomes immutable after settlement.

Describe the settlement process in chronological order from the moment trading closes until all winning balances have been credited.

----

# Validation Rules

Document every validation rule.

Examples:

- insufficient balance
- market closed
- cancelled market
- invalid option
- negative trade amount
- zero trade amount
- unauthenticated user
- suspended account
- resolved market
- duplicate resolution

Every validation rule must specify:

- condition
- expected behaviour
- resulting system state

---

# Failure Scenarios

Explain exactly what happens when operations fail.

Examples:

- payment fails
- webhook delayed
- insufficient funds
- invalid withdrawal
- market cancelled
- admin mistake
- duplicated request
Examples:

- User attempts to buy after market closes.
- User attempts to sell after market resolves.
- User attempts withdrawal without KYC.
- Admin attempts duplicate resolution.
- Payment webhook delayed.
- Liquidity exhausted.
- Invalid market state.

---

# Financial Invariants

List non-negotiable rules.

Examples:

- Every trade creates one ledger entry.
- Wallet balances cannot become negative.
- Closed markets cannot accept trades.
- Resolved markets cannot be reopened.
- Liquidity cannot change after trading begins.
- Every market has exactly one final outcome.
- Every payout must be traceable to a ledger record.

---

# Future Improvements

Clearly separate future features from MVP behaviour.

Examples:

- Reputation system
- Confidence scoring
- Market maker improvements
- Dynamic liquidity
- Automated dispute resolution

---

# Acceptance Criteria

The document is complete only if:

- Every financial concept is defined exactly once.
- Every market state is documented.
- Every position state is documented.
- Every money movement is specified.
- Every validation rule is deterministic.
- Every fee has one calculation rule.
- Every invariant is explicit.
- No implementation details are included.
- A backend engineer could build the engine without asking business questions.
- The flow is complete from market creation to final withdrawal.
- Every section uses deterministic language such as **must**, **will**, **cannot**, and **always**.
- No vague wording such as **should**, **might**, **could**, or **probably** is used unless describing future improvements.

The document is complete only if a software engineer can correctly implement:

- Market creation
- Trading
- Pricing
- Position valuation
- Wallet management
- Liquidity
- Settlement
- Withdrawals
- Revenue collection
- Ledger recording

without requesting clarification about business behaviour.
---

## Writing Style

- Write in plain Markdown.
- Use headings and bullet lists where appropriate.
- Be concise but complete.
- Explain every concept before it is used.
- Separate business rules from implementation details.
- Do not include source code.
- Do not include database schemas.
- Do not include API endpoints.
- Do not include framework-specific terminology.
- Treat this document as the single source of truth for the prediction engine.
