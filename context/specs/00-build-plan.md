# Build Plan

This document defines the implementation order for Sheybi.

Each unit follows these rules:

- Produces one visible, testable result.
- Stays within one primary system boundary.
- Introduces dependencies only when they are required.
- Leaves the application in a working state before the next unit begins.
- May depend only on previously completed units.
- Units that always get done together are merged into one.
- Units with no standalone visible result are merged with adjacent units.

---

# Unit 1 — Application Shell & Authentication

## Builds

- Next.js App Router project (TypeScript, Tailwind CSS, shadcn/ui)
- Sheybi design tokens (colors, typography, spacing, elevation)
- Global layout (topbar, mobile bottom nav, responsive breakpoints)
- Public landing page
- Clerk authentication (sign up, sign in, sign out)
- Protected route middleware
- InstantDB configuration
- Users, User Profiles, and Wallets tables (created on first sign-in)
- User profile page (view & edit display name, avatar, bio)

## Visible Result

A visitor can open the landing page, create an account, sign in, see a styled application shell with navigation, view and edit their profile, and sign out. A wallet row exists in the database for every authenticated user.

## Dependencies

None.

---

# Unit 2 — Admin Dashboard & Market Creation

## Builds

- Admin role check (Clerk metadata or Admin Users table)
- Admin layout and navigation (separate from user app)
- Categories table and CRUD
- Markets table, Market Options table, Trading Volume table
- Market creation form (title, description, category, options, times, liquidity)
- Market editing (Draft state only)
- Market state transitions: Draft → Scheduled → Open
- Admin market list with status filters
- Audit Logs table and automatic logging for every admin action

## Visible Result

An administrator can sign in, access the admin dashboard, create categories, create prediction markets with options and liquidity, edit draft markets, publish them through Draft → Scheduled → Open, and see a filterable market list. Every action is recorded in the audit log.

## Dependencies

- Unit 1

---

# Unit 3 — Market Discovery

## Builds

- Home feed page (featured markets, trending markets, categories)
- Market list page with filters (category, status, closing soon, volume)
- Market search
- Market detail page / modal (description, rules, resolution source, options with probabilities, trading volume, closing time)
- Market Activity table and activity feed on market detail
- Shareable market cards (Open Graph metadata, share URL)

## Visible Result

Any visitor (guest or authenticated) can browse the home feed, filter and search markets, open a market detail view displaying live probabilities, volume, activity feed, and share a market link.

## Dependencies

- Unit 2

---

# Unit 4 — Wallet & Payments

## Builds

- Wallet dashboard page (available balance, locked balance, portfolio value)
- Wallet Transactions table
- Deposits table
- Paystack integration (virtual account funding)
- Deposit flow (initiate → Paystack → webhook confirmation → balance update)
- Ledger table (immutable financial records)
- Ledger entry creation on every successful deposit
- Withdrawal Requests table
- Withdrawal request flow (enter amount, bank details, fee preview, submit)
- Transaction history page
- Deposit history section
- Pending withdrawal display

## Visible Result

An authenticated user can view their wallet balances, fund their wallet through Paystack, see the deposit reflected in real time, view transaction history, and submit a withdrawal request that appears as pending.

## Dependencies

- Unit 1

---

# Unit 5 — Trading

## Builds

- Prediction Engine module:
  - Dynamic pricing (LMSR or equivalent)
  - Probability calculation
  - Trading validation (market state, balance, suspension, amount)
  - Fee calculation (2.5% buy, 2.5% sell)
  - Position valuation
- Positions table, Position History table
- Server Actions for buy and sell
- Buy flow on market detail page (select option → enter amount → preview shares, fee, estimated payout → confirm)
- Sell flow (select position → enter share quantity → preview proceeds, fee → confirm)
- Wallet balance deduction on buy, credit on sell
- Ledger entries for every trade
- Market probability and price updates after every trade (real-time via InstantDB)
- Live profit/loss display on open positions

## Visible Result

An authenticated user with wallet funds can buy shares on any open market, see updated probabilities and prices in real time, sell shares before the market closes, and see their wallet balance change. Every trade creates a ledger record.

## Dependencies

- Unit 3
- Unit 4

---

# Unit 6 — Portfolio

## Builds

- Portfolio page
- Open positions tab (current value, unrealized P/L, market link)
- Closed positions tab (final value, realized P/L)
- Position detail view (entry price, shares, trade history)
- Profit/Loss history summary
- Market history (markets user participated in)
- Performance metrics (total invested, total returned, net P/L)

## Visible Result

An authenticated user can view all their open and closed positions, see live profit/loss for open positions, review trade history per position, and track overall performance.

## Dependencies

- Unit 5

---

# Unit 7 — Market Resolution & Settlement

## Builds

- Admin resolution interface (select winning option, confirm market title)
- Prediction Engine settlement logic:
  - Winning position identification
  - Payout calculation
  - Wallet balance credit for winners
  - Position state transitions (Open → Won / Lost)
- Market state transitions: Open → Closed → Resolved
- Market cancellation with full refund flow
- Market extension (Closed → Open with new closing time)
- Ledger entries for every settlement payout and refund
- Notifications table
- Settlement notifications (position won, position lost, market resolved, market cancelled)
- Notification center in the user app (list, unread badge, mark as read)

## Visible Result

An administrator can close, extend, cancel, or resolve a market. When resolved, winning users automatically receive payouts in their wallet. Losing positions are marked lost. Cancelled markets refund all positions. Every user receives a notification. Users see settlement results in their portfolio and wallet.

## Dependencies

- Unit 5

---

# Unit 8 — Community Features

## Builds

- Market Suggestions table
- Market suggestion form (title, description, category)
- User's submitted suggestions list with status
- Admin suggestion review queue (approve, reject with reason)
- Share market (generate share URL, copy link)
- Share position / prediction (sharable card with outcome and stake)
- Featured markets curation (admin marks markets as featured)
- Trending markets algorithm (based on volume, trade count, recency)

## Visible Result

Users can suggest new markets and track their suggestion status. Administrators can approve or reject suggestions. Users can share markets and their positions via link. The home feed displays algorithmically trending and admin-curated featured markets.

## Dependencies

- Unit 3
- Unit 6

---

# Unit 9 — Admin Operations

## Builds

- Withdrawal approval / rejection workflow
- Withdrawal processing (Paystack transfer after approval)
- Withdrawal ledger entries and notifications
- User management page (list, search, view profile, view wallet)
- User suspension / unsuspension
- Financial activity review (platform-wide ledger viewer, deposit summary, withdrawal summary)
- Audit log viewer (filterable by admin, action type, entity, date range)
- KYC Records table
- KYC submission flow (user side)
- KYC review (admin side, required before withdrawal payout)
- System Settings table and settings page

## Visible Result

Administrators can approve or reject withdrawals (triggering Paystack transfers), suspend users, review platform-wide financial activity, browse audit logs, review KYC submissions, and manage system settings. Users can submit KYC documents and receive withdrawal payouts after admin approval.

## Dependencies

- Unit 4
- Unit 7

---

# Unit Dependency Graph

```
Unit 1 ──┬──────────────── Unit 2 ── Unit 3 ──┐
         │                                     │
         └── Unit 4 ──────────────────────┬── Unit 5 ──┬── Unit 6 ── Unit 8
                                          │            │
                                          │            └── Unit 7 ── Unit 8
                                          │                    │
                                          └────────────────────┴── Unit 9
```

---

# Build Summary

| Unit | Name | Primary Boundary | Key Dependency |
|------|------|-----------------|----------------|
| 1 | Application Shell & Authentication | Presentation + Identity | None |
| 2 | Admin Dashboard & Market Creation | Administration | Unit 1 |
| 3 | Market Discovery | Presentation | Unit 2 |
| 4 | Wallet & Payments | Financial | Unit 1 |
| 5 | Trading | Prediction Engine + Financial | Units 3, 4 |
| 6 | Portfolio | Presentation | Unit 5 |
| 7 | Market Resolution & Settlement | Prediction Engine + Administration | Unit 5 |
| 8 | Community Features | Presentation + Administration | Units 3, 6 |
| 9 | Admin Operations | Administration + Financial | Units 4, 7 |

---

# Unit Completion Requirements

A unit is complete only when:

- All planned functionality has been implemented.
- All affected pages render correctly.
- Server Actions execute successfully.
- Realtime synchronization functions correctly.
- Authentication and authorization requirements are enforced.
- Documentation has been updated.
- The application builds successfully.
- No unfinished work remains inside the completed system boundary.

No subsequent unit may begin until the current unit satisfies every completion requirement.