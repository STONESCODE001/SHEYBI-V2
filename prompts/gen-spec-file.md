# Specification

Help me write the specification file for:

`<specification-name>.md`

This specification belongs to the Sheybi project.

Before writing this specification, read the following project documents:

- project-overview.md
- architecture.md
- ui-context.md
- build-plan.md
- wireframe.md
- user-flow.md
- code-standards.md
- progress-tracker.md
- api-contracts.md (only if relevant)

Use those documents as the source of truth.

Do not invent requirements.

Do not redefine requirements already owned by another document.

This specification owns ONLY the artifact named above.

Everything outside its scope belongs to another specification.

Follow the implementation order defined in `build-plan.md`.

---

# Purpose

State exactly what this specification exists to build.

State the visible result produced when the implementation is complete.

The purpose should be concrete.

---

# Scope

List exactly what this specification includes.

List exactly what it excludes.

There must be no ambiguity.

If another specification owns something, reference it instead of redefining it.

---

# Dependencies

List only what is actually required.

Include:

## Completed Build Units

List the completed units required before this specification can begin.

## Required Specifications

List only the specification files this artifact depends on.

## Required Packages

List only packages that must already exist before implementation begins.

Do not introduce future dependencies.

---

# Design

Describe only the visual and structural requirements.

Reference `ui-context.md` and `wireframe.md` where appropriate.

Include only:

- Visual hierarchy
- Layout
- Responsive behaviour
- Typography usage
- Spacing behaviour
- Component sizing
- States
- Accessibility requirements

Do not include:

- Business logic
- API behaviour
- Source code
- Tailwind classes
- Implementation instructions

---

# Structure

List every component introduced by this specification.

For every component define:

## Purpose

## Parent

## Children

## Reusable Elements

Describe the hierarchy only.

Do not describe implementation.

---

# Behaviour

Describe only interface behaviour.

Examples:

- Hover
- Focus
- Active
- Disabled
- Loading
- Opening
- Closing
- Navigation
- Keyboard interaction
- Responsive transitions

Do not describe:

- Business rules
- Authentication
- Prediction logic
- Database behaviour
- Server behaviour

---

# Acceptance Criteria

Create a measurable checklist.

Only include criteria relevant to this specification.

Examples:

- Every component renders correctly.
- Responsive layouts match the wireframe.
- Accessibility requirements are satisfied.
- Keyboard navigation works.
- No console errors.
- No TypeScript errors.
- npm run build succeeds.

Avoid vague acceptance criteria.

---

# Out of Scope

Explicitly list everything owned by later specifications.

Reference those specifications where appropriate.

---

# Cross-Document Responsibilities

If this specification references another artifact, it must reference it rather than redefine it.

Examples:

- Visual language → `ui-context.md`
- Application layout → `wireframe.md`
- Build order → `build-plan.md`
- User journeys → `user-flow.md`
- Architecture → `architecture.md`
- Feature behaviour → feature specifications
- API behaviour → `api-contracts.md`

This specification must remain the single source of truth only for `<specification-name>.md`.

---

# Writing Style

- Write in plain Markdown.
- Use deterministic language.
- Use **must**, **will**, **always**, and **cannot**.
- Be specific.
- Avoid vague wording.
- Avoid filler.
- Avoid implementation details.
- Avoid business logic unless this specification owns it.
- Do not include source code.
- Treat this document as the complete specification for this artifact.


edit and update the `<specification-name>.md`  file with the content of your generated output in .md file format