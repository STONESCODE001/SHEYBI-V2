# api-contracts.md

Help me write an `api-contracts.md` file for my project.

This document defines the complete contract between every client, server action, prediction engine, payment provider, background task, and administrator within Sheybi.

It is the single source of truth for every application action.

It defines:

- Every public application action
- Every authenticated application action
- Every administrator action
- Required inputs
- Validation rules
- Authorization rules
- Business preconditions
- Success responses
- Failure responses
- Side effects
- Idempotency rules
- Realtime events
- Audit requirements

This is **not** an implementation document.

Do not include:

- Source code
- TypeScript
- REST implementation
- JSON examples
- Framework APIs
- Database queries
- InstantDB queries
- Clerk implementation
- Prediction engine implementation

Describe only the behavioural contract.

---

# Overview

Explain the purpose of application contracts.

Explain why every action must have exactly one deterministic contract.

Explain the responsibility of this document within the architecture.

---

# Design Principles

Define the principles every application action must follow.

Examples:

- Explicit validation
- Authentication first
- Deterministic responses
- Immutable financial history
- Server-side 
- Idempotent financial operations
- Single responsibility
- Auditability
- Consistent error behaviour

---

# Application Action Categories

Document every category of application action.

Examples:

Authentication

Wallet

Markets

Trading

Portfolio

Notifications

Market Suggestions

Administration

System

Background Tasks

Explain the responsibility of every category.

---

# General Contract Rules

Define rules that apply to every action.

Examples:

Every action must define:

- Purpose
- Actor
- Authentication requirements
- Authorization requirements
- Inputs
- Validation
- Preconditions
- Business 
- Side effects
- Success result
- Failure result
- Realtime events
- Audit logging

No action may omit any section.

---

# Authentication Contracts

Document every authentication action.

Include:

Register

Login

Logout

Session Refresh

Forgot Password

Reset Password

Verify Email

For every action define:

Purpose

Actor

Inputs

Validation

Preconditions



Success Result

Failure Result

Side Effects

Realtime Events

Audit Events

---

# Request Lifecycle

Every application action must follow exactly one execution lifecycle.

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

Business Execution

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

No application action may execute these stages in a different order unless explicitly documented.

--- 

# Contract Definition Template

Every application contract documented in this file must follow exactly the same structure.

Each contract must contain:

- Purpose
- Actor
- Authentication
- Authorization
- Inputs
- Validation
- Business Preconditions
- Application Behaviour
- Side Effects
- Realtime Events
- Audit Logging
- Success Result
- Failure Result
- Idempotency Rules (if applicable)

No contract may introduce additional sections unless documented in this file.

---

# System Contracts

Document system-level operations.

Examples:

Startup

Health Checks

Configuration Loading

Realtime Synchronization

Cache Refresh

Metrics Collection

System Shutdown

For every action define:

Purpose

Trigger

Dependencies

Validation

Application Behaviour

Failure Behaviour

Audit Behaviour

---

# Contract Dependencies

Every application contract may depend only on documented platform subsystems.

Allowed dependencies include:

- Authentication
- Wallet
- Prediction Engine
- Database
- Notifications
- Audit Logging
- Background Tasks

Application contracts must never depend directly on user interface behaviour.

Application contracts must never depend on implementation details.

---

# Wallet Contracts

Document:

Create Wallet

View Wallet

Deposit

Deposit Confirmation

Withdrawal Request

Approve Withdrawal

Reject Withdrawal

Withdrawal Completion

For every action define:

Purpose

Actor

Inputs

Validation

Preconditions



Wallet Changes

Ledger Changes

Notification Behaviour

Realtime Updates

Audit Logging

Success Result

Failure Result

---

# Market Contracts

Document:

Browse Markets

View Market

Search Markets

Create Market

Edit Market

Schedule Market

Publish Market

Close Market

Extend Market

Cancel Market

Resolve Market

Archive Market

For every action define:

Purpose

Actor

Inputs

Validation

Business Preconditions

Market State Changes

Notification Behaviour

Audit Logging

Success Result

Failure Result

Realtime Events

---

# Trading Contracts

Document:

Buy Position

Sell Position

View Position

View Portfolio

Calculate Trade Preview

For every action define:

Purpose

Actor

Inputs

Validation

Prediction Engine Invocation

Wallet Changes

Position Changes

Market Changes

Trading Volume Changes

Ledger Changes

Notification Behaviour

Realtime Behaviour

Audit Logging

Success Result

Failure Result

Idempotency Rules

---

# Contract Versioning

Every application contract belongs to exactly one contract version.

Breaking changes must create a new version.

Backward-compatible additions must extend the existing version.

Deprecated contracts must remain documented until removed from the platform.

Every contract version must have exactly one active successor.

---

# Contract Ownership

Every application contract must have exactly one owning subsystem.

Examples:

Authentication → Authentication System

Trading → Prediction Engine

Wallet → Wallet System

Markets → Market Management

Notifications → Notification System

Administration → Administration System

No contract may have multiple owners.

---

# Market Suggestion Contracts

Document:

Submit Suggestion

Review Suggestion

Approve Suggestion

Reject Suggestion

Convert Suggestion Into Market

---

# Notification Contracts

Document:

List Notifications

Read Notification

Archive Notification

Delete Notification

Notification Delivery

---

# Profile Contracts

Document:

View Profile

Update Profile

Upload Avatar

Submit KYC

View Verification Status

---

# Administration Contracts

Document every administrator action.

Examples:

Create Market

Edit Market

Assign Liquidity

Resolve Market

Suspend User

Restore User

Approve Withdrawal

Reject Withdrawal

Manage Categories

Manage Featured Markets

View Audit Logs

View System Metrics

For every action define:

Purpose

Actor

Authentication

Authorization

Inputs

Validation

Business Preconditions



Side Effects

Audit Logging

Realtime Behaviour

Success Result

Failure Result

---

# Background Task Contracts

Document:

Payment Webhooks

Market Auto Closing

Market Settlement

Notification Dispatch

Scheduled Jobs

Generated Assets

For every background task define:

Trigger

Purpose

Inputs

Validation



Retry Behaviour

Failure Behaviour

Audit Logging

Realtime Behaviour

---

# Cross-Document Responsibilities

This document defines communication contracts only.

Business rules belong exclusively to:

- prediction-engine.md

Database entities belong exclusively to:

- database-schema.md

Architecture belongs exclusively to:

- architecture.md

Coding conventions belong exclusively to:

- code-standards.md

Visual behaviour belongs exclusively to:

- design-system.md

If a concept already exists in another document, this document must reference it rather than redefine it.

---


# External Service Contracts

Document every external integration.

Examples:

Clerk

InstantDB

Paystack

Future Email Provider

Future Push Notifications

For every integration define:

Purpose

Direction of Communication

Trusted Data

Validation

Failure Handling

Retry Rules

Timeout Behaviour

Fallback Behaviour

---

# Validation Rules

Document every validation rule.

Examples:

Unauthenticated User

Unauthorized User

Insufficient Balance

Invalid Trade Amount

Invalid Market

Market Closed

Market Resolved

Market Cancelled

Duplicate Submission

Expired Session

Duplicate Withdrawal

Duplicate Deposit

Duplicate Market Resolution

For every validation define:

Condition

System Behaviour

Returned Result

State Changes

Audit Behaviour

---

# Error Contracts

Document every error category.

Examples:

Validation Errors

Authentication Errors

Authorization Errors

Business Rule Errors

Payment Errors

Prediction Engine Errors

Database Errors

Network Errors

Unknown Errors

For every error define:

Trigger

System Behaviour

Rollback Behaviour

User Feedback

Logging Behaviour

Retry Behaviour

---

# Realtime Contracts

Document every realtime event.

Examples:

Market Updated

Probability Updated

Share Price Updated

Trading Volume Updated

Wallet Updated

Notification Created

Market Resolved

Position Updated

Settlement Completed

For every event define:

Trigger

Publisher

Consumers

Data Updated

Delivery Timing

Failure Behaviour

---

# Audit Contracts

Document every action that must create an audit record.

Examples:

Market Creation

Market Editing

Market Resolution

Withdrawal Approval

Withdrawal Rejection

User Suspension

Liquidity Assignment

System Setting Changes

For every audit define:

Trigger

Actor

Stored Information

Retention Rules

Immutability Rules

---

# Security Contracts

Define system-wide security rules.

Examples:

Financial actions require authentication.

Administrator actions require administrator privileges.

Prediction Engine cannot be invoked directly by clients.

Wallet balances cannot be modified outside validated application actions.

Background tasks cannot bypass business validation.

Audit records are immutable.

---

# Contract Invariants

List non-negotiable rules.

Examples:

Every financial mutation must create a ledger entry.

Every financial action must pass validation before .

Every administrator action must create an audit record.

Every successful trade must trigger realtime updates.

Every failed financial action must leave financial state unchanged.

Every background task must be retry-safe.

No application action may bypass the Prediction Engine.

No application action may modify immutable records.

Rules must use deterministic language.

---

# Future Contracts

Clearly separate future application actions.

Examples:

Referral System

Comments

Following Users

Achievements

AI Market Recommendations

AI Market Moderation

Email Notifications

Push Notifications

Public API

---

# Acceptance Criteria

The document is complete only if:

- Every application action is documented.
- Every action has one deterministic contract.
- Every validation rule is documented.
- Every success result is documented.
- Every failure result is documented.
- Every side effect is documented.
- Every realtime event is documented.
- Every audit requirement is documented.
- Every security rule is explicit.
- Every invariant is deterministic.
- A frontend engineer and backend engineer can build independently without asking additional questions.

---

# Scope

This document defines only behavioural contracts between application actors.

It defines:

- Required inputs
- Expected outputs
- Validation requirements
- Authorization requirements
- Side effects
- Realtime events
- Audit requirements

It does not define:

- Business rules
- Pricing logic
- Settlement logic
- Database structure
- Architecture
- UI behaviour
- Component behaviour
- Source code
- Algorithms

Those subjects belong exclusively to their respective documents.

---

# Writing Style

- Write in plain Markdown.
- Use deterministic language such as **must**, **will**, **cannot**, and **always**.
- Avoid vague wording.
- Do not include implementation details.
- Do not include source code.
- Do not include database queries.
- Treat this document as the single source of truth for every application action in Sheybi.