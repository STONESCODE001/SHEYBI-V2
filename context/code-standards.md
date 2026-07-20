# Code Standards

## Overview

### Purpose

This document defines the mandatory coding standards for the Sheybi codebase.

Its purpose is to ensure that every engineer and AI coding agent writes code that is consistent, predictable, maintainable, secure, and aligned with the architectural decisions of the platform.

This document governs **how code is written**, **how code is organized**, **how modules interact**, and **how new functionality is added** to the system.

These standards are mandatory for every feature, bug fix, refactor, and infrastructure change.

---

### Scope

This document applies to every source file in the Sheybi codebase, including but not limited to:

- User Interface
- Server Components
- Client Components
- Server Actions
- Prediction Engine integration
- Database access
- Authentication
- Authorization
- Background jobs
- Utility libraries
- Shared components
- Feature modules
- Testing
- Configuration
- Build tooling

Every contributor must follow these standards.

No contributor may introduce a conflicting coding style.

---

### Relationship to Other Documentation

This document governs implementation practices only.

It complements, but never overrides:

| Document | Responsibility |
|-----------|----------------|
| `architecture.md` | Defines system architecture, layer responsibilities, and dependency boundaries. |
| `database-schema.md` | Defines the business data model and entity relationships. |
| `prediction-engine.md` | Defines all trading and prediction market business rules. |
| `design-system.md` | Defines the visual design language and UI component behavior. |
| `api-contracts.md` | Defines every API contract, request format, response format, validation rule, and error response. |

If a rule conflicts with another document, the document responsible for that domain is the source of truth.

This document must never duplicate business rules defined elsewhere.

---

## Core Engineering Principles

The following principles govern every part of the Sheybi codebase.

These principles are mandatory.

---

### Single Responsibility Principle

#### Meaning

Every module must own exactly one responsibility.

A module must solve one problem.

#### Purpose

Single-purpose modules are easier to understand, test, extend, review, and replace.

#### Compliant

- A button component renders a button.
- A Server Action processes one business operation.
- A utility formats currency only.
- A validator validates one request type.

#### Violations

- A component fetching data, mutating state, validating input, and rendering UI.
- A utility performing unrelated formatting operations.
- A Server Action handling deposits and withdrawals simultaneously.

---

### Separation of Concerns

#### Meaning

Every concern must exist in the correct architectural layer.

Presentation concerns must remain inside presentation.

Business logic must remain inside business logic.

Persistence concerns must remain inside persistence.

#### Purpose

Layer separation prevents tight coupling.

It makes features replaceable without affecting unrelated systems.

#### Compliant

- UI renders data.
- Server Actions coordinate requests.
- Prediction Engine owns prediction calculations.
- Database layer stores data.

#### Violations

- Financial calculations inside React components.
- SQL or database queries inside UI components.
- Business validation inside styling utilities.

---

### Composition Over Duplication

#### Meaning

Shared behaviour must be extracted into reusable modules.

Logic must never be copied between features.

#### Purpose

A single implementation reduces bugs and simplifies maintenance.

#### Compliant

- Shared Button component.
- Shared Currency formatter.
- Shared validation helper.

#### Violations

- Three different buy buttons implementing the same logic.
- Copy-pasted validation across multiple actions.

---

### Explicit Behaviour Over Implicit Behaviour

#### Meaning

Code must communicate exactly what it does.

Hidden side effects are forbidden.

#### Purpose

Explicit behaviour improves readability and reduces unexpected system behaviour.

#### Compliant

- Functions clearly declare required parameters.
- Return values describe operation results.
- State changes are immediately visible.

#### Violations

- Functions modifying unrelated global state.
- Hidden database writes.
- Implicit authentication.

---

### Predictability Over Cleverness

#### Meaning

Readable code always takes priority over clever or compact code.

#### Purpose

The next engineer must understand the code without reverse engineering its intent.

#### Compliant

Simple conditionals.

Clear function names.

Straightforward control flow.

#### Violations

- Nested ternary expressions.
- Obscure language tricks.
- Excessive abstraction.

---

### Readability Over Brevity

#### Meaning

Longer code is acceptable when it improves clarity.

#### Purpose

Readable systems reduce maintenance cost.

#### Compliant

Descriptive variable names.

Small functions.

Clear branching.

#### Violations

- One-letter variables.
- Deeply nested expressions.
- Condensed logic with unclear intent.

---

### Deterministic Business Logic

#### Meaning

Identical inputs must always produce identical business outcomes.

#### Purpose

Prediction markets require reproducible financial behaviour.

#### Compliant

Trading logic executes identically for identical requests.

Settlement always produces the same payout.

#### Violations

- Random pricing behaviour.
- Hidden state affecting calculations.
- Time-dependent calculations without explicit timestamps.

---

### Fail Fast

#### Meaning

Invalid input must be rejected immediately.

Execution must stop as soon as validation fails.

#### Purpose

Early failures prevent inconsistent state.

#### Compliant

Authentication checked before processing.

Validation performed before mutation.

#### Violations

Partial database updates before validation.

Ignoring validation errors.

---

### Immutable Financial History

#### Meaning

Financial history must never be rewritten.

Corrections must create new records instead of modifying existing records.

#### Purpose

Financial integrity requires complete auditability.

#### Compliant

New ledger entries correcting previous records.

Settlement recorded as new transactions.

#### Violations

Editing ledger records.

Deleting completed trades.

Changing completed deposits.

---

### Security by Default

#### Meaning

Every feature must assume untrusted input.

Validation is mandatory.

Authorization is mandatory.

Ownership validation is mandatory.

#### Purpose

Security failures must be prevented by design rather than added later.

#### Compliant

Every mutation validates ownership.

Every request validates authentication.

#### Violations

Trusting client input.

Skipping authorization.

Client-controlled financial values.

---

## TypeScript Standards

TypeScript exists to improve correctness and maintainability.

Every TypeScript rule below is mandatory.

---

### Strict Mode

**Required**

The entire project must use TypeScript strict mode.

No file may disable strict type checking.

---

### Explicit Return Types

**Required**

Every exported function must declare an explicit return type.

Private helper functions may rely on inference only when the inferred type is obvious.

---

### Interfaces vs Types

Interfaces must define extendable object contracts.

Type aliases must define:

- unions
- intersections
- mapped types
- utility compositions
- function signatures
- primitive aliases

Interfaces must not be used for unions.

Type aliases must not replace extendable interfaces.

---

### Readonly

Properties that never change after creation must use `readonly`.

Immutable collections must expose readonly arrays.

Business identifiers must always be immutable.

---

### Enums vs Union Types

String literal unions are required for finite business states.

Examples include:

- Market states
- Position states
- Notification types
- User roles

Enums are permitted only when interoperability or serialization requires them.

---

### Literal Types

Literal types must be used whenever values belong to a finite set.

Magic strings are forbidden.

---

### Nullable Values

Nullable values must be explicit.

`null`

and

`undefined`

must never represent the same meaning.

Each nullable property must document why it may be absent.

---

### Unknown

External input must always be treated as `unknown`.

Validation must occur before type narrowing.

Unknown values must never be cast directly.

---

### Never

Impossible execution paths must resolve to `never`.

Exhaustive switches are mandatory for finite unions.

---

### Any

The `any` type is forbidden.

Exceptions require documented justification and approval.

Temporary `any` usage during development must never be merged into the main branch.

---

### Discriminated Unions

Finite business states must use discriminated unions.

Every union member must expose one unique discriminator.

---

### Branded Identifiers

Business identifiers must use branded types to prevent accidental interchange between unrelated identifiers.

Examples include:

- User IDs
- Market IDs
- Wallet IDs
- Position IDs
- Trade IDs

Identifiers representing different business entities must never be interchangeable.

---

### Generics

Generics must improve type safety.

Generic parameters must use descriptive names.

Unconstrained generics are forbidden unless absolutely required.

---

### Utility Types

Built-in utility types may be used when they improve readability.

Nested utility compositions that reduce readability are forbidden.

---

### Type Assertions

Type assertions must be treated as exceptional.

Validation is preferred over assertions.

Double assertions are forbidden.

---

### Import Type

Type-only imports must use explicit type imports.

Runtime imports must never include type-only dependencies.

---

### Optional Properties

Optional properties must represent values that may legitimately be absent.

Optional properties must never represent incomplete validation.

---

### Function Parameters

Functions must accept the minimum required number of parameters.

Functions accepting more than five parameters must instead receive a typed object.

---

### Boolean Parameters

Multiple boolean parameters are forbidden.

Replace them with descriptive configuration objects or discriminated unions.

---

### Function Size

Functions must perform one responsibility.

Functions exceeding approximately fifty logical lines must be evaluated for extraction into smaller functions.

---

### File Size

Files must remain focused on one concern.

Files containing unrelated responsibilities must be split into dedicated modules.

---

### Comments

Comments must explain intent.

Comments must never explain obvious syntax.

Outdated comments must be removed immediately.

---

### Dead Code

Unused exports are forbidden.

Commented-out code is forbidden.

Experimental implementations belong in feature branches, not the main codebase.

---

### Magic Values

Hardcoded business values are forbidden.

Shared business constants must live in dedicated constants modules.

UI values must reference the Design System tokens.

Financial values must reference the Prediction Engine configuration.

---

## Naming Conventions

Consistent naming is mandatory throughout the Sheybi codebase.

Names must communicate business intent.

Abbreviations are forbidden unless they are universally recognized.

---

### Variables

- Must use **camelCase**
- Must describe stored data
- Must never use single-character names except loop indices

**Examples**

- `walletBalance`
- `marketProbability`
- `withdrawalFee`

Forbidden:

- `x`
- `tmp`
- `obj`
- `data`

---

### Functions

- Must use **camelCase**
- Must begin with a verb
- Must describe exactly one action

**Examples**

- `calculatePayout`
- `createMarket`
- `validateTrade`
- `settlePosition`

Forbidden:

- `market`
- `wallet`
- `handler`
- `processEverything`

---

### Constants

Constants must use **SCREAMING_SNAKE_CASE**.

Examples:

- `MAX_WITHDRAWAL_FEE`
- `TRADING_FEE_RATE`
- `DEFAULT_MARKET_LIQUIDITY`

---

### Types

Custom types must use **PascalCase**.

Examples:

- `WalletBalance`
- `MarketSummary`
- `TradeResult`

---

### Interfaces

Interfaces must use **PascalCase**.

Interface names must describe contracts.

Prefixing interfaces with `I` is forbidden.

Correct:

- `Wallet`
- `TradeRequest`

Incorrect:

- `IWallet`
- `ITrade`

---

### Components

React components must use **PascalCase**.

Examples:

- `MarketCard`
- `WalletSummary`
- `TradeModal`

Component filenames must exactly match exported component names.

---

### Hooks

Hooks must begin with `use`.

Examples:

- `useWallet`
- `useMarket`
- `useRealtimeMarket`

Hooks not beginning with `use` are forbidden.

---

### Files

File names must use **kebab-case**.

Examples:

- `market-card.tsx`
- `wallet-summary.ts`
- `trade-history.tsx`

Exceptions:

- React components may mirror exported PascalCase names only if that convention is adopted consistently across the project. Otherwise, kebab-case remains mandatory.

---

### Folders

Folder names must use **kebab-case**.

Examples:

- `prediction-engine`
- `wallet`
- `market-details`

---

### Routes

Route segments must use lowercase kebab-case.

Examples:

- `/markets`
- `/wallet`
- `/admin/users`

---

### Server Actions

Action names must describe one mutation.

Examples:

- `buyPosition`
- `sellPosition`
- `resolveMarket`

Generic names are forbidden.

---

### Database Entities

Database entity names must exactly match the terminology defined in `database-schema.md`.

Aliases are forbidden.

---

### Environment Variables

Environment variables must use **SCREAMING_SNAKE_CASE**.

Every environment variable must begin with an application-specific prefix where applicable.

Examples:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `PAYSTACK_SECRET_KEY`

Undocumented environment variables are forbidden.

---

## Import Standards

Import statements must remain consistent throughout the project.

- Standard library imports must appear first.
- Third-party imports must appear second.
- Internal absolute imports must appear third.
- Relative imports must appear last.
- Type-only imports must use `import type`.
- Wildcard imports are forbidden unless required by the library.
- Circular imports are forbidden.
- Unused imports must be removed immediately.
- Deep relative paths exceeding two directory levels should be replaced with project aliases where available.


# Folder Organization

The folder structure defined in `architecture.md` is mandatory.

Every folder has one responsibility.

Files must always be placed in the folder that owns their concern.

Cross-boundary responsibilities are forbidden.

---

## `app/`

### Purpose

Owns application routing, layouts, pages, metadata, and route composition.

### Allowed

- Route definitions
- Layout definitions
- Page composition
- Route metadata
- Route-level loading UI
- Route-level error UI

### Forbidden

- Business logic
- Financial calculations
- Prediction engine logic
- Database queries
- Reusable UI components
- Utility functions

### Dependencies

May depend on:

- `features/`
- `components/`
- `providers/`
- `actions/`

Must never be depended upon by any other folder.

---

## `components/`

### Purpose

Owns reusable presentation components shared across multiple features.

### Allowed

- Buttons
- Cards
- Tables
- Dialogs
- Navigation
- Empty states
- Shared layout primitives

### Forbidden

- Business logic
- Prediction engine logic
- Database access
- Feature-specific state
- Financial calculations

### Dependencies

May depend on:

- `components/ui`
- `lib`
- `types`

Must never depend on:

- `features`
- `actions`
- `engine`

---

## `components/ui/`

### Purpose

Owns the application's design-system primitives.

### Allowed

- Base buttons
- Inputs
- Selects
- Badges
- Dialogs
- Tooltips
- Skeletons

Every component must follow `design-system.md`.

### Forbidden

- Business rules
- Feature behaviour
- Network requests

---

## `features/`

### Purpose

Owns complete business features.

Examples:

- Authentication
- Wallet
- Markets
- Profile
- Admin Dashboard

### Allowed

- Feature pages
- Feature components
- Feature hooks
- Feature utilities
- Feature validation

### Forbidden

- Shared UI
- Prediction pricing
- Cross-feature coupling

### Dependencies

May depend on:

- components
- actions
- engine
- lib
- hooks

Must never depend on unrelated features.

---

## `actions/`

### Purpose

Owns every Server Action.

### Allowed

- Authentication
- Authorization
- Validation
- Calling Prediction Engine
- Database mutations
- Transactions

### Forbidden

- UI rendering
- Styling
- React hooks

Every financial mutation must originate here.

---

## `engine/`

### Purpose

Owns the Prediction Engine.

This folder is the only source of prediction market business logic.

### Allowed

- Trade validation
- Pricing logic
- Settlement logic
- Probability updates
- Liquidity rules
- Market resolution rules

### Forbidden

- UI
- Authentication
- React
- Database queries unrelated to prediction logic
- Styling

No folder except `actions/` may invoke the engine.

---

## `lib/`

### Purpose

Owns shared infrastructure.

### Allowed

- Authentication helpers
- Database clients
- Date utilities
- Currency utilities
- Environment configuration
- Shared validators

### Forbidden

- Feature-specific logic
- Prediction calculations
- UI components

---

## `hooks/`

### Purpose

Owns reusable React hooks.

### Allowed

- UI state
- Browser APIs
- Realtime subscriptions
- Shared client behaviour

### Forbidden

- Database mutations
- Business logic
- Financial calculations

---

## `providers/`

### Purpose

Owns application-wide providers.

### Allowed

- Theme provider
- Clerk provider
- InstantDB provider
- Query providers

### Forbidden

- Business rules
- Feature logic

---

## `types/`

### Purpose

Owns shared TypeScript definitions.

### Allowed

- Interfaces
- Type aliases
- Shared enums
- Utility types

### Forbidden

- Runtime code
- Business logic

---

## `constants/`

### Purpose

Owns application constants.

### Allowed

- Route names
- Limits
- Default values
- Feature flags

### Forbidden

- Functions
- Database logic

---

## `config/`

### Purpose

Owns configuration consumed by the application.

### Allowed

- Environment mappings
- Feature configuration
- Service configuration

### Forbidden

- Runtime business logic

---

## `utils/`

### Purpose

Owns pure utility functions.

### Allowed

- String formatting
- Number formatting
- Currency formatting
- Date formatting

### Forbidden

- State mutation
- API requests
- Prediction logic

---

## `styles/`

### Purpose

Owns global styling.

### Allowed

- Global CSS
- Theme tokens
- Font declarations

### Forbidden

- Component logic

---

## `public/`

### Purpose

Owns static assets.

### Allowed

- Images
- Icons
- Fonts
- Static files

### Forbidden

- Generated assets
- User uploads

---

# Component Standards

Every component must have one responsibility.

Components must be predictable, reusable, and accessible.

---

## Presentational Components

Purpose:

Display UI only.

Responsibilities:

- Render data
- Accept props
- Emit events

Must never:

- Fetch data
- Mutate data
- Perform business calculations

---

## Container Components

Purpose:

Coordinate feature behaviour.

Responsibilities:

- Fetch data
- Connect hooks
- Handle loading states
- Pass data downward

Must never:

- Duplicate Prediction Engine logic
- Duplicate validation

---

## Shared Components

Purpose:

Provide reusable UI primitives.

Examples:

- Button
- Badge
- Avatar
- Card
- Modal
- Tooltip

Shared components must remain domain agnostic.

They must never know what a prediction market is.

---

## Feature Components

Purpose:

Represent one feature.

Examples:

- Market Card
- Wallet Balance
- Withdrawal Form
- Leaderboard

Feature components may compose shared components.

Feature components must never be reused across unrelated domains.

---

## Layout Components

Purpose:

Compose application layouts.

Responsibilities:

- Grid structure
- Navigation
- Sidebar
- Header
- Footer

Must never:

- Fetch business data
- Execute mutations

---

## Server Components

Server Components are the default.

Server Components must:

- Fetch data
- Render initial UI
- Reduce client-side JavaScript

Server Components must never:

- Use browser APIs
- Hold client state

---

## Client Components

Client Components exist only when browser interactivity is required.

Examples:

- Forms
- Dropdowns
- Modals
- Charts
- Drag interactions

Client Components must never:

- Execute financial mutations directly
- Access secrets
- Perform business validation

---

## Props

Props must be:

- Explicit
- Typed
- Minimal

Large prop chains are forbidden.

Boolean flags controlling multiple behaviours are forbidden.

---

## Composition

Components must compose smaller components.

Inheritance patterns are forbidden.

---

## Children

Children must only be used when composition improves flexibility.

Children must not replace explicit APIs.

---

## State

Components may own only UI state.

Business state belongs outside components.

---

## Memoization

Memoization must solve measured performance problems.

Premature memoization is forbidden.

---

## Accessibility

Every interactive component must:

- Be keyboard accessible
- Expose visible focus
- Support screen readers
- Meet WCAG contrast requirements
- Use semantic HTML

Accessibility is mandatory.

---

## Reusability

Reusable components must:

- Remain generic
- Avoid business terminology
- Avoid feature coupling

Business-specific behaviour belongs inside feature components.

# Server Action Standards

Server Actions are the exclusive entry point for every server-side mutation in the Sheybi application.

They coordinate authenticated requests, validate business intent, invoke the Prediction Engine when required, persist changes, and return deterministic results.

Server Actions are orchestration layers.

They are **not** business logic layers.

---

## Responsibilities

Every Server Action must perform exactly one business operation.

Examples include:

- Create Market
- Buy Position
- Sell Position
- Deposit Funds
- Request Withdrawal
- Resolve Market
- Cancel Market
- Approve Withdrawal

A Server Action must never perform multiple unrelated business operations.

---

## Mandatory Execution Order

Every Server Action must execute the following steps in the same order.

1. Authenticate the requester.
2. Authorize the requester.
3. Validate request structure.
4. Validate business rules.
5. Validate resource ownership.
6. Load required data.
7. Execute the business operation or invoke the Prediction Engine.
8. Persist changes.
9. Record audit and financial history where applicable.
10. Return a deterministic response.

No step may be skipped.

No mutation may occur before validation completes successfully.

---

## Authentication

Every protected Server Action must verify the caller's identity before performing any work.

Unauthenticated requests must terminate immediately.

Authentication must never occur after validation or database access.

---

## Authorization

Every Server Action must verify the caller's permissions.

Examples:

- Users cannot resolve markets.
- Users cannot approve withdrawals.
- Users cannot suspend accounts.
- Administrators cannot act outside their administrative permissions.

Permission checks must occur before business execution.

---

## Ownership Validation

Every Server Action operating on user-owned resources must verify ownership.

Examples:

- Wallet
- Position
- Withdrawal Request
- Profile
- Uploaded Documents

Ownership validation is mandatory.

Ownership must never rely on client-provided identifiers alone.

---

## Input Validation

Every input must be validated before use.

Validation must include:

- Required fields
- Data types
- Value ranges
- Enumeration values
- Business constraints

Invalid requests must terminate immediately.

Partial execution is forbidden.

---

## Business Validation

Business validation must occur after structural validation.

Examples include:

- Market is open.
- Position exists.
- Sufficient wallet balance.
- Market has not resolved.
- User account is active.

Business rules belong to the Prediction Engine or business services, not inside validation helpers.

---

## Prediction Engine Invocation

Any operation affecting prediction markets must invoke the Prediction Engine.

Examples:

- Buy Position
- Sell Position
- Resolve Market
- Cancel Market
- Settlement

Server Actions must never reproduce Prediction Engine behaviour.

They must delegate business decisions to the engine.

---

## Database Mutations

Database writes must occur only after all validation succeeds.

Writes must be deterministic.

Writes must never depend on client-controlled calculations.

---

## Transactions

Related financial mutations must execute atomically.

If one financial mutation fails, every related mutation must fail.

Partial financial updates are forbidden.

---

## Logging

Every Server Action must record operational events appropriate to its responsibility.

Financial actions must generate audit records.

Unexpected failures must generate error logs.

Sensitive information must never be logged.

---

## Idempotency

Repeated requests representing the same operation must not create duplicate financial outcomes.

Duplicate submissions must produce one business result.

Financial mutations must be idempotent whenever external retries are possible.

---

## Error Handling

Every Server Action must return deterministic error responses.

Internal implementation details must never be exposed.

Errors must clearly distinguish between:

- Validation failures
- Authentication failures
- Authorization failures
- Business rule violations
- System failures

---

## Forbidden Behaviour

Server Actions must never:

- Render UI
- Contain styling
- Duplicate Prediction Engine logic
- Perform pricing calculations
- Trust client financial values
- Skip authentication
- Skip authorization
- Skip ownership validation
- Modify immutable financial history
- Access browser APIs
- Depend on React components

Server Actions exist only to coordinate secure business execution.
```


# API Standards

The API layer exists to expose application capabilities to trusted clients in a predictable, secure, and consistent manner.

All API endpoints must follow the contracts defined in **`api-contracts.md`**.

This document defines implementation standards only.

It does not redefine endpoint behavior, request schemas, response schemas, or business rules.

---

## Purpose

Every API endpoint must perform four responsibilities only:

1. Receive a request.
2. Validate the request.
3. Delegate business execution.
4. Return a deterministic response.

API endpoints are transport layers.

They must never become business logic layers.

---

## Input Validation

Every request must undergo complete validation before any business operation begins.

Validation must include:

- Authentication
- Request format
- Required fields
- Data types
- Enumeration values
- Length constraints
- Numeric limits
- Business preconditions

Validation failures must terminate execution immediately.

No mutation may occur before validation succeeds.

---

## Authentication

Protected endpoints must always verify authentication before accessing protected resources.

Unauthenticated requests must return an authentication error.

Authentication must never be optional for protected operations.

---

## Authorization

Every protected endpoint must verify user permissions.

Authorization must validate:

- User role
- Resource ownership
- Administrative privileges
- Feature access

Authorization failures must terminate execution immediately.

---

## Ownership Validation

Endpoints operating on user-owned resources must validate ownership before reading or mutating data.

Examples include:

- Wallets
- Positions
- Withdrawal Requests
- Deposits
- KYC Records
- User Profiles

Ownership must never rely solely on client-provided identifiers.

---

## Business Validation

Business validation occurs after structural validation.

Examples include:

- Market is open.
- User account is active.
- Withdrawal amount is valid.
- Position exists.
- Position is sellable.
- Market has not resolved.
- Wallet has sufficient balance.

Business validation belongs to the Prediction Engine or business services.

API endpoints must never duplicate business rules.

---

## Request Processing

Every endpoint must follow the same execution order.

1. Receive request.
2. Authenticate.
3. Authorize.
4. Validate input.
5. Validate ownership.
6. Delegate business execution.
7. Persist changes.
8. Return response.

No endpoint may skip any mandatory step.

---

## Response Structure

Every successful response must be deterministic.

Responses must:

- Clearly indicate success.
- Return only relevant data.
- Exclude internal implementation details.
- Remain consistent across the application.

Response formats are defined exclusively by `api-contracts.md`.

---

## Error Responses

Errors must always be predictable.

Every error must identify:

- Category
- Cause
- User-safe message

Errors must never expose:

- Stack traces
- Database details
- Internal identifiers
- Secrets
- Infrastructure details

---

## Status Codes

Every endpoint must return status codes that accurately describe the outcome.

Status codes must never contradict the actual operation result.

Status code definitions belong to `api-contracts.md`.

---

## Pagination

Endpoints returning collections must support deterministic pagination.

Pagination must remain stable regardless of concurrent writes.

Pagination behavior is defined in `api-contracts.md`.

---

## Filtering

Filtering must occur before pagination.

Filtering rules must be deterministic.

Unknown filters must be rejected.

---

## Sorting

Sorting must always be explicit.

Default sort orders must remain consistent across requests.

Client-provided sorting must validate supported fields.

---

## Versioning

Breaking API changes must introduce a new API version.

Existing versions must remain functional until officially deprecated.

Versioning strategy is defined in `api-contracts.md`.

---

## Rate Limiting

Public endpoints must enforce request limits.

Protected financial endpoints must enforce stricter limits.

Administrative endpoints must use independent limits.

Rate limiting must prevent abuse without affecting legitimate usage.

---

## Idempotency

Operations capable of duplicate execution must be idempotent.

Examples include:

- Deposits
- Withdrawals
- Payment callbacks
- Settlement
- Market Resolution

Repeated requests must never create duplicate financial records.

---

## API Responsibilities

API endpoints may:

- Authenticate requests.
- Validate input.
- Validate ownership.
- Invoke business logic.
- Return responses.

API endpoints must never:

- Calculate prediction prices.
- Perform settlement calculations.
- Modify financial history directly.
- Contain UI logic.
- Duplicate Prediction Engine behavior.

---

# Prediction Engine Standards

The Prediction Engine is the exclusive owner of all prediction market business logic.

Application code interacts with the engine through a single, well-defined execution path.

Business rules are defined in **`prediction-engine.md`**.

This section defines interaction standards only.

---

## Purpose

The Prediction Engine exists to guarantee deterministic market behavior.

Every trade must produce identical results for identical inputs.

No other layer may reproduce Prediction Engine logic.

---

## Allowed Callers

The Prediction Engine may be invoked only by:

- Server Actions
- Approved background jobs responsible for settlement or scheduled market events

No other layer may invoke the engine directly.

---

## Forbidden Callers

The following layers must never communicate directly with the Prediction Engine:

- UI Components
- Client Components
- React Hooks
- Utility Functions
- External APIs
- Database Models
- Browser Code

All requests must pass through Server Actions.

---

## Validation Order

Before invoking the Prediction Engine, callers must verify:

1. Authentication
2. Authorization
3. Ownership
4. Input validation
5. Business preconditions

The engine assumes validated requests.

---

## Engine Responsibilities

The Prediction Engine owns:

- Market pricing
- Probability updates
- Liquidity rules
- Trade execution
- Position calculations
- Settlement calculations
- Market resolution validation
- Financial invariants

No other module may implement these responsibilities.

---

## Engine Return Values

The Prediction Engine must return deterministic business outcomes.

Returned data must contain only information necessary to complete the operation.

Internal implementation details must never escape the engine boundary.

---

## Error Handling

Prediction Engine failures must return deterministic business errors.

Unexpected internal failures must terminate execution safely.

No partial market mutation may occur after engine failure.

---

## State Mutation Rules

The Prediction Engine is the only module permitted to determine:

- Price changes
- Probability changes
- Position outcomes
- Settlement values
- Winning options

Persistence remains the responsibility of the calling Server Action.

---

## Prediction Engine Isolation

The engine must remain independent from:

- React
- Browser APIs
- UI Components
- Styling
- Routing
- Presentation concerns

This isolation guarantees portability and deterministic execution.

---

## Prediction Engine References

Trading rules, settlement rules, liquidity rules, pricing behavior, and market lifecycle definitions belong exclusively to **`prediction-engine.md`**.

Application code must reference that document instead of redefining business behavior.

---

# Database Access Standards

The database exists to persist business state.

The business data model is defined exclusively in **`database-schema.md`**.

This section defines how application code interacts with the database.

---

## General Principles

Database access must always be:

- Explicit
- Predictable
- Authorized
- Validated
- Auditable

Every database mutation must preserve business integrity.

---

## Read Operations

Read operations must request only the data required to complete the operation.

Over-fetching is forbidden.

Repeated identical queries should be minimized through appropriate caching where permitted by the architecture.

---

## Mutations

Every mutation must:

- Validate authentication.
- Validate authorization.
- Validate ownership.
- Validate business rules.
- Preserve invariants.

Mutations must never bypass the Prediction Engine when market behavior is affected.

---

## Transactions

Financial mutations affecting multiple entities must execute atomically.

Either every mutation succeeds or every mutation fails.

Partial financial updates are forbidden.

---

## Relationship Loading

Relationships must be loaded intentionally.

Application code must avoid unnecessary relationship traversal.

Only required related entities may be loaded.

---

## Ownership Validation

Database access must always verify ownership before exposing private records.

Ownership checks must occur independently of client-provided identifiers.

---

## Soft Deletion

Entities supporting soft deletion must never be permanently removed during ordinary application workflows.

Soft-deleted records must remain recoverable until administrative retention policies expire.

---

## Immutable Records

The following records must remain immutable after creation:

- Ledger Entries
- Completed Deposits
- Completed Withdrawals
- Settlements
- Audit Logs

Corrections must create new records.

Existing records must never be rewritten.

---

## Financial Integrity

Database writes must preserve every financial invariant defined in:

- `prediction-engine.md`
- `database-schema.md`

Application code must never bypass these invariants.

---

## Query Standards

Database queries must:

- Be deterministic.
- Return predictable ordering.
- Avoid duplicate records.
- Avoid ambiguous filtering.
- Validate externally supplied identifiers before execution.

---

## Database References

Entity definitions, relationships, indexes, ownership rules, and lifecycle definitions belong exclusively to **`database-schema.md`**.

Application code must reference that document instead of duplicating database behavior.

---

# State Management Standards

Every piece of state must have one owner.

State duplication is forbidden unless explicitly required for performance or auditability.

---

## Client State

Client state exists only for temporary interface behavior.

Examples include:

- Open dialogs
- Form inputs
- Active tabs
- Expanded sections
- Selected filters
- Local animations

Client state must never contain business truth.

---

## Server State

Server state represents authoritative business data retrieved from the backend.

Examples include:

- Markets
- Wallet
- Positions
- Notifications
- Categories
- Profile

Server state is owned by the backend.

The client must never treat cached copies as the source of truth.

---

## Persistent State

Persistent state is stored permanently.

Examples include:

- Users
- Wallets
- Ledger
- Positions
- Markets
- Deposits
- Withdrawals

Persistent state is owned exclusively by the database.

---

## Realtime State

Realtime state represents data synchronized automatically after server-side mutations.

Examples include:

- Market prices
- Market probabilities
- Trading volume
- Wallet balances
- Notifications
- Market status

Realtime updates must always originate from the server.

Clients must never broadcast business state directly.

---

## Derived State

Derived state is calculated from authoritative data.

Examples include:

- Profit/Loss
- ROI
- Portfolio Value
- Trending Rankings

Derived state must never become the system of record.

---

## State Synchronization

State synchronization must always flow in one direction:

Server

↓

Realtime Synchronization

↓

Client

Clients must never overwrite authoritative state.

---

## State Ownership

Each state value must have exactly one owner.

Duplicated ownership is forbidden.

---

## State Invalidation

After every successful mutation:

- stale state must be invalidated,
- authoritative state must be refreshed,
- realtime subscribers must receive updated values where applicable.

---

## State Caching

Only non-financial data may be cached aggressively.

Financial balances, ledger history, settlements, and market outcomes must always prioritize authoritative server data.

---

## Forbidden Practices

Application code must never:

- Duplicate business state across multiple owners.
- Compute financial truth inside UI components.
- Store authoritative business data in local component state.
- Trust cached financial values after mutations.
- Treat derived values as authoritative records.

State ownership must remain explicit throughout the entire application.

---

# Styling Standards

The visual design of Sheybi is defined exclusively in **`design-system.md`**.

This section defines implementation rules only.

It does not redefine colors, spacing, typography, or component behavior.

---

## General Rules

All styling must follow the Design System.

Visual decisions must never be made independently by individual features.

Consistency takes precedence over local customization.

---

## Tailwind Usage

Tailwind utility classes must be the primary styling mechanism.

Custom CSS must be limited to global styles, design tokens, and documented utilities.

---

## Design Tokens

Colors, spacing, typography, shadows, borders, and radii must reference design tokens.

Hardcoded visual values are forbidden.

---

## Responsive Design

Every screen must support the responsive breakpoints defined in `design-system.md`.

Responsive behavior must be intentional.

Layout shifts must remain predictable.

---

## Dark Theme

The MVP is dark-mode only.

Components must not introduce independent light-mode behavior.

---

## Animations

Animations must improve clarity.

Animations must never delay critical interactions.

Users requesting reduced motion must receive reduced animation.

---

## Spacing

Spacing must follow the spacing scale defined in the Design System.

Arbitrary spacing values are forbidden.

---

## Typography

Typography must use the defined semantic text styles.

Font sizes must never be selected arbitrarily.

---

## Border Radius

Border radii must follow the standardized radius scale.

Random radius values are forbidden.

---

## Color Usage

Every color must reference a semantic design token.

Raw hexadecimal values are forbidden outside the Design System.

---

## Forbidden Styling Practices

Application code must never:

- Hardcode colors.
- Hardcode spacing scales.
- Create undocumented component variants.
- Duplicate component styles.
- Override design tokens locally.
- Break responsive layouts intentionally.

Every visual implementation must remain consistent with `design-system.md`.

---

# Accessibility Standards

Accessibility is a mandatory quality requirement.

Every user must be able to operate the application regardless of input method or assistive technology.

---

## Keyboard Navigation

Every interactive element must be reachable using only the keyboard.

Keyboard traps are forbidden.

---

## Focus Management

Every interactive element must expose a visible focus indicator.

Focus order must follow logical reading order.

---

## Semantic HTML

Semantic HTML elements must be preferred over generic containers.

Interactive behavior must never rely solely on visual styling.

---

## ARIA

ARIA attributes must be added only when semantic HTML cannot communicate the required meaning.

Incorrect ARIA usage is forbidden.

---

## Screen Readers

Every interactive control must expose an accessible name.

Images conveying information must include meaningful alternative text.

Decorative images must be ignored by assistive technologies.

---

## Color Contrast

Text and interactive elements must satisfy accessibility contrast requirements.

Color alone must never communicate important information.

---

## Reduced Motion

Animations must respect reduced-motion preferences.

Critical workflows must remain fully usable without animations.

---

## Forms

Every form control must include:

- A visible label
- Validation feedback
- Accessible error messaging
- Proper focus behavior

---

## Interactive Targets

Interactive controls must provide sufficient target size for mouse, touch, and keyboard users.

---

## Accessibility Reviews

Accessibility requirements apply to every pull request.

Accessibility regressions must be treated as functional defects.


# Error Handling Standards

Errors are part of the application's business behavior.

Every error must be predictable, deterministic, recoverable where possible, and safe to expose.

Errors must never leave the system in a partially completed state.

---

## General Principles

Every error must:

- Be detected immediately.
- Stop invalid execution.
- Preserve data integrity.
- Preserve financial integrity.
- Return a deterministic response.
- Produce appropriate logs.

Unexpected failures must fail safely.

---

## Error Categories

All errors must belong to one category.

Categories include:

- Validation Errors
- Authentication Errors
- Authorization Errors
- Ownership Errors
- Business Rule Errors
- Financial Errors
- Prediction Engine Errors
- Database Errors
- External Service Errors
- Network Errors
- Unexpected System Errors

Categories must never overlap.

---

## Validation Errors

Validation errors occur before business execution.

Examples:

- Missing required field
- Invalid data type
- Invalid enum value
- Negative amount
- Zero amount
- Invalid identifier

Validation errors must:

- Reject the request.
- Produce no side effects.
- Produce no database mutations.

---

## Authentication Errors

Authentication errors occur when identity cannot be verified.

Examples:

- Missing session
- Expired session
- Invalid token

Authentication failures must terminate execution immediately.

Protected resources must never be accessed.

---

## Authorization Errors

Authorization errors occur when permissions are insufficient.

Examples:

- User attempts administrative action.
- User resolves a market.
- User approves withdrawals.

Authorization failures must not expose restricted resources.

---

## Ownership Errors

Ownership validation failures occur when users attempt to access resources they do not own.

Examples:

- Wallet
- Position
- Withdrawal
- Profile

Ownership failures must terminate immediately.

---

## Business Rule Errors

Business rule errors occur after validation.

Examples:

- Market closed
- Market resolved
- Insufficient balance
- Selling unavailable shares
- Duplicate settlement

Business rule failures must never partially mutate state.

---

## Prediction Engine Errors

Prediction Engine failures indicate business execution could not complete.

Examples:

- Invalid market state
- Settlement conflict
- Liquidity violation
- Pricing invariant violation

Prediction Engine failures must rollback every related mutation.

---

## Financial Errors

Financial errors include:

- Insufficient balance
- Duplicate payment
- Duplicate withdrawal
- Settlement conflict

Financial errors must never leave inconsistent balances.

---

## Database Errors

Database failures include:

- Connection failures
- Transaction failures
- Constraint violations
- Persistence failures

Database failures must rollback all pending mutations.

---

## External Service Errors

Examples include:

- Paystack unavailable
- File storage unavailable
- Authentication provider unavailable

External failures must never corrupt application state.

---

## Network Errors

Network interruptions must not create duplicate mutations.

Retriable requests must remain idempotent.

---

## Unexpected Errors

Unexpected exceptions must:

- Stop execution.
- Rollback pending work.
- Produce error logs.
- Return generic user-safe messages.

Internal implementation details must never be exposed.

---

## User Messages

User-facing errors must:

- Explain what failed.
- Explain what action may be taken.
- Never expose implementation details.

---

## Logging

Recoverable errors must produce warning logs.

Unexpected failures must produce error logs.

Fatal failures must generate operational alerts.

---

## Retry Behaviour

Retries are permitted only for operations documented as idempotent.

Repeated retries must never duplicate financial records.

---

# Logging Standards

Logging exists for observability, auditing, debugging, compliance, and incident investigation.

Logs must be structured, searchable, and deterministic.

---

## General Rules

Every log entry must contain:

- Timestamp
- Event category
- Severity
- Correlation identifier
- Actor
- Resource
- Result

Logs must remain immutable.

---

## Authentication Logging

Log:

- Login
- Logout
- Failed login
- Password reset
- Session expiration

Never log authentication secrets.

---

## Trading Logging

Every trade must generate logs recording:

- User
- Market
- Position
- Trade type
- Result

Pricing calculations belong to the ledger and Prediction Engine, not logs.

---

## Financial Logging

Log:

- Deposits
- Withdrawals
- Trading fees
- Withdrawal fees
- Settlements

Every financial log must reference the corresponding immutable financial record.

---

## Administrative Logging

Every administrator action must be logged.

Examples:

- Market creation
- Market edit
- Market cancellation
- Market resolution
- User suspension
- Withdrawal approval
- Withdrawal rejection
- Liquidity assignment

Administrative actions must always be attributable.

---

## Error Logging

Unexpected failures must generate error logs.

Error logs must include sufficient context for investigation.

Sensitive information must never appear.

---

## Performance Logging

Record:

- Slow requests
- Long-running jobs
- Prediction Engine execution time
- Database latency

Performance metrics support operational monitoring.

---

## Forbidden Logging

The following must never be logged:

- Passwords
- Authentication tokens
- Secrets
- Payment credentials
- Complete payment details
- Private uploaded documents
- Sensitive personal information

---

# Security Standards

Security is mandatory.

Every feature must be secure by default.

---

## Authentication

Protected functionality requires authenticated users.

Authentication must occur before protected resources are accessed.

---

## Authorization

Every protected action must verify permissions.

Permission validation must never rely on the client.

---

## Ownership Validation

Users may access only resources they own unless administrative permissions explicitly allow otherwise.

Ownership must always be validated on the server.

---

## Input Validation

All external input is untrusted.

Validation must occur before processing.

---

## Output Encoding

User-generated content must be safely rendered.

Rendered output must prevent script injection.

---

## Secrets Management

Secrets must never exist inside source code.

Secrets must never be exposed to browsers.

Secrets must never be logged.

---

## Injection Prevention

Application code must validate and sanitize all external input before use.

Injection vulnerabilities are forbidden.

---

## Cross-Site Scripting

User content must never execute as application code.

Output encoding must always be applied where appropriate.

---

## Cross-Site Request Forgery

Financial mutations must require verified authenticated requests.

Unauthenticated mutation requests must fail immediately.

---

## Rate Limiting

Sensitive endpoints must enforce stricter rate limits than public endpoints.

Rate limiting must prevent abuse without degrading legitimate usage.

---

## Financial Security

Every financial mutation must:

- Authenticate.
- Authorize.
- Validate ownership.
- Create immutable records.
- Preserve financial invariants.

---

## Administrative Security

Administrative capabilities must never be accessible through client-side authorization alone.

Server-side validation is mandatory.

---

# Performance Standards

Performance improvements must never compromise correctness.

Correctness always takes precedence.

---

## Rendering

Server Components are the default rendering strategy.

Client Components exist only when browser interactivity requires them.

---

## Lazy Loading

Large features must load only when required.

Initial page loads must avoid unnecessary resources.

---

## Streaming

Pages with independent data sources should stream content when beneficial.

Streaming must not change business behavior.

---

## Pagination

Large collections must use pagination.

Entire datasets must never be loaded unnecessarily.

---

## Virtualization

Large scrolling collections should use virtualization where required.

Virtualization must remain transparent to users.

---

## Image Optimization

Images must use optimized delivery.

Large original images must never be served unnecessarily.

---

## Memoization

Memoization must solve measured performance problems.

Unnecessary memoization is forbidden.

---

## Bundle Size

Client bundles must contain only code required for browser execution.

Server-only logic must never appear in client bundles.

---

## Database Queries

Queries must:

- Avoid duplication.
- Load only required fields.
- Avoid unnecessary relationship traversal.

---

## Realtime

Realtime subscriptions must subscribe only to required data.

Unused subscriptions must be cleaned up immediately.

---

## Prediction Engine Performance

Prediction Engine execution must remain deterministic regardless of application scale.

Performance optimizations must never change business outcomes.

---

# Testing Standards

Testing verifies business correctness.

Every test must validate observable behavior rather than implementation details.

---

## Unit Tests

Unit tests validate isolated functions.

Examples:

- Utilities
- Validators
- Formatters

Unit tests must remain independent.

---

## Integration Tests

Integration tests verify collaboration between multiple modules.

Examples:

- Server Actions
- Database interactions
- Authentication
- Authorization

---

## Prediction Engine Tests

Prediction Engine tests are mandatory.

They must verify:

- Pricing
- Settlement
- Liquidity
- Resolution
- Financial invariants

Every engine rule defined in `prediction-engine.md` must have corresponding test coverage.

---

## Financial Tests

Financial tests validate:

- Ledger integrity
- Wallet balances
- Deposits
- Withdrawals
- Trading fees
- Settlement

Financial correctness is non-negotiable.

---

## UI Tests

UI tests verify:

- Navigation
- Accessibility
- User interaction
- Error presentation

UI tests must never validate business calculations.

---

## Regression Tests

Regression tests verify previously resolved defects remain fixed.

Every production defect must receive regression coverage.

---

## End-to-End Tests

End-to-end tests verify complete workflows.

Examples:

- Registration
- Deposit
- Buy Position
- Sell Position
- Settlement
- Withdrawal

End-to-end tests must reflect real user behavior.

---

# Git Standards

Git history is part of the project's documentation.

Every commit must communicate meaningful progress.

---

## Branch Naming

Branch names must clearly describe purpose.

Examples:

- feature/market-trading
- feature/wallet
- fix/withdrawal-validation
- refactor/prediction-engine
- docs/database-schema

---

## Commit Messages

Commit messages must describe completed work.

Messages must be concise, specific, and imperative.

---

## Pull Requests

Every pull request must:

- Solve one concern.
- Include sufficient context.
- Pass all tests.
- Preserve architectural boundaries.

---

## Code Review

Every pull request must undergo review before merging.

Reviews must verify correctness, maintainability, architecture, and standards compliance.

---

## Merge Strategy

Changes must preserve a readable project history.

Unrelated work must never be merged together.

---

## Release Tags

Releases must use deterministic version identifiers.

Release history must remain traceable.

---

# Documentation Standards

Documentation is part of the codebase.

Documentation must remain synchronized with implementation.

---

## General Rules

Documentation must describe intent rather than implementation details.

Duplicate documentation is forbidden.

---

## Public APIs

Public functions, exported modules, and reusable libraries must include clear documentation.

---

## Complex Logic

Algorithms requiring non-obvious reasoning must include explanatory documentation.

---

## Architecture Changes

Changes affecting architectural boundaries must update `architecture.md`.

---

## Business Rule Changes

Changes affecting prediction markets must update `prediction-engine.md`.

---

## Database Changes

Changes affecting stored data must update `database-schema.md`.

---

## API Changes

Changes affecting public interfaces must update `api-contracts.md`.

---

## Design Changes

Visual system changes must update `design-system.md`.

---

## Documentation Ownership

Every document has one source of truth.

Documentation must reference related documents instead of duplicating their content.

# Documentation Standards

Documentation is a first-class part of the Sheybi codebase. Every architectural decision, business rule, and public interface must be documented in exactly one location. Documentation must remain synchronized with the implementation at all times.

## General Rules

- Documentation must always be written before implementing a new major feature.
- Every document must own exactly one subject.
- Documentation must never duplicate information defined in another document.
- When another document already owns a concept, reference that document instead of redefining the concept.
- Every documentation update must be reviewed together with the related code changes.
- Breaking architectural changes must update all affected documentation before merging.
- Public APIs, shared utilities, reusable hooks, and exported functions must include clear documentation explaining their purpose.
- Complex algorithms must include documentation explaining the business reasoning rather than implementation details.
- Financial logic must never rely on comments to explain incorrect or unclear code. The implementation itself must remain readable.

## Source of Truth

The following documents own their respective domains:

| Document | Owns |
|----------|------|
| architecture.md | System architecture, layers, boundaries and communication |
| prediction-engine.md | Market rules, pricing behaviour, trading lifecycle and settlement |
| database-schema.md | Data model, entities, ownership, relationships and persistence |
| design-system.md | Visual language, UI behaviour, components and design tokens |
| api-contracts.md | Public server interfaces, request validation and response contracts |
| code-standards.md | Coding conventions, engineering rules and implementation practices |

No document may redefine concepts owned by another document.

---

# Dependency Rules

Dependency direction within the codebase is strictly enforced. Dependencies must always point inward toward business logic. Lower layers must never depend on higher layers.

## Allowed Dependencies

| Source | May Depend On |
|---------|---------------|
| UI Components | Shared UI Components |
| Feature Components | Shared Components |
| Feature Components | Feature Hooks |
| Feature Components | Server Actions |
| Pages | Features |
| Server Actions | Prediction Engine |
| Server Actions | Authentication |
| Server Actions | Database Layer |
| Prediction Engine | Database Layer |
| Prediction Engine | Shared Utilities |
| Database Layer | Shared Types |
| Shared Utilities | Shared Types |

## Forbidden Dependencies

| Source | Cannot Depend On |
|---------|------------------|
| UI Components | Database |
| UI Components | Prediction Engine |
| UI Components | Payment Providers |
| Client Components | Financial Logic |
| Prediction Engine | React |
| Prediction Engine | UI Components |
| Database Layer | UI |
| Database Layer | React |
| Utilities | Feature Modules |
| Shared Components | Prediction Engine |
| External Services | UI State |

## Circular Dependencies

Circular imports are forbidden.

Modules must never depend on each other directly or indirectly.

Shared utilities exist specifically to prevent circular dependencies.

If two modules require each other, the architecture must be redesigned.

---

# Code Review Checklist

Every pull request must satisfy all review requirements before approval.

## Architecture

- All architectural boundaries remain intact.
- No layer owns responsibilities outside its scope.
- Dependency rules are respected.
- No circular dependencies exist.

## Business Logic

- Prediction Engine remains the single owner of prediction logic.
- Financial rules remain deterministic.
- Business logic is not duplicated.
- Validation occurs before state mutation.

## TypeScript

- Types are explicit.
- No usage of `any`.
- No unnecessary type assertions.
- Utility types are used appropriately.
- Imports remain organized.

## Components

- Components have a single responsibility.
- Shared components remain domain agnostic.
- Accessibility requirements are satisfied.
- Styling follows the Design System.

## Server

- Authentication enforced.
- Authorization enforced.
- Ownership validated.
- Errors handled consistently.
- Logging added where required.

## Database

- Ownership validated before mutation.
- Immutable records remain immutable.
- Relationships remain consistent.
- Duplicate writes are avoided.

## Security

- Secrets remain protected.
- Sensitive information is never exposed.
- External input validated.
- No injection vulnerabilities introduced.

## Documentation

- Documentation updated where required.
- Comments remain accurate.
- New public interfaces documented.

## Testing

- Existing tests pass.
- New behaviour includes appropriate tests.
- Regression risks evaluated.

---

# Anti-Patterns

The following practices are prohibited throughout the Sheybi codebase.

## Business Logic

- Business logic inside UI components.
- Business logic inside layouts.
- Business logic inside reusable UI libraries.
- Financial calculations outside the Prediction Engine.
- Duplicate implementations of business rules.

## Components

- Components performing multiple unrelated responsibilities.
- Deep component nesting without purpose.
- Large monolithic components.
- Repeated JSX blocks instead of reusable components.

## State

- Global mutable state.
- Duplicate sources of truth.
- Client ownership of server state.
- Direct mutation of cached state.

## TypeScript

- Using `any`.
- Excessive type assertions.
- Ignoring compiler errors.
- Implicit return types.
- Untyped external input.

## Database

- Direct database access from UI.
- Duplicate financial records.
- Mutable ledger entries.
- Missing ownership validation.
- Missing transactions for financial mutations.

## Styling

- Hardcoded colors.
- Hardcoded spacing.
- Hardcoded typography.
- Inline styles.
- Component-specific design systems.

## Architecture

- Layer violations.
- Circular imports.
- Cross-feature coupling.
- Hidden dependencies.
- Shared mutable modules.

## Error Handling

- Silent failures.
- Swallowed exceptions.
- Generic error messages.
- Missing logs.
- Ignored validation failures.

---

# Code Invariants

The following rules are mandatory and cannot be violated.

## Architecture

- Business logic must never exist inside UI components.
- Every module must own exactly one responsibility.
- Architectural boundaries defined in `architecture.md` must always be respected.
- Circular dependencies are forbidden.

## Prediction Engine

- Every prediction market mutation must pass through the Prediction Engine.
- Pricing logic must never execute outside the Prediction Engine.
- Settlement logic must never execute outside the Prediction Engine.
- Market validation must occur before pricing.

## Financial

- Every financial mutation must execute on the server.
- Every financial mutation must create a ledger record.
- Ledger records are immutable.
- Wallet balances must never become negative.
- Financial calculations must always be deterministic.

## Database

- Every mutation must validate ownership.
- Every entity must belong to a single owner unless explicitly shared.
- Referential integrity must always be maintained.
- Duplicate financial data is forbidden.

## Security

- Every protected operation requires authentication.
- Every mutation requires authorization.
- External input must always be validated.
- Secrets must never be committed to source control.

## UI

- Shared UI components must remain business-agnostic.
- Design tokens must always be used.
- Accessibility requirements must always be satisfied.

---

# Future Improvements

The following standards apply only after the MVP.

## Monorepo

- Shared packages for UI, Prediction Engine, Types and Utilities.
- Independent package versioning.
- Shared linting and formatting configuration.

## Internal SDK

- Shared client libraries.
- Generated API clients.
- Shared validation models.

## Event Architecture

- Domain events.
- Event sourcing.
- CQRS.
- Event replay.

## Automation

- Automatic API documentation generation.
- Automatic type generation.
- Automated schema validation.
- Automated dependency analysis.

## Tooling

- Static architecture validation.
- Dependency graph enforcement.
- Automatic invariant checking.
- Continuous performance monitoring.

---

# Acceptance Criteria

This document is complete only if:

- Every engineering principle is documented.
- Every TypeScript rule is deterministic.
- Every naming convention is explicit.
- Every folder has a defined responsibility.
- Every component type follows one implementation pattern.
- Every Server Action follows one validation pattern.
- Every API rule references `api-contracts.md`.
- Every Prediction Engine interaction references `prediction-engine.md`.
- Every database access rule references `database-schema.md`.
- Every styling rule references `design-system.md`.
- Every dependency direction is explicit.
- Every anti-pattern is explicitly forbidden.
- Every invariant is mandatory.
- Every pull request can be reviewed using this document alone.
- A software engineer can contribute code to Sheybi without making architectural, stylistic, or engineering decisions independently.