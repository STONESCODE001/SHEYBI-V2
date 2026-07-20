# AI Workflow Rules

## Purpose

This document defines mandatory rules for every AI coding agent working on the Sheybi codebase.

These rules define **how work is performed**, not **what is built**.

Every implementation must follow this document before writing, modifying, reviewing, or deleting code.

This document complements, but never overrides:

* `project-overview.md`
* `architecture.md`
* `prediction-engine.md`
* `database-schema.md`
* `api-contracts.md`
* `design-system.md`
* `code-standards.md`
* `ui-context.md`
* `progress-tracker.md`

If two documents conflict, resolve the conflict by following the document that owns that responsibility.

---

# Development Approach

Build the project using a **spec-driven, incremental workflow**.

Every implementation must begin by reading all relevant context documents.

Never invent behaviour.

Never assume missing requirements.

Implement only behaviour explicitly defined by the project specifications.

Every implementation must be fully verifiable before continuing to the next unit.

Always complete work in this order:

1. Read the relevant specification documents.
2. Identify the smallest implementation unit.
3. Implement only that unit.
4. Verify the implementation.
5. Update documentation if required.
6. Update `progress-tracker.md`.
7. Stop.

Do not begin another unit until the current unit is complete.

---

# Scoping Rules

Work on exactly one feature unit at a time.

Do not implement multiple unrelated features in the same task.

Do not combine user interface work with backend logic unless the specification explicitly requires both.

Do not modify unrelated files while implementing a feature.

Do not refactor unrelated code during feature development.

Do not optimize code outside the current implementation scope.

Do not implement future features early.

Do not add "helpful" functionality that has not been specified.

Do not expand the project scope without explicit instructions.

Every implementation must solve exactly one documented problem.

---

# Unit Definition Rules

A feature unit must represent one independently verifiable piece of functionality.

A feature unit must:

* Have one responsibility.
* Be testable independently.
* Be reviewable independently.
* Be deployable without depending on unfinished work.

Examples of valid feature units include:

* User Registration
* Login
* Browse Markets
* View Market Details
* Buy Position
* Sell Position
* Wallet Summary
* Deposit Flow
* Withdrawal Request
* Notification List
* Market Suggestion Submission
* Administrator Market Creation

Do not merge multiple feature units into one implementation.

---

# When to Split Work

Split implementation immediately if any task includes more than one architectural concern.

Split work whenever a task includes:

* UI and backend implementation
* Backend and database changes
* Prediction Engine and wallet changes
* Wallet and payment integration
* Administrator and user functionality
* Multiple unrelated pages
* Multiple unrelated API contracts
* Multiple unrelated database entities
* Multiple unrelated business rules
* Multiple deployment stages

If implementation cannot be verified quickly, split the task into smaller units.

Smaller units always take priority over larger implementations.

---

# Handling Missing Requirements

Never invent missing requirements.

Never infer unspecified business behaviour.

Never guess expected system behaviour.

If information is missing:

1. Stop implementation.
2. Identify the missing requirement.
3. Record the missing requirement in `progress-tracker.md`.
4. Wait for clarification before continuing.

If documentation conflicts:

1. Stop implementation.
2. Identify conflicting documents.
3. Record the conflict.
4. Request resolution.

Never resolve conflicting specifications independently.

---

# Documentation Usage Rules

Read the required documents before implementing any feature.

Use documents according to ownership.

`project-overview.md`

Defines the product vision.

`architecture.md`

Defines system boundaries.

`database-schema.md`

Defines persistent data.

`prediction-engine.md`

Defines trading behaviour.

`api-contracts.md`

Defines application contracts.

`design-system.md`

Defines visual implementation.

`ui-context.md`

Defines interface appearance.

`code-standards.md`

Defines coding conventions.

`progress-tracker.md`

Defines implementation progress.

Never redefine responsibilities already owned by another document.

Always reference the owning document.

---

# Protected Files

Do not modify protected files unless explicitly instructed.

Protected files include:

* `components/ui/**`
* Generated design system components
* Third-party libraries
* Framework source files
* Package manager lock files
* Generated assets
* Build output directories
* Environment templates
* Migration history
* Generated type definitions
* Vendor code
* External SDK source code

Only modify these files when explicitly requested.

Never edit generated code manually if regeneration is supported.

---

# Documentation Synchronization Rules

Documentation and implementation must remain synchronized.

Whenever implementation changes:

Update the owning document immediately.

Examples:

Architecture changes

→ Update `architecture.md`

Database changes

→ Update `database-schema.md`

Prediction behaviour changes

→ Update `prediction-engine.md`

API behaviour changes

→ Update `api-contracts.md`

Visual system changes

→ Update `design-system.md`

Coding conventions

→ Update `code-standards.md`

Product scope

→ Update `project-overview.md`

Implementation progress

→ Update `progress-tracker.md`

Never allow implementation and documentation to diverge.

Documentation always reflects the current system.
