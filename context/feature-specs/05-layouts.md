# 05-layouts.md

# Purpose

The purpose of this specification is to define every reusable application layout that provides the structural foundation for routed pages.

Layouts compose Application Shell variants.
Layouts expose one or more content slots.
Routed pages render inside those slots.
Layouts never redefine shell regions.

Layouts must be reusable and contain no feature-specific behaviour.

---

# Scope

This specification includes only reusable layouts.

**Includes:**
- Public Layout
- Authenticated Layout
- Admin Layout
- Centered Layout
- Blank Layout
- Error Layout
- Loading Layout
- Maintenance Layout

**Each layout must define:**
- Which Application Shell variant it composes
- Content slot locations
- Layout constraints
- Responsive layout composition

**Exclude:**
- Routed pages
- Desktop Sidebar
- Mobile Header
- Desktop Header
- Bottom Navigation
- Hamburger Drawer
- Wallet Region
- Wallet Chip
- Search Region
- Notification Region
- User Region
- Live Market Ticker
- Dialog Layer
- Toast Layer
- Loading Layer
- Parent component implementation
- Child component implementation
- Navigation implementation
- Business logic
- Authentication behaviour
- API behaviour
- Database behaviour
- State management
- Feature implementation

---

# Dependencies

## Completed Build Units
- `01-ui-primitives.md`
- `02-child-components.md`
- `03-parent-components.md`
- `04-application-shell.md`

## Required Specifications
- `context/specs/project-overview.md`
- `context/specs/architecture.md`
- `context/specs/ui-context.md`
- `context/specs/wireframe.md`
- `context/specs/build-plan.md`
- `context/specs/user-flow.md`
- `context/specs/code-standards.md`
- `context/feature-specs/01-ui-primitives.md`
- `context/feature-specs/02-child-components.md`
- `context/feature-specs/03-parent-components.md`
- `context/feature-specs/04-application-shell.md`

## Required Packages
No new packages.
Reuse packages installed by:
- `context/feature-specs/01-ui-primitives.md

---

# Design

Reference:
- `ui-context.md`
- `wireframe.md`
- `04-application-shell.md`

## Layout Design Rules
- **Content slot placement**: Content slots must be correctly positioned within the layout's structural container.
- **Maximum content width**: Enforced maximum width for content boundaries (e.g. 1440px for standard content layout).
- **Layout spacing**: Consistent spacing, margins, and padding rules around the content slot.
- **Layout constraints**: Enforce maximum content widths, centering rules, and overflow handling.
- **Responsive composition**: Ensure the layout's structural composition adapts seamlessly across desktop, tablet, and mobile views.

Layouts must never render feature-specific markup or redefine shell UI components.
Layouts reference `04-application-shell.md` instead of redefining shell regions.

---

# Structure

## Public Layout
### Purpose
Displays pages accessible without authentication.
### Parent
None
### Children
- Guest Application Shell
    - Main Content Slot
### Reusable Elements
- Section Header
### Ownership
- Layout Composition

## Authenticated Layout
### Purpose
Displays every authenticated user page.
### Parent
None
### Children
- Authenticated Application Shell
    - Main Content Slot
### Reusable Elements
- Profile Summary
### Ownership
- Layout Composition

## Admin Layout
### Purpose
Displays administrative tools.
### Parent
None
### Children
- Admin Application Shell
    - Main Content Slot
### Reusable Elements
- Admin Summary Cards
### Ownership
- Layout Composition

## Centered Layout
### Purpose
Displays focused content requiring vertical and horizontal centering.
### Parent
None
### Children
- Centered Container
    - Main Content Slot
### Reusable Elements
- Not applicable
### Ownership
- Layout Composition

## Blank Layout
### Purpose
Displays standalone application states without surrounding shell UI.
### Parent
None
### Children
- Blank Container
    - Main Content Slot
### Reusable Elements
- Not applicable
### Ownership
- Layout Composition

## Error Layout
### Purpose
Displays application errors.
### Parent
None
### Children
- Error Container
    - Main Content Slot
### Reusable Elements
- Empty Illustration
### Ownership
- Layout Composition

## Loading Layout
### Purpose
Displays loading experiences.
### Parent
None
### Children
- Loading Container
    - Main Content Slot
### Reusable Elements
- Skeleton Placeholders
### Ownership
- Layout Composition

## Maintenance Layout
### Purpose
Displays maintenance mode.
### Parent
None
### Children
- Maintenance Container
    - Main Content Slot
### Reusable Elements
- Empty Illustration
### Ownership
- Layout Composition

---

# Composition Rules

Layouts exist only to compose reusable interface regions and application shell variants.

Layouts may only compose:

- Application Shell Variants
- Main Content Slots
- Shared UI Regions
- Parent Components
- Dialog Containers
- Toast Containers
- Loading Overlays

Layouts must never:

- Render feature-specific UI
- Render business data
- Fetch data
- Manage business state
- Implement feature workflows
- Implement API interactions
- Contain page-specific logic
- Redefine shell regions

Every routed page must consume a layout rather than redefining one.

Layouts are structural containers only.

---

# Behaviour

- **Layout composition**: Layouts automatically wrap their children (routed pages) with the appropriate Application Shell or container variant.
- **Responsive slot placement**: The Main Content Slot adapts its position based on the active Application Shell's responsive boundaries.
- **Content rendering behaviour**: Pages render strictly within the exposed content slots. Content scrolling is managed by the layout constraints or the Application Shell.

---

# Acceptance Criteria

- Every reusable layout exists and exports a valid React component.
- Every layout composes the correct Application Shell.
- Every layout exposes the correct content slot.
- Layouts do not duplicate shell regions.
- Layouts do not redefine shell components.
- Responsive layout composition matches the wireframe.
- No layout contains feature-specific UI.
- No layout performs data fetching.
- No layout owns business state.
- Layouts only arrange reusable interface regions and slots.
- Responsive layouts function correctly across desktop, tablet, and mobile targets.
- Accessibility requirements are satisfied.
- No console errors are produced by layouts.
- No TypeScript errors exist in the layout codebase.
- `npm run build` succeeds.

---

# Out of Scope

- Routed pages
- Navigation implementation logic
- Dialog state implementation
- Authentication logic
- Market functionality
- Wallet functionality
- Trading functionality
- Portfolio functionality
- Community functionality
- Administration logic
- Background jobs
- Production systems

---

# Cross-Document Responsibilities

- Visual language → `context/specs/ui-context.md`
- Visual blueprint → `context/specs/wireframe.md`
- Build order → `context/specs/build-plan.md`
- User journeys → `context/specs/user-flow.md`
- Architecture → `context/specs/architecture.md`
- UI primitives → `context/feature-specs/01-ui-primitives.md`
- Child components → `context/feature-specs/02-child-components.md`
- Parent components → `context/feature-specs/03-parent-components.md`
- API behaviour → `context/specs/api-contracts.md`
- Application Shell → `context/feature-specs/04-application-shell.md`

Shell regions are owned by `04-application-shell.md`.
Layouts consume them.
