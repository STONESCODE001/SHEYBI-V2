<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Application Building Context

Before implementing code, modifying architecture, changing documentation, or making technical decisions, read the following files in the specified order.

1. `context/project-overview.md`

   * Product vision
   * Product goals
   * Product scope
   * User personas
   * Core features
   * Product constraints
   * Non-goals

2. `context/prediction-engine.md`

   * Prediction market rules
   * Market lifecycle
   * Trading rules
   * Settlement rules
   * Wallet interaction
   * Financial invariants
   * Market state transitions

3. `context/architecture.md`

   * System architecture
   * Application boundaries
   * Module responsibilities
   * Dependency rules
   * Realtime architecture
   * Security boundaries
   * System invariants

4. `context/database-schema.md`

   * Database entities
   * Relationships
   * Ownership rules
   * Persistence model
   * Financial records
   * Audit records

5. `context/ui-context.md`

   * Color tokens
   * Typography
   * Spacing
   * Border radius
   * Layout patterns
   * Component conventions
   * Interaction patterns

6. `context/design-system.md`

   * Design principles
   * Component specifications
   * States
   * Accessibility
   * Motion
   * Responsive behaviour
   * Visual consistency rules

7. `context/code-standards.md`

   * Engineering principles
   * TypeScript standards
   * Folder organization
   * Component standards
   * API standards
   * Database access rules
   * Dependency rules
   * Code review rules

8. `context/api-contract.md`

   * Application contracts
   * Validation contracts
   * Authentication contracts
   * Authorization contracts
   * Request lifecycle
   * Response contracts
   * Error contracts
   * Realtime contracts

9. `context/ai-workflow-rules.md`

   * Development workflow
   * Scope management
   * Documentation rules
   * Verification requirements
   * Protected files
   * Delivery process

10. `context/progress-tracker.md`

    * Current phase
    * Current implementation target
    * Completed work
    * Work in progress
    * Next implementation unit
    * Open questions
    * Architecture decisions
    * Session notes

    
11. `context/wireframe.md`

    * Layout & Structure
    * Navigation Structure
    * Routed Pages
    * Shared UI Regions
    * Section Inventory
    * Parent Components
    * Child Components
    * Component Hierarchy
    * Dialog Inventory
    * Responsive Behaviour
    * Component Relationships
    * Component Checklist

12. `context/user-flow.md`

    * User Journeys
    * Entry Points
    * Task Sequences
    * Decision Points
    * Exit Points
    * Critical Paths
    * Alternative Paths
    * Completion Criteria
    * Failure Handling

13. `context/build-plan.md`

    * Implementation Roadmap
    * Feature Dependencies
    * Architectural Dependencies
    * Risk Assessment
    * Mitigation Strategies
    * Task Organization
    * Dependency Ordering
    * Verification Phases
    * Backlog Management

---

# Required Workflow

Every implementation session must follow this sequence.

1. Read every required context document in the order listed above.
2. Identify the current implementation target from `progress-tracker.md`.
3. Restrict work to the current implementation scope.
4. Verify that every planned change complies with:

   * `architecture.md`
   * `prediction-engine.md`
   * `database-schema.md`
   * `design-system.md`
   * `code-standards.md`
   * `api-contracts.md`
   * `ui-context.md`
   * `wireframe.md`
   * `user-flow.md`
   
5. Implement only the requested scope.
6. Validate that all architectural boundaries remain intact.
7. Update documentation if implementation changes any documented behaviour.
8. Update `context/progress-tracker.md` before ending the session.

---

# Documentation Rules

Documentation files are the source of truth.

Implementation must conform to the documentation.

Implementation must not redefine documented behaviour.

If implementation requires changing documented behaviour:

1. Update the appropriate context document.
2. Ensure the change does not conflict with other context documents.
3. Continue implementation only after documentation reflects the new behaviour.

The following ownership rules apply.

* Product behaviour → `project-overview.md`
* Prediction logic → `prediction-engine.md`
* Architecture → `architecture.md`
* Database structure → `database-schema.md`
* Visual design → `ui-context.md`
* Component behaviour → `design-system.md`
* Coding conventions → `code-standards.md`
* Application contracts → `api-contracts.md`
* Development workflow → `ai-workflow-rules.md`
* Project status → `progress-tracker.md`
* Layout & Structure → `wireframe.md`
* User Journeys → `user-flow.md`
* UI Guidelines → `ui-context.md`

A responsibility documented in one file must never be duplicated in another file.

---

# Implementation Rules

Every implementation must:

* Follow the documented architecture.
* Follow the documented design system.
* Follow the documented code standards.
* Follow the documented API contracts.
* Follow the documented prediction engine.
* Respect all documented invariants.
* Keep business logic out of UI components.
* Keep financial logic inside the Prediction Engine.
* Keep communication contracts consistent with `api-contracts.md`.
* Keep documentation synchronized with implementation.

---

# Scope Rules

Never expand implementation scope beyond the requested unit.

Do not implement future features.

Do not implement speculative functionality.

Do not modify unrelated modules.

Do not refactor unrelated code.

Complete the current implementation before beginning another.

---

# Completion Checklist

Before considering any implementation complete, verify that:

* The requested implementation scope is complete.
* The implementation satisfies every relevant context document.
* No architectural boundary has been violated.
* No documented invariant has been broken.
* Documentation reflects the current implementation.
* `context/progress-tracker.md` has been updated.
* The project remains internally consistent.
