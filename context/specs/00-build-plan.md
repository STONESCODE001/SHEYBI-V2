# Build Plan

## Purpose

This document defines the implementation roadmap for the Sheybi platform.

It is the single source of truth for build order.

Every implementation task must begin by determining which build unit is currently active.

Every build unit produces one complete, testable milestone.

No work may begin outside the current build unit.

Implementation always moves forward.

Completed units must never be partially rebuilt by later units.

---

# Design Principles

The implementation roadmap follows these rules.

- Build reusable foundations before dependent features.
- Build one system boundary at a time.
- Produce one visible result per build unit.
- Introduce dependencies only when they unlock new functionality.
- Build UI shells before connecting real data.
- Build backend capabilities before wiring frontend interactions.
- Authentication always precedes protected functionality.
- Never implement future units early.
- Every completed unit must be independently testable.
- Every build unit references its own specification document.
- No build unit owns requirements belonging to another specification.

---

# Frontend Build

The frontend build creates the complete visual application before backend functionality is connected.

---

# Unit 01 — UI Primitives

## Purpose

Create the reusable visual foundation of the application.

## Builds

- shadcn/ui installation
- Theme provider
- Light mode
- Dark mode
- Typography system
- Icon system
- Button variants
- Form primitives
- Feedback primitives
- Utility helpers
- Global design tokens integration

## Visible Result

The project contains a complete reusable UI foundation.

## Dependencies

None.

## Specification Files

- frontend/01-ui-primitives.md

## Completion Criteria

- Every primitive renders correctly.
- Theme switching works.
- No visual inconsistencies exist.
- All primitives are reusable.

---

# Unit 02 — Child Components

## Purpose

Create every reusable low-level UI component.

## Builds

- Buttons
- Inputs
- Labels
- Badges
- Chips
- Avatars
- Countdown
- Probability indicator
- Status indicator
- Icons
- Search input
- Empty state
- Skeleton state
- Dividers
- Tooltips

## Visible Result

Every reusable child component exists and renders using placeholder content.

## Dependencies

Unit 01

## Specification Files

- frontend/02-child-components.md

## Completion Criteria

- Every child component renders.
- Responsive behaviour works.
- Components can be reused independently.

---

# Unit 03 — Parent Components

## Purpose

Create reusable application components built from child components.

## Builds

- Hero Banner
- Market Card
- Market Feed
- Wallet Card
- Portfolio Card
- Statistic Card
- Activity Feed
- Search Result Card
- Notification Item
- Section Header
- Category Tabs
- Trade Panel
- Profile Summary
- Admin Summary Cards

## Visible Result

The application contains reusable feature components using placeholder data.

## Dependencies

Unit 02

## Specification Files

- frontend/03-parent-components.md

## Completion Criteria

- Every parent component renders.
- Placeholder data displays correctly.
- Component composition matches the wireframe.

---

# Unit 04 — Layouts

## Purpose

Create every reusable application layout.

## Builds

- Public Layout
- Authenticated Layout
- Admin Layout
- Mobile Layout
- Tablet Layout
- Desktop Layout
- Error Layout
- Loading Layout
- Maintenance Layout

## Visible Result

Every application layout exists and responds correctly across screen sizes.

## Dependencies

Unit 03

## Specification Files

- frontend/04-layouts.md

## Completion Criteria

- Layout switching works.
- Responsive layouts work.
- Shared regions remain consistent.

---

# Unit 05 — Pages

## Purpose

Create every routed page using placeholder data.

## Builds

- Landing
- Dashboard
- Markets
- Portfolio
- Wallet
- Profile
- Settings
- Notifications
- Search
- Administration
- Error
- Loading

## Visible Result

Users can navigate through every page without backend functionality.

## Dependencies

Unit 04

## Specification Files

- frontend/05-pages.md

## Completion Criteria

- Every page exists.
- Navigation works.
- Placeholder content displays correctly.

---

# Unit 06 — Dialogs

## Purpose

Create every reusable dialog, drawer and sheet.

## Builds

- Wallet Dialog
- Deposit Dialog
- Withdraw Dialog
- Search Dialog
- Profile Dialog
- Settings Dialog
- Notification Dialog
- Trade Confirmation Dialog
- Market Suggestion Dialog
- Image Viewer
- Share Dialog

## Visible Result

Every dialog opens, closes and integrates with the application shell.

## Dependencies

Unit 05

## Specification Files

- frontend/06-dialogs.md

## Completion Criteria

- Every dialog functions.
- Responsive presentation works.
- Navigation remains consistent.

---

# Backend Build

The backend build introduces application behaviour without modifying the visual structure.

---

# Unit 07 — Authentication

## Purpose

Implement identity and access control.

## Builds

- Clerk integration
- Sign Up
- Login
- Logout
- Email Verification
- Password Reset
- Session persistence
- Protected routes
- Route guards
- User creation
- User profile synchronization
- Role assignment

## Visible Result

Users can authenticate and access protected sections.

## Dependencies

Unit 06

## Specification Files

- backend/07-authentication.md

---

# Unit 08 — Markets

## Purpose

Implement market management and retrieval.

## Builds

- Market model
- Category model
- Market creation
- Market editing
- Market publishing
- Market archiving
- Featured markets
- Trending markets
- Search backend
- Market filtering
- Market statistics
- Market realtime synchronization

## Visible Result

Administrators manage markets while users browse live market data.

## Dependencies

Unit 07

## Specification Files

- backend/08-markets.md

---

# Unit 09 — Wallet

## Purpose

Implement the financial platform.

## Builds

- Wallet creation
- Available balance
- Locked balance
- Portfolio value
- Virtual account generation
- Paystack deposits
- Deposit verification
- Withdrawal requests
- Transaction history
- Ledger
- Wallet server actions

## Visible Result

Users can fund wallets and manage balances.

## Dependencies

Unit 08

## Specification Files

- backend/09-wallet.md

---

# Unit 10 — Trading

## Purpose

Implement prediction trading.

## Builds

- Prediction Engine
- Dynamic pricing
- Probability calculation
- Buy validation
- Sell validation
- Trading fees
- Position creation
- Position updates
- Trade preview
- Wallet deductions
- Wallet credits
- Ledger entries
- Trade history
- Live market updates
- Live probability updates

## Visible Result

Users buy and sell prediction positions with live updates.

## Dependencies

Unit 09

## Specification Files

- backend/10-trading.md

---

# Unit 11 — Portfolio

## Purpose

Implement portfolio management.

## Builds

- Open positions
- Closed positions
- Position history
- Market history
- Profit/Loss
- Portfolio summaries
- Performance analytics
- Position valuation

## Visible Result

Users monitor portfolio performance.

## Dependencies

Unit 10

## Specification Files

- backend/11-portfolio.md

---

# Unit 12 — Community

## Purpose

Implement community features.

## Builds

- Market suggestions
- Suggestion moderation
- Share market
- Share prediction
- Featured content
- Trending calculations
- Community activity feed

## Visible Result

Users interact beyond trading.

## Dependencies

Unit 11

## Specification Files

- backend/12-community.md

---

# Unit 13 — Administration

## Purpose

Implement platform operations.

## Builds

- Market resolution
- Settlement approval
- Withdrawal approval
- Withdrawal rejection
- User suspension
- User restoration
- Financial review
- Audit logs
- Platform analytics
- Administrative notifications

## Visible Result

Administrators operate the platform end-to-end.

## Dependencies

Unit 12

## Specification Files

- backend/13-administration.md

---

# Unit 14 — Background Jobs

## Purpose

Implement asynchronous platform processes.

## Builds

- Scheduled jobs
- Market auto-close
- Settlement jobs
- Notification jobs
- Payment reconciliation
- Retry queues
- Cleanup jobs

## Visible Result

Long-running processes execute automatically.

## Dependencies

Unit 13

## Specification Files

- backend/14-background-jobs.md

---

# Unit 15 — Production

## Purpose

Prepare the platform for deployment.

## Builds

- Error handling
- Monitoring
- Logging
- Performance optimization
- Deployment configuration
- Production validation
- Security hardening
- Final testing

## Visible Result

The platform is production-ready.

## Dependencies

Unit 14

## Specification Files

- backend/15-production.md

---

# Phase Dependencies

Every build unit depends only on completed units.

Dependencies always move forward.

Circular dependencies are prohibited.

Frontend units complete before backend platform behaviour is introduced.

Backend units build incrementally on previous platform capabilities.

---

# Cross-Document Responsibilities

This document defines build order only.

Implementation requirements belong to individual specification files.

Visual structure belongs to `wireframe.md`.

Component requirements belong to `specs/frontend`.

Feature behaviour belongs to `specs/backend`.

Architecture belongs to `architecture.md`.

User interactions belong to `user-flow.md`.

Business rules belong to `prediction-engine.md`.

API behaviour belongs to `api-contracts.md`.

---

# Acceptance Criteria

- Every build unit has one responsibility.
- Every build unit produces one visible milestone.
- Dependencies are explicit.
- Specification files are referenced.
- No implementation details are included.
- No business rules are duplicated.
- Frontend and backend implementation remain separated.

---

# Scope

This document defines only the implementation roadmap.

It defines:

- Build order
- Build units
- Dependencies
- Visible milestones

It does not define:

- UI implementation
- Business rules
- Database design
- API behaviour
- Source code
- Styling

Those subjects belong to their respective specification documents.