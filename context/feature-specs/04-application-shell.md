# 04-application-shell.md

# Purpose

The purpose of this specification is to define the permanent Application Shell for the Sheybi application.

The Application Shell is the persistent interface that surrounds every routed page and remains consistent throughout the application.

The visible result must be a complete, reusable application shell that provides navigation, global actions, shared interface regions, overlays, and structural containers for every supported device.

Pages must only replace the Main Content region.

Layouts must compose this shell.

Pages must never redefine it.

This specification is the single source of truth for every persistent interface region outside page content.

---

# Scope

This specification owns only the permanent Application Shell.

It includes:

- Desktop Shell
- Tablet Shell
- Mobile Shell
- Guest Shell Variant
- Authenticated Shell Variant
- Admin Shell Variant

It defines:

- Application Root
- Desktop Sidebar
- Desktop Header
- Mobile Header
- Hamburger Drawer
- Bottom Navigation
- Global Search Region
- Wallet Display Region
- User Profile Region
- Primary Navigation Region
- Category Navigation Region
- Notification Region
- Live Market Ticker
- Main Content Container
- Dialog Layer
- Toast Layer
- Loading Layer

For every shell region this specification defines:

- Purpose
- Visibility
- Placement
- Composition
- Hierarchy
- Responsive behaviour
- Component Sizing
- Spacing Rules
- Typography Usage
- Scroll ownership
- Accessibility
- Empty State
- Design Tokens Used
- Ownership

This specification does **not** define:

- Routed pages
- Feature implementation
- Authentication logic
- Prediction markets
- Trading
- Wallet functionality
- Portfolio functionality
- Community functionality
- API behaviour
- Database behaviour
- Business logic
- Parent component implementation
- Child component implementation

---

# Dependencies

## Completed Build Units

- `01-ui-primitives.md`
- `02-child-components.md`
- `03-parent-components.md`

## Required Specifications

- `project-overview.md`
- `architecture.md`
- `ui-context.md`
- `wireframe.md`
- `build-plan.md`
- `user-flow.md`
- `03-parent-components.md`
- `02-child-components.md`
- `01-ui-primitives.md`
- `05-layouts.md`
- `06-pages.md`

## Required Packages

No new packages.

Reuse only packages introduced by previous frontend specifications.
- `next` (App Router)
- `lucide-react` (Icons)
- `@clerk/nextjs` (Authentication status)
- `shadcn/ui` (Base UI primitives)

---

# Design

Reference:

- `ui-context.md`
- `wireframe.md`

The Application Shell must remain visually identical throughout the authenticated experience.

Only the Main Content region changes between routes.

Every shell region must maintain consistent sizing, spacing, typography, hierarchy and interaction patterns. The Application Shell follows a mobile-first, predictable layout design. 

---

# Shell Regions

## Application Root

### Purpose
Acts as the permanent container for the entire application.

### Visibility
- Guest
- Authenticated
- Admin

### Desktop Behaviour
Contains:
- Desktop Sidebar
- Desktop Header
- Live Market Ticker
- Main Content
- Dialog Layer
- Toast Layer
- Loading Layer
Enforces full viewport height.

### Tablet Behaviour
Same hierarchy. Sidebar becomes collapsible. Enforces full viewport height.

### Mobile Behaviour
Contains:
- Mobile Header
- Main Content
- Bottom Navigation
- Dialog Layer
- Toast Layer
- Loading Layer
Enforces `100dvh` (dynamic viewport height) to respect mobile browser chrome.

### Visual Hierarchy
Highest structural container. Owns every persistent shell region. Base layer.

### Component Sizing
Occupies full viewport (`100vw`, `100vh`/`100dvh`).

### Spacing Rules
Defines global gutters and page spacing.

### Typography Usage
Defines default `--font-sans`.

### Fixed vs Scrollable
Application Root never scrolls. Main Content owns scrolling.

### Accessibility
Must expose proper landmark hierarchy. Contains `main` content landmark and navigation landmarks.

### Empty State
Not applicable.

### Responsive Transitions
Automatically swaps shell regions without replacing page content.

### Design Tokens Used
- `--bg-base` (Surface, Background)
- Border, Spacing, Radius, Elevation

### Ownership
Owns all shell regions.

---

## Desktop Sidebar

### Purpose
Primary navigation and persistent status for desktop users.

### Visibility
Guest
- Logo
- Wallet placeholder
- Log In & Sign up buttons

Authenticated
- Logo
- Wallet Card
- Primary Navigation
- Clerk User placeholder

Admin
- Logo
- Admin Navigation
- Clerk User placeholder

### Desktop Behaviour
Always visible. Fixed to the left edge. Full height. Never overlays content. Categories section is explicitly removed from desktop sidebar. Scrollbar is hidden (`scrollbar-width: none`).

### Tablet Behaviour
Collapsible. Can expand over content.

### Mobile Behaviour
Hidden. Replaced by Hamburger Drawer and Bottom Navigation.

### Visual Hierarchy
Top: Logo
Second: Wallet Card
Third: Primary Navigation
Bottom: User Region
Secondary to Main Content, but pinned. Categories are excluded.

### Component Sizing
Fixed width `260px`. Full viewport height minus header.

### Spacing Rules
Base padding `24px`. Consistent vertical spacing between navigation groups.

### Typography Usage
Navigation labels use body typography (Base). Section labels use muted labels.

### Fixed vs Scrollable
Sidebar remains fixed. Navigation region scrolls independently vertically if necessary with hidden scrollbar (`scrollbar-width: none`).

### Accessibility
Keyboard navigable. Current page announced. Visible focus states. `nav` landmark. `aria-label="Main Navigation"`.

### Empty State
Guest variant displays Login / Create Account actions.

### Responsive Transitions
Collapses on tablet. Hidden on mobile.

### Design Tokens Used
- `--bg-surface` (Surface)
- Surface Variant
- Border
- Primary
- Radius
- Spacing

### Ownership
Navigation Items → `02-child-components.md`
Wallet Card → `03-parent-components.md`
Profile Region → `03-parent-components.md`

---

## Wallet Display Region

### Purpose
Displays the user's financial summary or authentication prompts.

### Visibility
Always visible in Sidebar (Desktop) or Hamburger Drawer (Mobile).

### Desktop Behaviour
Rendered near the top of the Sidebar.

### Tablet Behaviour
Inside collapsible Drawer.

### Mobile Behaviour
Inside Hamburger Drawer.

### Visual Hierarchy
High priority status card.

### Component Sizing
Full width of Sidebar/Drawer.

### Spacing Rules
Margin bottom `24px`.

### Typography Usage
`--font-mono` for balances.

### Fixed vs Scrollable
Scrolls with Sidebar content.

### Accessibility
`aria-live="polite"` for balance updates.

### Empty State
Guest sees Login / Create Account Card.

### Responsive Transitions
Moves from Sidebar to Drawer.

### Design Tokens Used
- `--accent-primary`
- `--wallet`

### Ownership
Application Shell.

---

## User Profile Region

### Purpose
Displays user profile actions or login prompts.

### Visibility
Always visible.

### Desktop Behaviour
Pinned to the bottom of the Sidebar.

### Tablet Behaviour
Bottom of Drawer.

### Mobile Behaviour
Bottom of Drawer.

### Visual Hierarchy
Secondary utility.

### Component Sizing
Full width of container. Height `64px`.

### Spacing Rules
Padding `16px`.

### Typography Usage
Body small.

### Fixed vs Scrollable
Pinned/Fixed within the Sidebar container.

### Accessibility
Keyboard focusable menu.

### Empty State
Guest sees "Login / Create Account" link.

### Responsive Transitions
Fluidly resizes within container.

### Design Tokens Used
- `--text-primary`
- `--bg-surface`

### Ownership
Application Shell.

---

## Primary Navigation Region

### Purpose
Links to main sections (Home, Markets, Portfolio, Wallet, Notifications, Settings).

### Visibility
Always visible.

### Desktop Behaviour
Vertical list in Sidebar. Administrator navigation replaces items if role matches.

### Tablet Behaviour
Vertical list in Drawer.

### Mobile Behaviour
Replaced by Bottom Navigation for core links; full list in Drawer.

### Visual Hierarchy
Primary interactive elements.

### Component Sizing
Items are minimum `44px` height.

### Spacing Rules
`8px` gap between items.

### Typography Usage
Body base, semi-bold for active.

### Fixed vs Scrollable
Scrolls if Sidebar height is exceeded.

### Accessibility
`role="menu"`, tab navigation.

### Empty State
N/A.

### Responsive Transitions
Transforms to horizontal Bottom Navigation on mobile.

### Design Tokens Used
- `--text-secondary`
- `--bg-hover` (on hover).

### Ownership
Application Shell.

---

## Category Navigation Region

### Purpose
Links to market categories (Entertainment, Sports, Politics, Crypto).

### Visibility
Always visible.

### Desktop Behaviour
Below primary navigation in Sidebar.

### Tablet Behaviour
Inside Drawer.

### Mobile Behaviour
Inside Drawer.

### Visual Hierarchy
Secondary navigation.

### Component Sizing
Items `40px` height.

### Spacing Rules
Top margin `24px` to separate from primary navigation.

### Typography Usage
Body small.

### Fixed vs Scrollable
Scrolls with Sidebar.

### Accessibility
`role="menu"`.

### Empty State
Displays "No categories available" if empty.

### Responsive Transitions
None.

### Design Tokens Used
- `--text-muted`.

### Ownership
Application Shell.

---

## Desktop Header

### Purpose
Provides global actions. Persistent top bar containing search and quick actions.

### Visibility
Authenticated
Admin

### Desktop Behaviour
Sticky. Spans the top of the Main Content region. Contains:
- Global Search
- Wallet Chip
- Notification Button
No logo.

### Tablet Behaviour
Same structure. Spans full width. Search width reduced.

### Mobile Behaviour
Hidden. Replaced by Mobile Header.

### Visual Hierarchy
Search receives highest emphasis. Wallet Chip second. Notification third. Highest structural element on desktop content side.

### Component Sizing
Fixed height `64px`. Full width spans available content area.

### Spacing Rules
Horizontal padding `24px`. Even spacing between actions.

### Typography Usage
Search placeholder uses body typography (Base). Wallet Chip uses emphasis typography.

### Fixed vs Scrollable
Fixed. Never scrolls. Sticky top.

### Accessibility
Keyboard accessible. Proper landmarks (`header` landmark).

### Empty State
Search placeholder.

### Responsive Transitions
Hidden on mobile. Transforms to Mobile Header on small screens.

### Design Tokens Used
- `--bg-surface` (Surface)
- `--border-default` (Border)
- Elevation
- Primary

### Ownership
Search Bar → `02-child-components.md`
Wallet Chip → `02-child-components.md`
Notification Button → `02-child-components.md`

---

## Global Search Region

### Purpose
Global market search.

### Visibility
Always available.

### Desktop Behaviour
Expanded search bar in Desktop Header.

### Tablet Behaviour
Expanded or icon-only depending on width.

### Mobile Behaviour
Search Button in Mobile Header opens full-screen overlay.

### Visual Hierarchy
Prominent utility.

### Component Sizing
Max-width `400px` on desktop.

### Spacing Rules
Centered or flex-grown in Header.

### Typography Usage
Body base.

### Fixed vs Scrollable
Fixed inside Header.

### Accessibility
`type="search"`, `aria-label="Search Markets"`.

### Empty State
Placeholder "Search markets...".

### Responsive Transitions
Collapses to icon on mobile.

### Design Tokens Used
- `--bg-surface-secondary`.

### Ownership
Application Shell.

---

## Wallet Chip

### Purpose
Quick glance at available balance for authenticated users.

### Visibility
Desktop Header and Mobile Header. Authenticated users only.

### Desktop Behaviour
Displayed adjacent to Notification Button.

### Tablet Behaviour
Displayed in Header.

### Mobile Behaviour
Displayed in Header.

### Visual Hierarchy
High attention.

### Component Sizing
Height `32px`, padding horizontal `12px`.

### Spacing Rules
Margin right `16px`.

### Typography Usage
`--font-mono`, small.

### Fixed vs Scrollable
Fixed inside Header.

### Accessibility
`aria-live="polite"`.

### Empty State
Hidden for Guests.

### Responsive Transitions
Scales down slightly on mobile.

### Design Tokens Used
- `--accent-primary`
- `--text-primary`

### Ownership
Application Shell.

---

## Notification Region

### Purpose
Access to notification center.

### Visibility
Always visible in Header.

### Desktop Behaviour
Button with unread badge in Desktop Header.

### Tablet Behaviour
Button in Header.

### Mobile Behaviour
Inside Mobile Drawer or Mobile Header.

### Visual Hierarchy
Utility action.

### Component Sizing
`40px` by `40px` button.

### Spacing Rules
`8px` gap to adjacent actions.

### Typography Usage
Badge uses xs.

### Fixed vs Scrollable
Fixed inside Header.

### Accessibility
`aria-label="Notifications"`, indicates unread count.

### Empty State
No unread badge.

### Responsive Transitions
None.

### Design Tokens Used
- `--state-error` (badge).

### Ownership
Application Shell.

---

## Mobile Header

### Purpose
Primary mobile application header.

### Visibility
Guest
Authenticated
Admin

### Desktop Behaviour
Hidden.

### Tablet Behaviour
Hidden or simplified.

### Mobile Behaviour
Sticky. Contains:
- Logo
- Wallet Chip
- Search Trigger
- Hamburger Menu

### Visual Hierarchy
Logo
Wallet
Search
Menu
Primary branding and navigation trigger.

### Component Sizing
Safe-area aware. Fixed height `64px`.

### Spacing Rules
Horizontal padding `16px`. Horizontal spacing remains consistent.

### Typography Usage
Wallet Chip uses emphasis typography. Base typography.

### Fixed vs Scrollable
Always fixed. Sticky top.

### Accessibility
44px touch targets. Keyboard accessible. Respects safe areas. `header` landmark.

### Empty State
Wallet placeholder for guests.

### Responsive Transitions
Hidden above mobile breakpoint. Expands to Desktop Header on large screens.

### Design Tokens Used
- `--bg-surface` (Surface)
- `--border-default` (Border)
- Primary
- Radius

### Ownership
Wallet Chip → `02-child-components.md`
Search Trigger → `02-child-components.md`
Hamburger Button → `02-child-components.md`

---

## Hamburger Drawer

### Purpose
Provides complete navigation on mobile. Hidden navigation panel for mobile devices.

### Visibility
Guest
Authenticated
Admin
Triggered by Hamburger.

### Desktop Behaviour
Hidden.

### Tablet Behaviour
Optional. Opens from left.

### Mobile Behaviour
Slides from left. Contains:
- User Region
- Primary Navigation
- Categories
- Footer Actions

### Visual Hierarchy
User
Navigation
Categories
Footer
Overlay navigation.

### Component Sizing
Width `80vw`, max `320px`. Full viewport height.

### Spacing Rules
Padding `16px`.

### Typography Usage
Base.

### Fixed vs Scrollable
Drawer fixed. Internal scrolling allowed.

### Accessibility
Focus trapped. Esc closes. `aria-modal="true"`.

### Empty State
N/A.

### Responsive Transitions
Slides in and out from left.

### Design Tokens Used
- `--bg-surface` (Surface)
- `--bg-base` (overlay)
- Border
- Elevation

### Ownership
Navigation Items → `02-child-components.md`
User Region → `03-parent-components.md`

---

## Bottom Navigation

### Purpose
Primary mobile navigation.

### Visibility
Authenticated. Guest variant may display Home and Login. Mobile only.

### Desktop Behaviour
Hidden.

### Tablet Behaviour
Hidden.

### Mobile Behaviour
Fixed to bottom. Contains:
- Home
- Markets
- Portfolio
- Wallet
- Profile

### Visual Hierarchy
Equal emphasis. Primary mobile interaction.

### Component Sizing
Height `72px` (plus safe area). Safe-area aware.

### Spacing Rules
Evenly spaced flex distribution.

### Typography Usage
Label uses xs.

### Fixed vs Scrollable
Always fixed. Fixed bottom.

### Accessibility
Minimum touch target 44px. Current page announced. `nav` landmark, safe-area-inset-bottom padded.

### Empty State
N/A.

### Responsive Transitions
Appears only on mobile. Transforms to Sidebar on desktop.

### Design Tokens Used
- `--bg-surface` (Surface)
- `--border-default` (Border)
- `--accent-primary` (active/Primary)

### Ownership
Navigation Items → `02-child-components.md`

---

## Live Market Ticker

> [!NOTE]
> Implementation and active rendering of the Live Market Ticker are currently **PAUSED** to prevent schema or build sequence disruption while preserving underlying component types for future reference.

### Purpose
Displays continuously scrolling market activity.

### Visibility
Guest
Authenticated
Desktop and Tablet. Mobile if space permits.

### Desktop Behaviour
Appears directly beneath Header. Full width of Main Content.

### Tablet Behaviour
Same. Below header.

### Mobile Behaviour
Appears beneath Mobile Header. Reduced height. Hidden or below header depending on configuration.

### Visual Hierarchy
Secondary. Ambient information.

### Component Sizing
Single row. Height `40px`.

### Spacing Rules
None.

### Typography Usage
`--font-mono`, small.

### Fixed vs Scrollable
Ticker scrolls horizontally indefinitely. Main page scroll unaffected.

### Accessibility
Animation can be reduced. `aria-hidden="true"` (purely decorative/ambient, screen readers use main feed).

### Empty State
Placeholder ticker items. Hidden if no active updates.

### Responsive Transitions
Height reduces on mobile. Pauses on hover.

### Design Tokens Used
- `--bg-surface-secondary` (Surface Variant)
- `--text-secondary`
- Primary
- Border

### Ownership
Ticker Item → `02-child-components.md`

---

## Main Content Region

### Purpose
Displays routed page content.

### Visibility
All variants. Always visible.

### Desktop Behaviour
Centered. Maximum readable width. Occupies area right of Sidebar, below Header and Ticker.

### Tablet Behaviour
Expanded. Full width below Header.

### Mobile Behaviour
Full width between Mobile Header and Bottom Navigation.

### Visual Hierarchy
Primary content region.

### Component Sizing
Responsive width. Flex-grow. Max-width `1200px` internally.

### Spacing Rules
Consistent horizontal gutters (`16px` mobile, `32px` desktop). Vertical spacing defined by design tokens.

### Typography Usage
Inherited from page.

### Fixed vs Scrollable
Owns primary vertical scrolling.

### Accessibility
Uses `<main>` landmark.

### Empty State
Page specific. Defined by routed page.

### Responsive Transitions
Adjusts width only based on Sidebar presence.

### Design Tokens Used
- `--bg-base`
- Spacing
- Surface
- Background

### Ownership
Owned by `05-pages.md`

---

## Dialog Layer

### Purpose
Displays global modal dialogs above every page.

### Visibility
All variants. Visible when active.

### Desktop Behaviour
Center aligned. Background blur.

### Tablet Behaviour
Center aligned.

### Mobile Behaviour
Bottom sheet with rounded top corners. Max height 90% viewport.

### Visual Hierarchy
Highest interactive priority.

### Component Sizing
Max-width `500px` (desktop), `100vw` (mobile).

### Spacing Rules
Padding `24px`.

### Typography Usage
Base.

### Fixed vs Scrollable
Fixed overlay. Internal scrollable content.

### Accessibility
Focus trap. Background inert. `aria-modal="true"`, escape to close.

### Empty State
N/A.

### Responsive Transitions
Transforms from centered modal to bottom sheet.

### Design Tokens Used
- `--bg-surface`
- shadows `Shadow 3`

### Ownership
`06-dialogs.md`

---

## Toast Layer

### Purpose
Displays temporary notifications.

### Visibility
All variants. Visible when triggered.

### Desktop Behaviour
Bottom right or top right placement.

### Tablet Behaviour
Bottom center.

### Mobile Behaviour
Above bottom navigation.

### Visual Hierarchy
High priority but non-blocking.

### Component Sizing
Width auto, max `350px`.

### Spacing Rules
Margin `16px` from edges.

### Typography Usage
Body small.

### Fixed vs Scrollable
Fixed overlay.

### Accessibility
ARIA live region. `role="status"` or `role="alert"`.

### Empty State
N/A.

### Responsive Transitions
Repositions based on screen size.

### Design Tokens Used
- `--bg-elevated`
- state tokens

### Ownership
`06-dialogs.md`

---

## Loading Layer

### Purpose
Displays application-wide loading overlays.

### Visibility
All variants. Visible during critical global loading transitions.

### Desktop Behaviour
Covers entire shell. Blocks interaction.

### Tablet Behaviour
Covers entire shell.

### Mobile Behaviour
Covers entire viewport.

### Visual Hierarchy
Blocking overlay.

### Component Sizing
`100vw`, `100vh`.

### Spacing Rules
Centered content.

### Typography Usage
None.

### Fixed vs Scrollable
Full-screen overlay. Fixed.

### Accessibility
Announces loading state. `aria-busy="true"`.

### Empty State
N/A.

### Responsive Transitions
None.

### Design Tokens Used
- `--bg-base` with opacity.

### Ownership
`06-dialogs.md`

---

# Structure

Application Root
- Desktop Sidebar
- Desktop Header
- Mobile Header
- Hamburger Drawer
- Bottom Navigation
- Live Market Ticker
- Main Content
- Dialog Layer
- Toast Layer
- Loading Layer

Pages may only replace Main Content.
No page may redefine any shell region.

## Application Root
- **Purpose**: Mount point.
- **Parent**: HTML Body.
- **Children**: Desktop Sidebar, Mobile Header, Main Content Region, Bottom Navigation, Overlay Layers.
- **Reusable Elements**: None.
- **Ownership**: Application Shell.

## Desktop Sidebar
- **Purpose**: Persistent navigation container.
- **Parent**: Application Root.
- **Children**: Logo, Wallet Region, Primary Navigation, Category Navigation, Flexible Spacer, User Region.
- **Reusable Elements**: ActionIcons, WalletCard.
- **Ownership**: Application Shell.

## Wallet Display Region
- **Purpose**: Balance display.
- **Parent**: Desktop Sidebar, Hamburger Drawer.
- **Children**: Wallet Summary Component / Login CTA.
- **Reusable Elements**: WalletCard.
- **Ownership**: Application Shell.

## User Profile Region
- **Purpose**: Profile and session actions.
- **Parent**: Desktop Sidebar, Hamburger Drawer.
- **Children**: Clerk User Button Placeholder / Login CTA.
- **Reusable Elements**: ActionIcon.
- **Ownership**: Application Shell.

## Primary Navigation Region
- **Purpose**: Core application routes.
- **Parent**: Desktop Sidebar, Hamburger Drawer.
- **Children**: Navigation links (Home, Market, Trades, Wallet, `+` [Market Suggestion action button]).
- **Reusable Elements**: None.
- **Ownership**: Application Shell.

## Category Navigation Region
- **Purpose**: Route filtering by category.
- **Parent**: Desktop Sidebar, Hamburger Drawer.
- **Children**: Category links.
- **Reusable Elements**: None.
- **Ownership**: Application Shell.

## Desktop Header
- **Purpose**: Top persistent bar.
- **Parent**: Main Content Container.
- **Children**: Global Search Region, Wallet Chip, Notification Region.
- **Reusable Elements**: NotificationButton, WalletChip.
- **Ownership**: Application Shell.

## Global Search Region
- **Purpose**: Global search.
- **Parent**: Desktop Header, Mobile Header.
- **Children**: Search Input, Search Overlay.
- **Reusable Elements**: None.
- **Ownership**: Application Shell.

## Wallet Chip
- **Purpose**: Compact balance.
- **Parent**: Desktop Header, Mobile Header.
- **Children**: Balance text.
- **Reusable Elements**: WalletChip.
- **Ownership**: Application Shell.

## Notification Region
- **Purpose**: Notification access.
- **Parent**: Desktop Header, Mobile Header.
- **Children**: Bell Icon, Badge.
- **Reusable Elements**: NotificationDot, ActionIcon.
- **Ownership**: Application Shell.

## Mobile Header
- **Purpose**: Mobile top bar.
- **Parent**: Application Root.
- **Children**: Hamburger Button, Logo, Wallet Chip, Search Button.
- **Reusable Elements**: ActionIcon.
- **Ownership**: Application Shell.

## Hamburger Drawer
- **Purpose**: Mobile hidden navigation.
- **Parent**: Dialog Layer.
- **Children**: Wallet Region, Primary Navigation, Category Navigation, User Region.
- **Reusable Elements**: Same as Sidebar.
- **Ownership**: Application Shell.

## Bottom Navigation
- **Purpose**: Mobile persistent navigation.
- **Parent**: Application Root.
- **Children**: Route Icons (Home, Markets, `+` [Market Suggestion center button], Trades, Profile).
- **Reusable Elements**: NavigationIcon.
- **Ownership**: Application Shell.

## Live Market Ticker
- **Purpose**: Animated market updates.
- **Parent**: Main Content Container.
- **Children**: Market Ticker Items.
- **Reusable Elements**: None.
- **Ownership**: Application Shell.

## Main Content Region
- **Purpose**: Page wrapper.
- **Parent**: Application Root.
- **Children**: Desktop Header, Live Market Ticker, Hero Region Placeholder, Routed Pages.
- **Reusable Elements**: None.
- **Ownership**: Application Shell.

## Dialog Layer
- **Purpose**: Z-index host for modals.
- **Parent**: Application Root.
- **Children**: Modals, Bottom Sheets, Hamburger Drawer.
- **Reusable Elements**: None.
- **Ownership**: Application Shell.

## Toast Layer
- **Purpose**: Z-index host for toasts.
- **Parent**: Application Root.
- **Children**: Toast Notifications.
- **Reusable Elements**: None.
- **Ownership**: Application Shell.

## Loading Layer
- **Purpose**: Z-index host for blocking loaders.
- **Parent**: Application Root.
- **Children**: Fullscreen Spinner.
- **Reusable Elements**: None.
- **Ownership**: Application Shell.

---

# Behaviour

The Application Shell must remain mounted during route changes.

Only the Main Content region changes.

Desktop Sidebar must remain persistent.

Headers must remain sticky.

Bottom Navigation must remain fixed.

Hamburger Drawer must overlay the shell.

Dialogs must trap focus.

Toasts must appear above dialogs.

Loading Layer must appear above every shell region.

Focus order must always be:
1. Header
2. Navigation
3. Main Content
4. Dialog
5. Toast

Responsive transitions must never recreate shell regions.

## Sticky Behaviour
- The Desktop Header and Mobile Header remain fixed (sticky) to the top of the viewport at all times.
- The Bottom Navigation remains fixed to the bottom of the viewport on mobile devices.

## Sidebar Behaviour
- The Desktop Sidebar remains completely fixed. Only the inner navigation area may scroll vertically if its content exceeds the available height. The Logo (top), Wallet Region (top), and User Region (bottom) must remain pinned in view.

## Drawer Behaviour
- Triggered by the Mobile Header hamburger icon.
- Slides in from the left edge.
- Traps scroll (background page cannot scroll while open).
- Outside click or swipe left closes the drawer.

## Bottom Navigation Behaviour
- Exists exclusively below the mobile breakpoint.
- Does not hide on scroll (always visible).
- Touch targets strictly enforced at minimum 44px.

## Keyboard Navigation
- Focus must flow naturally from Header → Sidebar → Main Content.
- When the Hamburger Drawer or any Dialog opens, keyboard focus must be trapped inside the overlay.

## Responsive Transitions Details
- Between breakpoints, the Main Content region flexes smoothly.
- The Sidebar disappears entirely on mobile, immediately replaced by the Mobile Header and Bottom Navigation.
- Re-rendering is strictly avoided; the shell layout uses CSS media queries for visibility toggles to preserve React state during resizing.

## Overlay Stacking
1. Main Shell (z-index base)
2. Sticky Headers / Bottom Navigation (z-index 10-20)
3. Hamburger Drawer / Sidebar Overlays (z-index 30)
4. Dialog Layer (z-index 40)
5. Toast Layer (z-index 50)
6. Loading Layer (z-index 100)

## Scroll Ownership
- The Main Content Region strictly owns all page-level scrolling.
- The `body` element must be prevented from scrolling the entire shell; `overflow: hidden` applies to the Application Root, delegating `overflow-y: auto` only to the Main Content Region.

## Loading Overlays
- When a blocking global loading state is triggered, the Loading Layer renders above everything (z-index 100) and captures all pointer events, disabling interaction with the shell beneath.

---

# Acceptance Criteria

- Every shell region exists.
- Guest shell variant exists.
- Authenticated shell variant exists.
- Admin shell variant exists.
- Desktop shell is defined.
- Tablet shell is defined.
- Mobile shell is defined.
- Sidebar composition is fully defined.
- Header composition is fully defined.
- Mobile Header composition is fully defined.
- Bottom Navigation composition is fully defined.
- Hamburger Drawer composition is fully defined.
- Live Market Ticker composition is fully defined.
- Main Content ownership is unambiguous.
- Overlay stacking is fully defined.
- Every child component has an owning specification.
- No routed page duplicates shell content.
- No layout duplicates shell regions.
- Accessibility requirements are satisfied.
- No TypeScript errors exist.
- `npm run build` succeeds.
- Wallet regions are defined.
- Main Content ownership is defined.
- Responsive behaviour is completely specified.

---

# Out of Scope

This specification does not define:

- Layout implementation (`05-layouts.md`)
- Routed pages (`06-pages.md`)
- Dialog implementation (`06-dialogs.md`)
- Authentication
- Business logic
- Prediction markets
- Wallet functionality
- Portfolio functionality
- Trading
- API behaviour
- Database behaviour

---

# Cross-Document Responsibilities

- Visual Language → `ui-context.md`
- Wireframes → `wireframe.md`
- Application Layouts → `05-layouts.md`
- Routed Pages → `06-pages.md`
- Parent Components → `03-parent-components.md`
- Child Components → `02-child-components.md`
- UI Primitives → `01-ui-primitives.md`
- Architecture → `architecture.md`
- User Flow → `user-flow.md`
- Build Order → `build-plan.md`
- API Behaviour → `api-contracts.md`
