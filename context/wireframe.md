# wireframe.md

# 1. Purpose

This document defines the visual blueprint of the Sheybi application.

It is the single source of truth for the application's visual structure before implementation begins.

Every specification file must reference this document instead of defining new layouts, pages, regions, or reusable components.

This document defines only visual composition.

It does not define business logic, user behaviour, API behaviour, authentication, prediction rules, or implementation details.

---

# 2. Design Principles

The application must follow these principles.

## Mobile First

Every screen must be designed for mobile before tablet and desktop.

Desktop layouts extend the mobile experience.

---

## Component Reuse

Every reusable visual element must exist as a reusable component.

Pages must assemble reusable components.

Pages must never duplicate component structures.

---

## Predictable Layout

Every page must follow a consistent layout hierarchy.

Navigation always appears in the same location.

Primary content always occupies the same region.

Dialogs always open from consistent positions.

---

## Responsive Structure

The application must adapt to Desktop, Tablet and Mobile layouts without changing the overall visual hierarchy.

Only layout changes.

Navigation destinations remain identical.

---

## Progressive Disclosure

Only the information needed for the current screen should be visible.

Secondary actions belong inside dialogs, sheets or menus.

---

## Consistent Visual Hierarchy

Every screen follows the same hierarchy.

Primary Action

↓

Primary Content

↓

Supporting Information

↓

Secondary Actions

---

## Single Scroll Container

Each page must contain one primary scrolling region.

Fixed regions must never scroll.

---

## Reusable Building Blocks

Every page must be assembled from reusable sections.

Every section must be assembled from reusable parent components.

Every parent component must be assembled from reusable child components.

No page may introduce unique component structures unless documented.

---

# 3. Application Shell

The application shell surrounds every authenticated screen.

It remains visually consistent across the platform.

---

# Desktop Layout

## Header

Purpose

Primary application navigation.

Children

- Logo
- Search
- Global Market Categories
- Notification Button
- Wallet Button
- Profile Button

Behaviour

Fixed.

Never scrolls.

Requirements

- Full width
- Fixed height
- Always visible

---

## Left Sidebar

Purpose

Primary navigation.

Children

- Dashboard
- Markets
- Portfolio
- Wallet
- Notifications
- Profile
- Settings

Administrator accounts additionally display

- Admin

Behaviour

Fixed.

Never scrolls.

Requirements

- Fixed width
- Full viewport height below header

---

## Main Content

Purpose

Displays routed page content.

Behaviour

Scrollable.

Requirements

- Single vertical scroll container
- Maximum readable width
- Center aligned

---

## Right Sidebar

Purpose

Persistent secondary information.

Children

- Trending Markets
- Featured Markets
- Watchlist
- Recent Activity

Behaviour

Fixed.

Independent scrolling.

Hidden on medium screens.

---

## Dialog Layer

Purpose

Displays dialogs above every page.

Requirements

- Full screen overlay
- Highest application priority

---

## Toast Layer

Purpose

Temporary notifications.

Requirements

Appears above dialog layer.

Never blocks interaction.

---

## Loading Layer

Purpose

Application loading state.

Requirements

Covers application shell.

Blocks interaction.

---

# Tablet Layout

Header remains fixed.

Sidebar becomes collapsible.

Main content expands.

Right sidebar is removed.

Dialogs remain centered.

Bottom navigation is hidden.

---

# Mobile Layout

## Header

Purpose

Primary application identity.

Children

- Logo
- Search Button
- Notification Button

Behaviour

Fixed.

---

## Main Content

Purpose

Displays routed page.

Behaviour

Scrollable.

---

## Bottom Navigation

Purpose

Primary navigation.

Children

- Home
- Markets
- Portfolio
- Wallet
- Profile

Behaviour

Fixed.

Always visible.

Requirements

Equal spacing.

Safe area aware.

---

## Floating Action Area

Purpose

Future floating actions.

Requirements

Reserved only.

Unused until specified.

---

## Dialog Layer

Dialogs open nativly the way they are postioned like shadcn/ui

Full width.

Rounded top corners.

Maximum height 90% viewport.

Scrollable internally.

---

## Toast Layer

Appears above bottom navigation.

---

## Loading Layer

Covers entire viewport.

Blocks interaction.

---

### Application Shell Hierarchy

Application

```
Application
│
├── Header
│
├── Navigation
│   ├── Sidebar (Desktop)
│   └── Bottom Navigation (Mobile)
│
├── Main Content
│
├── Right Sidebar (Desktop Only)
│
├── Dialog Layer
│
├── Toast Layer
│
└── Loading Layer
```



# 4. Layout Inventory

Every routed page must use one documented layout.

No page may create its own layout.

---

# Public Layout

## Purpose

Displays pages accessible without authentication.

## Used By

- Landing
- Sign In
- Sign Up
- Forgot Password
- Reset Password
- Email Verification
- Legal Pages

## Structure

```
Header

↓

Main Content

↓

Footer
```

## Requirements

- Header remains fixed.
- Main content scrolls.
- Footer appears only after page content.
- Maximum readable content width.
- No application sidebar.
- No bottom navigation.

## Responsive Behaviour

Desktop

- Full header
- Centered content
- Footer visible

Tablet

- Same structure

Mobile

- Simplified header
- Footer stacked vertically

## Acceptance Criteria

- All public pages share the same layout.
- Header position never changes.
- Footer remains consistent.

---

# Authenticated Layout

## Purpose

Displays every authenticated user page.

## Used By

- Dashboard
- Markets
- Portfolio
- Wallet
- Notifications
- Profile
- Settings

## Structure

Desktop

```
Header

↓

Sidebar + Main Content + Right Panel
```

Mobile

```
Header

↓

Main Content

↓

Bottom Navigation
```

## Requirements

- Header always fixed.
- Navigation always available.
- Main content is the only primary scrolling region.
- Dialog layer available globally.
- Toast layer available globally.

## Responsive Behaviour

Desktop

- Sidebar visible
- Right panel visible

Tablet

- Collapsible sidebar
- No right panel

Mobile

- Bottom navigation replaces sidebar

## Acceptance Criteria

- Navigation never disappears.
- Content adapts without changing hierarchy.

---

# Admin Layout

## Purpose

Displays administrative tools.

## Used By

- Admin Dashboard
- Market Management
- User Management
- Financial Review
- Withdrawal Review
- Audit Logs
- System Settings

## Structure

```
Header

↓

Admin Sidebar

↓

Workspace

↓

Inspector Panel (optional)
```

## Requirements

- Administrative navigation isolated from user navigation.
- Workspace optimized for tables and management screens.
- Supports large datasets.
- Supports persistent filters.

## Responsive Behaviour

Desktop

- Full admin sidebar
- Workspace
- Optional inspector

Tablet

- Collapsible sidebar

Mobile

- Full-screen workspace
- Navigation drawer

## Acceptance Criteria

- Every admin page shares this layout.
- No user pages use this layout.

---

# Centered Layout

## Purpose

Displays focused content.

## Used By

- Authentication
- Verification
- Success pages
- Error messages

## Structure

```
Centered Container
```

## Requirements

- Content vertically centered when possible.
- Maximum width enforced.
- No sidebar.
- No bottom navigation.

## Acceptance Criteria

- Every screen remains visually centered.

---

# Blank Layout

## Purpose

Displays standalone application states.

## Used By

- Fullscreen Loading
- Splash Screen
- Maintenance
- Fatal Error

## Structure

```
Single Container
```

## Requirements

- No navigation.
- No footer.
- No dialogs.

## Acceptance Criteria

- Layout contains only required content.

---

# Error Layout

## Purpose

Displays application errors.

## Used By

- 404
- 403
- 500

## Structure

```
Centered Illustration

↓

Title

↓

Description

↓

Primary Action
```

## Requirements

- Single focus.
- No unrelated navigation.

## Acceptance Criteria

- Error information immediately visible.

---

# Loading Layout

## Purpose

Displays loading experiences.

## Used By

- Initial application load
- Route transitions
- Full-page loading

## Structure

```
Loading Indicator

↓

Optional Branding
```

## Requirements

- No interaction.
- Full viewport coverage.

## Acceptance Criteria

- User immediately understands loading state.

---

# Maintenance Layout

## Purpose

Displays maintenance mode.

## Used By

- Planned maintenance
- Temporary shutdown

## Structure

```
Illustration

↓

Status Message

↓

Optional Countdown
```

## Requirements

- Full viewport.
- No navigation.
- No interactive application elements.

## Acceptance Criteria

- Users immediately understand the application is unavailable.

---

# 5. Navigation Structure

This section defines every primary navigation destination.

It defines location only.

It does not define behaviour.

---

# Public Navigation

- Landing
- Sign In
- Sign Up
- Forgot Password
- Reset Password
- Verify Email
- Privacy Policy
- Terms of Service

---

# Primary Authenticated Navigation

Desktop Sidebar

- Dashboard
- Markets
- Portfolio
- Wallet
- Notifications
- Profile
- Settings

Mobile Bottom Navigation

- Home
- Markets
- Portfolio
- Wallet
- Profile

---

# Secondary Navigation

Accessible from the Header.

- Search
- Notifications
- Wallet
- User Menu

---

# Administrator Navigation

- Dashboard
- Markets
- Categories
- Market Suggestions
- Users
- Wallet Operations
- Withdrawals
- Financial Activity
- Audit Logs
- Platform Settings

---

# Global Dialog Destinations

Available from every authenticated page.

- Search
- Notifications
- Wallet
- Deposit
- Withdraw
- Profile
- Settings

---

# Market Navigation

Accessible from Dashboard and Markets.

- Market Details
- Trade Confirmation
- Market Activity
- Market Statistics

---

# Portfolio Navigation

Accessible from Portfolio.

- Open Positions
- Closed Positions
- Position Details

---

# Community Navigation

- Market Suggestions
- Featured Markets
- Trending Markets
- Shared Markets

---

# Navigation Hierarchy

```
Application

├── Public
│   ├── Landing
│   ├── Authentication
│   └── Legal
│
├── Authenticated
│   ├── Dashboard
│   ├── Markets
│   ├── Portfolio
│   ├── Wallet
│   ├── Notifications
│   ├── Profile
│   └── Settings
│
└── Administration
    ├── Dashboard
    ├── Market Management
    ├── Users
    ├── Withdrawals
    ├── Financial Activity
    ├── Audit Logs
    └── Settings
``` 

# 6. Page Inventory

Every routed page must exist before feature implementation begins.

Each page defines only the visual structure.

Business logic belongs to individual feature specifications.

---

## Landing Page

### Purpose

Introduce Sheybi and encourage user registration.

### Parent Layout

Public Layout

### Primary Sections

- Hero Banner
- Featured Markets
- Trending Markets
- Why Sheybi
- Call To Action
- Footer

### Reusable Components

- Header
- Hero Banner
- Market Feed
- Market Card
- Section Header
- Primary Button
- Footer

### Dialogs Used

- Authentication Dialog

### Responsive Behaviour

Desktop

- Two-column hero section.
- Market feeds displayed in multiple columns.

Tablet

- Hero stacks vertically.
- Two-column market grid.

Mobile

- Single-column layout.
- Sticky bottom navigation hidden.
- Simplified hero content.

### Acceptance Criteria

- Hero is immediately visible.
- Featured markets appear below hero.
- Footer remains the last section.
- Layout adapts across all breakpoints.

---

## Dashboard

### Purpose

Display active prediction markets after authentication.

### Parent Layout

Authenticated Layout

### Primary Sections

- Welcome Banner
- Category Tabs
- Market Feed

### Reusable Components

- Header
- Sidebar
- Bottom Navigation
- Banner
- Category Tabs
- Market Feed
- Market Card

### Dialogs Used

- Search
- Wallet
- Notifications
- Profile

### Responsive Behaviour

Desktop

- Sidebar visible.
- Multi-column market feed.

Tablet

- Collapsible sidebar.
- Two-column market feed.

Mobile

- Bottom navigation replaces sidebar.
- Single-column market feed.

### Acceptance Criteria

- Category navigation remains visible.
- Market feed scrolls independently.
- Navigation never overlaps content.

---

## Market Details

### Purpose

Display one prediction market.

### Parent Layout

Authenticated Layout

### Primary Sections

- Market Header
- Market Statistics
- Price Chart
- Trade Panel
- Activity Feed

### Reusable Components

- Header
- Market Banner
- Statistics Cards
- Market Graph
- Trade Panel
- Activity Feed
- Section Header

### Dialogs Used

- Trade Confirmation

### Responsive Behaviour

Desktop

- Graph and trade panel displayed side by side.

Tablet

- Trade panel moves below graph.

Mobile

- Sections stack vertically.
- Trade panel becomes full width.

### Acceptance Criteria

- Market information appears above trading controls.
- Trade panel remains visible without hiding market data.
- Activity feed remains scrollable.

---

## Portfolio

### Purpose

Display user trading positions.

### Parent Layout

Authenticated Layout

### Primary Sections

- Portfolio Summary
- Open Positions
- Closed Positions
- Performance Statistics

### Reusable Components

- Portfolio Card
- Position Card
- Statistic Card
- Section Header

### Dialogs Used

None

### Responsive Behaviour

Desktop

- Summary cards displayed horizontally.

Tablet

- Two-column summary grid.

Mobile

- Single-column cards.

### Acceptance Criteria

- Summary always appears first.
- Position lists remain independently scrollable.
- Empty state appears when required.

---

## Profile

### Purpose

Display user account information.

### Parent Layout

Authenticated Layout

### Primary Sections

- Profile Header
- Account Information
- Verification Status
- Account Actions

### Reusable Components

- Avatar
- Profile Card
- Statistic Card
- Section Header

### Dialogs Used

- Edit Profile

### Responsive Behaviour

Desktop

- Information displayed in two columns.

Tablet

- Mixed grid.

Mobile

- Single-column layout.

### Acceptance Criteria

- Avatar remains visible.
- Account actions grouped together.
- Information hierarchy remains consistent.

---

## Notifications

### Purpose

Display user notifications.

### Parent Layout

Authenticated Layout

### Primary Sections

- Notification List

### Reusable Components

- Notification Item
- Empty State
- Loading State

### Dialogs Used

None

### Responsive Behaviour

Desktop

- Centered content container.

Tablet

- Full-width container.

Mobile

- Full-screen list.

### Acceptance Criteria

- Notification items remain vertically stacked.
- Empty state appears when list is empty.

---

## Settings

### Purpose

Display configurable application settings.

### Parent Layout

Authenticated Layout

### Primary Sections

- Appearance
- Security
- Preferences
- About

### Reusable Components

- Setting Card
- Section Header
- Toggle Item

### Dialogs Used

- Confirmation Dialog

### Responsive Behaviour

Desktop

- Two-column settings.

Tablet

- Mixed layout.

Mobile

- Single-column settings.

### Acceptance Criteria

- Sections remain visually separated.
- Settings grouped logically.

---

## Administration

### Purpose

Provide administrative interface.

### Parent Layout

Admin Layout

### Primary Sections

- Dashboard Summary
- Market Management
- Wallet Management
- User Management
- Suggestions
- Audit Overview

### Reusable Components

- Statistic Card
- Admin Table
- Section Header
- Search Bar

### Dialogs Used

- Create Market
- Edit Market
- Resolve Market
- Suspend User
- Withdrawal Review

### Responsive Behaviour

Desktop

- Sidebar permanently visible.
- Multi-panel workspace.

Tablet

- Collapsible sidebar.

Mobile

- Limited administration interface.

### Acceptance Criteria

- Navigation remains accessible.
- Tables remain readable.
- Administrative actions grouped by category.

---

## Error Page

### Purpose

Display unrecoverable application errors.

### Parent Layout

Error Layout

### Primary Sections

- Error Illustration
- Error Message
- Primary Action

### Reusable Components

- Empty State
- Primary Button

### Dialogs Used

None

### Responsive Behaviour

Same across all devices.

### Acceptance Criteria

- Error message centered.
- Primary action immediately visible.

---

## Loading Page

### Purpose

Display loading placeholders.

### Parent Layout

Loading Layout

### Primary Sections

- Skeleton Components

### Reusable Components

- Skeleton Card
- Skeleton Feed

### Dialogs Used

None

### Responsive Behaviour

Matches destination page layout.

### Acceptance Criteria

- Placeholder dimensions match final content.

---

## Empty Page

### Purpose

Display when a page has no content.

### Parent Layout

Context dependent.

### Primary Sections

- Illustration
- Message
- Primary Action

### Reusable Components

- Empty State
- Primary Button

### Dialogs Used

None

### Responsive Behaviour

Centered across all screen sizes.

### Acceptance Criteria

- Empty state occupies available content area.
- Action remains immediately accessible.

# 7. Section Inventory

A section is a reusable visual block that appears inside one or more pages.

A section is assembled from reusable parent components.

A section must never contain business logic.

---

## Hero Banner

### Purpose

Introduce the current screen or highlight important platform content.

### Parent Pages

- Landing
- Dashboard

### Children

- Section Header
- Banner Card
- Primary Button
- Secondary Button
- Illustration or Promotional Image

### Requirements

- Always appears first.
- Full content width.
- Maximum one primary action.
- Maximum one secondary action.
- Text remains vertically centered.
- Image never overlaps content.

### Responsive Behaviour

Desktop

- Two-column layout.

Tablet

- Image reduced.

Mobile

- Single-column stacked layout.

### Acceptance Criteria

- Hero always appears first.
- Primary action immediately visible.
- Image remains responsive.

---

## Featured Markets

### Purpose

Display curated prediction markets.

### Parent Pages

- Landing
- Dashboard

### Children

- Section Header
- Market Feed

### Requirements

- Appears before Trending Markets.
- Supports horizontal or vertical layouts.
- Section title always visible.

### Responsive Behaviour

Desktop

- Multi-column grid.

Tablet

- Two columns.

Mobile

- Single column.

### Acceptance Criteria

- Section header remains visible.
- Market cards align consistently.

---

## Trending Markets

### Purpose

Display currently popular markets.

### Parent Pages

- Landing
- Dashboard

### Children

- Section Header
- Market Feed

### Requirements

- Appears below Featured Markets.
- Uses identical spacing rules.
- Supports unlimited market cards.

### Responsive Behaviour

Matches Featured Markets.

### Acceptance Criteria

- Visual structure identical to Featured Markets.

---

## Category Navigation

### Purpose

Allow navigation between market categories.

### Parent Pages

- Dashboard
- Markets

### Children

- Tabs Component

### Requirements

- Always positioned directly above Market Feed.
- Full width.
- Horizontal scrolling permitted when required.

### Responsive Behaviour

Desktop

- Full-width tabs.

Tablet

- Scrollable tabs.

Mobile

- Horizontally scrollable tabs.

### Acceptance Criteria

- Tabs remain accessible.
- Active category clearly identifiable.

---

## Market Feed

### Purpose

Display a collection of Market Cards.

### Parent Pages

- Landing
- Dashboard
- Markets

### Children

- Market Card

### Requirements

- Supports unlimited cards.
- Equal spacing.
- Consistent alignment.
- No nested scrolling.

### Responsive Behaviour

Desktop

- Multi-column grid.

Tablet

- Two-column grid.

Mobile

- Single-column list.

### Acceptance Criteria

- Cards remain evenly spaced.
- Feed fills available width.

---

## Portfolio Summary

### Purpose

Display portfolio overview.

### Parent Pages

- Portfolio

### Children

- Portfolio Card
- Statistic Card

### Requirements

- Appears before positions.
- Summary cards grouped together.

### Responsive Behaviour

Desktop

- Horizontal row.

Tablet

- Two-column grid.

Mobile

- Vertical stack.

### Acceptance Criteria

- Summary visible before positions.

---

## Wallet Summary

### Purpose

Display wallet overview.

### Parent Pages

- Wallet

### Children

- Wallet Card
- Statistic Card

### Requirements

- Appears at top.
- Balance emphasized.
- Secondary metrics grouped below.

### Responsive Behaviour

Desktop

- Two-column layout.

Tablet

- Two-column layout.

Mobile

- Single-column layout.

### Acceptance Criteria

- Wallet summary immediately visible.

---

## Open Positions

### Purpose

Display active positions.

### Parent Pages

- Portfolio

### Children

- Position Card

### Requirements

- Appears before Closed Positions.
- Unlimited cards.
- Vertical list.

### Responsive Behaviour

Consistent across all devices.

### Acceptance Criteria

- Cards align correctly.
- Empty state supported.

---

## Closed Positions

### Purpose

Display completed positions.

### Parent Pages

- Portfolio

### Children

- Position Card

### Requirements

- Appears below Open Positions.
- Unlimited cards.

### Responsive Behaviour

Same as Open Positions.

### Acceptance Criteria

- Visual consistency maintained.

---

## Market Statistics

### Purpose

Display market metrics.

### Parent Pages

- Market Details

### Children

- Statistic Card

### Requirements

- Appears above graph.
- Equal card sizes.

### Responsive Behaviour

Desktop

- Horizontal row.

Tablet

- Grid.

Mobile

- Vertical stack.

### Acceptance Criteria

- Cards remain aligned.

---

## Activity Feed

### Purpose

Display chronological activity.

### Parent Pages

- Market Details

### Children

- Activity Item

### Requirements

- Vertical list.
- Independent scrolling when required.

### Responsive Behaviour

Desktop

- Side panel.

Tablet

- Full width.

Mobile

- Full width below Trade Panel.

### Acceptance Criteria

- Feed remains readable.

---

## Search Results

### Purpose

Display search matches.

### Parent Pages

- Search Dialog

### Children

- Search Result Card

### Requirements

- Vertical list.
- Supports long result sets.

### Responsive Behaviour

Identical across devices.

### Acceptance Criteria

- Results remain aligned.

---

## Notification Feed

### Purpose

Display notification history.

### Parent Pages

- Notifications

### Children

- Notification Item

### Requirements

- Vertical list.
- Equal spacing.

### Responsive Behaviour

Same across devices.

### Acceptance Criteria

- Items remain readable.

---

## Administration Dashboard Summary

### Purpose

Display administrative overview.

### Parent Pages

- Administration

### Children

- Statistic Card
- Section Header

### Requirements

- Appears first.
- Supports multiple summary cards.

### Responsive Behaviour

Desktop

- Multi-column grid.

Tablet

- Two-column grid.

Mobile

- Single-column stack.

### Acceptance Criteria

- Summary always appears above management sections.

---

## Administration Tables

### Purpose

Display administrative records.

### Parent Pages

- Administration

### Children

- Data Table
- Pagination
- Filters

### Requirements

- Full content width.
- Sticky table header.
- Horizontal scrolling supported.

### Responsive Behaviour

Desktop

- Full table.

Tablet

- Scrollable table.

Mobile

- Card-based representation where required.

### Acceptance Criteria

- Records remain readable at every breakpoint.

---

## Footer

### Purpose

Display application footer.

### Parent Pages

- Landing

### Children

- Logo
- Navigation Links
- Social Links
- Copyright

### Requirements

- Appears last.
- Full width.
- Consistent spacing.

### Responsive Behaviour

Desktop

- Multi-column layout.

Tablet

- Two columns.

Mobile

- Single-column stack.

### Acceptance Criteria

- Footer always remains the final section.
- Content remains centered and aligned.


# 8. Child Component Inventory

Child components are the smallest reusable visual building blocks.

They may be composed into parent components.

Child components must never contain other parent components.

They must remain generic and reusable across the application.

---

## Primary Button

### Purpose

Execute the primary action within a component or page.

### Parent Components

- Hero Banner
- Market Card
- Trade Panel
- Wallet Card
- Portfolio Card
- Dialog Footer

### Requirements

- Single line label.
- Leading icon optional.
- Fixed minimum height.
- Text centered.
- Width determined by parent.
- Disabled state supported.
- Loading state supported.

### Responsive Behaviour

Desktop

- Auto width.

Tablet

- Auto width.

Mobile

- Full width when inside dialogs or forms.

### Acceptance Criteria

- Button label remains centered.
- Loading state preserves layout.
- Disabled state remains visually distinct.

---

## Secondary Button

### Purpose

Execute secondary actions.

### Parent Components

- Hero Banner
- Dialog Footer
- Market Card
- Profile Card

### Requirements

- Same height as Primary Button.
- Supports icon.
- Supports loading.
- Supports disabled state.

### Responsive Behaviour

Matches Primary Button.

### Acceptance Criteria

- Consistent dimensions with Primary Button.

---

## Icon Button

### Purpose

Display icon-only actions.

### Parent Components

- Header
- Notification Item
- Search
- Profile Menu
- Wallet

### Requirements

- Square aspect ratio.
- Equal internal padding.
- Icon centered.
- Tooltip supported.

### Responsive Behaviour

Same across all devices.

### Acceptance Criteria

- Icon always centered.
- Touch target remains accessible.

---

## Text Button

### Purpose

Display lightweight actions.

### Parent Components

- Empty State
- Footer
- Dialog Footer

### Requirements

- No fixed width.
- Text remains on one line.
- Optional leading icon.

### Responsive Behaviour

Same across all devices.

### Acceptance Criteria

- Text never wraps.

---

## Avatar

### Purpose

Represent a user.

### Parent Components

- Header
- Profile Card
- Notification Item
- Activity Item

### Requirements

- Circular.
- Supports image.
- Supports initials fallback.
- Supports placeholder.

### Responsive Behaviour

Consistent across all devices.

### Acceptance Criteria

- Always renders correctly without an image.

---

## Badge

### Purpose

Display short contextual labels.

### Parent Components

- Market Card
- Wallet Card
- Portfolio Card
- Notification Item

### Requirements

- Single line.
- Rounded shape.
- Content centered.
- Supports icon.

### Responsive Behaviour

Consistent across all devices.

### Acceptance Criteria

- Badge height remains constant.

---

## Probability Chip

### Purpose

Display probability values.

### Parent Components

- Market Card
- Trade Panel
- Market Header

### Requirements

- Compact.
- Single line.
- Center aligned.
- Fixed height.

### Responsive Behaviour

Same across all devices.

### Acceptance Criteria

- Value remains readable.

---

## Status Chip

### Purpose

Display current status.

### Parent Components

- Market Card
- Wallet Card
- Portfolio Card

### Requirements

- Fixed height.
- Single line.
- Compact width.

### Responsive Behaviour

Consistent across all devices.

### Acceptance Criteria

- Text never wraps.

---

## Countdown Timer

### Purpose

Display remaining time.

### Parent Components

- Market Card
- Market Header

### Requirements

- Fixed width.
- Monospaced appearance.
- Single line.

### Responsive Behaviour

Consistent across all devices.

### Acceptance Criteria

- Layout remains stable as values change.

---

## Search Input

### Purpose

Capture search queries.

### Parent Components

- Search Dialog
- Header

### Requirements

- Leading search icon.
- Clear button.
- Placeholder supported.
- Full width.

### Responsive Behaviour

Desktop

- Fixed maximum width.

Tablet

- Full width.

Mobile

- Full width.

### Acceptance Criteria

- Placeholder remains visible.
- Input scales correctly.

---

## Text Label

### Purpose

Display descriptive labels.

### Parent Components

Used throughout the application.

### Requirements

- Single responsibility.
- Never truncated unless specified by parent.

### Responsive Behaviour

Consistent across all devices.

### Acceptance Criteria

- Readable at every breakpoint.

---

## Tag

### Purpose

Display categories or metadata.

### Parent Components

- Market Card
- Search Result Card

### Requirements

- Compact.
- Single line.
- Rounded.

### Responsive Behaviour

Same across all devices.

### Acceptance Criteria

- Text remains centered.

---

## Divider

### Purpose

Separate visual groups.

### Parent Components

Used throughout the application.

### Requirements

- Full available width.
- Equal spacing above and below.

### Responsive Behaviour

Consistent across all devices.

### Acceptance Criteria

- Divider aligns with parent content.

---

## Tooltip Trigger

### Purpose

Provide contextual help.

### Parent Components

- Header
- Statistic Card
- Wallet Card

### Requirements

- Icon or text trigger.
- Does not alter layout.

### Responsive Behaviour

Desktop

- Hover interaction.

Tablet

- Tap interaction.

Mobile

- Tap interaction.

### Acceptance Criteria

- Trigger remains aligned.

---

## Progress Indicator

### Purpose

Display completion or progress.

### Parent Components

- Wallet Card
- Portfolio Card
- Market Statistics

### Requirements

- Horizontal.
- Fixed height.
- Full available width.

### Responsive Behaviour

Consistent across all devices.

### Acceptance Criteria

- Progress fills smoothly.

---

## Statistic Value

### Purpose

Display a primary metric.

### Parent Components

- Statistic Card
- Wallet Card
- Portfolio Card

### Requirements

- Largest text within parent.
- Single line.
- Center or left aligned according to parent.

### Responsive Behaviour

Consistent across all devices.

### Acceptance Criteria

- Value always remains readable.

---

## Statistic Label

### Purpose

Describe a statistic.

### Parent Components

- Statistic Card

### Requirements

- Positioned below or above value.
- Single line.

### Responsive Behaviour

Consistent across all devices.

### Acceptance Criteria

- Label remains aligned with value.

---

## Empty Illustration

### Purpose

Represent an empty state.

### Parent Components

- Empty State

### Requirements

- Center aligned.
- Scales proportionally.

### Responsive Behaviour

Desktop

- Large illustration.

Tablet

- Medium illustration.

Mobile

- Compact illustration.

### Acceptance Criteria

- Never exceeds parent bounds.

---

## Skeleton Block

### Purpose

Represent loading placeholders.

### Parent Components

- Loading State
- Market Card Skeleton
- Portfolio Skeleton

### Requirements

- Matches final component dimensions.
- Fixed layout.
- Supports repeated patterns.

### Responsive Behaviour

Matches final component.

### Acceptance Criteria

- Layout identical to final component footprint.

# 10. Shared UI Regions

Shared UI regions are persistent visual areas reused throughout the application.

They define application structure.

They do not define behaviour.

---

# Header

## Purpose

Provide global navigation and access to common actions.

## Children

- Sheybi Logo
- Search Trigger
- Notifications Trigger
- Wallet Trigger
- Profile Trigger

## Requirements

- Fixed to the top of the viewport.
- Full application width.
- Equal horizontal padding.
- Single horizontal row.
- Never scrolls with page content.

## Responsive Behaviour

### Desktop

- Logo aligned left.
- Actions aligned right.

### Tablet

- Reduced spacing.
- Same structure.

### Mobile

- Logo remains left.
- Actions compressed.
- No sidebar trigger.

## Acceptance Criteria

- Header remains visible during scrolling.
- Layout never changes between pages.

---

# Desktop Sidebar

## Purpose

Provide primary application navigation.

## Children

- Navigation Items
- Active Indicator
- Administration Section (administrator only)

## Requirements

- Fixed height.
- Fixed width.
- Independent scrolling.
- Never overlaps Header.

## Responsive Behaviour

### Desktop

Visible.

### Tablet

Collapsible.

### Mobile

Hidden.

## Acceptance Criteria

- Sidebar never scrolls with content.
- Active destination is always identifiable.

---

# Bottom Navigation

## Purpose

Provide primary navigation on mobile devices.

## Children

- Home
- Markets
- Portfolio
- Wallet
- Profile

## Requirements

- Fixed to bottom.
- Equal spacing.
- Five navigation items.
- Safe-area aware.

## Responsive Behaviour

### Desktop

Hidden.

### Tablet

Hidden.

### Mobile

Visible.

## Acceptance Criteria

- Always visible.
- Never overlaps content.
- Navigation items evenly spaced.

---

# Main Content Container

## Purpose

Contain routed page content.

## Children

- Routed Pages
- Sections

## Requirements

- Occupies remaining viewport space.
- Independent vertical scrolling.
- Consistent horizontal padding.
- Maximum readable width.

## Responsive Behaviour

### Desktop

Centered.

### Tablet

Centered.

### Mobile

Full width.

## Acceptance Criteria

- Only this region scrolls.
- Header and navigation remain fixed.

---

# Floating Action Area

## Purpose

Contain floating actions when required.

## Children

- Floating Action Button

## Requirements

- Bottom-right alignment.
- Never overlap Bottom Navigation.
- Hidden when unused.

## Responsive Behaviour

### Desktop

Visible when required.

### Tablet

Visible when required.

### Mobile

Position adjusted above Bottom Navigation.

## Acceptance Criteria

- Floating action never blocks page content.

---

# Footer

## Purpose

Display application footer.

## Children

- Logo
- Links
- Social Icons
- Copyright

## Requirements

- Appears only on public pages.
- Full width.
- Last visible region.

## Responsive Behaviour

### Desktop

Multi-column.

### Tablet

Two-column.

### Mobile

Single-column.

## Acceptance Criteria

- Footer never appears inside authenticated layouts.

---

# Dialog Container

## Purpose

Display dialogs and sheets above application content.

## Children

- Wallet Dialog
- Deposit Dialog
- Withdrawal Dialog
- Search Dialog
- Notifications Dialog
- Profile Dialog
- Trade Confirmation Dialog
- Market Suggestion Dialog

## Requirements

- Highest visual layer.
- Background dimming.
- One active dialog at a time.

## Responsive Behaviour

### Desktop

Centered dialog.

### Tablet

Centered dialog.

### Mobile

Bottom sheet.

## Acceptance Criteria

- Dialog never exceeds viewport.
- Background interaction disabled while open.

---

# Toast Region

## Purpose

Display temporary system messages.

## Children

- Toast Item

## Requirements

- Fixed position.
- Stacked vertically.
- Does not affect layout.

## Responsive Behaviour

### Desktop

Top-right.

### Tablet

Top-right.

### Mobile

Top-center.

## Acceptance Criteria

- Toasts never overlap Header.
- Multiple toasts stack correctly.

---

# Loading Overlay

## Purpose

Display application-wide loading placeholders.

## Children

- Skeleton Layouts

## Requirements

- Matches destination layout.
- Preserves component dimensions.
- Prevents layout shift.

## Responsive Behaviour

Matches destination layout.

## Acceptance Criteria

- Every global loading state uses skeletons.
- Full-page spinners are not used.


# 10. Shared UI Regions

Shared UI regions are persistent visual areas reused throughout the application.

They define application structure.

They do not define behaviour.

---

# Header

## Purpose

Provide global navigation and access to common actions.

## Children

- Sheybi Logo
- Search Trigger
- Notifications Trigger
- Wallet Trigger
- Profile Trigger

## Requirements

- Fixed to the top of the viewport.
- Full application width.
- Equal horizontal padding.
- Single horizontal row.
- Never scrolls with page content.

## Responsive Behaviour

### Desktop

- Logo aligned left.
- Actions aligned right.

### Tablet

- Reduced spacing.
- Same structure.

### Mobile

- Logo remains left.
- Actions compressed.
- No sidebar trigger.

## Acceptance Criteria

- Header remains visible during scrolling.
- Layout never changes between pages.

---

# Desktop Sidebar

## Purpose

Provide primary application navigation.

## Children

- Navigation Items
- Active Indicator
- Administration Section (administrator only)

## Requirements

- Fixed height.
- Fixed width.
- Independent scrolling.
- Never overlaps Header.

## Responsive Behaviour

### Desktop

Visible.

### Tablet

Collapsible.

### Mobile

Hidden.

## Acceptance Criteria

- Sidebar never scrolls with content.
- Active destination is always identifiable.

---

# Bottom Navigation

## Purpose

Provide primary navigation on mobile devices.

## Children

- Home
- Markets
- Portfolio
- Wallet
- Profile

## Requirements

- Fixed to bottom.
- Equal spacing.
- Five navigation items.
- Safe-area aware.

## Responsive Behaviour

### Desktop

Hidden.

### Tablet

Hidden.

### Mobile

Visible.

## Acceptance Criteria

- Always visible.
- Never overlaps content.
- Navigation items evenly spaced.

---

# Main Content Container

## Purpose

Contain routed page content.

## Children

- Routed Pages
- Sections

## Requirements

- Occupies remaining viewport space.
- Independent vertical scrolling.
- Consistent horizontal padding.
- Maximum readable width.

## Responsive Behaviour

### Desktop

Centered.

### Tablet

Centered.

### Mobile

Full width.

## Acceptance Criteria

- Only this region scrolls.
- Header and navigation remain fixed.

---

# Floating Action Area

## Purpose

Contain floating actions when required.

## Children

- Floating Action Button

## Requirements

- Bottom-right alignment.
- Never overlap Bottom Navigation.
- Hidden when unused.

## Responsive Behaviour

### Desktop

Visible when required.

### Tablet

Visible when required.

### Mobile

Position adjusted above Bottom Navigation.

## Acceptance Criteria

- Floating action never blocks page content.

---

# Footer

## Purpose

Display application footer.

## Children

- Logo
- Links
- Social Icons
- Copyright

## Requirements

- Appears only on public pages.
- Full width.
- Last visible region.

## Responsive Behaviour

### Desktop

Multi-column.

### Tablet

Two-column.

### Mobile

Single-column.

## Acceptance Criteria

- Footer never appears inside authenticated layouts.

---

# Dialog Container

## Purpose

Display dialogs and sheets above application content.

## Children

- Wallet Dialog
- Deposit Dialog
- Withdrawal Dialog
- Search Dialog
- Notifications Dialog
- Profile Dialog
- Trade Confirmation Dialog
- Market Suggestion Dialog

## Requirements

- Highest visual layer.
- Background dimming.
- One active dialog at a time.

## Responsive Behaviour

### Desktop

Centered dialog.

### Tablet

Centered dialog.

### Mobile

Bottom sheet.

## Acceptance Criteria

- Dialog never exceeds viewport.
- Background interaction disabled while open.

---

# Toast Region

## Purpose

Display temporary system messages.

## Children

- Toast Item

## Requirements

- Fixed position.
- Stacked vertically.
- Does not affect layout.

## Responsive Behaviour

### Desktop

Top-right.

### Tablet

Top-right.

### Mobile

Top-center.

## Acceptance Criteria

- Toasts never overlap Header.
- Multiple toasts stack correctly.

---

# Loading Overlay

## Purpose

Display application-wide loading placeholders.

## Children

- Skeleton Layouts

## Requirements

- Matches destination layout.
- Preserves component dimensions.
- Prevents layout shift.

## Responsive Behaviour

Matches destination layout.

## Acceptance Criteria

- Every global loading state uses skeletons.
- Full-page spinners are not used.

# 11. Dialog Inventory

Dialogs are temporary interface surfaces used to complete focused tasks without navigating away from the current page.

Desktop and tablet use centered dialogs.

Mobile uses bottom sheets for every dialog unless explicitly stated otherwise.

Dialogs do not contain business logic.

---

# Search Dialog

## Purpose

Allow users to search markets from anywhere in the application.

## Trigger

Search button in the Header.

## Children

- Search Input
- Search Filters
- Recent Searches
- Search Results
- Empty State

## Responsive Behaviour

### Desktop

Centered dialog.

### Tablet

Centered dialog.

### Mobile

Full-height bottom sheet.

## Closing Behaviour

- Close button.
- Escape key.
- Outside click (Desktop).
- Swipe down (Mobile).

## Acceptance Criteria

- Search input receives focus immediately.
- Dialog occupies appropriate screen space.
- Search results scroll independently.

---

# Wallet Dialog

## Purpose

Display wallet overview and wallet actions.

## Trigger

Wallet button in the Header or Bottom Navigation.

## Children

- Wallet Summary Card
- Balance Cards
- Deposit Button
- Withdraw Button
- Transaction Preview
- Transaction History Preview

## Responsive Behaviour

### Desktop

Centered dialog.

### Tablet

Centered dialog.

### Mobile

Bottom sheet.

## Closing Behaviour

Standard dialog behaviour.

## Acceptance Criteria

- Wallet summary is immediately visible.
- Primary actions remain above the fold.

---

# Deposit Dialog

## Purpose

Display the deposit interface.

## Trigger

Deposit button inside Wallet Dialog.

## Children

- Section Header
- Deposit Information
- Deposit Method Card
- Primary Action

## Responsive Behaviour

Desktop

Centered dialog.

Tablet

Centered dialog.

Mobile

Bottom sheet.

## Closing Behaviour

Standard dialog behaviour.

## Acceptance Criteria

- Primary action always visible.
- Content fits without horizontal scrolling.

---

# Withdrawal Dialog

## Purpose

Display the withdrawal interface.

## Trigger

Withdraw button inside Wallet Dialog.

## Children

- Section Header
- Withdrawal Summary
- Withdrawal Form
- Primary Action

## Responsive Behaviour

Desktop

Centered dialog.

Tablet

Centered dialog.

Mobile

Bottom sheet.

## Closing Behaviour

Standard dialog behaviour.

## Acceptance Criteria

- Form remains fully visible.
- Primary action remains accessible.

---

# Trade Confirmation Dialog

## Purpose

Allow users to review a trade before submission.

## Trigger

Trade action inside Trade Panel.

## Children

- Market Summary
- Trade Summary
- Fee Summary
- Position Summary
- Primary Button
- Secondary Button

## Responsive Behaviour

Desktop

Centered dialog.

Tablet

Centered dialog.

Mobile

Bottom sheet.

## Closing Behaviour

Standard dialog behaviour.

## Acceptance Criteria

- Trade summary appears above action buttons.
- Buttons remain fixed at the bottom of the dialog.

---

# Notifications Dialog

## Purpose

Display recent notifications.

## Trigger

Notification icon in the Header.

## Children

- Section Header
- Notification Feed
- Empty State

## Responsive Behaviour

Desktop

Dropdown-sized dialog anchored to the Header.

Tablet

Centered dialog.

Mobile

Bottom sheet.

## Closing Behaviour

Standard dialog behaviour.

## Acceptance Criteria

- Notification list scrolls independently.
- Header remains fixed.

---

# Profile Dialog

## Purpose

Display profile shortcuts and account options.

## Trigger

Profile Avatar.

## Children

- User Summary
- Navigation List
- Settings Shortcut
- Logout Action

## Responsive Behaviour

Desktop

Dropdown menu.

Tablet

Centered dialog.

Mobile

Bottom sheet.

## Closing Behaviour

Standard dialog behaviour.

## Acceptance Criteria

- All actions remain visible without scrolling.

---

# Settings Dialog

## Purpose

Display application settings.

## Trigger

Settings action from Profile Dialog.

## Children

- Settings Navigation
- Preference Groups
- Theme Controls
- Account Controls

## Responsive Behaviour

Desktop

Centered dialog.

Tablet

Centered dialog.

Mobile

Full-height bottom sheet.

## Closing Behaviour

Standard dialog behaviour.

## Acceptance Criteria

- Settings grouped into logical sections.
- Independent scrolling supported.

---

# Market Suggestion Dialog

## Purpose

Allow users to submit new market ideas.

## Trigger

Suggestion button.

## Children

- Section Header
- Suggestion Form
- Category Selector
- Text Area
- Primary Action

## Responsive Behaviour

Desktop

Centered dialog.

Tablet

Centered dialog.

Mobile

Full-height bottom sheet.

## Closing Behaviour

Standard dialog behaviour.

## Acceptance Criteria

- Form fits within viewport.
- Submission action remains visible.

---

# Share Dialog

## Purpose

Display sharing options for markets and positions.

## Trigger

Share button.

## Children

- Preview Card
- Share Options
- Copy Link Action

## Responsive Behaviour

Desktop

Centered dialog.

Tablet

Centered dialog.

Mobile

Bottom sheet.

## Closing Behaviour

Standard dialog behaviour.

## Acceptance Criteria

- Preview visible before actions.
- Share options remain evenly spaced.

---

# Filter Dialog

## Purpose

Display market filtering options.

## Trigger

Filter button within Market Feed.

## Children

- Filter Groups
- Category Selector
- Status Selector
- Sort Selector
- Apply Button
- Reset Button

## Responsive Behaviour

Desktop

Side dialog.

Tablet

Centered dialog.

Mobile

Bottom sheet.

## Closing Behaviour

Standard dialog behaviour.

## Acceptance Criteria

- Filter groups remain separated.
- Apply and Reset actions remain fixed at the bottom.

---

# Administration Dialogs

## Purpose

Provide administrator-only actions.

## Dialogs

- Create Market
- Edit Market
- Resolve Market
- Suspend User
- Approve Withdrawal
- Reject Withdrawal
- Review Suggestion

## Responsive Behaviour

Desktop

Centered dialogs.

Tablet

Centered dialogs.

Mobile

Full-height sheets.

## Closing Behaviour

Standard dialog behaviour.

## Acceptance Criteria

- Every administrative task opens in its own dialog.
- Only one administrator dialog may be active at a time.
```

# 12. Responsive Rules

The application must use a mobile-first responsive layout.

Responsive behaviour is controlled exclusively through Tailwind CSS utility classes.

No separate CSS files may be created for responsive layouts.

Every page, layout, section, and component must follow these rules.

---

# Desktop

Desktop is the primary productivity layout.

It maximizes visible information while minimizing navigation changes.

## Layout

- Header remains fixed.
- Desktop Sidebar remains visible.
- Bottom Navigation is hidden.
- Main Content is centered.
- Multiple columns are preferred where appropriate.
- Dialogs open as centered modal windows.

## Navigation

Visible

- Header
- Desktop Sidebar

Hidden

- Bottom Navigation

## Content

- Multiple sections may appear side by side.
- Cards may appear in grids.
- Statistics may be displayed horizontally.
- Supporting panels may remain visible.

## Scrolling

- Header never scrolls.
- Sidebar scrolls independently if required.
- Main Content Area scrolls independently.
- Dialog content scrolls independently.

## Dialog Behaviour

- Centered.
- Fixed maximum width.
- Fixed maximum height.
- Background remains dimmed.

## Acceptance Criteria

- Primary navigation remains visible.
- Content does not exceed maximum readable width.
- No horizontal scrolling occurs.
- Dialogs remain fully visible.

---

# Tablet

Tablet bridges desktop and mobile layouts.

It prioritizes readable content over density.

## Layout

- Header remains fixed.
- Sidebar may collapse.
- Bottom Navigation remains hidden.
- Main Content expands to available width.
- Grid layouts reduce column count.

## Navigation

Visible

- Header

Optional

- Collapsible Sidebar

Hidden

- Bottom Navigation

## Content

- Two-column layouts become single or two-column depending on available width.
- Supporting panels move below primary content when necessary.

## Scrolling

- Same scrolling behaviour as Desktop.

## Dialog Behaviour

- Centered.
- Slightly larger than Mobile.
- Maximum width constrained.

## Acceptance Criteria

- Layout remains readable.
- Components never overlap.
- Navigation remains accessible.

---

# Mobile

Mobile prioritizes speed, readability, and thumb reachability.

Every screen must remain usable with one-handed interaction.

## Layout

- Header remains fixed.
- Desktop Sidebar is hidden.
- Bottom Navigation is always visible.
- Content occupies full available width.
- Sections stack vertically.
- Cards span available width.

## Navigation

Visible

- Header
- Bottom Navigation

Hidden

- Desktop Sidebar

## Content

- Single-column layout.
- No side panels.
- Supporting information moves below primary content.
- Lists scroll vertically.

## Scrolling

- Header remains fixed.
- Bottom Navigation remains fixed.
- Main Content Area scrolls.
- Dialog content scrolls independently.

## Dialog Behaviour

- Render as bottom sheets.
- Expand vertically as needed.
- Never exceed viewport height.
- Support swipe-to-close.
- Primary actions remain visible whenever possible.

## Acceptance Criteria

- Bottom Navigation never overlaps content.
- Content never requires horizontal scrolling.
- Dialogs remain fully usable with one hand.

---

# Component Adaptation Rules

Every reusable component must define responsive behaviour.

## Market Feed

Desktop

- Three to four columns.

Tablet

- Two columns.

Mobile

- One column.

---

## Market Card

Desktop

- Fixed width.

Tablet


# 13. Component Relationships

This section defines the complete visual hierarchy of the Sheybi interface.

It defines how layouts, pages, sections, parent components, and child components compose the application.

It does not define behaviour.

---

# Application Hierarchy

```
Application

│

├── Public Layout
│
│   ├── Landing Page
│   │
│   ├── Hero Banner
│   ├── Featured Markets
│   ├── Trending Markets
│   ├── Category Navigation
│   ├── Market Feed
│   └── Footer
│
└── Authenticated Layout
    │
    ├── Header
    ├── Desktop Sidebar
    ├── Bottom Navigation
    └── Main Content Area
```

---

# Authenticated Layout Hierarchy

```
Authenticated Layout

│

├── Header
│   ├── Logo
│   ├── Search Trigger
│   ├── Wallet Trigger
│   ├── Notification Trigger
│   └── Profile Trigger
│
├── Desktop Sidebar
│   ├── Dashboard
│   ├── Markets
│   ├── Portfolio
│   ├── Wallet
│   ├── Notifications
│   ├── Profile
│   ├── Settings
│   └── Admin
│
├── Main Content Area
│
└── Bottom Navigation (Mobile)
```

---

# Dashboard Hierarchy

```
Dashboard

│

├── Hero Banner
│
├── Wallet Summary
│
├── Featured Markets
│
├── Category Tabs
│
├── Market Feed
│   │
│   └── Market Card
│       ├── Thumbnail
│       ├── Status Chip
│       ├── Category Chip
│       ├── Title
│       ├── Description
│       ├── Probability Chip
│       ├── Countdown Timer
│       ├── Statistics Row
│       └── Trade Button
│
├── Trending Markets
│
└── Activity Feed
```

---

# Market Details Hierarchy

```
Market Details

│

├── Market Banner
│
├── Market Information
│
├── Market Statistics
│
├── Probability Chart
│
├── Activity Feed
│
├── Trade Panel
│   ├── Option Selector
│   ├── Amount Input
│   ├── Trade Preview
│   └── Trade Button
│
└── Share Actions
```

---

# Portfolio Hierarchy

```
Portfolio

│

├── Portfolio Summary
│
├── Performance Statistics
│
├── Open Positions
│   └── Position Card
│
├── Closed Positions
│   └── Position Card
│
└── Profit / Loss History
```

---

# Wallet Hierarchy

```
Wallet

│

├── Wallet Summary
│
├── Balance Cards
│
├── Deposit History
│
├── Withdrawal History
│
└── Transaction History
```

---

# Notification Hierarchy

```
Notifications

│

└── Notification Feed

# 14. Component Checklist

This checklist contains every reusable visual component required by the application.

Each component appears exactly once.

Future specification files must reference these components instead of creating new ones.

---

# Layouts

- [ ] Public Layout
- [ ] Authenticated Layout
- [ ] Admin Layout
- [ ] Centered Layout
- [ ] Error Layout
- [ ] Loading Layout
- [ ] Blank Layout

---

# Shared UI Regions

- [ ] Header
- [ ] Desktop Sidebar
- [ ] Bottom Navigation
- [ ] Main Content Container
- [ ] Floating Action Area
- [ ] Footer
- [ ] Dialog Container
- [ ] Toast Region
- [ ] Loading Overlay

---

# Sections

- [ ] Hero Banner
- [ ] Featured Markets
- [ ] Trending Markets
- [ ] Category Tabs
- [ ] Market Feed
- [ ] Wallet Summary
- [ ] Portfolio Summary
- [ ] Statistics Panel
- [ ] Activity Feed
- [ ] Search Results
- [ ] Administration Summary

---

# Parent Components

- [ ] Banner
- [ ] Market Card
- [ ] Market Feed
- [ ] Wallet Card
- [ ] Portfolio Card
- [ ] Statistic Card
- [ ] Search Result Card
- [ ] Trade Panel
- [ ] Position Card
- [ ] Section Header
- [ ] Empty State
- [ ] Skeleton State

---

# Child Components

- [ ] Primary Button
- [ ] Secondary Button
- [ ] Icon Button
- [ ] Avatar
- [ ] Badge
- [ ] Status Chip
- [ ] Category Chip
- [ ] Probability Chip
- [ ] Countdown Timer
- [ ] Search Input
- [ ] Label
- [ ] Tag
- [ ] Divider
- [ ] Tooltip Trigger
- [ ] Statistic Value
- [ ] Statistic Label
- [ ] Thumbnail
- [ ] Trade Preview
- [ ] Option Selector

---

# Dialogs

- [ ] Search Dialog
- [ ] Wallet Dialog
- [ ] Deposit Dialog
- [ ] Withdrawal Dialog
- [ ] Trade Confirmation Dialog
- [ ] Profile Dialog
- [ ] Settings Dialog
- [ ] Market Suggestion Dialog
- [ ] Share Dialog
- [ ] Filter Dialog
- [ ] Create Market Dialog
- [ ] Edit Market Dialog
- [ ] Resolve Market Dialog
- [ ] Suspend User Dialog
- [ ] Approve Withdrawal Dialog
- [ ] Reject Withdrawal Dialog
- [ ] Review Suggestion Dialog

---

# Routed Pages

- [ ] Landing
- [ ] Dashboard
- [ ] Market Details
- [ ] Portfolio
- [ ] Profile
- [ ] Administration
- [ ] Error
- [ ] Loading

---

# Toasts

- [ ] Success Toast
- [ ] Error Toast
- [ ] Warning Toast
- [ ] Information Toast

---

# Global Rules

- Every reusable component must appear exactly once in this checklist.
- Every future specification file must reference components from this checklist.
- New reusable components must be added to this checklist before implementation.
- Duplicate reusable components are prohibited.

# 15. Cross-Document Responsibilities

This document defines the visual structure of the Sheybi application.

It owns the application's visual blueprint and component hierarchy.

Every specification document must reference this document instead of redefining layouts, pages, or reusable components.

---

# This Document Owns

- Application Shell
- Layout Inventory
- Responsive Layouts
- Navigation Structure
- Routed Pages
- Shared UI Regions
- Section Inventory
- Parent Components
- Child Components
- Component Relationships
- Dialog Inventory
- Component Checklist

No other document may redefine these subjects.

---

# Business Behaviour

Business behaviour belongs exclusively to:

- `prediction-engine.md`

This includes:

- Market pricing
- Trading rules
- Settlement rules
- Fee calculations
- Position valuation
- Probability updates
- Market resolution

This document must never describe business behaviour.

---

# User Interactions

User interaction behaviour belongs exclusively to:

- `user-flow.md`

This includes:

- Navigation flows
- Trading flows
- Authentication flows
- Wallet flows
- Portfolio flows
- Administration flows

This document must never describe user journeys.

---

# Application Behaviour

Application contracts belong exclusively to:

- `api-contracts.md`

This includes:

- Application actions
- Validation
- Authorization
- Server actions
- Success responses
- Failure responses
- Realtime events
- Audit requirements

This document must never define application behaviour.

---

# Database Structure

Database ownership belongs exclusively to:

- `database-schema.md`

This includes:

- Entities
- Relationships
- Tables
- Fields
- Constraints
- Indexes

This document must never define data structures.

---

# System Architecture

System architecture belongs exclusively to:

- `architecture.md`

This includes:

- System boundaries
- Platform services
- External integrations
- Infrastructure
- Storage architecture
- Application layers

This document must never redefine architecture.

---

# Build Order

Implementation order belongs exclusively to:

- `build-plan.md`

This includes:

- Build phases
- Build dependencies
- Milestones
- Specification ordering

This document must never describe implementation order.

---

# Feature Requirements

Feature requirements belong exclusively to:

- `specs/features/*`

This includes:

- Feature scope
- Behaviour
- Validation
- Acceptance criteria

This document must never redefine feature requirements.

---

# Component Requirements

Implementation requirements for reusable components belong exclusively to:

- `specs/components/*`

This includes:

- Component requirements
- Component behaviour
- Component acceptance criteria

This document defines where components exist.

It does not define how they are implemented.

---

# Layout Requirements

Implementation requirements for layouts belong exclusively to:

- `specs/layouts/*`

This includes:

- Layout behaviour
- Layout composition
- Layout acceptance criteria

This document defines the available layouts only.

---

# Page Requirements

Implementation requirements for routed pages belong exclusively to:

- `specs/pages/*`

This includes:

- Page composition
- Page requirements
- Page-specific acceptance criteria

This document defines page inventory only.

---

# Dialog Requirements

Implementation requirements for dialogs belong exclusively to:

- `specs/dialogs/*`

This includes:

- Dialog composition
- Dialog requirements
- Dialog acceptance criteria

This document defines dialog inventory only.

---

# Section Requirements

Implementation requirements for reusable sections belong exclusively to:

- `specs/sections/*`

This includes:

- Section composition
- Section requirements
- Section acceptance criteria

This document defines section inventory only.

---

# Styling

Visual styling belongs exclusively to:

- `ui-context.md`
- `globals.css`

This includes:

- Color system
- Typography
- Spacing scale
- Elevation
- Border radius
- Motion
- Design tokens

This document must never define styling values.

---

# Implementation Rules

Development rules belong exclusively to:

- `code-standards.md`
- `ai-workflow-rules.md`

This includes:

- Coding standards
- Development workflow
- File organization
- Naming conventions

This document must never define implementation rules.

---

# Responsibility Rules

The following rules are mandatory.

- Every visual decision must originate from this document.
- Every implementation document must reference this document instead of redefining layouts.
- No document may duplicate the ownership of another document.
- Every concept must have exactly one owning document.
- Conflicting definitions across documents are prohibited.
- If a visual structure changes, this document must be updated before implementation continues.


# 16. Acceptance Criteria

The `wireframe.md` document is complete only if every requirement in this section is satisfied.

All criteria are mandatory.

---

# Application Structure

- [ ] Every application shell is documented.
- [ ] Every reusable layout is documented.
- [ ] Every routed page is documented.
- [ ] Every shared UI region is documented.
- [ ] Every reusable section is documented.
- [ ] Every reusable parent component is documented.
- [ ] Every reusable child component is documented.
- [ ] Every dialog is documented.
- [ ] Every navigation destination is documented.

---

# Component Hierarchy

- [ ] Every page references an existing layout.
- [ ] Every layout references existing shared UI regions.
- [ ] Every page is composed from reusable sections.
- [ ] Every section is composed from reusable parent components.
- [ ] Every parent component is composed from reusable child components.
- [ ] Every reusable component appears exactly once within the documented hierarchy.
- [ ] No undocumented reusable component exists.

---

# Responsive Layout

- [ ] Desktop layout is documented.
- [ ] Tablet layout is documented.
- [ ] Mobile layout is documented.
- [ ] Responsive behaviour is documented for every layout.
- [ ] Responsive behaviour is documented for every page.
- [ ] Responsive behaviour is documented for every reusable section.
- [ ] Responsive behaviour is documented for every reusable parent component.
- [ ] Responsive behaviour is documented for every shared UI region.
- [ ] Responsive behaviour is documented for every dialog.

---

# Navigation

- [ ] Every routed page is reachable through documented navigation.
- [ ] Every dialog has a documented entry point.
- [ ] Every dialog has a documented closing method.
- [ ] Primary navigation is documented for every device size.

---

# Reusability

- [ ] Every reusable component appears in the Component Checklist.
- [ ] Duplicate reusable components do not exist.
- [ ] Parent components are reused instead of duplicated.
- [ ] Child components are reused instead of duplicated.

---

# Document Ownership

- [ ] No business logic is documented.
- [ ] No authentication behaviour is documented.
- [ ] No prediction engine behaviour is documented.
- [ ] No API behaviour is documented.
- [ ] No database structure is documented.
- [ ] No implementation details are documented.
- [ ] No Tailwind classes are documented.
- [ ] No source code is documented.

---

# Cross-Document Consistency

- [ ] Visual structure matches `ui-context.md`.
- [ ] Component hierarchy matches `build-plan.md`.
- [ ] Navigation structure is compatible with `user-flow.md`.
- [ ] Layouts do not redefine architecture documented in `architecture.md`.
- [ ] Visual components do not redefine feature requirements owned by specification files.

---

# Readiness

The document is implementation-ready only when:

- [ ] Every page has a documented visual blueprint.
- [ ] Every reusable component has a documented location.
- [ ] Every layout is complete.
- [ ] Every dialog is complete.
- [ ] Every responsive rule is complete.
- [ ] Every visual dependency is documented.
- [ ] The complete application can be visualized without referring to any other document except `ui-context.md`.


# 17. Scope

This document defines only the visual blueprint of the Sheybi application.

It is the single source of truth for the application's visual structure before implementation begins.

---

## This Document Defines

- Application Shell
- Layout Inventory
- Navigation Structure
- Routed Pages
- Shared UI Regions
- Section Inventory
- Parent Components
- Child Components
- Component Hierarchy
- Dialog Inventory
- Responsive Behaviour
- Component Relationships
- Component Checklist

---

## This Document Does Not Define

- Business Logic
- Prediction Engine Behaviour
- Authentication Behaviour
- Authorization
- User Flows
- API Contracts
- Database Structure
- Realtime Behaviour
- Background Tasks
- Payment Processing
- Server Actions
- Source Code
- Tailwind Classes
- Styling Implementation
- Design Tokens
- Algorithms

Those subjects belong exclusively to their owning documents.

---

## Ownership Rules

- Every visual decision must originate from this document.
- Every feature specification must reference this document instead of redefining layouts.
- Every reusable component must appear in this document before implementation begins.
- No implementation may introduce undocumented layouts or reusable components.
- Changes to the application's visual hierarchy must be reflected in this document before implementation continues.
- This document must remain synchronized with `build-plan.md` and `ui-context.md`.

---

## Writing Rules

This document must:

- Describe visual structure only.
- Use deterministic language.
- Avoid business behaviour.
- Avoid implementation details.
- Avoid styling values.
- Avoid source code.
- Avoid duplicated definitions.
- Remain implementation-independent.
