# api-contracts.md

# Part 1 — Foundation

---

# Overview

## Purpose

This document defines the communication contract between every actor and every backend capability within Sheybi.

It specifies how requests enter the system, the validation required before processing, the expected results, the possible failures, and the side effects produced by each application action.

This document defines **communication contracts only**.

It does not define:

- Business rules
- Market pricing
- Trade execution logic
- Settlement logic
- Database structure
- Architecture
- User interface behaviour
- Source code
- Framework implementation

Those responsibilities belong exclusively to their respective documents.

---

## Responsibility

This document is the single source of truth for application communication.

Every public application action must be documented here.

Every authenticated application action must be documented here.

Every administrator application action must be documented here.

Every background task that interacts with application state must be documented here.

Every external service interaction must be documented here.

Every application action must have exactly one contract.

No undocumented application action may exist.

---

## Relationship to Other Documentation

This document references other documentation instead of duplicating responsibilities.

| Subject | Source of Truth |
|----------|-----------------|
| Business Rules | `prediction-engine.md` |
| Database Structure | `database-schema.md` |
| System Architecture | `architecture.md` |
| UI Behaviour | `design-system.md` |
| Coding Standards | `code-standards.md` |
| Product Behaviour | `project-overview.md` |

This document references those files whenever business behaviour, storage behaviour, architecture, or presentation behaviour is required.

---

# Design Principles

Every application contract must follow these principles.

## Explicit Validation

Every request must be validated before execution.

Validation must complete before any business operation begins.

Invalid requests must terminate immediately.

No partial execution is permitted.

---

## Authentication Before Authorization

Authentication must complete before authorization.

The system must first identify the actor.

The system must then determine whether that actor has permission to perform the requested action.

Authorization must never execute for unauthenticated requests.

---

## Deterministic Contracts

Every application action must produce predictable behaviour.

Identical requests submitted against identical application state must produce identical outcomes.

Application behaviour must not depend on undefined state.

---

## Immutable Financial History

Financial records must never be modified after creation.

Corrections must create new financial records.

Historical financial records remain permanent.

Financial history must always remain auditable.

---

## Server-Side Execution

Business operations must execute on trusted server infrastructure.

Clients must never execute financial logic.

Clients must never execute market logic.

Clients must never resolve markets.

Clients submit requests.

Servers perform application actions.

---

## Idempotent Financial Operations

Financial operations must safely handle duplicate requests.

Repeated requests with the same idempotency identity must not execute multiple financial mutations.

Deposits, withdrawals, settlements, and trading operations must be idempotent.

---

## Single Responsibility

Every application contract must define one application action.

A contract must never describe multiple unrelated operations.

Each operation must have one purpose.

---

## Auditability

Every application action affecting financial records, market state, user permissions, or administrative behaviour must produce an audit record.

Audit records must remain immutable.

Audit records must contain sufficient information to reconstruct the action.

---

## Consistent Error Behaviour

Application failures must follow one consistent error model.

Every failure must belong to exactly one error category.

Every failure must produce predictable client behaviour.

Unexpected failures must never expose internal implementation details.

---

# Application Action Categories

Every application action belongs to exactly one category.

## Authentication

Manages user identity.

Responsibilities include:

- Account registration
- User login
- Session validation
- Session renewal
- Logout
- Password recovery
- Email verification

Authentication manages identity only.

It does not manage permissions.

---

## Wallet

Manages financial balances.

Responsibilities include:

- Wallet creation
- Wallet retrieval
- Deposits
- Withdrawals
- Balance reporting
- Financial history

Wallet operations reference financial rules defined in `prediction-engine.md`.

Persistent financial data is defined in `database-schema.md`.

---

## Markets

Manages prediction markets.

Responsibilities include:

- Listing markets
- Searching markets
- Viewing market details
- Creating markets
- Publishing markets
- Scheduling markets
- Closing markets
- Cancelling markets
- Resolving markets
- Archiving markets

Business behaviour is defined in `prediction-engine.md`.

---

## Trading

Manages market participation.

Responsibilities include:

- Buying positions
- Selling positions
- Viewing positions
- Viewing portfolio
- Trade previews

Trading behaviour references `prediction-engine.md`.

Trading contracts never redefine pricing logic.

---

## Portfolio

Manages user investment summaries.

Responsibilities include:

- Position summaries
- Holdings
- Profit and loss
- Historical trades
- Settlement history

Portfolio contracts expose calculated and stored information without redefining calculation rules.

---

## Notifications

Manages user notifications.

Responsibilities include:

- Notification delivery
- Notification retrieval
- Read status
- Archive status
- Notification lifecycle

Notification generation references application actions defined elsewhere.

---

## Market Suggestions

Manages community market proposals.

Responsibilities include:

- Suggestion submission
- Suggestion review
- Approval
- Rejection
- Conversion into official markets

Suggestion approval does not automatically define market behaviour.

Approved markets follow market contracts.

---

## Administration

Manages privileged operations.

Responsibilities include:

- Market management
- User management
- Withdrawal approvals
- Category management
- Audit review
- Platform configuration

Administrator contracts require administrator authorization.

---

## System

Manages internal platform operations.

Responsibilities include:

- Startup
- Configuration loading
- Health monitoring
- Metrics collection
- Cache management
- Internal synchronization

System contracts are not directly callable by end users.

---

## Background Tasks

Manages automated operations.

Responsibilities include:

- Scheduled jobs
- Settlement execution
- Market closure
- Notification dispatch
- Payment verification
- Generated assets

Background tasks execute independently of user interaction.

Every background task follows its own documented contract.

---

# General Contract Rules

Every application contract documented in this file must follow one standard structure.

Each contract must define:

- Purpose
- Actor
- Authentication
- Authorization
- Inputs
- Validation
- Business Preconditions
- Application Behaviour
- Side Effects
- Success Result
- Failure Result
- Realtime Events
- Audit Logging
- Idempotency Rules (when applicable)

No application contract may omit a required section.

No application contract may introduce undocumented behaviour.

No application contract may redefine business rules contained in `prediction-engine.md`.

No application contract may redefine storage rules contained in `database-schema.md`.

No application contract may redefine architecture defined in `architecture.md`.

No application contract may depend on user interface implementation.

Every application contract must describe observable system behaviour only.


# Authentication Contracts

Authentication contracts define every operation that establishes, validates, refreshes, or terminates a user's authenticated session. These contracts define only communication behaviour. Authentication implementation belongs to the Authentication System and Architecture.

Every authentication contract must validate identity before any authenticated application action executes.

---

## Register

### Purpose

Create a new Sheybi account.

### Actor

Guest

### Authentication

Not required.

### Authorization

Not applicable.

### Inputs

- Email
- Username
- Password
- Acceptance of Terms of Service
- Acceptance of Privacy Policy

### Validation

The system must validate:

- Email format
- Email uniqueness
- Username uniqueness
- Username format
- Password strength
- Required fields
- Terms acceptance

### Preconditions

The account must not already exist.

### Success Result

The account is created.

A profile is created.

A wallet is created.

The user becomes eligible to authenticate.

### Failure Result

Registration fails.

No user data is created.

### Side Effects

Creates:

- User
- User Profile
- Wallet

### Realtime Events

None.

### Audit Events

Account creation must create an audit record.

---

## Login

### Purpose

Authenticate an existing user.

### Actor

Guest

### Authentication

Not required.

### Authorization

Not applicable.

### Inputs

- Email or Username
- Password

### Validation

The system must validate:

- Credentials
- Account status
- Email verification status (if required)
- Suspension status

### Preconditions

The account must exist.

### Success Result

An authenticated session is established.

### Failure Result

Authentication fails.

No application state changes.

### Side Effects

Updates:

- Last login timestamp
- Active session information

### Realtime Events

User presence may be updated.

### Audit Events

Every successful and failed login attempt must be recorded.

---

## Logout

### Purpose

Terminate an authenticated session.

### Actor

Authenticated User

### Authentication

Required.

### Authorization

User owns the active session.

### Inputs

None.

### Validation

The session must be active.

### Preconditions

The user must be authenticated.

### Success Result

The session is invalidated.

### Failure Result

The session remains unchanged.

### Side Effects

Removes the active session.

### Realtime Events

User presence may be updated.

### Audit Events

Logout must be recorded.

---

## Session Refresh

### Purpose

Extend an authenticated session.

### Actor

Authenticated User

### Authentication

Required.

### Authorization

User owns the session.

### Inputs

Session credentials.

### Validation

The session must remain valid.

### Preconditions

The session must not be expired or revoked.

### Success Result

A refreshed session is issued.

### Failure Result

The session expires.

Authentication becomes invalid.

### Side Effects

Updates session expiration.

### Realtime Events

None.

### Audit Events

Session refresh events must be recorded.

---

## Forgot Password

### Purpose

Initiate password recovery.

### Actor

Guest

### Authentication

Not required.

### Authorization

Not applicable.

### Inputs

Email address.

### Validation

Email format.

### Preconditions

The account exists.

### Success Result

Password recovery is initiated.

### Failure Result

Recovery request is rejected.

### Side Effects

Creates a password reset request.

### Realtime Events

None.

### Audit Events

Password recovery requests must be recorded.

---

## Reset Password

### Purpose

Replace an existing password.

### Actor

Guest

### Authentication

Validated using the recovery process.

### Authorization

Recovery token owner only.

### Inputs

- Recovery credential
- New password

### Validation

Password strength.

Recovery validity.

### Preconditions

Recovery request remains valid.

### Success Result

Password is replaced.

### Failure Result

Password remains unchanged.

### Side Effects

Existing sessions are revoked.

### Realtime Events

None.

### Audit Events

Password changes must be recorded.

---

## Verify Email

### Purpose

Verify account ownership.

### Actor

Guest

### Authentication

Not required.

### Authorization

Verification owner only.

### Inputs

Verification credential.

### Validation

Verification request validity.

### Preconditions

Verification request exists.

### Success Result

Email becomes verified.

### Failure Result

Verification status remains unchanged.

### Side Effects

Account verification status updates.

### Realtime Events

None.

### Audit Events

Email verification must be recorded.

---

# Request Lifecycle

Every application action must execute using exactly one request lifecycle.

No action may skip, reorder, or duplicate lifecycle stages unless explicitly documented.

```
Request Received
        ↓
Authentication
        ↓
Authorization
        ↓
Input Validation
        ↓
Business Preconditions
        ↓
Application Behaviour
        ↓
Prediction Engine Invocation (if applicable)
        ↓
Persistence
        ↓
Audit Logging
        ↓
Realtime Events
        ↓
Notifications
        ↓
Success or Failure Response
```

## Stage Definitions

### Request Received

The application receives a client request.

A Correlation ID must be assigned.

Request metadata must be captured.

---

### Authentication

Identity must be verified before protected actions execute.

Unauthenticated requests terminate immediately.

---

### Authorization

Ownership and permissions must be validated.

Unauthorized requests terminate immediately.

---

### Input Validation

All request fields must be validated.

Invalid requests terminate immediately.

---

### Business Preconditions

Business state is verified.

Examples include:

- Market is open
- Wallet has sufficient balance
- User account is active

Business rules belong to `prediction-engine.md`.

---

### Application Behaviour

The owning subsystem performs the requested application action.

---

### Prediction Engine Invocation

Actions involving trading, settlement, market resolution, pricing, or portfolio changes must invoke the Prediction Engine.

Other actions bypass this stage.

---

### Persistence

Validated changes become permanent.

Persistent storage must remain consistent.

---

### Audit Logging

Every auditable action creates immutable audit records.

---

### Realtime Events

Subscribed clients receive updates after successful persistence.

---

### Notifications

Notifications are generated after successful completion when required.

---

### Success or Failure Response

Exactly one response is returned.

No additional processing occurs after the response.

---

# Contract Definition Template

Every application contract documented in this file must follow exactly one structure.

Every contract must contain the following sections.

## Purpose

Defines the responsibility of the application action.

---

## Actor

Defines the caller.

---

## Authentication

Defines authentication requirements.

---

## Authorization

Defines ownership requirements.

---

## Inputs

Defines every accepted input.

Each input documents:

- Name
- Required status
- Validation requirements
- Description

---

## Validation

Defines validation performed before execution.

---

## Business Preconditions

References business rules from:

- prediction-engine.md

No business rules are duplicated here.

---

## Application Behaviour

Describes high-level application behaviour.

Implementation details are excluded.

---

## Side Effects

Defines every resulting application change.

---

## Realtime Events

Defines every emitted realtime event.

---

## Audit Logging

Defines required audit records.

---

## Success Result

Defines the successful outcome.

---

## Failure Result

Defines all failure outcomes.

---

## Idempotency Rules

Required only for actions supporting repeated requests.

---

# System Contracts

System contracts define platform operations that are not initiated directly by users.

---

## Startup

### Purpose

Initialize platform services.

### Trigger

Application startup.

### Dependencies

- Configuration
- Database
- Authentication
- Background Tasks

### Validation

Required services must be available.

### Application Behaviour

The platform initializes operational subsystems.

### Failure Behaviour

Startup terminates.

The platform does not accept requests.

### Audit Behaviour

Startup events must be recorded.

---

## Health Checks

### Purpose

Report platform health.

### Trigger

System monitoring.

### Dependencies

Core platform services.

### Validation

Service availability.

### Application Behaviour

Collect health status.

### Failure Behaviour

Unavailable services are reported.

### Audit Behaviour

Health failures must be logged.

---

## Configuration Loading

### Purpose

Load runtime configuration.

### Trigger

Application startup.

### Dependencies

Configuration source.

### Validation

Configuration completeness.

### Application Behaviour

Validated configuration becomes active.

### Failure Behaviour

Startup terminates.

### Audit Behaviour

Configuration loading failures must be recorded.

---

## Realtime Synchronization

### Purpose

Maintain realtime consistency.

### Trigger

Successful persistent mutations.

### Dependencies

Realtime infrastructure.

### Validation

Event payload validity.

### Application Behaviour

Publish subscribed events.

### Failure Behaviour

Retry according to platform retry policy.

### Audit Behaviour

Persistent failures must be recorded.

---

## Cache Refresh

### Purpose

Refresh cached application data.

### Trigger

Configured refresh events.

### Dependencies

Persistent storage.

### Validation

Cache consistency.

### Application Behaviour

Replace stale cached values.

### Failure Behaviour

Previous cache remains active.

### Audit Behaviour

Not required unless failures become persistent.

---

## Metrics Collection

### Purpose

Collect operational metrics.

### Trigger

Scheduled intervals.

### Dependencies

Application telemetry.

### Validation

Metric integrity.

### Application Behaviour

Update operational statistics.

### Failure Behaviour

Retry according to monitoring policy.

### Audit Behaviour

Operational failures must be logged.

---

## System Shutdown

### Purpose

Terminate application services safely.

### Trigger

Shutdown request.

### Dependencies

Running services.

### Validation

Pending operations complete safely.

### Application Behaviour

Stop accepting new requests.

Complete active operations.

Release resources.

### Failure Behaviour

Shutdown errors are logged.

### Audit Behaviour

Shutdown events must be recorded.

---

# Contract Dependencies

Every application contract owns exactly one responsibility.

Contracts may depend only on documented platform subsystems.

Allowed dependencies include:

- Authentication System
- Wallet System
- Prediction Engine
- Database
- Notification System
- Audit Logging
- Background Task System
- Payment Provider
- Realtime System

Application contracts must never:

- Depend on UI components
- Depend on page layouts
- Depend on visual behaviour
- Depend on implementation details
- Depend on internal framework behaviour
- Depend on undocumented subsystems

Every dependency must be explicit.

No application contract may create circular dependencies.



# Wallet Contracts

The Wallet category defines every application action responsible for creating, viewing, funding, debiting, locking, and releasing user funds.

Wallet contracts define communication only.

Financial business rules belong exclusively to `prediction-engine.md`.

Wallet persistence belongs exclusively to `database-schema.md`.

---

## Create Wallet

### Purpose

Create the permanent financial account assigned to a newly registered user.

### Actor

Authenticated User

### Authentication

Required.

### Authorization

The authenticated user may create only one wallet belonging to their own account.

### Inputs

- User Identifier

### Validation

The user account must exist.

The user must not already own a wallet.

### Business Preconditions

User registration must be complete.

### Wallet Changes

A wallet record is created with:

- Available Balance = 0
- Locked Balance = 0
- Total Balance = 0

### Ledger Changes

None.

### Notification Behaviour

None.

### Realtime Updates

Wallet Created.

### Audit Logging

System records wallet creation.

### Success Result

Returns the created wallet summary.

### Failure Result

Returns the appropriate validation or authorization error.

---

## View Wallet

### Purpose

Return the current financial summary for the authenticated user.

### Actor

Authenticated User

### Authentication

Required.

### Authorization

Users may access only their own wallet.

Administrators may access any wallet.

### Inputs

None.

### Validation

The wallet must exist.

### Business Preconditions

None.

### Wallet Changes

None.

### Ledger Changes

None.

### Notification Behaviour

None.

### Realtime Updates

None.

### Audit Logging

Optional read access logging.

### Success Result

Returns:

- Total Balance
- Available Balance
- Locked Balance
- Pending Deposits
- Pending Withdrawals
- Recent Activity

### Failure Result

Returns wallet access errors.

---

## Deposit

### Purpose

Begin a wallet funding operation.

### Actor

Authenticated User

### Inputs

- Deposit Amount
- Payment Method

### Validation

Amount must exceed the minimum deposit amount.

Payment method must be supported.

### Business Preconditions

User account must be active.

### Wallet Changes

No balance changes occur until payment confirmation.

### Ledger Changes

A pending ledger record is created.

### Notification Behaviour

Deposit initiated notification.

### Realtime Updates

Pending Deposit Created.

### Audit Logging

Deposit initiation recorded.

### Success Result

Returns payment initiation details.

### Failure Result

Returns validation or payment initiation errors.

---

## Deposit Confirmation

### Purpose

Finalize a successful deposit.

### Actor

Payment Provider or Background Task.

### Validation

Payment confirmation must be verified.

Duplicate confirmations must be rejected.

### Wallet Changes

Available Balance increases.

Total Balance increases.

### Ledger Changes

Pending ledger entry becomes completed.

### Notification Behaviour

Deposit confirmed notification.

### Realtime Updates

Wallet Updated.

### Audit Logging

Deposit completion recorded.

### Success Result

Deposit finalized.

### Failure Result

No financial mutation occurs.

---

## Withdrawal Request

### Purpose

Request transfer of funds from the wallet.

### Actor

Authenticated User

### Inputs

- Withdrawal Amount
- Destination Account

### Validation

Wallet must contain sufficient available funds.

Destination account must be valid.

### Business Preconditions

User verification requirements must be satisfied.

### Wallet Changes

Requested amount moves from Available Balance to Locked Balance.

### Ledger Changes

Pending withdrawal ledger entry created.

### Notification Behaviour

Withdrawal pending notification.

### Realtime Updates

Wallet Updated.

### Audit Logging

Withdrawal request recorded.

### Success Result

Withdrawal enters Pending state.

### Failure Result

Wallet remains unchanged.

---

## Approve Withdrawal

### Purpose

Approve a pending withdrawal.

### Actor

Administrator.

### Validation

Withdrawal must remain pending.

### Wallet Changes

Locked balance remains unchanged until completion.

### Ledger Changes

Ledger status updated.

### Notification Behaviour

Withdrawal approved notification.

### Realtime Updates

Withdrawal Updated.

### Audit Logging

Approval recorded.

### Success Result

Withdrawal enters Approved state.

### Failure Result

Withdrawal state remains unchanged.

---

## Reject Withdrawal

### Purpose

Reject a pending withdrawal.

### Actor

Administrator.

### Validation

Withdrawal must remain pending.

### Wallet Changes

Locked funds return to Available Balance.

### Ledger Changes

Withdrawal marked rejected.

### Notification Behaviour

Withdrawal rejected notification.

### Realtime Updates

Wallet Updated.

### Audit Logging

Rejection recorded.

### Success Result

Withdrawal rejected.

### Failure Result

No financial mutation occurs.

---

## Withdrawal Completion

### Purpose

Finalize an approved withdrawal.

### Actor

Background Task.

### Validation

Withdrawal must already be approved.

### Wallet Changes

Locked Balance decreases.

Total Balance decreases.

### Ledger Changes

Withdrawal ledger entry finalized.

### Notification Behaviour

Withdrawal completed notification.

### Realtime Updates

Wallet Updated.

### Audit Logging

Completion recorded.

### Success Result

Withdrawal completed.

### Failure Result

Retry process initiated according to background task rules.

---

# Market Contracts

Market contracts define communication for discovery, lifecycle management, publication, resolution, and archival.

Business rules belong to `prediction-engine.md`.

Market persistence belongs to `database-schema.md`.

Document the following contracts:

- Browse Markets
- View Market
- Search Markets
- Create Market
- Edit Market
- Schedule Market
- Publish Market
- Close Market
- Extend Market
- Cancel Market
- Resolve Market
- Archive Market

Every contract must define:

- Purpose
- Actor
- Authentication
- Authorization
- Inputs
- Validation
- Business Preconditions
- Market State Changes
- Notification Behaviour
- Audit Logging
- Success Result
- Failure Result
- Realtime Events

---

# Trading Contracts

Trading contracts define communication between clients and the Prediction Engine.

Trading behaviour is defined exclusively in `prediction-engine.md`.

Trading persistence is defined exclusively in `database-schema.md`.

Document the following contracts:

- Calculate Trade Preview
- Buy Position
- Sell Position
- View Position
- View Portfolio

Every contract must define:

- Purpose
- Actor
- Authentication
- Authorization
- Inputs
- Validation
- Prediction Engine Invocation
- Wallet Changes
- Position Changes
- Market Changes
- Trading Volume Changes
- Ledger Changes
- Notification Behaviour
- Realtime Behaviour
- Audit Logging
- Success Result
- Failure Result
- Idempotency Rules

---

# Contract Versioning

Every application contract belongs to exactly one version.

Breaking changes must create a new contract version.

Backward-compatible additions must extend the current version.

Deprecated contracts remain documented until removal.

Every contract version has exactly one active successor.

No client may invoke an undocumented contract version.

---

# Contract Ownership

Every application contract belongs to exactly one platform subsystem.

Ownership is exclusive.

No contract may belong to multiple subsystems.

| Contract Category | Owning Subsystem |
|-------------------|------------------|
| Authentication | Authentication System |
| Wallet | Wallet System |
| Trading | Prediction Engine |
| Markets | Market Management |
| Portfolio | Portfolio Service |
| Notifications | Notification Service |
| Suggestions | Suggestion Service |
| Administration | Administration System |
| Background Tasks | Job Scheduler |
| Audit | Audit System |
| Realtime | Event System |


# Wallet Contracts

The Wallet category defines every application action that reads or modifies a user's financial account.

Wallet actions must reference:

- prediction-engine.md for financial business rules.
- database-schema.md for persistent data ownership.
- architecture.md for execution flow.

Wallet actions must never define financial calculations.

---

## Create Wallet

### Purpose

Create the permanent financial account assigned to a newly registered user.

### Actor

Authenticated User

System

### Authentication

Required.

### Authorization

The wallet must belong only to the authenticated user.

### Inputs

- User Identity

### Validation

The user must not already own a wallet.

### Business Preconditions

User registration must be completed.

### Wallet Changes

Create exactly one wallet.

Initialize:

- Available Balance
- Locked Balance
- Lifetime Deposits
- Lifetime Withdrawals

### Ledger Changes

None.

### Notification Behaviour

None.

### Realtime Updates

Wallet Created

### Audit Logging

Record wallet creation.

### Success Result

Wallet successfully created.

### Failure Result

Wallet already exists.

---

## View Wallet

### Purpose

Return the current financial summary.

### Actor

Authenticated User

Administrator

### Authentication

Required.

### Authorization

Users may view only their own wallet.

Administrators may view every wallet.

### Inputs

None.

### Validation

Wallet must exist.

### Wallet Changes

None.

### Ledger Changes

None.

### Notification Behaviour

None.

### Realtime Updates

None.

### Audit Logging

None.

### Success Result

Return:

- Available Balance
- Locked Balance
- Total Deposits
- Total Withdrawals
- Portfolio Value
- Unrealized Profit/Loss

### Failure Result

Wallet not found.

---

## Deposit

### Purpose

Create a pending deposit request.

### Actor

Authenticated User

### Authentication

Required.

### Authorization

User must own the destination wallet.

### Inputs

- Amount
- Payment Method
- Payment Provider

### Validation

Amount must exceed the minimum deposit.

Payment provider must be supported.

### Business Preconditions

User account must be active.

### Wallet Changes

None until confirmation.

### Ledger Changes

None until confirmation.

### Notification Behaviour

Deposit initiated.

### Realtime Updates

Deposit Pending

### Audit Logging

Create deposit audit record.

### Success Result

Pending deposit created.

### Failure Result

Deposit rejected.

---

## Deposit Confirmation

### Purpose

Finalize a verified deposit.

### Actor

Payment Provider

Background Task

### Authentication

Trusted integration.

### Authorization

Verified payment provider only.

### Inputs

Provider payment confirmation.

### Validation

Payment reference must exist.

Payment must not already be processed.

### Wallet Changes

Increase Available Balance.

### Ledger Changes

Create immutable ledger entry.

### Notification Behaviour

Deposit confirmed.

### Realtime Updates

Wallet Updated

Deposit Completed

### Audit Logging

Record completed deposit.

### Success Result

Deposit completed.

### Failure Result

Duplicate payment.

Invalid payment.

---

## Withdrawal Request

### Purpose

Create a withdrawal request.

### Actor

Authenticated User

### Authentication

Required.

### Authorization

User must own the wallet.

### Inputs

- Amount
- Destination Account

### Validation

Available balance must be sufficient.

KYC must satisfy withdrawal requirements.

### Business Preconditions

Withdrawal rules defined in prediction-engine.md.

### Wallet Changes

Move funds from Available Balance to Locked Balance.

### Ledger Changes

Create pending withdrawal ledger record.

### Notification Behaviour

Withdrawal pending.

### Realtime Updates

Wallet Updated

Withdrawal Pending

### Audit Logging

Create withdrawal audit record.

### Success Result

Withdrawal request accepted.

### Failure Result

Insufficient balance.

Withdrawal blocked.

---

## Approve Withdrawal

Administrator action.

Moves withdrawal to processing.

Creates audit record.

Triggers payout workflow.

---

## Reject Withdrawal

Administrator action.

Returns locked funds to Available Balance.

Creates immutable ledger entry.

Creates audit record.

Sends rejection notification.

---

## Withdrawal Completion

Background task.

Marks withdrawal completed.

Creates immutable settlement record.

Updates wallet balances.

Publishes realtime wallet update.

Records final audit event.

---

# Market Contracts

The Market category manages prediction markets.

Business rules belong exclusively to prediction-engine.md.

Market contracts define communication only.

Document the following contracts:

- Browse Markets
- View Market
- Search Markets
- Create Market
- Edit Market
- Schedule Market
- Publish Market
- Close Market
- Extend Market
- Cancel Market
- Resolve Market
- Archive Market

Every market contract must define:

- Purpose
- Actor
- Authentication
- Authorization
- Inputs
- Validation
- Business Preconditions
- Market State Changes
- Notification Behaviour
- Audit Logging
- Realtime Events
- Success Result
- Failure Result

Market contracts must never redefine pricing, probability updates, settlement, liquidity, or market resolution logic.

Those rules belong exclusively to prediction-engine.md.

---

# Trading Contracts

The Trading category defines every portfolio mutation.

Trading contracts include:

- Buy Position
- Sell Position
- View Position
- View Portfolio
- Calculate Trade Preview

Every trading contract must define:

- Purpose
- Actor
- Authentication
- Authorization
- Inputs
- Validation
- Prediction Engine Invocation
- Wallet Changes
- Position Changes
- Market Changes
- Trading Volume Changes
- Ledger Changes
- Notification Behaviour
- Realtime Behaviour
- Audit Logging
- Success Result
- Failure Result
- Idempotency Rules

Trading contracts must never calculate prices.

Trading contracts must never update balances directly.

Trading contracts must always invoke the Prediction Engine.

---

# Contract Versioning

Every application contract belongs to exactly one version.

Breaking changes must create a new version.

Backward-compatible additions extend the current version.

Deprecated contracts remain documented until removed.

Only one contract version may be active.

---

# Contract Ownership

Every application contract has exactly one owning subsystem.

| Contract Category | Owner |
|-------------------|-------|
| Authentication | Authentication System |
| Wallet | Wallet System |
| Markets | Market Management |
| Trading | Prediction Engine |
| Portfolio | Portfolio System |
| Notifications | Notification System |
| Suggestions | Suggestion Management |
| Administration | Administration System |
| Background Tasks | Background Task Scheduler |
| External Integrations | Integration Layer |

No contract may have multiple owners.

---

# Market Suggestion Contracts

Document:

- Submit Suggestion
- Review Suggestion
- Approve Suggestion
- Reject Suggestion
- Convert Suggestion Into Market

Each contract must define:

- Purpose
- Actor
- Authentication
- Authorization
- Inputs
- Validation
- Side Effects
- Audit Logging
- Success Result
- Failure Result

---

# Notification Contracts

Document:

- List Notifications
- Read Notification
- Archive Notification
- Delete Notification
- Notification Delivery

Every notification contract must define:

- Purpose
- Actor
- Authentication
- Authorization
- Inputs
- Validation
- Notification State Changes
- Realtime Behaviour
- Success Result
- Failure Result

---

# Profile Contracts

Document:

- View Profile
- Update Profile
- Upload Avatar
- Submit KYC
- View Verification Status

Each contract must define:

- Purpose
- Actor
- Authentication
- Authorization
- Inputs
- Validation
- Side Effects
- Success Result
- Failure Result

---

# Administration Contracts

Administrator contracts include:

- Create Market
- Edit Market
- Assign Liquidity
- Resolve Market
- Suspend User
- Restore User
- Approve Withdrawal
- Reject Withdrawal
- Manage Categories
- Manage Featured Markets
- View Audit Logs
- View System Metrics

Every administrator contract must define:

- Purpose
- Actor
- Authentication
- Authorization
- Inputs
- Validation
- Business Preconditions
- Side Effects
- Audit Logging
- Realtime Behaviour
- Success Result
- Failure Result

Administrator contracts always require administrator privileges.

Every successful administrator action must create an immutable audit record.

---

# Background Task Contracts

Document:

- Payment Webhooks
- Market Auto Closing
- Market Settlement
- Notification Dispatch
- Scheduled Jobs
- Generated Assets

Every background task must define:

- Trigger
- Purpose
- Inputs
- Validation
- Retry Behaviour
- Failure Behaviour
- Audit Logging
- Realtime Behaviour

Background tasks must execute without user interaction.

Background tasks must remain retry-safe.

Background tasks must never bypass Prediction Engine validation.


# Realtime Contracts

Realtime contracts define every event published by the platform after a successful state change. Realtime events synchronize connected clients with the latest application state. Realtime events never replace persistent storage. Clients must treat realtime events as notifications that new data is available.

---

## Event: Market Updated

### Trigger

A market's metadata changes.

### Publisher

Market Management System.

### Consumers

- Market List
- Market Details
- Administrator Dashboard

### Data Updated

- Market metadata
- Market status
- Market schedule
- Market visibility

### Delivery Timing

Published immediately after persistence succeeds.

### Failure Behaviour

Failure to publish does not roll back the completed operation. The event must be retried by the background task system.

---

## Event: Probability Updated

### Trigger

A completed trade changes market probabilities.

### Publisher

Prediction Engine.

### Consumers

- Market Details
- Market Cards
- Portfolio

### Data Updated

- Probability
- Implied odds
- Market depth
- Liquidity indicators

### Delivery Timing

Published immediately after trade settlement.

### Failure Behaviour

Trade completion remains valid. Event delivery must be retried.

---

## Event: Share Price Updated

### Trigger

A completed trade changes share pricing.

### Publisher

Prediction Engine.

### Consumers

- Market Details
- Trade Screen
- Portfolio

### Data Updated

- Current share price
- Price movement
- Market liquidity

### Delivery Timing

Immediately after pricing recalculation.

### Failure Behaviour

Pricing remains persisted. Event publication must retry.

---

## Event: Trading Volume Updated

### Trigger

A completed buy or sell operation.

### Publisher

Prediction Engine.

### Consumers

- Market Pages
- Trending Markets
- Analytics

### Data Updated

- Total volume
- Daily volume
- Market activity

### Delivery Timing

Immediately after persistence.

---

## Event: Wallet Updated

### Trigger

Any completed wallet mutation.

### Publisher

Wallet System.

### Consumers

- Wallet Page
- Portfolio
- Navigation Wallet Widget

### Data Updated

- Available balance
- Locked balance
- Total balance

### Delivery Timing

Immediately after ledger persistence.

---

## Event: Notification Created

### Trigger

A new notification record is created.

### Publisher

Notification System.

### Consumers

- Notification Center
- Notification Badge

### Data Updated

- Notification list
- Unread count

### Delivery Timing

Immediately after notification creation.

---

## Event: Position Updated

### Trigger

A position changes state.

### Publisher

Prediction Engine.

### Consumers

- Portfolio
- Position Details

### Data Updated

- Shares
- Position value
- Unrealized profit or loss
- Settlement status

---

## Event: Market Resolved

### Trigger

Administrator resolves a market.

### Publisher

Market Management System.

### Consumers

- Market Details
- Portfolio
- Notifications

### Data Updated

- Winning option
- Resolution state
- Settlement status

---

## Event: Settlement Completed

### Trigger

Settlement completes successfully.

### Publisher

Settlement System.

### Consumers

- Wallet
- Portfolio
- Notifications

### Data Updated

- Wallet balance
- Position status
- Settlement history

---

# Audit Contracts

Every privileged operation must create an immutable audit record.

Audit records exist independently from business records.

Audit records cannot be modified or deleted.

---

## Market Creation

### Trigger

Administrator creates a market.

### Stored Information

- Administrator ID
- Timestamp
- Market ID
- Created fields
- Request correlation ID

---

## Market Editing

### Trigger

Administrator edits a market.

### Stored Information

- Administrator ID
- Timestamp
- Previous values
- New values
- Reason
- Correlation ID

---

## Market Resolution

### Trigger

Administrator resolves a market.

### Stored Information

- Administrator ID
- Winning option
- Resolution timestamp
- Resolution notes
- Correlation ID

---

## Withdrawal Approval

### Trigger

Administrator approves a withdrawal.

### Stored Information

- Administrator ID
- Withdrawal ID
- Wallet ID
- Amount
- Timestamp

---

## Withdrawal Rejection

### Trigger

Administrator rejects a withdrawal.

### Stored Information

- Administrator ID
- Withdrawal ID
- Reason
- Timestamp

---

## User Suspension

### Trigger

Administrator suspends a user.

### Stored Information

- Administrator ID
- User ID
- Suspension reason
- Timestamp

---

## Liquidity Assignment

### Trigger

Liquidity configuration changes.

### Stored Information

- Administrator ID
- Market ID
- Previous liquidity
- Updated liquidity
- Timestamp

---

## System Setting Changes

### Trigger

Administrator modifies system configuration.

### Stored Information

- Administrator ID
- Setting changed
- Previous value
- Updated value
- Timestamp

---

# Security Contracts

The following security rules apply to every application contract.

- Every authenticated action must validate the active session before execution.
- Every mutation must validate authorization after authentication.
- Every mutation must validate ownership before modifying user-owned resources.
- Prediction Engine operations cannot be invoked directly by client applications.
- Wallet balances cannot be modified outside documented wallet or trading contracts.
- Ledger records are immutable.
- Audit records are immutable.
- Background tasks must execute the same validation rules as user-initiated requests.
- Every external request must be validated before processing.
- Every failed financial mutation must leave persistent financial data unchanged.
- Every successful financial mutation must create the required ledger entries.
- Secrets must never appear in responses.
- Internal system identifiers must never expose implementation details.
- Suspended users cannot execute authenticated mutations.
- Administrator privileges must be verified independently of user authentication.

---

# Contract Invariants

The following rules are mandatory.

- Every application action has exactly one documented contract.
- Every contract belongs to exactly one application category.
- Every request follows the documented execution lifecycle.
- Every protected operation requires authentication.
- Every mutation requires authorization.
- Every ownership rule must be validated before persistence.
- Every successful financial mutation creates ledger records.
- Every successful trade invokes the Prediction Engine.
- Every completed trade updates market state.
- Every completed trade updates trading volume.
- Every completed trade updates user positions.
- Every completed financial mutation updates wallet balances.
- Every completed administrator action creates an audit record.
- Every realtime event originates from a completed persistent change.
- Failed financial operations cannot partially modify persistent state.
- Business rules remain exclusively defined in `prediction-engine.md`.
- Database ownership remains exclusively defined in `database-schema.md`.
- Architecture remains exclusively defined in `architecture.md`.
- Every application contract has exactly one owning subsystem.
- Contracts cannot duplicate responsibilities owned by another documentation file.

---

# Future Contracts

The following contracts are outside the MVP.

## Referral System

Invitation generation, referral rewards, referral history and referral analytics.

## Comments

Market discussions, replies, moderation and reporting.

## Following Users

Follow relationships, activity feeds and creator profiles.

## Achievements

Badges, milestones, trading streaks and progression.

## AI Market Recommendations

Personalized market recommendations generated from user activity.

## AI Market Moderation

Automated moderation of market suggestions before administrator review.

## Email Notifications

Transactional email delivery.

## Push Notifications

Native mobile notification delivery.

## Public API

External developer access under independent authentication and rate limiting contracts.

---

# Acceptance Criteria

This document is complete only if:

- Every application action is documented.
- Every contract defines one responsibility.
- Every contract defines authentication requirements.
- Every contract defines authorization requirements.
- Every contract defines validation requirements.
- Every contract defines success results.
- Every contract defines failure results.
- Every contract defines side effects.
- Every financial action defines idempotency requirements.
- Every realtime event is documented.
- Every audit requirement is documented.
- Every security rule is explicit.
- Every invariant is deterministic.
- Every cross-document responsibility references its owning document.
- Frontend and backend engineers can implement application communication independently without redefining business behaviour.

---

# Scope

This document defines behavioural contracts between application actors.

It defines:

- Required inputs
- Validation requirements
- Authorization requirements
- Expected outputs
- Side effects
- Realtime events
- Audit requirements
- Idempotency requirements

This document does not define:

- Business rules
- Prediction pricing
- Settlement logic
- Database structure
- Database relationships
- System architecture
- User interface behaviour
- Component implementation
- Source code
- Algorithms

Those responsibilities belong exclusively to their respective documentation files.

---

# Writing Style

This document is the single source of truth for application communication within Sheybi.

Every contract must use deterministic language.

Every contract must define exactly one responsibility.

Implementation details, framework APIs, source code, database queries and transport protocols are intentionally excluded.


