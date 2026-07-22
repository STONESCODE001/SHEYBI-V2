# 06-pages.md

# Purpose

The purpose of this specification is to define every routed page in the Sheybi application.

Each page must describe its structure, layout, composition, placeholders, and reusable interface hierarchy.

Pages define only routed content. Pages render exclusively inside the Main Content slot provided by their Layout. Pages never redefine shell UI.

The visible result must be a complete navigable application where every route exists using placeholder content only.

No feature implementation should exist.

---

# Scope

This specification includes only routed pages.

It must define every page that exists in the application:

- Landing
- Authentication Pages (Sign In, Sign Up, Forgot Password, Reset Password, Verify Email)
- Legal Pages (Privacy Policy, Terms of Service)
- Dashboard
- Markets
- Market Details
- Portfolio
- Wallet
- Notifications
- Profile
- Settings
- Admin Dashboard
- Admin Market Management
- Admin Categories
- Admin Users
- Admin Transactions (Withdrawals & Financial Activity)
- Admin Audit Logs
- Admin Settings
- Error Pages
- Maintenance Page
- Loading Page

Pages MUST own:
- Routed page composition
- Main Content composition
- Parent component placement
- Placeholder content
- Empty states
- Loading states
- Error states
- Responsive page composition

Pages MUST NOT own:
- Desktop Sidebar
- Desktop Header
- Mobile Header
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

These are supplied by the assigned Layout.

This specification must not define:
- Child components
- Parent component implementation
- Layout implementation
- Application Shell implementation
- Dialog implementation
- Business logic
- Authentication behaviour
- API behaviour
- Database behaviour
- Feature workflows
- Server behaviour
- State management

---

# Dependencies

## Completed Build Units

This specification must depend only on completed frontend units.

Expected dependencies include:
- `context/feature-specs/01-ui-primitives.md`
- `context/feature-specs/02-child-components.md`
- `context/feature-specs/03-parent-components.md`
- `context/feature-specs/04-application-shell.md`
- `context/feature-specs/05-layouts.md`

## Required Specifications

Reference only required specifications.

- `context/specs/project-overview.md`
- `context/specs/architecture.md`
- `context/specs/wireframe.md`
- `context/specs/user-flow.md`
- `context/specs/ui-context.md`
- `context/specs/build-plan.md`
- `context/specs/code-standards.md`
- `context/specs/progress-tracker.md`   
- `context/feature-specs/01-ui-primitives.md`
- `context/feature-specs/02-child-components.md`
- `context/feature-specs/03-parent-components.md`
- `context/feature-specs/04-application-shell.md`
- `05-layouts.md`

## Required Packages

No new packages.

Reuse packages introduced by previous frontend specifications.

Pages must not introduce additional dependencies.

---

# Design

Reference:
- `context/specs/ui-context.md`
- `context/specs/wireframe.md`

Describe only page-level visual composition.

Every page defines only the Main Content region. The assigned Layout provides every surrounding shell region.

For every page define:
- Assigned Layout
- Assigned Application Shell
- Visual hierarchy
- Page width
- Scroll behaviour
- Responsive adaptations
- Placeholder behaviour
- Empty states
- Loading states
- Error states
- Accessibility requirements

---

# Structure

# Route Inventory

## Public

/
 /auth/sign-in
 /auth/sign-up
 /auth/forgot-password
 /auth/reset-password
 /auth/verify-email
 /legal/privacy
 /legal/terms

## Authenticated

/dashboard
/markets
/markets/[id]
/portfolio
/wallet
/notifications
/profile
/settings

## Administrator

/admin
/admin/markets
/admin/categories
/admin/users
/admin/transactions
/admin/audit-logs
/admin/settings

## System

loading.tsx
error.tsx
not-found.tsx
maintenance

System Pages include:

- loading.tsx
- error.tsx
- not-found.tsx

These pages must integrate with the assigned Layout where applicable.

Maintenance pages remain standalone.

# Navigation Rules

Every routed page must define:

- Primary entry points
- Exit points
- Breadcrumb visibility
- Active navigation destination
- Browser back compatibility

Navigation implementation belongs to
07-dialog.md only where dialogs initiate navigation.

Navigation behaviour belongs to feature specifications.

---

## Public Pages

### Landing Page
#### Purpose
Introduce Sheybi and encourage user registration.
#### Route
`/`
#### Assigned Layout
Public Layout
#### Assigned Application Shell
Public Application Shell
#### Main Content
- Hero Banner
- Section Header
- Market Feed
#### Placeholder Content
- Static hero copy and placeholder imagery.
- 4-8 placeholder market cards in featured/trending feeds.
#### Navigation Entry Points
- Public Header Logo
#### Responsive Behaviour
- Desktop: Two-column hero section. Multi-column market feeds.
- Tablet: Hero stacks vertically. Two-column market grid.
- Mobile: Single-column layout. Simplified hero content.
#### Accessibility Notes
- Semantic heading hierarchy starting from `<h1>` in the hero.
- Focus order follows visual hierarchy.

### Sign In
#### Purpose
Allow existing users to authenticate.
#### Route
`/auth/sign-in`
#### Assigned Layout
Centered Layout
#### Assigned Application Shell
Guest Application Shell
#### Main Content
- Authentication Form (Placeholder form structure)
#### Placeholder Content
- Email and password input skeletons.
- Primary button for submission.
#### Navigation Entry Points
- Header (Public)
#### Responsive Behaviour
- Centered vertically and horizontally across all viewports.
#### Accessibility Notes
- Inputs must be clearly labeled and wrapped in a form element.

### Sign Up
#### Purpose
Allow new users to register.
#### Route
`/auth/sign-up`
#### Assigned Layout
Centered Layout
#### Assigned Application Shell
Guest Application Shell
#### Main Content
- Authentication Form (Placeholder form structure)
#### Placeholder Content
- Registration input skeletons.
#### Navigation Entry Points
- Header (Public), Landing Page CTA
#### Responsive Behaviour
- Centered vertically and horizontally across all viewports.
#### Accessibility Notes
- Inputs must be clearly labeled and wrapped in a form element.

### Forgot Password
#### Purpose
Allow users to request a password reset link.
#### Route
`/auth/forgot-password`
#### Assigned Layout
Centered Layout
#### Assigned Application Shell
Guest Application Shell
#### Main Content
- Authentication Form (Placeholder form structure)
#### Placeholder Content
- Email input skeleton.
#### Navigation Entry Points
- Sign In Page
#### Responsive Behaviour
- Centered vertically and horizontally across all viewports.
#### Accessibility Notes
- Clear instructions on the recovery process.

### Reset Password
#### Purpose
Allow users to set a new password.
#### Route
`/auth/reset-password`
#### Assigned Layout
Centered Layout
#### Assigned Application Shell
Guest Application Shell
#### Main Content
- Authentication Form (Placeholder form structure)
#### Placeholder Content
- Password input skeleton.
#### Navigation Entry Points
- Email Link
#### Responsive Behaviour
- Centered vertically and horizontally across all viewports.
#### Accessibility Notes
- Clear feedback on password strength requirements.

### Verify Email
#### Purpose
Confirm user's email address.
#### Route
`/auth/verify-email`
#### Assigned Layout
Centered Layout
#### Assigned Application Shell
Guest Application Shell
#### Main Content
- Placeholder Feedback Card
#### Placeholder Content
- Verification status skeleton/loading indicator.
#### Navigation Entry Points
- Email Link, Sign Up completion
#### Responsive Behaviour
- Centered vertically and horizontally across all viewports.
#### Accessibility Notes
- Live region for status updates.

### Legal Pages (Privacy Policy, Terms of Service)
#### Purpose
Display static legal documentation.
#### Route
`/legal/privacy`, `/legal/terms`
#### Assigned Layout
Public Layout
#### Assigned Application Shell
Public Application Shell
#### Main Content
- Text Content Block
#### Placeholder Content
- Lorem ipsum blocks for legal text.
#### Navigation Entry Points
- Footer
#### Responsive Behaviour
- Desktop: Maximum readable width, centered.
- Mobile: Full width with standard padding.
#### Accessibility Notes
- Proper semantic HTML structure for headings and paragraphs.

---

## Authenticated Pages

### Dashboard
#### Purpose
Display active prediction markets after authentication.
#### Route
`/dashboard`
#### Assigned Layout
Authenticated Layout
#### Assigned Application Shell
Authenticated Application Shell
#### Main Content
- Hero Banner
- Category Tabs
- Market Feed
#### Placeholder Content
- Welcome banner copy.
- Placeholder category tabs.
- 6-12 placeholder market cards.
#### Navigation Entry Points
- Sidebar, Bottom Navigation
#### Responsive Behaviour
- Desktop: Multi-column market feed.
- Tablet: Two-column market feed.
- Mobile: Single-column feed.
#### Accessibility Notes
- Tablist semantics for categories. Keyboard navigation across market cards.

### Markets
#### Purpose
Browse all available prediction markets.
#### Route
`/markets`
#### Assigned Layout
Authenticated Layout
#### Assigned Application Shell
Authenticated Application Shell
#### Main Content
- Category Tabs
- Market Feed
#### Placeholder Content
- Extensive grid of placeholder market cards.
#### Navigation Entry Points
- Sidebar, Bottom Navigation
#### Responsive Behaviour
- Matches Dashboard feed behaviour.
#### Accessibility Notes
- Accessible search and filter controls.

### Market Details
#### Purpose
Display one prediction market and trading interface.
#### Route
`/markets/[id]`
#### Assigned Layout
Authenticated Layout
#### Assigned Application Shell
Authenticated Application Shell
#### Main Content
- Section Header (Market Title/Status)
- Statistic Card (Market Stats)
- Trade Panel
- Activity Feed
#### Placeholder Content
- Dummy market title, statistics, static graph placeholder, and placeholder activity items.
#### Navigation Entry Points
- Dashboard, Markets, Portfolio, Search
#### Responsive Behaviour
- Desktop: Graph and trade panel side by side.
- Tablet: Trade panel below graph.
- Mobile: Sections stack vertically, trade panel full width.
#### Accessibility Notes
- Complex charts must have accessible alternatives (tables or screen reader text).

### Portfolio
#### Purpose
Display user trading positions.
#### Route
`/portfolio`
#### Assigned Layout
Authenticated Layout
#### Assigned Application Shell
Authenticated Application Shell
#### Main Content
- Portfolio Card (Summary)
- Statistic Card
- Activity Feed (Positions)
#### Placeholder Content
- Dummy portfolio balance.
- 3-5 placeholder open and closed positions.
#### Navigation Entry Points
- Sidebar, Bottom Navigation
#### Responsive Behaviour
- Desktop: Horizontal summary cards.
- Tablet: Two-column grid for summary.
- Mobile: Single-column stack.
#### Accessibility Notes
- Logical grouping of open vs closed positions.

### Wallet
#### Purpose
Display wallet overview and transaction history.
#### Route
`/wallet`
#### Assigned Layout
Authenticated Layout
#### Assigned Application Shell
Authenticated Application Shell
#### Main Content
- Wallet Card
- Statistic Card
- Activity Feed
#### Placeholder Content
- Dummy balance, deposit/withdraw buttons, placeholder transaction history.
#### Navigation Entry Points
- Sidebar, Bottom Navigation, Header Wallet Icon
#### Responsive Behaviour
- Desktop/Tablet: Two-column layout for summary.
- Mobile: Single-column layout.
#### Accessibility Notes
- Clear labeling for financial figures.

### Notifications
#### Purpose
Display user notifications.
#### Route
`/notifications`
#### Assigned Layout
Authenticated Layout
#### Assigned Application Shell
Authenticated Application Shell
#### Main Content
- Section Header
- Activity Feed (Notifications)
#### Placeholder Content
- 5-10 placeholder notification items.
#### Navigation Entry Points
- Sidebar, Header Notification Icon
#### Responsive Behaviour
- Desktop: Centered content container.
- Mobile: Full-screen list.
#### Accessibility Notes
- New notifications should alert screen readers.

### Profile
#### Purpose
Display user account information.
#### Route
`/profile`
#### Assigned Layout
Authenticated Layout
#### Assigned Application Shell
Authenticated Application Shell
#### Main Content
- Profile Summary Card
- Statistic Card
- Section Header
#### Placeholder Content
- Placeholder avatar, dummy user details, dummy statistics.
#### Navigation Entry Points
- Sidebar, Bottom Navigation, Header User Menu
#### Responsive Behaviour
- Desktop: Two columns for information.
- Mobile: Single-column layout.
#### Accessibility Notes
- Descriptive alt text for avatar.

### Settings
#### Purpose
Display configurable application settings.
#### Route
`/settings`
#### Assigned Layout
Authenticated Layout
#### Assigned Application Shell
Authenticated Application Shell
#### Main Content
- Section Header
- Setting Card
#### Placeholder Content
- Toggle and select skeletons for settings.
#### Navigation Entry Points
- Sidebar, Header User Menu
#### Responsive Behaviour
- Desktop: Two-column settings.
- Mobile: Single-column settings.
#### Accessibility Notes
- Proper association between labels and input controls (toggles, selects).

---

## Administrator Pages

Administrative pages must never be reused by authenticated user pages.

The Admin Layout exists independently from the Authenticated Layout.

### Admin Dashboard
#### Purpose
Display administrative overview and key platform metrics.
#### Route
`/admin`
#### Assigned Layout
Admin Layout
#### Assigned Application Shell
Admin Application Shell
#### Main Content
- Section Header
- Statistic Card
#### Placeholder Content
- 4-6 placeholder top-level statistic cards.
#### Navigation Entry Points
- Admin Sidebar
#### Responsive Behaviour
- Desktop: Multi-panel workspace.
- Mobile: Card-based representation.
#### Accessibility Notes
- Complex dashboard widgets must be keyboard navigable.

### Admin Market Management
#### Purpose
Manage prediction markets (create, edit, resolve).
#### Route
`/admin/markets`
#### Assigned Layout
Admin Layout
#### Assigned Application Shell
Admin Application Shell
#### Main Content
- Section Header
- Admin Table (Placeholder)
#### Placeholder Content
- Data table skeleton with placeholder rows.
#### Navigation Entry Points
- Admin Sidebar
#### Responsive Behaviour
- Desktop: Full table.
- Tablet: Scrollable table.
- Mobile: Card-based view.
#### Accessibility Notes
- Table rows and actions must be accessible via keyboard.

### Admin Categories
#### Purpose
Manage market categories.
#### Route
`/admin/categories`
#### Assigned Layout
Admin Layout
#### Assigned Application Shell
Admin Application Shell
#### Main Content
- Section Header
- Admin Table (Placeholder)
#### Placeholder Content
- Category list skeleton.
#### Navigation Entry Points
- Admin Sidebar
#### Responsive Behaviour
- Follows Admin Market Management rules.
#### Accessibility Notes
- Consistent with Admin Market Management.

### Admin Users
#### Purpose
Manage users (suspend, review).
#### Route
`/admin/users`
#### Assigned Layout
Admin Layout
#### Assigned Application Shell
Admin Application Shell
#### Main Content
- Section Header
- Admin Table (Placeholder)
#### Placeholder Content
- User list skeleton.
#### Navigation Entry Points
- Admin Sidebar
#### Responsive Behaviour
- Follows Admin Market Management rules.
#### Accessibility Notes
- Consistent with Admin Market Management.

### Admin Transactions
#### Purpose
Review financial activity and manage withdrawals.
#### Route
`/admin/transactions`
#### Assigned Layout
Admin Layout
#### Assigned Application Shell
Admin Application Shell
#### Main Content
- Section Header
- Admin Table (Placeholder)
#### Placeholder Content
- Transaction list skeleton.
#### Navigation Entry Points
- Admin Sidebar
#### Responsive Behaviour
- Follows Admin Market Management rules.
#### Accessibility Notes
- Consistent with Admin Market Management.

### Admin Audit Logs
#### Purpose
Review system audit trails.
#### Route
`/admin/audit-logs`
#### Assigned Layout
Admin Layout
#### Assigned Application Shell
Admin Application Shell
#### Main Content
- Section Header
- Admin Table (Placeholder)
#### Placeholder Content
- Audit log list skeleton.
#### Navigation Entry Points
- Admin Sidebar
#### Responsive Behaviour
- Follows Admin Market Management rules.
#### Accessibility Notes
- Consistent with Admin Market Management.

### Admin Settings
#### Purpose
Manage platform configuration.
#### Route
`/admin/settings`
#### Assigned Layout
Admin Layout
#### Assigned Application Shell
Admin Application Shell
#### Main Content
- Section Header
- Setting Card
#### Placeholder Content
- Platform setting toggles and forms.
#### Navigation Entry Points
- Admin Sidebar
#### Responsive Behaviour
- Desktop: Multi-column.
- Mobile: Single-column.
#### Accessibility Notes
- Consistent with user Settings page.

---

## System Pages

### Error Page
#### Purpose
Display application errors (404, 500, etc.).
#### Route
Dynamic (Error Boundary / Next.js `not-found`, `error`)
#### Assigned Layout
Error Layout
#### Assigned Application Shell
Error Application Shell
#### Main Content
- Error Layout Content (Illustration, Message, Action)
#### Placeholder Content
- Static error message and primary action.
#### Navigation Entry Points
- System-triggered
#### Responsive Behaviour
- Same across all devices.
#### Accessibility Notes
- Error messages must be announced by screen readers.

### Loading Page
#### Purpose
Display loading experiences during route transitions or initial load.
#### Route
Dynamic (Next.js `loading`)
#### Assigned Layout
Loading Layout
#### Assigned Application Shell
Context-dependent (matches destination layout)
#### Main Content
- Loading Indicator / Skeletons
- Skeleton Groups
- Placeholder Sections
#### Placeholder Content
- Skeleton structure matching the destination page.
#### Navigation Entry Points
- System-triggered
#### Responsive Behaviour
- Matches destination page layout.
#### Accessibility Notes
- ARIA live regions to announce loading state.
#### Notes
- Loading pages must never use spinners.
- Loading experiences must match the final page layout. 

### Maintenance Page
#### Purpose
Display maintenance mode.
#### Route
System-level routing
#### Assigned Layout
Maintenance Layout
#### Assigned Application Shell
Maintenance Application Shell
#### Main Content
- Maintenance Layout Content
#### Placeholder Content
- Static maintenance copy.
#### Navigation Entry Points
- System-triggered
#### Responsive Behaviour
- Full viewport, no navigation.
#### Accessibility Notes
- Clearly announce maintenance state.

---

# Composition Rules

Pages exist only to compose reusable layouts and parent components.

Pages may only compose:
- Layouts
- Parent Components
- Dialog Triggers
- Toast Triggers

Pages must never:
- Build reusable UI
- Render business data
- Fetch data
- Implement feature workflows
- Manage business state
- Duplicate layout logic
- Duplicate parent components

Every routed page must consume one layout.

Every page must remain independently replaceable without modifying the layouts beneath it.

---

# Behaviour

Pages must implement the following page-level interface behaviours:
- **Route transitions:** Smooth routing without flashing styles.
- **Page loading placeholders:** Next.js `loading.tsx` using skeletons.
- **Empty page rendering:** Display Empty State components when lists are empty.
- **Error page rendering:** Use Next.js `error.tsx` and `not-found.tsx`.
- **Scroll restoration:** Handled automatically by the router.
- **Keyboard navigation:** Focus must move to the main content area upon route change.
- **Focus management:** Managed for accessibility across routes.
- **Responsive layout switching:** Pages adapt naturally via Layout constraints and Tailwind CSS.
- **Dialog trigger locations:** Triggers must be easily accessible.

---

# Acceptance Criteria

- [ ] Every routed page exists.
- [ ] Every page uses an approved layout (Public, Authenticated, Admin, Centered, Error, Loading, or Maintenance).
- [ ] Every page only composes existing parent components.
- [ ] Every navigation destination resolves to a page.
- [ ] Responsive layouts match the wireframe.
- [ ] Placeholder content exists where required.
- [ ] Empty states exist where required.
- [ ] Loading states (`loading.tsx`) exist where required.
- [ ] Error pages (`error.tsx`, `not-found.tsx`) exist.
- [ ] Accessibility requirements are satisfied (focus management, semantic HTML).
- [ ] Keyboard navigation works across route transitions.
- [ ] No duplicated layouts exist within pages.
- [ ] No duplicated parent components exist.
- [ ] No page contains feature logic.
- [ ] No console errors exist.
- [ ] No TypeScript errors exist.
- [ ] `npm run build` succeeds.
- [ ] Pages compose only Main Content.
- [ ] Pages never duplicate shell regions.
- [ ] Pages consume the correct Layout.
- [ ] Every route renders inside an Application Shell.
- [ ] Shell UI remains unchanged during routing.

---

# Out of Scope

The following items belong to later specifications and are out of scope for this document:
- Dialog implementation → `07-dialog.md`
- Authentication behaviour
- Market functionality
- Wallet functionality
- Trading
- Portfolio
- Community
- Administration
- Background Jobs
- Production systems
- API behaviour
- Business rules

---

Page specifications own:

- Route structure
- Layout assignment
- Main Content composition
- Parent component placement
- Placeholder composition
- Empty states
- Loading states
- Error states
- Responsive page composition

They do not own:

- Component implementation
- Layout implementation
- Application Shell implementation
- Feature implementation
- Business behaviour
- API behaviour
- State management

# Out of Scope (Explicit)

Protected pages must not implement authentication.

Authentication ownership belongs exclusively to `07-authentication.md`.

# Cross-Document Responsibilities

If this specification references another artifact, it must reference it rather than redefine it.

- Application Shell → `04-application-shell.md`
- Layouts → `05-layouts.md`
- Visual language → `ui-context.md`
- Application blueprint → `wireframe.md`
- Build order → `build-plan.md`
- Parent components → `03-parent-components.md`
- Child components → `02-child-components.md`
- UI primitives → `01-ui-primitives.md`
- User journeys → `user-flow.md`
- Architecture → `architecture.md`
- API behaviour → `api-contracts.md`

Pages consume layouts.
Layouts consume the Application Shell.
Pages never redefine shell regions.

This specification remains the single source of truth only for `06-pages.md`.
