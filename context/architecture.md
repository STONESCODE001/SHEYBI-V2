# Architecture

## Overview

Sheybi uses a layered, server-first architecture that separates user interface, application orchestration, business logic, financial rules, persistent storage, and external integrations into independent system layers. Every request that modifies financial or market state flows through a controlled server-side execution path before reaching the prediction engine. The prediction engine acts as the single authority responsible for validating and executing every trading operation. InstantDB serves as the persistent realtime database, while Clerk manages authentication and identity. External payment processing is delegated to Paystack, and all financial history is permanently recorded before changes are synchronized back to connected clients through realtime subscriptions.

The overall request lifecycle is:

User

↓

Next.js Application

↓

Server Action

↓

Prediction Engine

↓

InstantDB

↓

Realtime Synchronization

↓

Browser UI

External systems communicate only with the server layer and never interact directly with the client or prediction engine.

This architecture was chosen because it provides deterministic financial behavior, clear ownership boundaries, realtime synchronization, and long-term maintainability.

---

# Architectural Principles

The architecture of Sheybi must always follow these principles.

## Single Responsibility

Every architectural layer owns exactly one responsibility.

No layer may perform responsibilities owned by another layer.

---

## Separation of Concerns

User interface, business rules, financial logic, persistence, authentication, and external integrations must remain isolated from one another.

Changing one layer must not require modifications to unrelated layers.

---

## Server-first Architecture

All operations capable of changing persistent data must execute on the server.

The client exists only to collect input, display information, and trigger server requests.

---

## Deterministic Business Logic

Every identical request with identical system state must always produce the same result.

Financial behavior must never depend on client state.

---

## Prediction Engine as Single Source of Financial Truth

All trading decisions, pricing updates, wallet mutations, market updates, settlement operations, and financial validations belong exclusively to the Prediction Engine.

No other layer may implement financial rules.

---

## Realtime-first Data

All market information displayed to users must originate from realtime synchronized data.

The interface must reflect the current database state rather than local assumptions.

---

## Immutable Financial History

Financial records are permanent.

Historical transactions, settlements, ledger entries, deposits, withdrawals, and completed trades cannot be modified after creation.

Corrections must create new records instead of altering historical records.

---

## Explicit Ownership

Every piece of data must have exactly one owner.

Every architectural responsibility must belong to exactly one layer.

Ownership must never be shared across unrelated layers.

---

## Secure-by-Default

Every protected operation requires authentication before execution.

Authorization is validated before any financial or administrative action begins.

No financial mutation is trusted simply because it originated from the client.

---

## Dependency Direction

Dependencies always flow downward.

Presentation Layer

↓

Application Layer

↓

Prediction Engine

↓

Database

↓

External Infrastructure

Lower layers must never depend on higher layers.

---

# High-Level Architecture

The major architectural components interact in the following order.

User

↓

Next.js Application

↓

Presentation Layer

↓

Server Actions

↓

Prediction Engine

↓

InstantDB

↓

Realtime Synchronization

↓

Browser UI

↓

Paystack

↓

File Storage

### User → Next.js Application

The browser provides user interaction through pages, forms, and application navigation.

No financial logic executes inside the browser.

---

### Next.js Application → Presentation Layer

The presentation layer renders data received from the server and collects user interaction.

It owns visual representation only.

---

### Presentation Layer → Server Actions

Every action that modifies application state is submitted to a Server Action.

Examples include:

- Buying shares
- Selling shares
- Depositing funds
- Withdrawing funds
- Creating markets
- Resolving markets

---

### Server Actions → Prediction Engine

Server Actions validate authentication, gather required inputs, and delegate financial operations to the Prediction Engine.

Server Actions do not calculate pricing.

Server Actions do not modify balances directly.

---

### Prediction Engine → InstantDB

After validation and calculation, the Prediction Engine persists the resulting state inside InstantDB.

This includes updates to:

- Wallets
- Positions
- Markets
- Trading Volume
- Ledger
- Notifications

---

### InstantDB → Realtime Synchronization

InstantDB broadcasts committed changes to connected clients.

Only committed database state is synchronized.

Temporary calculations are never synchronized.

---

### Realtime Synchronization → Browser UI

Connected clients immediately receive updated market information.

Examples include:

- Market probability
- Share prices
- Trading volume
- Wallet balances
- Position values
- Notifications

---

### Paystack Integration

Paystack communicates exclusively with the server.

Deposit confirmations and withdrawal updates never communicate directly with client components.

---

### File Storage

Binary files are stored separately from structured application data.

Examples include:

- User avatars
- KYC documents
- Generated share images

The Prediction Engine never communicates directly with File Storage.

# Technology Stack

| Layer | Technology | Responsibility | Reason Chosen |
|--------|------------|----------------|---------------|
| Frontend Framework | Next.js (App Router) | Renders the application, handles routing, and executes server-side rendering. | Supports server-first architecture and Server Actions. |
| UI Library | React / shadcn ui | Builds reusable user interface components. | Component-based architecture with strong ecosystem. |
| Programming Language | TypeScript | Defines application logic using static typing. | Improves maintainability and reduces runtime errors. |
| Styling | Tailwind CSS | Provides utility-first styling for the application. | Enables consistent and scalable UI development. |
| Component Library | shadcn/ui | Provides reusable interface components. | Consistent design system with full customization. |
| Database | InstantDB | Stores persistent application data and synchronizes realtime updates. | Native realtime synchronization with simplified data management. |
| Authentication | Clerk | Authenticates users and manages identities. | Secure authentication with minimal infrastructure. |
| Payment Provider | Paystack | Processes deposits and withdrawals. | Trusted payment infrastructure for Nigerian users. |
| Server Execution | Server Actions | Executes all server-side mutations securely. | Eliminates unnecessary API layer while enforcing server-side execution. |
| Business Logic | Prediction Engine | Owns every financial rule, pricing decision, validation, and settlement operation. | Guarantees deterministic market behavior. |
| File Storage | Object Storage | Stores uploaded files and generated assets. | Structured data and binary files remain separated. |
| Background Processing | Background Jobs | Executes asynchronous operations. | Prevents long-running operations from blocking user requests. |
| Deployment Platform | Vercel | Hosts the web application and server execution environment. | Optimized deployment for Next.js applications. |

---

# System Layers

## Presentation Layer

### Responsibility

Displays information and collects user interaction.

### Inputs

- User input
- Realtime updates
- Server-rendered data

### Outputs

- UI events
- Form submissions
- Navigation requests

### Dependencies

- Application Layer

The Presentation Layer must never perform financial calculations, database mutations, or authentication decisions.

---

## Application Layer

### Responsibility

Coordinates requests between the presentation layer and business logic.

### Inputs

- User actions
- Authentication state

### Outputs

- Prediction Engine requests
- Read requests
- External service requests

### Dependencies

- Prediction Engine
- Authentication
- Database
- External Services

The Application Layer must never implement prediction market rules.

---

## Business Logic Layer

### Responsibility

Coordinates application-specific workflows.

This layer prepares validated requests before delegating financial operations to the Prediction Engine.

### Inputs

- Authenticated requests
- Validated application data

### Outputs

- Engine operations
- Database operations

### Dependencies

- Prediction Engine
- Database Layer

Business workflows must never duplicate pricing logic.

---

## Prediction Engine

### Responsibility

Acts as the single authority for every financial operation.

Owns:

- Pricing
- Probability updates
- Wallet mutations
- Position management
- Market updates
- Trading validation
- Settlement calculations
- Fee calculations

### Inputs

Validated business requests.

### Outputs

Financial state changes.

### Dependencies

Database Layer only.

The Prediction Engine must never depend on UI, pages, components, or browser state.

---

## Database Layer

### Responsibility

Persists application state.

Owns:

- Users
- Wallets
- Markets
- Positions
- Ledger
- Notifications
- Trading history

### Inputs

Validated writes from upper layers.

### Outputs

Persistent data and realtime events.

---

## Storage Layer

### Responsibility

Stores binary assets.

Owns:

- User avatars
- KYC documents
- Generated images

The Storage Layer must never store structured financial information.

---

## External Services Layer

### Responsibility

Communicates with third-party systems.

Examples:

- Clerk
- Paystack

External services never communicate directly with client components.

---

# Architectural Boundaries

Every architectural layer owns exactly one responsibility.

## Presentation Layer

Owns:

- Pages
- Components
- Rendering
- User interaction

Must never own:

- Financial rules
- Authentication decisions
- Database mutations
- Prediction logic

---

## Application Layer

Owns:

- Request orchestration
- Validation flow
- Service coordination

Must never own:

- Pricing
- Settlement
- Market calculations

---

## Prediction Engine

Owns:

- Financial rules
- Market state transitions
- Probability updates
- Wallet mutations
- Position calculations

Must never own:

- UI rendering
- Authentication
- Routing
- File uploads

---

## Database Layer

Owns:

Persistent storage.

Must never own:

Business decisions.

---

## Storage Layer

Owns:

Binary assets only.

Must never own:

Application state.

---

These boundaries ensure every responsibility has exactly one owner, preventing duplicated logic and reducing coupling between layers.

---

# Dependency Rules

Dependencies must always flow downward.

Allowed dependencies:

Presentation Layer → Application Layer ✅

Application Layer → Prediction Engine ✅

Application Layer → Database Layer ✅

Application Layer → External Services ✅

Prediction Engine → Database Layer ✅

Background Jobs → Prediction Engine ✅

Background Jobs → Database Layer ✅

Forbidden dependencies:

Prediction Engine → UI ❌

Prediction Engine → Components ❌

Prediction Engine → Browser APIs ❌

Presentation Layer → Database ❌

Presentation Layer → Prediction Engine ❌

Database Layer → UI ❌

Database Layer → Prediction Engine ❌

External Services → UI ❌

Circular dependencies between any layers are forbidden.

---

# Layer Communication Rules

The architecture only permits the following communication paths.

| From |        To  |               Allowed        |
|------|------------|------------------------------|
| User Interface    | Server Actions          | ✅ |
| Server Actions    | Prediction Engine       | ✅ |
| Prediction Engine | InstantDB               | ✅ |
| InstantDB         | Browser (Realtime Sync) | ✅ |
| Background Jobs   | Prediction Engine       | ✅ |
| Background Jobs   | Database                | ✅ |
| Client Components | Database                | ❌ |
| Client Components | Prediction Engine       | ❌ |
| UI Components     | Paystack                | ❌ |
| External Services | Browser State           | ❌ |
| Prediction Engine | UI Components           | ❌ |

All financial mutations must originate from authenticated Server Actions before reaching the Prediction Engine.

---

# State Ownership

Application state is divided into four ownership categories.

## Client State

Owned by the Presentation Layer.

Examples:

- Open modals
- Form inputs
- Selected tabs
- Filters
- Search text
- Theme preference

Client state is temporary.

---

## Server State

Owned by the Application Layer.

Examples:

- Markets
- Wallet
- Positions
- Notifications
- Withdrawal requests

Server state originates from the database.

---

## Realtime State

Owned by InstantDB synchronization.

Examples:

- Share prices
- Market probabilities
- Trading volume
- Wallet balances
- Market status
- Notifications

Realtime state always reflects committed database changes.

---

## Persistent State

Owned by the Database Layer.

Examples:

- Users
- Wallets
- Ledger
- Markets
- Positions
- Transactions
- Audit Logs

Persistent state remains the single source of truth throughout the application.

# Folder Boundaries

Every folder within the application has a single responsibility. Code must only exist in the folder that owns its responsibility.

| Folder | Responsibility | Allowed | Forbidden |
|---------|----------------|---------|------------|
| app/ | Defines application routes, layouts, and pages. | Pages, layouts, route groups, loading states, error boundaries. | Business logic, pricing logic, database mutations. |
| components/ | Contains reusable UI components shared across features. | Buttons, cards, dialogs, tables, layouts, reusable interface elements. | Feature-specific logic, financial calculations, server mutations. |
| features/ | Contains complete business features grouped by domain. | Wallet UI, Market UI, Admin UI, Authentication UI. | Shared UI primitives, prediction engine logic. |
| actions/ | Contains all Server Actions. | Authentication checks, request validation, orchestration, server-side mutations. | Pricing calculations, UI rendering. |
| engine/ | Contains the Prediction Engine. | Pricing rules, settlement rules, validation rules, market rules, financial calculations. | UI logic, routing, authentication, payment integration. |
| lib/ | Shared utilities and infrastructure. | Database clients, helper utilities, constants, shared services. | Business rules unique to one feature. |
| hooks/ | Reusable React hooks. | Client-side state helpers, reusable UI behavior. | Financial mutations, database writes. |
| providers/ | Application-wide providers. | Authentication provider, theme provider, realtime provider. | Business logic. |
| types/ | Shared type definitions. | Domain models, enums, interfaces. | Runtime logic. |
| styles/ | Global styling resources. | Global styles, fonts, theme configuration. | Application logic. |
| public/ | Static assets. | Images, logos, icons, static files. | Dynamic user data. |

Folder boundaries must never be violated. If a responsibility changes, the code must move to the correct folder rather than duplicating logic.

---

# Feature Boundaries

Each feature owns its own user experience, orchestration, and presentation while delegating financial decisions to the Prediction Engine.

## Authentication

Owns:

- User sign in
- User sign up
- Session management
- User identity

Depends on:

- Clerk

Must never own:

- Wallet balances
- Trading permissions
- Market logic

---

## Markets

Owns:

- Market discovery
- Market details
- Market filtering
- Market presentation

Depends on:

- Prediction Engine
- Database

Must never own:

- Pricing calculations
- Settlement logic

---

## Wallet

Owns:

- Wallet display
- Transaction history
- Deposit requests
- Withdrawal requests

Depends on:

- Paystack
- Server Actions

Must never own:

- Balance calculations
- Settlement calculations

---

## Prediction Engine

Owns:

- Market pricing
- Probability updates
- Share valuation
- Wallet mutations
- Position management
- Settlement
- Trading validation

Depends on:

- Database

Must never depend on:

- UI
- Authentication provider
- Browser APIs

---

## Profile

Owns:

- User profile
- Preferences
- Avatar
- KYC status

Must never own:

- Financial history
- Wallet balances

---

## Admin Dashboard

Owns:

- Market management
- User moderation
- Liquidity assignment
- Market resolution
- Withdrawal approvals

Must never bypass the Prediction Engine when modifying financial state.

---

# Request Lifecycle

## User Opens Homepage

User

↓

Next.js renders the requested page

↓

Server fetches market data

↓

Database returns current markets

↓

Page is rendered

↓

Realtime subscriptions begin

↓

User receives live updates

---

## Login

User submits credentials

↓

Clerk authenticates identity

↓

Session is established

↓

Application loads authenticated state

↓

Protected features become available

---

## Deposit

User initiates deposit

↓

Server Action validates request

↓

Paystack processes payment

↓

Payment confirmation is received

↓

Wallet balance is updated

↓

Ledger entry is created

↓

Realtime synchronization updates all connected sessions

---

## Buy Position

User submits buy request

↓

Server Action validates authentication

↓

Prediction Engine validates request

↓

Prediction Engine calculates trade

↓

Database updates wallet

↓

Database updates position

↓

Database updates market

↓

Ledger entry is recorded

↓

Realtime synchronization updates connected clients

---

## Sell Position

User submits sell request

↓

Server Action validates ownership

↓

Prediction Engine validates trade

↓

Prediction Engine calculates proceeds

↓

Wallet balance updates

↓

Position updates

↓

Market updates

↓

Ledger entry created

↓

Realtime synchronization broadcasts updates

---

## Withdraw

User submits withdrawal request

↓

Server Action validates request

↓

Withdrawal request created

↓

Administrator approves request

↓

Paystack transfers funds

↓

Ledger updated

↓

Wallet updated

↓

Notification delivered

---

## Market Resolution

Administrator resolves market

↓

Prediction Engine validates resolution

↓

Winning positions identified

↓

Payouts calculated

↓

Wallet balances updated

↓

Ledger entries recorded

↓

Positions finalized

↓

Market marked resolved

↓

Realtime synchronization updates every connected user

---

# Prediction Engine Boundary

The Prediction Engine exists as an independent architectural layer responsible for every financial decision made by the platform.

The Prediction Engine owns:

- Trading validation
- Market pricing
- Share valuation
- Market probability
- Wallet mutations
- Position mutations
- Settlement
- Fee calculations
- Market state transitions

The Prediction Engine must never own:

- User interface
- Authentication
- Payment processing
- File storage
- Routing
- Browser state

Every financial request reaches the Prediction Engine only through authenticated Server Actions.

No component, feature, or external integration may bypass this boundary.

---

# Server Action Boundary

Server Actions act as the application's secure execution layer.

They own:

- Authentication validation
- Authorization checks
- Input validation
- Request orchestration
- Communication with external services
- Invoking the Prediction Engine

Server Actions must never own:

- Pricing calculations
- Share calculations
- Settlement logic
- Financial rules

The client must never perform any financial mutation directly.

Every mutation must execute through a Server Action.

---

# Database Boundary

InstantDB stores all persistent structured application data.

Examples include:

- Users
- Wallets
- Positions
- Markets
- Market options
- Ledger
- Notifications
- Trading history
- Audit logs

The database must never contain:

- Temporary UI state
- Component state
- Session-only values
- Derived calculations that can be recomputed safely

The database remains the single source of truth for persistent application state.

---

# Storage Boundary

## Database

Stores structured persistent data.

Examples:

- Markets
- Wallets
- Users
- Positions
- Ledger
- Transactions

---

## File Storage

Stores binary assets.

Examples:

- User avatars
- KYC documents
- Generated share images

---

## Cache

Stores temporary performance data.

Examples:

- Frequently viewed markets
- Trending market lists
- Frequently accessed categories

Financial state must never rely exclusively on cached values.

---

## Generated Assets

Generated dynamically from application data.

Examples:

- Share cards
- Market preview images
- Leaderboard graphics

Generated assets are disposable and can always be regenerated from persistent data.

# Authentication, Authorization & Permissions

Authentication verifies identity.

Authorization determines permitted actions.

## Guest

Can:

- View public markets
- Browse categories
- View market details

Cannot:

- Trade
- Deposit
- Withdraw
- Create suggestions
- Access wallet

---

## Authenticated User

Can:

- Buy positions
- Sell positions
- Deposit funds
- Request withdrawals
- View wallet
- View portfolio
- Suggest markets
- Complete KYC

Cannot:

- Create official markets
- Resolve markets
- Assign liquidity
- Approve withdrawals
- Suspend users

---

## Administrator

Can:

- Create markets
- Edit markets before trading opens
- Schedule markets
- Close trading
- Extend markets
- Resolve markets
- Cancel markets
- Assign liquidity before launch
- Approve withdrawals
- Reject withdrawals
- Suspend users
- Review KYC submissions

Administrator permissions must always execute through authenticated server-side operations.

---

# Background Tasks

Background processes execute independently of user interaction.

They include:

- Payment webhook processing
- Market closing
- Market settlement
- Withdrawal processing
- Notification delivery
- Scheduled market publication
- Generated image creation

Background tasks improve responsiveness by removing long-running work from user requests.

---

# External Services

## Clerk

Purpose:

Identity management.

Provides:

- Authentication
- Session management
- User identity

Failure Handling:

Protected operations fail immediately until authentication is restored.

---

## InstantDB

Purpose:

Persistent realtime data storage.

Provides:

- Data persistence
- Realtime synchronization

Failure Handling:

Mutations fail atomically and no partial financial updates are committed.

---

## Paystack

Purpose:

Payment processing.

Provides:

- Deposits
- Withdrawals

Failure Handling:

Wallet balances remain unchanged until verified payment confirmation.

---

## Future Email Provider

Purpose:

Transactional communication.

Future scope only.

---

# Error Handling Strategy

## Payment Failure

No wallet mutation occurs.

The payment remains incomplete.

---

## Database Failure

The entire request fails.

Partial writes are forbidden.

---

## Webhook Delay

Funds remain unchanged until verified confirmation is received.

---

## Invalid Trade

Trade is rejected.

No financial records are created.

---

## Network Timeout

The request terminates safely.

Users may retry without creating duplicate financial mutations.

---

# Data Flow Principles

Every mutation follows the same direction.

User Action

↓

Server Action

↓

Prediction Engine

↓

Database

↓

Realtime Synchronization

↓

Browser Update

No architectural layer may reverse this flow.

Financial state always originates from the Prediction Engine before reaching the database.

---

# Security Principles

The architecture enforces the following rules.

- Clients never modify financial state directly.
- Every protected request requires authentication.
- Every administrative action requires authorization.
- Every financial mutation passes through the Prediction Engine.
- Sensitive operations execute only on the server.
- Ledger history remains immutable.
- Payment providers never modify wallet balances directly.
- Every persistent mutation is validated before execution.

---

# Architectural Invariants

The following rules are mandatory.

- Business logic must never exist inside UI components.
- Prediction Engine is the only owner of financial rules.
- Client components cannot write directly to the database.
- Every financial mutation must create the required financial records.
- Circular dependencies are forbidden.
- External services never communicate directly with client state.
- Database writes occur only through validated server execution.
- Financial history remains immutable.
- Authentication precedes authorization.
- Persistent data always overrides cached data.

---

# Realtime Architecture

Realtime synchronization originates from committed database changes.

The following events trigger realtime updates:

- Market creation
- Market opening
- Market closing
- Share price updates
- Probability updates
- Trading volume updates
- Wallet balance updates
- Position updates
- Notifications
- Market resolution

The following data must always synchronize in realtime:

- Market prices
- Probabilities
- Wallet balances
- Trading volume
- Portfolio values
- Notifications

The following data does not require realtime synchronization:

- User settings
- Static pages
- Application configuration
- Help documentation

# Deployment Architecture

The deployed system consists of five major architectural components.

Presentation Layer

↓

Application Layer

↓

Database

↓

External Services

↓

Background Processing

The Presentation Layer communicates only with the Application Layer.

The Application Layer coordinates all communication with the Prediction Engine, InstantDB, Clerk, Paystack, File Storage, and Background Jobs.

No external system communicates directly with the browser to modify financial state.

---

# Integration Boundaries

## Clerk

Purpose:

Authentication.

Direction:

Application ↔ Clerk

Trusted Data:

Authenticated identity.

Validation:

Every protected request validates the authenticated user.

Failure Handling:

Protected operations terminate immediately.

---

## InstantDB

Purpose:

Persistent storage and realtime synchronization.

Direction:

Application ↔ InstantDB

Trusted Data:

Committed application state.

Validation:

Only validated mutations are persisted.

Failure Handling:

Transactions fail atomically.

---

## Paystack

Purpose:

Deposits and withdrawals.

Direction:

Application ↔ Paystack

Trusted Data:

Verified payment status.

Validation:

Wallet updates require verified payment confirmation.

Failure Handling:

No financial mutation occurs until confirmation.

---

## Future Email Provider

Purpose:

Transactional communication.

Future architecture only.

---

## Future Push Notifications

Purpose:

Realtime engagement.

Future architecture only.

---

# Prediction Engine Integration

The Prediction Engine sits between the Application Layer and the Database Layer.

Communication allowed:

Application Layer

↓

Prediction Engine

↓

Database

Communication forbidden:

Presentation Layer

↓

Prediction Engine

External Services

↓

Prediction Engine

Client Components

↓

Prediction Engine

The Prediction Engine remains isolated from interface concerns and external infrastructure.

---

# Scalability Strategy

The architecture supports future growth through clear separation of responsibilities.

Future expansion includes:

- Additional prediction categories
- Increased trading volume
- Multiple payment providers
- Multiple administrators
- International markets
- Additional notification providers

These additions extend existing layers without changing architectural boundaries.

---

# Future Architecture

Future enhancements remain outside the MVP architecture.

Examples include:

- AI moderation
- Market recommendation engine
- Queue workers
- Event streaming
- Multi-region deployment
- Recommendation systems
- Advanced analytics

These systems integrate as additional architectural layers without changing existing responsibilities.

---