# user-flows.md

# Overview

This document defines every user journey within Sheybi.

It is the single source of truth for how users move through the platform from their first visit until completing every supported action.

This document defines:

- User entry points
- Navigation paths
- Screen transitions
- User decisions
- Validation checkpoints
- Success paths
- Failure paths
- Exit paths

This document does **not** define:

- UI styling (`ui-context.md`)
- Components (`design-system.md`)
- Business rules (`prediction-engine.md`)
- Database structure (`database-schema.md`)
- System architecture (`architecture.md`)

Every flow described in this document must have one deterministic beginning and one deterministic end.

---

# User Roles

The platform supports four user roles.

## Guest

A visitor who has not authenticated.

Guest users can:

- Browse public markets
- Search markets
- View market details
- View categories
- View resolved markets
- Register
- Log in

Guest users cannot:

- Buy shares
- Sell shares
- Deposit funds
- Withdraw funds
- View wallets
- View portfolios
- Suggest markets

---

## Authenticated User

A registered user with an active account.

Authenticated users can:

- Deposit funds
- Withdraw funds
- Buy positions
- Sell positions
- View portfolio
- Receive notifications
- Suggest markets
- Complete KYC

---

## Verified User

An authenticated user whose KYC has been approved.

Verified users have access to all financial features requiring identity verification.

---

## Administrator

Platform operators responsible for markets and moderation.

Administrators manage:

- Markets
- Withdrawals
- Users
- Categories
- Suggestions
- System settings

Administrators do not participate in prediction markets using administrator privileges.

---

# Global Navigation Flow

Guest

↓

Landing Page

↓

Browse Markets

↓

Market Details

↓

Login/Register

↓

Dashboard

Authenticated User

↓

Dashboard

↓

Markets

↓

Wallet

↓

Portfolio

↓

Notifications

↓

Profile

Administrator

↓

Admin Dashboard

↓

Markets

↓

Withdrawals

↓

Users

↓

Audit Logs

↓

Settings

---

# Authentication Flow

## Registration

Start

↓

User selects **Create Account**

↓

Enter:

- Email
- Username
- Password

↓

Validation

↓

Account created

↓

Profile created

↓

Wallet created

↓

User session starts

↓

Dashboard

Failure Conditions

- Email already exists
- Username unavailable
- Invalid password
- Network failure

---

## Login

Start

↓

Enter credentials

↓

Authentication

↓

Session created

↓

Dashboard

Failure Conditions

- Invalid credentials
- Suspended account
- Network failure

---

## Logout

Start

↓

User selects Logout

↓

Session destroyed

↓

Guest homepage

---

# Onboarding Flow

First Login

↓

Welcome Screen

↓

Platform Introduction

↓

Prediction Market Explanation

↓

Risk Disclaimer

↓

Optional Notification Permission

↓

Dashboard

The onboarding flow is displayed only once per account.

---

# Home Flow

Landing Page

↓

Featured Markets

↓

Trending Markets

↓

Categories

↓

Search

↓

Market Details

The homepage never requires authentication for browsing.

---

# Market Discovery Flow

Home

↓

Browse Categories

↓

Select Category

↓

Filtered Markets

↓

Choose Market

↓

Market Details

↓

Trade

Filtering options:

- Category
- Status
- Closing Soon
- Trending
- Highest Volume
- Recently Added

Sorting options:

- Popularity
- Closing Time
- Trading Volume
- Recently Created

---

# Market Details Flow

Market Selected

↓

Market Information

↓

Current Probability

↓

Trading Volume

↓

Liquidity

↓

Rules

↓

Trade Panel

↓

Related Markets

Actions Available

Guest

- Login

Authenticated User

- Buy
- Sell
- Share

---

# Deposit Flow

Wallet

↓

Select Deposit

↓

Enter Amount

↓

Validation

↓

Redirect to Payment Provider

↓

Payment Processing

↓

Webhook Confirmation

↓

Wallet Updated

↓

Ledger Entry Created

↓

Deposit Success Notification

Failure Conditions

- Payment cancelled
- Payment timeout
- Payment declined
- Webhook delay

---

# Withdrawal Flow

Wallet

↓

Withdraw

↓

Enter Amount

↓

Validation

↓

Bank Selection

↓

Account Verification

↓

Review Summary

↓

Submit Request

↓

Pending Approval

↓

Administrator Review

↓

Approved

↓

Payment Sent

↓

Completed

OR

↓

Rejected

Failure Conditions

- Insufficient balance
- KYC incomplete
- Invalid bank account
- Withdrawal below minimum
- Withdrawal above maximum
- Administrator rejection

---

# Buy Position Flow

Market Open

↓

Select Option

↓

Enter Amount

↓

Display

- Current Probability
- Estimated Shares
- Trading Fee
- Total Cost

↓

Validation

↓

Confirmation

↓

Prediction Engine

↓

Trade Executed

↓

Wallet Updated

↓

Position Updated

↓

Ledger Updated

↓

Market Updated

↓

Realtime Update

↓

Success

Failure Conditions

- Market closed
- Insufficient balance
- Invalid amount
- User suspended
- Market cancelled

---

# Sell Position Flow

Portfolio

↓

Select Position

↓

Sell

↓

Display

- Current Share Price
- Estimated Value
- Trading Fee
- Net Amount

↓

Validation

↓

Confirmation

↓

Prediction Engine

↓

Position Updated

↓

Wallet Updated

↓

Ledger Updated

↓

Market Updated

↓

Realtime Update

↓

Success

Failure Conditions

- No shares owned
- Market closed
- Position already settled
- Invalid quantity

---

# Portfolio Flow

Portfolio

↓

Summary

↓

Open Positions

↓

Resolved Positions

↓

Won Markets

↓

Lost Markets

↓

Position Details

↓

Trade History

---

# Notification Flow

Event Occurs

↓

Notification Created

↓

Notification Center Updated

↓

Unread Badge Updated

↓

User Opens Notification

↓

Notification Marked Read

↓

Navigate To Related Screen

Supported notifications:

- Deposit completed
- Deposit failed
- Withdrawal approved
- Withdrawal rejected
- Market closing soon
- Market resolved
- Position settled
- Market suggestion accepted
- Market suggestion rejected

---

# Market Suggestion Flow

User

↓

Suggest Market

↓

Enter Market Details

↓

Submit

↓

Pending Review

↓

Administrator Review

↓

Accepted

OR

↓

Rejected

Accepted suggestions create a Draft market.

---

# KYC Flow

Profile

↓

Start Verification

↓

Upload Documents

↓

Submit

↓

Pending Review

↓

Approved

OR

↓

Rejected

Rejected applications include a rejection reason.

---

# Administrator Market Creation Flow

Dashboard

↓

Create Market

↓

Enter Market Information

↓

Define Options

↓

Assign Category

↓

Assign Liquidity

↓

Schedule Market

↓

Review

↓

Publish

↓

Market Opens Automatically

Validation

- Minimum two options
- Future close date
- Positive liquidity
- Unique title

---

# Market Resolution Flow

Market Closed

↓

Administrator Selects Resolve

↓

Type Market Name

↓

Select Winning Option

↓

Confirmation

↓

Prediction Engine Settlement

↓

Winning Positions Settled

↓

Wallet Updates

↓

Notifications Sent

↓

Market Resolved

Resolution cannot be reversed.

---

# Withdrawal Review Flow

Pending Queue

↓

Open Request

↓

Review

↓

Approve

OR

↓

Reject

↓

User Notified

---

# Search Flow

Search

↓

Suggestions

↓

Results

↓

Select Market

↓

Market Details

Search supports:

- Markets
- Categories
- Housemates
- Events

---

# Market Suggestion Flow (`+` Action UI Sequence)

*(Note: Follows canonical Market Suggestion Flow lifecycle defined above; accepted suggestions create a Draft market in administrator queue)*

Click `+` Plus Icon (Left Sidebar Desktop / Bottom Nav Mobile)

↓

Open Market Suggestion Component (Modal Dialog Desktop / Bottom Sheet Mobile)

↓

Enter Market Information:
- `Name` (Proposed market question title)
- `Market Rules` (Criteria for outcome resolution)
- `Description` (Background / context explanation, optional)

↓

Validation:
- Title non-empty
- Rules non-empty
- Description optional

↓

Submit Suggestion

↓

Suggestion Sent to Administrator Queue (Creates Draft market upon admin acceptance)

↓

Display Success Toast / Confirmation

---

# Error Flows

Every flow must define an error destination.

Example

Trade Failure

↓

Display Error

↓

No Financial Changes

↓

Retry

↓

Cancel

The user never loses funds because of a failed operation.

---

# Empty States

The following screens must support empty states:

- Portfolio
- Notifications
- Search Results
- Market Suggestions
- Transaction History
- Open Positions
- Withdrawal History

Each empty state includes:

- Illustration
- Title
- Description
- Primary Action

---

# Success States

The following operations must display success confirmation:

- Registration
- Login
- Deposit
- Withdrawal Request
- Buy Position
- Sell Position
- Market Suggestion
- KYC Submission

---

# Flow Invariants

The following rules must always be true:

1. Every financial action requires authentication.

2. Every trade requires explicit user confirmation.

3. Every successful trade ends with wallet, ledger, position, and market updates.

4. Every failed trade leaves all financial records unchanged.

5. Every withdrawal requires sufficient available balance.

6. Every deposit requires payment confirmation before wallet updates.

7. Every resolved market notifies affected users.

8. Every administrator action requiring financial impact requires confirmation.

9. Users can never navigate to screens they are not authorized to access.

10. Every flow has a deterministic success path and failure path.

11. Navigation must never bypass required validation steps.

12. Users must always know the current state of long-running operations.

---

# Future User Flows

The following flows are intentionally excluded from the MVP:

- User Following
- Social Comments
- Leaderboards
- Referral Program
- Market Collections
- AI Market Recommendations
- AI Betting Assistant
- Push Notification Preferences
- Community Profiles

---

# Acceptance Criteria

This document is complete only if:

- Every user role is documented.
- Every supported feature has a complete user flow.
- Every flow has one starting point.
- Every flow has one success outcome.
- Every flow defines failure scenarios.
- Every navigation path is deterministic.
- Every validation checkpoint is documented.
- Every permission requirement is explicit.
- Every financial operation has a confirmation step.
- A product designer, frontend engineer, and backend engineer can understand every user journey without asking additional questions.

---

# Scope

This document defines only user journeys.

It does not redefine:

- Business rules
- Database entities
- Architecture
- UI tokens
- Components

Every concept has exactly one source of truth.
