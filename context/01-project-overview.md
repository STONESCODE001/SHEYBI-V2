# Sheybi — Project Overview

> Version: 3.3.0
> Status: Planning
> Product Type: Real-Money Prediction Market
> Initial Market: Big Brother Naija (BBNaija)

---

# Overview

Sheybi is a real-money prediction market platform where users predict the outcomes of Big Brother Naija events using Nigerian Naira (₦). Users deposit money into their Sheybi wallet, purchase positions on live prediction markets, and earn profits if their predictions are correct. Unlike a traditional betting platform, Sheybi uses a dynamic market pricing engine where prices change as users buy and sell positions before market resolution. The MVP focuses exclusively on BBNaija, with the architecture designed to expand into sports, entertainment, politics, finance, and other prediction categories in future releases.

---

# Product Goals

1. Launch a production-ready MVP within the planned launch window.
2. Allow users to deposit funds, trade prediction markets, and request withdrawals.
3. Support both binary (Yes/No) and multi-option prediction markets.
4. Update market prices in real time as users trade.
5. Provide a clean, modern, mobile-first experience that feels social rather than financial.
6. Keep the prediction engine deterministic, auditable, and easy to maintain.
7. Build the system so additional market categories can be added without architectural changes.
8. Record every financial action through a ledger for complete auditability.

---

# Target Users

### Primary Users

- Big Brother Naija viewers
- Nigerian Gen Z users
- Users familiar with fantasy games or sports predictions
- Users interested in making predictions with real money

### Future Users

- Sports fans
- Entertainment fans
- Political prediction users
- Financial prediction users

---

# Core User Flow

1. User visits Sheybi.
2. User attempts to interact with a protected feature.
3. User is redirected to Sign Up / Log In.
4. User creates an account using Clerk authentication.
5. User receives a Sheybi wallet.
6. User deposits funds using a Paystack-generated virtual account.
7. Paystack webhook confirms payment.
8. Wallet balance updates automatically.
9. User browses available prediction markets.
10. User opens a market detail modal.
11. User reviews:
    - Market description
    - Rules
    - Source of truth
    - Market graph
    - Current probabilities
    - Recent activity
12. User selects an outcome.
13. User enters an amount.
14. Prediction engine calculates:
    - Current price
    - Shares received
    - Estimated payout
15. User confirms the trade.
16. Funds move from Available Balance to Locked Balance.
17. Position appears in Portfolio.
18. User may sell before market resolution.
19. Admin resolves the market after the event concludes.
20. Winning positions are settled automatically.
21. User's wallet balance updates.
22. User requests withdrawal.
23. Admin reviews and approves the withdrawal.
24. Funds are transferred to the user's verified bank account.
25. Transaction history and market history remain permanently accessible.

---

# Features

## Authentication

- Clerk authentication
- Protected application routes
- User profile management

---

## Wallet

- Virtual account funding
- Available balance
- Locked balance
- Portfolio value
- Deposit history
- Withdrawal requests
- Transaction history

---

## Prediction Markets

- Binary markets
- Multi-option markets
- Dynamic market pricing
- Real-time probability updates
- Market graph
- Market statistics
- Market activity feed
- Shareable market cards

---

## Trading

- Buy positions
- Sell positions before market closes
- Live profit/loss updates
- Estimated payout preview
- Trading fees

---

## Portfolio

- Open positions
- Closed positions
- Position performance
- Profit/Loss history
- Market history

---

## Community

- Submit market suggestions
- Share markets
- Share prediction positions
- Trending markets
- Featured markets

---

## Admin

- Create markets
- Edit markets
- Resolve markets
- Approve withdrawals
- Manage market suggestions
- Suspend users
- Review financial activity

---

# Key Product Decisions

- BBNaija is the only supported category for the MVP.
- All values are displayed in Nigerian Naira (₦).
- Users cannot create live markets directly.
- Users submit market suggestions for admin approval.
- Markets support Binary and Multi-option formats.
- Prediction prices change dynamically as trades occur.
- Every financial transaction is recorded in a ledger.
- Wallet balances are divided into Available and Locked balances.
- Users may exit positions before market resolution.
- Withdrawals require admin approval during the MVP.
- KYC is collected before withdrawals.
- Market details open in a modal (desktop) or bottom sheet (mobile).
- The UI prioritizes simplicity over trading complexity.

---

# In Scope

The MVP includes:

- Authentication
- Wallet funding
- Virtual accounts
- Prediction trading
- Dynamic pricing engine
- Portfolio
- Transaction history
- Market suggestions
- Admin dashboard
- Manual withdrawals
- Real-time updates
- Mobile and desktop layouts
- Dark mode
- Light mode

---

# Out of Scope

The MVP will NOT include:

- Cryptocurrency
- Blockchain
- Smart contracts
- User-created live markets
- Automated withdrawals
- Limit orders
- Margin trading
- Copy trading
- Market comments
- Direct messaging
- Public APIs
- Native mobile applications
- Multiple currencies
- AI-generated markets
- Leaderboards (planned for a future release)
- Social following system
- Referral program
- Push notifications

---

# Success Criteria

The MVP is considered complete when:

- A new user can create an account.
- A user can fund their wallet using Paystack.
- Wallet balances update automatically after payment.
- Users can browse active markets.
- Users can buy and sell positions.
- Market prices update after each trade.
- Users can view their portfolio.
- Admins can create and resolve markets.
- Winning users receive correct payouts.
- Users can request withdrawals.
- Admins can approve withdrawals.
- Every financial action creates a ledger record.
- All protected pages require authentication.
- The application works on desktop and mobile devices.

---

# Guiding Principles

- Simplicity over complexity.
- Trust through transparent financial records.
- Fast interactions over feature quantity.
- Mobile-first design.
- Every balance change must be auditable.
- Every prediction must have a clearly defined resolution rule.
- Every feature should contribute directly to the prediction market experience.

---

# Future Expansion (currently out of scope )

After the BBNaija MVP, Sheybi is designed to expand into:

- Sports
- Entertainment
- Politics
- Finance
- Technology
- Global news
- Creator economy
- Community-created prediction markets (with moderation)