# architecture.md

Help me write an `architecture.md` file for my project.

This document defines the complete system architecture of Sheybi.

It explains how every major part of the application fits together, what responsibilities each layer owns, and the rules that separate those layers.

It is not an implementation guide.

Do not include source code, framework-specific APIs, or configuration files.

Describe the architecture using business-level and system-level concepts.

---

# Overview

Explain the overall architecture of Sheybi.

Describe the high-level request flow from the browser to the database and back.

Explain why this architecture was chosen.

---

# Architectural Principles

Define the principles the architecture must always follow.

Examples:

- Single Responsibility
- Separation of Concerns
- Server-first Architecture
- Deterministic Business Logic
- Realtime-first Data
- Immutable Financial History
- Secure-by-default
- Explicit Ownership

---


# High-Level Architecture

Provide a simple system diagram showing how the major components interact.

Example:

User

↓

Next.js Application

↓

Server Actions

↓

Prediction Engine

↓

InstantDB

↓

Realtime Sync

↓

Browser UI

↓

Paystack (Deposits & Withdrawals)

↓

File Storage

↓

Generated Share Images

Explain the responsibility of each connection.

---


# Technology Stack

Provide a table containing:

| Layer | Technology | Responsibility | Reason Chosen |

Include every major technology, including but not limited to:

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- InstantDB
- Clerk
- Paystack
- Server Actions
- Prediction Engine
- File Storage
- Background Jobs
- Vercel (or deployment platform)

Explain the responsibility of every technology.

---


# System Layers

Define each architectural layer.

Examples:

Presentation Layer

Application Layer

Business Logic Layer

Prediction Engine

Database Layer

Storage Layer

External Services

For every layer explain:

- Responsibility
- Inputs
- Outputs
- Dependencies

---


# Architectural Boundaries

Define what each layer is responsible for.

Define what each layer must never own.

Explain how these boundaries prevent tight coupling.

---


# Dependency Rules

Document which layers may depend on other layers.

Examples:

Components may depend on UI primitives.

Features may depend on shared components.

Prediction Engine cannot depend on UI.

UI cannot depend on database logic.

Server Actions cannot depend on client components.

Circular dependencies are forbidden.

---

# Layer Communication Rules

Document which layers may communicate directly.

Examples:

Presentation Layer → Application Layer ✅

Application Layer → Prediction Engine ✅

Prediction Engine → Database ✅

Presentation Layer → Database ❌

Client → Prediction Engine ❌

External Service → UI ❌

Every allowed and forbidden communication path must be documented.

---

# State Ownership

Define where every type of state belongs.

Examples:

Client State

- Modals
- Form input
- Selected category

Server State

- Markets
- Wallet
- Positions
- Notifications

Realtime State

- Market prices
- Probabilities
- Trading volume

Persistent State

- Ledger
- Users
- Deposits

Explain which layer owns each state.

---


# Folder Boundaries

Define the responsibility of every major folder.

Example:

app/

components/

features/

actions/

lib/

engine/

hooks/

providers/

types/

styles/

public/

Explain what is allowed and not allowed inside each folder.

---

# Request Lifecycle

Describe what happens when a user performs common actions.

Examples:

User opens homepage

↓

Server renders page

↓

Fetch markets

↓

Return UI

↓

Realtime updates

Repeat for:

- Login
- Deposit
- Buy Position
- Sell Position
- Withdraw
- Market Resolution

---

# Prediction Engine Boundary

Explain where the prediction engine lives.

Explain what the engine owns.

Explain what the engine must never access directly.

Explain how every trade reaches the engine.

---

# Server Action Boundary

Explain which responsibilities belong inside Server Actions.

Examples:

- Buying
- Selling
- Deposits
- Withdrawals
- Market creation
- Market resolution

Explain what must never happen in the client.

---


# Database Boundary

Explain what data belongs in InstantDB.

Explain what does not belong in the database.

---

# Storage Boundary

Separate:

Database

File Storage

Cache

Generated Assets

Examples:

Database

- Users
- Markets
- Wallets
- Positions

File Storage

- KYC uploads
- User avatars
- Shareable images

Cache

- Trending markets
- Frequently accessed market lists

Generated Assets

- Social share cards
- Leaderboards

---


# Authentication & Authorization & permissons

Explain:

Authentication

Ownership

Role hierarchy

Guest

Authenticated User

Administrator

Explain which operations each role can perform.

---

# Background Tasks

Define every asynchronous process.

Examples:

- Payment webhooks
- Settlement
- Notifications
- Share image generation
- Market closing
- Scheduled jobs

Explain why each runs in the background.

---

# External Services

List every external dependency.

Examples:

Paystack

InstantDB

Image Generation

Email Provider ( currently out of scope)

Explain:

Purpose

Inputs

Outputs

Failure handling

---

# Error Handling Strategy

Explain how the system behaves when:

- Payment fails
- Database unavailable
- Webhook delayed
- Invalid trade
- Network timeout

---


# Data Flow Principles

Define how data flows through the application.

Examples:

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

UI Update

Explain the principles that every feature must follow.

---

# Security Principles

Define architecture-level security rules.

Examples:

- Client never modifies financial data.
- Prediction Engine always validates requests.
- Every financial action is authenticated.
- Sensitive operations execute only on the server.
- Ledger records are immutable.

---

# Integration Boundaries

Define every external integration point.

Include:

- Clerk Authentication
- Paystack
- InstantDB
- Future Email Provider
- Future Push Notifications

For every integration specify:

- Purpose
- Direction of communication
- Trusted data
- Validation requirements
- Failure handling
- Retry behaviour (if applicable)

No implementation details.

---

# Feature Boundaries

Document the responsibility of every major feature.

Examples:

Authentication

Wallet

Markets

Prediction Engine

Admin Dashboard

Notifications

Profile

For every feature define:

- Responsibility
- Dependencies
- What it owns
- What it must never own

---

# Prediction Engine Integration

Describe where the Prediction Engine sits in the architecture.

Describe which layers communicate with it.

Describe which layers are forbidden from communicating with it.

Do not describe pricing, settlement or trading behaviour.

---

# Realtime Architecture

Explain how realtime updates flow through the application.

Include:

- Market updates
- Price changes
- Probability changes
- Wallet balance updates
- Notifications
- Market resolution

Explain:

- What events trigger realtime updates.
- Which data must always update in realtime.
- Which data does not require realtime synchronization.

---

# Deployment Architecture

Explain the deployment model.

Include:

- Frontend
- Backend
- Database
- File Storage
- Background Workers

Describe how these systems communicate.

Do not include hosting configuration.

---

# Scalability Strategy

Explain how the architecture supports future growth.

Examples:

- More prediction categories
- Higher trading volume
- Additional payment providers
- Multiple administrators
- International expansion

Explain how the current architecture enables these without major redesign.

---

# Monitoring & Observability

Define what the platform must monitor.

Examples:

- Failed trades
- Failed payments
- Settlement failures
- Slow requests
- Database errors
- Prediction engine errors
- Background job failures

Explain why each event must be observable.

---

# Future Architecture

Clearly separate future architecture from MVP.

Examples:

- AI moderation
- Market recommendation engine
- Event streaming
- Queue workers
- Multi-region deployment

---

# Architectural Decisions

Document important architectural decisions and the reasoning behind them.

Include decisions such as:

- Next.js App Router over traditional REST architecture
- Clerk for authentication
- InstantDB for realtime synchronization
- Server Actions for all financial mutations
- Manual market creation and settlement
- Paystack for payments
- Static liquidity assigned before market opens
- Prediction Engine as the only source of pricing logic
- shadcn/ui with Tailwind CSS for UI components
- No mock user data during development
- Binary and multi-option markets supported from MVP

---

# Acceptance Criteria

The document is complete only if:

- Every technology has one clearly defined responsibility.
- Every system layer has a single purpose.
- Every folder has explicit ownership.
- Every architectural boundary is documented.
- Every external service is documented.
- Every background task is documented.
- Authentication and authorization are explicit.
- Storage boundaries are unambiguous.
- Architectural invariants are deterministic.
- A software engineer can understand how the entire system works without reading the code.

---

# Scope

This document must only describe its own domain.

If another topic belongs to a different document, reference it but do not redefine it.

Do not duplicate information across documentation.

Each concept must have exactly one source of truth.

---

## Writing Style

- Write in plain Markdown.
- Be implementation independent.
- Explain architecture, not code.
- Use tables where appropriate.
- Use deterministic language such as **must**, **will**, **cannot**, and **always**.
- Avoid vague wording.
- Treat this document as the single source of truth for Sheybi's architecture.