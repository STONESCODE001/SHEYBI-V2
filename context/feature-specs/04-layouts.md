# 04-layouts.md

# Purpose

The purpose of this specification is to define every reusable application layout that provides the structural foundation for routed pages. 

The visible result should be a complete collection of reusable layouts that correctly position navigation, shared UI regions, parent components, dialogs, and page content across every supported device size. 

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
- Mobile Layout Rules
- Tablet Layout Rules
- Desktop Layout Rules

**Each layout must define:**
- Structural regions
- Shared UI placement
- Content boundaries
- Scrollable regions
- Fixed regions
- Responsive transitions
- Parent component placement
- Dialog container placement
- Toast region placement

**Exclude:**
- Routed pages
- Parent component implementation
- Child component implementation
- Dialog implementation
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

## Required Specifications
- `context/ui-context.md`
- `context/wireframe.md`
- `context/specs/00-build-plan.md`
- `context/feature-specs/01-ui-primitives.md`
- `context/feature-specs/02-child-components.md`
- `context/feature-specs/03-parent-components.md`

## Required Packages
No new packages.
Reuse packages installed by:
- 01-ui-primitives.md
---

# Design

Reference:
- `context/ui-context.md`
- `context/wireframe.md`

## Desktop Layout Rules
- **Purpose**: Extend the mobile experience to larger screens.
- **Overall layout structure**: Fixed header, fixed left sidebar, scrollable main content, fixed right sidebar.
- **Visual hierarchy**: Follows progressive disclosure from main navigation down to page content.
- **Shared UI regions**: Navigation sidebar on the left, trending/watchlist on the right.
- **Parent component placement**: Rendered exclusively within the main content boundaries.
- **Fixed regions**: Header (always visible, full width), Left Sidebar (fixed width, full viewport height below header), Right Sidebar.
- **Scrollable regions**: Main Content (single vertical scroll container), Right Sidebar (independent scrolling).
- **Maximum content width**: 1440px for content boundaries.
- **Content alignment**: Center aligned.
- **Navigation placement**: Header (Top), Left Sidebar.
- **Dialog layer placement**: Full screen overlay above every page, center aligned.
- **Toast placement**: Appears above dialog layer.
- **Loading overlay placement**: Covers application shell, blocks interaction.
- **Accessibility requirements**: Minimum touch target 44px, WCAG AA contrast ratio, visible focus states.
Layouts must never render feature-specific markup.

Layouts may only compose previously implemented parent components and shared UI regions.

Individual pages remain responsible for selecting which parent components appear within the layout.

## Tablet Layout Rules
- **Purpose**: Adapt the application shell to medium-sized screens.
- **Overall layout structure**: Fixed header, collapsible sidebar, expanded main content.
- **Responsive behaviour**: Right sidebar is removed, bottom navigation is hidden. Sidebar becomes collapsible.

## Mobile Layout Rules
- **Purpose**: The primary application layout and default target for all responsive decisions.
- **Overall layout structure**: Fixed header, scrollable main content, fixed bottom navigation.
- **Fixed regions**: Header, Bottom Navigation (always visible, equal spacing, safe area aware).
- **Scrollable regions**: Main Content.
- **Safe areas**: Bottom navigation is strictly safe area aware.
- **Navigation placement**: Bottom Navigation.
- **Dialog layer placement**: Bottom sheet natively positioned, full width, rounded top corners, max height 90% viewport, internally scrollable.
- **Toast placement**: Appears above bottom navigation.

---

# Structure

## Public Layout
### Purpose
Displays pages accessible without authentication.
### Children
- Header
- Main Content
- Footer
### Reusable Elements
- Section Header
### Layout Rules
- Header remains fixed.
- Main Content scrolls.
- Footer appears only after page content.
- Maximum readable content width enforced.
- Region nesting: No application sidebar, no bottom navigation.

## Authenticated Layout
### Purpose
Displays every authenticated user page.
### Children
- Header
- Sidebar (Desktop)
- Main Content
- Right Panel (Desktop)
- Bottom Navigation (Mobile)
- Dialog Layer
- Toast Layer
### Reusable Elements
- Profile Summary
### Layout Rules
- Header is always fixed.
- Main Content is the only primary scrolling region.
- Navigation (Sidebar or Bottom Navigation) is always available.
- Dialog and Toast layers are available globally above all regions.

## Admin Layout
### Purpose
Displays administrative tools.
### Children
- Header
- Admin Sidebar
- Workspace
- Inspector Panel (optional)
### Reusable Elements
- Admin Summary Cards
### Layout Rules
- Administrative navigation is isolated from user navigation.
- Workspace is optimized for tables and management screens (supports large datasets).
- Admin Sidebar is fixed.
- Workspace scrolls independently.

## Centered Layout
### Purpose
Displays focused content.
### Children
- Centered Container
### Reusable Elements
- Not applicable
### Layout Rules
- Content is vertically centered when possible.
- Maximum width enforced.
- No sidebar, no bottom navigation, no footer.

## Blank Layout
### Purpose
Displays standalone application states.
### Children
- Single Container
### Reusable Elements
- Not applicable
### Layout Rules
- Single container covers full viewport.
- No navigation, no footer, no dialogs.

## Error Layout
### Purpose
Displays application errors.
### Children
- Centered Illustration
- Title
- Description
- Primary Action
### Reusable Elements
- Empty Illustration
### Layout Rules
- Single focus layout.
- Vertically stacked items.
- No unrelated navigation present.

## Loading Layout
### Purpose
Displays loading experiences.
### Children
- Skeleton Placeholders
### Reusable Elements
- Not applicable
### Layout Rules
- Covers entire application shell or viewport.
- Blocks interaction.

## Maintenance Layout
### Purpose
Displays maintenance mode.
### Children
- Illustration
- Status Message
- Optional Countdown
### Reusable Elements
- Empty Illustration
### Layout Rules
- Full viewport coverage.
- No navigation.
- No interactive application elements.

---

# Composition Rules

Layouts exist only to compose reusable interface regions.

Layouts may only compose:

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

Every routed page must consume a layout rather than redefining one.

Layouts are structural containers only.

# Behaviour

- **Page scrolling**: The Main Content area is the only region that handles primary page scrolling. Fixed regions must never scroll.
- **Sidebar expansion/collapse**: The sidebar will become collapsible on tablet devices and expand/collapse upon user interaction.
- **Sticky regions**: The Header and Bottom Navigation will maintain fixed positions relative to the viewport.
- **Responsive layout switching**: The application will automatically switch layouts between desktop, tablet, and mobile based on device size without reloading.
- **Keyboard navigation**: Layouts will preserve document flow to ensure keyboard focus moves predictably from primary navigation to main content.
- **Focus order**: Focus must never be trapped in the shell unless a dialog is active. Focus moves from Header to Navigation to Main Content.
- **Dialog layering**: Dialogs must trap focus, disable background scrolling, and render above the main application shell.
- **Overlay stacking**: Stacking order is strictly enforced: Main Content < Sidebar < Header < Bottom Navigation < Dialog Layer < Toast Layer < Loading Layer.
- **Resize behaviour**: The layout will seamlessly adapt to window resizes without horizontal scrolling or broken flex layouts.

---

# Acceptance Criteria

- Every reusable layout exists and exports a valid React component.
- Every layout composes only previously completed parent components.
- No layout contains feature-specific UI.
- No layout performs data fetching.
- No layout owns business state.
- Layouts only arrange reusable interface regions.
- Every layout matches the visual hierarchy specified in the wireframe.
- Shared UI regions are positioned correctly based on the viewport size.
- Fixed regions stay fixed and scrollable regions scroll without overflow issues.
- Responsive layouts function correctly across desktop, tablet, and mobile targets.
- Parent components render within the correct regions without breaking boundaries.
- Accessibility requirements are satisfied (valid ARIA landmarks such as `main`, `nav`).
- Keyboard navigation is preserved.
- No duplicated layouts exist across the application.
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

- Visual language → `context/ui-context.md`
- Visual blueprint → `context/wireframe.md`
- Build order → `context/specs/00-build-plan.md`
- User journeys → `context/user-flow.md`
- Architecture → `context/architecture.md`
- UI primitives → `context/feature-specs/01-ui-primitives.md`
- Child components → `context/feature-specs/02-child-components.md`
- Parent components → `context/feature-specs/03-parent-components.md`
- API behaviour → `context/api-contracts.md`
