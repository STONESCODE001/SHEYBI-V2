# design-system.md

# Overview

This document defines the complete Design System for Sheybi.

It is the single source of truth for every reusable UI component used throughout the platform.

This document defines:

- Component responsibilities
- Component hierarchy
- Component variants
- Component anatomy
- Component states
- Component interactions
- Component composition
- Component ownership
- Visual consistency rules

This document does **not** define colors, typography, spacing, or animations. Those belong exclusively in `ui-context.md`.

This document also does **not** define business logic. Financial behaviour belongs in `prediction-engine.md`.

Every component described here must be reusable, deterministic, and independent of business rules.

---

# Design Principles

Every component must follow these principles.

## Reusable

A component must solve one problem.

It must never contain page-specific behaviour.

---

## Composable

Large interfaces must be created by composing smaller components.

Components must not duplicate functionality.

---

## Predictable

Every component must behave the same way regardless of where it appears.

---

## Accessible

Every interactive component must support:

- Keyboard navigation
- Focus states
- Screen readers
- Touch interaction

---

## Stateless by Default

Presentation components must not own business state.

Business state belongs to application logic.

---

## Consistent

Every component must follow the tokens defined inside `ui-context.md`.

No exceptions.

---

# Component Hierarchy

```
Application

├── Layouts
│
├── Navigation
│
├── Pages
│
├── Sections
│
├── Feature Components
│
├── Shared Components
│
└── UI Components
```

Each level has one responsibility.

---

# Component Levels

## Level 1

UI Components

Examples

- Button
- Card
- Badge
- Avatar
- Input
- Modal

These components know nothing about prediction markets.

---

## Level 2

Shared Components

Examples

- Empty State
- Loading State
- Error State
- Search Bar
- Pagination
- Confirmation Dialog

Reusable across multiple features.

---

## Level 3

Feature Components

Examples

- Market Card
- Trade Panel
- Wallet Card
- Portfolio Card
- Notification Card

Specific to Sheybi.

---

## Level 4

Sections

Examples

Trending Markets

Portfolio Section

Wallet Overview

Admin Statistics

Sections compose multiple feature components.

---

## Level 5

Pages

Pages compose sections.

Pages own layout.

Pages never own reusable UI.

---

# Component Naming Rules

Every reusable component must use PascalCase.

Examples

```
Button

MarketCard

WalletBalance

ProbabilityBar

TradePanel

NotificationCard
```

No abbreviations.

---

# Component Anatomy

Every component must define:

Purpose

Inputs

Outputs

Variants

States

Composition

Accessibility

---

# Primitive Components

## Button

Purpose

Executes one user action.

### Variants

Primary

Secondary

Ghost

Success

Danger

Outline

Icon

Text

### Sizes

Small

Medium

Large

### States

Default

Hover

Pressed

Focused

Disabled

Loading

### Rules

One primary action per container.

Loading buttons cannot be clicked.

Disabled buttons cannot receive pointer events.

---

## Input

Purpose

Collects user input.

### Variants

Text

Email

Password

Search

Currency

Number

Textarea

### States

Default

Focused

Disabled

Error

Read Only

---

## Card

Purpose

Groups related information.

Cards never perform business logic.

Cards never scroll independently.

---

## Badge

Purpose

Displays status.

Variants

Success

Warning

Error

Neutral

Market

Category

---

## Avatar

Purpose

Represents a user.

Fallback

Initials.

---

## Divider

Purpose

Separates content.

Never used for decoration.

---

## Modal

Purpose

Temporarily interrupts workflow.

Variants

Confirmation

Information

Form

Warning

Success

Error

Financial Confirmation

---

# Shared Components

## Loading State

Purpose

Represents data loading.

Must never use spinner alone.

Skeleton loading is required.

---

## Empty State

Must include

Illustration

Title

Description

Primary action

---

## Error State

Must include

Problem

Explanation

Retry

---

## Search Bar

Supports

Search

Clear

Loading

Recent searches

---

## Confirmation Dialog

Used before

Withdrawal

Trade

Settlement approval

Market cancellation

Never skipped.

---

# Navigation Components

## Top Navigation

Contains

Logo

Search

Categories

Wallet

Notifications

Profile

Never scrolls independently.

---

## Bottom Navigation

Mobile only.

Contains

Home

Markets

Portfolio

Wallet

Profile

---

## Sidebar

Desktop admin only.

Contains

Navigation

User

Settings

Logout

---

# Market Components

## Market Card

Purpose

Represents one prediction market.

Contains

Title

Category

Probability

Trading Volume

Time Remaining

Status

Primary Action

### States

Open

Closed

Resolved

Cancelled

Featured

Trending

---

## Market Header

Displays

Question

Category

Trading Volume

Liquidity

Probability

Close Time

---

## Probability Bar

Displays

Every option

Probability

Color

Percentage

Must always equal 100%.

---

## Option Card

Displays

Option name

Probability

Share price

Selection state

---

## Trade Panel

Purpose

Buying and selling positions.

Contains

Selected option

Current probability

Current share price

Trade amount

Estimated shares

Fees

Total

Buy button

Sell button

Validation message

---

## Trading Summary

Displays

Trade amount

Fee

Shares

Effective price

Wallet after trade

---

# Wallet Components

## Wallet Balance Card

Displays

Available balance

Locked balance

Total balance

Last update

---

## Deposit Card

Displays

Amount

Payment method

Confirmation

---

## Withdrawal Card

Displays

Available balance

Withdrawal amount

Fee

Net received

Status

---

## Transaction Card

Displays

Type

Amount

Fee

Status

Timestamp

Reference

---

# Portfolio Components

## Portfolio Summary

Displays

Current Value

Profit

Loss

ROI

Open Positions

Resolved Positions

---

## Position Card

Displays

Market

Selected Option

Shares

Average Entry Price

Current Price

Current Value

Profit/Loss

State

---

## Position History

Displays

Complete trade history.

Read only.

---

# Notification Components

## Notification Item

Displays

Title

Description

Timestamp

Status

Action

States

Unread

Read

Archived

---

# Admin Components

## Statistics Card

Displays

Single KPI.

Examples

Markets

Users

Revenue

Volume

---

## Admin Table

Supports

Sorting

Filtering

Pagination

Bulk actions

---

## Market Management Panel

Displays

Market information

State

Actions

Audit history

---

## Withdrawal Queue

Displays

Pending withdrawals.

Supports

Approve

Reject

---

# Page Templates

## Home

Hero

↓

Featured Markets

↓

Trending

↓

Categories

↓

Recent Activity

---

## Market Details

Header

↓

Probability

↓

Trade Panel

↓

Activity

↓

Rules

---

## Wallet

Balance

↓

Actions

↓

History

---

## Portfolio

Summary

↓

Positions

↓

History

---

## Profile

User

↓

Statistics

↓

Settings

---

## Admin Dashboard

Overview

↓

Markets

↓

Users

↓

Withdrawals

↓

Audit Logs

---

# Component Composition Rules

Pages may contain Sections.

Sections may contain Feature Components.

Feature Components may contain Shared Components.

Shared Components may contain UI Components.

UI Components must never contain Feature Components.

Circular composition is forbidden.

---

# State Rules

Every interactive component supports

Default

Hover

Focused

Pressed

Disabled

Loading

Error

Success (where applicable)

Resolved

Empty (where applicable)

No undocumented state is permitted.

---

# Responsive Rules

Desktop

1440px maximum content width.

Tablet

Adaptive two-column layout.

Mobile

Single column.

No horizontal scrolling.

---

# Accessibility Rules

Every interactive component must:

Support keyboard navigation.

Expose semantic labels.

Display visible focus indicators.

Support screen readers.

Meet WCAG AA contrast requirements.

Maintain a minimum touch target of 44 × 44 pixels.

---

# Component Invariants

The design system must always satisfy the following rules:

1. Every component has exactly one primary responsibility.

2. Components must never contain business logic.

3. Feature components must never directly modify financial data.

4. UI components must never know about prediction engine behaviour.

5. Components must never hardcode colors, typography, spacing or border radius.

6. Every interactive state must be visually distinguishable.

7. Every financial action must use a confirmation dialog before execution.

8. Components must be reusable across multiple pages.

9. No page may duplicate an existing component.

10. Every component must have documented variants and states.

11. Feature components may only compose lower-level components.

12. Components must never communicate directly with the database.

13. Components must never own authentication state.

14. Every loading state must have a corresponding error and empty state.

15. Every component must remain functional on desktop, tablet and mobile.

---

# Future Components

The following components are intentionally excluded from the MVP and may be introduced later:

- Live Price Chart
- Market Comments
- User Reputation Badge
- Achievement Cards
- Follow User Button
- Leaderboards
- AI Market Insights
- AI Market Summaries
- Social Feed
- Creator Profiles
- Market Collections

---

# Acceptance Criteria

This document is complete only if:

- Every reusable component has exactly one documented purpose.
- Every component defines its anatomy.
- Every component defines its variants.
- Every component defines every supported state.
- Component composition rules are explicit.
- Component hierarchy is documented.
- Accessibility requirements are defined.
- Responsive behaviour is defined.
- Components contain no business logic.
- The design system references `ui-context.md` for visual tokens instead of redefining them.
- A frontend engineer can build the complete component library without asking additional design questions.

---

# Scope

This document defines only reusable UI components.

It does not define:

- Business rules (`prediction-engine.md`)
- Database entities (`database-schema.md`)
- System architecture (`architecture.md`)
- Visual tokens (`ui-context.md`)
- Product requirements (`project-overview.md`)

Every concept must have exactly one source of truth.

---

# Writing Style

- Use deterministic language.
- Components must be described by behaviour, not implementation.
- Do not include source code.
- Do not include framework-specific APIs.
- Treat this document as the single source of truth for Sheybi's component library.