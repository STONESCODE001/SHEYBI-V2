I think `code-standards.md` is one of the most important documents in the project because it's the document every AI agent and every engineer will read before writing code.

It should **not** explain how Sheybi works (that's covered by `prediction-engine.md`, `database-schema.md`, and `architecture.md`).

Instead, it should answer only one question:

> **"How must code be written inside the Sheybi codebase?"**


---

# code-standards.md

## Overview

Explain the purpose of the coding standards.

Define the scope of the document.

Explain that this document governs how source code is written, organized, reviewed, and maintained throughout the Sheybi codebase.

State that it is implementation-focused and complements, but never overrides:

* architecture.md
* database-schema.md
* prediction-engine.md
* design-system.md
* api-contracts.md

---

# Core Engineering Principles

Define the engineering philosophy.

Examples:

* Single Responsibility Principle
* Separation of Concerns
* Composition over duplication
* Explicit behaviour over implicit behaviour
* Predictability over cleverness
* Readability over brevity
* Deterministic business logic
* Fail fast
* Immutable financial history
* Security by default

Every principle must explain:

* meaning
* purpose
* examples of compliant code
* examples of violations

---

# TypeScript Standards

Define every TypeScript rule.

Include:

* strict mode
* explicit return types
* interfaces vs types
* readonly usage
* enums vs unions
* literal types
* generics
* nullable values
* unknown
* never
* any prohibition
* discriminated unions
* branded IDs
* utility types
* import type

Document:

* allowed
* forbidden
* required

---

# Naming Conventions

Document naming rules.

Include:

Variables

Functions

Components

Hooks

Types

Interfaces

Enums

Constants

Files

Folders

Routes

Actions

Database entities

Environment variables

Examples:

camelCase

PascalCase

SCREAMING_SNAKE_CASE

kebab-case

Explain exactly where each naming style is used.

---

# Folder Organization

Document every folder.

Example:

app/

components/

components/ui/

features/

engine/

actions/

lib/

hooks/

providers/

types/

styles/

constants/

config/

utils/

Explain:

Purpose

Allowed contents

Forbidden contents

Dependencies

---

# Component Standards

Document how components are written.

Include:

Presentational components

Container components

Shared components

Feature components

Layout components

Server Components

Client Components

Rules for:

Props

Composition

Children

State

Memoization

Accessibility

Reusability

---

# Server Action Standards

Define:

Responsibilities

Validation

Authentication

Authorization

Error handling

Transactions

Logging

Idempotency

Forbidden behaviour

Document exactly what every Server Action must do before mutating data.

---

# API Standards

Define standards for every API endpoint.

Include:

Input validation

Authentication

Authorization

Ownership validation

Business validation

Response structure

Status codes

Error format

Pagination

Filtering

Sorting

Versioning

Rate limiting

Idempotency

Reference `api-contracts.md` instead of redefining endpoint behaviour.

---

# Prediction Engine Standards

Define how application code interacts with the Prediction Engine.

Include:

Allowed callers

Forbidden callers

Validation order

Return values

Error handling

State mutation rules

Reference `prediction-engine.md`.

Do not redefine trading behaviour.

---

# Database Access Standards

Document database access rules.

Examples:

Read-only queries

Mutations

Transactions

Optimistic updates

Relationship loading

Ownership validation

Soft deletion

Financial immutability

Reference `database-schema.md`.

---

# State Management Standards

Define where state belongs.

Examples:

Client State

Server State

Persistent State

Realtime State

Derived State

Rules for:

Ownership

Synchronization

Caching

Invalidation

---

# Styling Standards

Reference `design-system.md`.

Include:

Tailwind usage

CSS variables

Spacing

Responsive design

Dark mode

Animations

Transitions

Typography

Border radius

Color usage

Forbidden styling practices

---

# Accessibility Standards

Define mandatory accessibility requirements.

Include:

Keyboard navigation

Focus states

ARIA labels

Semantic HTML

Color contrast

Reduced motion

Screen readers

---

# Error Handling Standards

Document:

Recoverable errors

Fatal errors

Validation errors

Network errors

Authentication errors

Prediction engine errors

Payment errors

User-facing messages

Logging

Retry behaviour

---

# Logging Standards

Define what must be logged.

Examples:

Authentication

Trading

Withdrawals

Admin actions

Errors

Unexpected exceptions

Performance issues

Define what must never be logged.

Examples:

Passwords

Tokens

Private financial data

Secrets

---

# Security Standards

Document secure coding rules.

Include:

Authentication

Authorization

Ownership validation

Input validation

Output encoding

Secrets management

CSRF

XSS

Injection prevention

Rate limiting

Sensitive data

---

# Performance Standards

Define performance expectations.

Include:

Server Components by default

Lazy loading

Streaming

Pagination

Virtualization

Image optimization

Memoization

Bundle size

Database query efficiency

Realtime subscriptions

---

# Testing Standards

Define required testing levels.

Examples:

Unit tests

Integration tests

Prediction engine tests

Financial tests

UI tests

Regression tests

End-to-end tests

Explain what each type validates.

---

# Git Standards

Define:

Branch naming

Commit messages

Pull requests

Review process

Merge strategy

Release tags

---

# Documentation Standards

Define how documentation is maintained.

Examples:

Public functions documented

Complex algorithms documented

Architecture changes documented

Breaking changes documented

Reference documents instead of duplication

---

# Dependency Rules

Document dependency direction.

Examples:

UI → Features ✅

Features → Server Actions ✅

Server Actions → Prediction Engine ✅

Prediction Engine → Database ✅

Database → UI ❌

Prediction Engine → React ❌

Components → Database ❌

Circular dependencies ❌

---

# Code Review Checklist

Every pull request must verify:

* Naming follows conventions.
* Types are explicit.
* No duplicated business logic exists.
* Prediction Engine is used correctly.
* Authentication is enforced.
* Authorization is enforced.
* Financial mutations create ledger records.
* Tests pass.
* Documentation remains accurate.
* No architectural boundaries are violated.

---

# Anti-Patterns

List forbidden practices.

Examples:

* Business logic inside UI components.
* Duplicate validation logic.
* Direct database access from components.
* Hardcoded colors.
* Magic numbers.
* Copy-paste code.
* Global mutable state.
* Silent failures.
* Swallowed exceptions.
* Using `any`.
* Circular imports.
* Financial calculations inside the UI.

---

# Code Invariants

Document non-negotiable rules.

Examples:

* Business logic must never exist inside UI components.
* Every financial mutation must execute on the server.
* Every prediction market mutation must pass through the Prediction Engine.
* Every financial mutation must create a ledger record.
* Every database mutation must validate ownership before Application.
* Client code cannot modify financial state directly.
* Shared UI components must remain domain-agnostic.
* Every exported function must have a single responsibility.
* Every module must own exactly one concern.
* Circular dependencies are forbidden.
* No feature may bypass architectural boundaries defined in `architecture.md`.

---

# Future Improvements

Document coding standards that apply only after the MVP.

Examples:

* Monorepo structure
* Shared internal packages
* Microservices
* Event sourcing
* CQRS
* Plugin architecture
* Automated code generation

---

# Acceptance Criteria

This document is complete only if:

* Every naming convention is documented.
* Every folder has a defined responsibility.
* Every architectural dependency is explicit.
* Every TypeScript rule is deterministic.
* Every styling rule references the design system.
* Every API rule references the API contract.
* Every database rule references the database schema.
* Every prediction engine interaction follows a single defined pattern.
* Every anti-pattern is explicitly forbidden.
* Every invariant is written as a mandatory rule.
* A software engineer can contribute code to Sheybi without making architectural or stylistic decisions independently.

---
