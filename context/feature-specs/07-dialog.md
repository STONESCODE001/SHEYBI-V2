# 07-dialog.md — Reusable Dialog Framework Specification

## Document Information
- **Project**: Sheybi
- **Scope**: Frontend Architecture Infrastructure
- **Role**: Reusable Dialog Infrastructure and Generic Primitives
- **Status**: Draft
- **Version**: 2.0.0

---

## Purpose

This specification defines the complete, reusable Dialog Framework for the Sheybi application. The Dialog Framework must provide a unified, responsive dialog management system that handles overlay overlays, drawer sheets, and modals across desktop, tablet, and mobile views. 

All feature modules must compose this dialog framework to display modal or sheet interfaces. Individual features must never implement dialog behaviors, focus traps, scroll locks, or animation layers independently. This framework is the single source of truth for dialog architecture.

---

## Specification Dependencies

The Sheybi frontend is organized around strict separation of architectural concerns. The Dialog Framework relates to other specifications as follows:

1. **ui-context.md**: Owns visual design tokens, including color schemes, spacing, typography, and animation timing tokens. The Dialog Framework consumes these tokens and must never declare raw color hex values, spacing sizes, or custom transition durations.
2. **design-system.md**: Owns reusable, stateless UI components (e.g., buttons, input fields, badges). The Dialog Framework composes these components within its generic templates but does not define them.
3. **04-application-shell.md**: Owns persistent layouts and global interface regions (headers, navbars, sidebars). The Dialog Framework mounts into the application shell's global overlay/dialog slots.
4. **05-layouts.md**: Owns structural page composition and slots. Layouts compose application shell variants and include slots where pages and dialog portals render.
5. **06-pages.md**: Owns routing and route-level view composition. Pages trigger dialog events but must never define layout structures or dialog containers directly.
6. **07-dialog.md (This Document)**: Owns only reusable dialog infrastructure, lifecycle management, global states, and generic dialog primitives.

No specification may duplicate or redefine responsibilities owned by another.

---

## Scope

This specification owns and defines ONLY the reusable dialog infrastructure components.

### Infrastructure Components
- **Dialog Provider**: Manages the global mounting state of active dialogs.
- **Dialog Context**: Exposes hooks to open, close, update, and track dialog states.
- **Dialog Manager**: Orchestrates opening, stacking, and transitioning dialog layers.
- **Dialog Registry**: Registers available dialog templates and components.
- **Dialog Portal**: Directs rendering of dialog nodes into the application root overlay node.
- **Responsive Dialog**: Wraps modal dialog behavior (centered on desktop, sheet on mobile).
- **Responsive Sheet**: Wraps side drawer sheet behavior (side drawer on desktop/tablet, bottom/full sheet on mobile).
- **Bottom Sheet**: Mobile-first bottom sliding sheet layout.
- **Full Screen Sheet**: Modal sheet that occupies the entire mobile viewport.
- **Overlay**: Backdrop mask layer for blocking background interaction.
- **Focus Trap**: Traps focus cycle within the active dialog.
- **Scroll Lock**: Disables background document scrolling when dialog is open.
- **Escape Handling**: Keypress listener for closing the dialog when the Escape key is pressed.
- **Outside Click Handling**: Pointer listener for closing the dialog when the backdrop is clicked.
- **Z-index Management**: Enforces z-index stacking rules.
- **Dialog Animation Rules**: Defines exit/entry transitions based on global animation tokens.

### Shared Layout Regions
- **Dialog Header**: Structural top region containing titles, descriptions, and close buttons.
- **Dialog Body**: Primary container for content.
- **Dialog Footer**: Bottom region containing actions.
- **Dialog Actions**: Multi-button layouts for confirmation and cancellation.
- **Dialog Close Button**: Persistent top-right overlay button.
- **Dialog Scroll Area**: Internally scrollable body container.

### Generic Primitives
- **Generic Alert Dialog**: Infrastructure primitive for system alerts.
- **Generic Confirmation Dialog**: Infrastructure primitive for dual-action confirmations.
- **Generic Information Dialog**: Infrastructure primitive for educational/informational modals.
- **Generic Success Dialog**: Infrastructure primitive for displaying completion states.
- **Generic Error Dialog**: Infrastructure primitive for displaying failure states.
- **Generic Loading Dialog**: Infrastructure primitive for blocking asynchronous operations.

---

## Explicitly Out of Scope

This specification must not define or implement any feature-specific logic, styling details (other than token mappings), or business workflows. The following dialog instances belong to future feature specifications and must compose the generic structures specified here:

- **Wallet Dialogs**: Deposit, Withdraw, Transfer.
- **Trading Dialogs**: Buy position, Sell position, Trade Confirmation.
- **Profile Dialogs**: Avatar upload, KYC verification, profile details.
- **Administration Dialogs**: Create market, Edit market, Resolve market, User suspension, Withdrawal reviews.
- **Authentication Dialogs**: Session verification, password resets.
- **Utility Dialogs**: Search, category filters, share receipt modals.

---

## Dependencies

The Dialog Framework must build strictly upon completed architecture and UI primitives.

### Required Packages
- **React / Next.js**: App Router orchestration and React runtime.
- **shadcn/ui**: Base styles and base component templates.
- **Radix UI Dialog (`@radix-ui/react-dialog`)**: Base focus trapping, keyboard access, and overlay logic.
- **Radix UI Sheet (`@radix-ui/react-sheet`)**: Base drawer and sheet primitives.
- **Radix UI Portal (`@radix-ui/react-portal`)**: Mounting target portals.
- **lucide-react**: Stroke icon indicators only.

---

## Dialog Ownership Rules

To prevent state duplication, race conditions, and visual inconsistencies, the ownership of dialog states is strictly separated:

1. **Feature Modules**: Own the *internal content* and *data inputs* of a dialog. Feature components must never control their own modal triggers or modal mounting elements directly.
2. **DialogProvider**: Owns the *global visibility state* of active dialog overlays. It acts as the single source of truth for whether a dialog wrapper is mounted.
3. **DialogManager**: Owns the *dialog lifecycle* transitions and *queuing orchestration*. It controls active/pending states, transitions, promises, and stacking layers.
4. **DialogRegistry**: Owns *component registration*. It stores the catalog mapping IDs to visual dialog templates. No dialog may be opened unless it is mapped in the Registry.
5. **Pages**: Pages must never own dialog state directly. They must interact with dialogs exclusively by calling the promise-based context API.

---

## Provider Placement

The Application must mount exactly one `DialogProvider`. Multiple provider instances are prohibited. The provider must live in the core providers wrapping the entire application layout, structured exactly as:

```
Application (Root)
└── Providers (Global Contexts)
    └── DialogProvider
        └── ApplicationShell
            └── Pages (Routed Content)
```

---

## Dialog Registration Rules

Every reusable dialog in the application must register through the **Dialog Registry** to be rendered globally:

1. **Single Source of Truth**: The Dialog Registry is the only mapping system that associates unique string identifiers (e.g., `'wallet/deposit'`, `'trade/confirm'`) with React component templates.
2. **Global Registration**: Feature modules must export their dialog contents and register them inside the global Registry configuration during application initialization.
3. **No Direct Page Imports**: Pages must never import or render dialog components directly within their page templates. Pages open dialogs by dispatching the dialog identifier and payloads to the Dialog Manager.
4. **Payload Validation**: The Registry must type-check and map payloads passed to the target registered dialog, ensuring runtime safety.

---

## Controlled vs. Uncontrolled Dialogs

The framework supports two categories of dialog triggers:

### 1. Controlled Dialogs
- **Definition**: Dialogs that are opened programmatically by user actions on specific pages or components.
- **Trigger**: Pages or components invoke the Dialog Manager context hook directly (e.g., clicking a button).
- **Persistence**: Associated with the current page view. They must automatically close on route changes.
- **Examples**:
  - Search Dialog (`'global/search'`)
  - Filter Dialog (`'market/filters'`)
  - Market Suggestion Dialog (`'market/suggest'`)

### 2. Uncontrolled (Global) Dialogs
- **Definition**: Dialogs triggered by system-level events (network state, session status, or websocket pushes) independent of the active page.
- **Trigger**: Global listeners, state stores, or hooks dispatching actions directly to the Dialog Manager.
- **Persistence**: Persist across route changes. They remain mounted until the system event resolves or is explicitly dismissed.
- **Examples**:
  - Session Expired (`'system/session-expired'`)
  - Connection Lost / Offline (`'system/offline'`)
  - Maintenance Mode Active (`'system/maintenance'`)
  - Update Available (`'system/update-available'`)
  - Fatal System Error (`'system/fatal-error'`)

---

## Dialog Categories

To organize future feature development, all dialogs belong to one of three architectural categories:

```
                  ┌────────────────────────────────────────┐
                  │           Dialog Framework             │
                  └───────────────────┬────────────────────┘
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         │                            │                            │
┌────────▼────────┐          ┌────────▼────────┐          ┌────────▼────────┐
│ Infrastructure  │          │     Feature     │          │     System      │
├─────────────────┤          ├─────────────────┤          ├─────────────────┤
│ Alert           │          │ Deposit         │          │ Session Expired │
│ Confirmation    │          │ Withdraw        │          │ Offline         │
│ Information     │          │ Trade           │          │ Maintenance     │
│ Success         │          │ Notifications   │          │ Fatal Error     │
│ Error           │          │ Profile         │          │                 │
│ Loading         │          │ Settings        │          │                 │
└─────────────────┘          └─────────────────┘          └─────────────────┘
```

1. **Infrastructure**: Generic, stateless layouts provided by the framework to show basic notifications, simple confirmations, errors, and progress indicators. They do not depend on external data or stores.
2. **Feature**: Domain-specific dialog content built by feature modules (e.g., Wallet, Trading) that compose the framework's layouts, displaying interactive forms, odds selectors, or inputs.
3. **System**: Critical application-wide state dialogs triggered by backend actions or global network monitors, which lock the application or require immediate user attention.

---

## Dialog Queue Rules

When multiple events request a dialog simultaneously, the Dialog Manager must orchestrate rendering according to the following invariants:

1. **Single Active Dialog**: Only one dialog may be rendered in the DOM portal at any single moment.
2. **Stack/Queue System**: If a new dialog is triggered while one is open, the Dialog Manager resolves it based on priority rules:
   - **System Priority**: System dialogs (e.g., Session Expired) always supersede and immediately replace active Feature or Infrastructure dialogs.
   - **Feature Priority**: Feature dialogs block other feature dialogs. Subsequent requests are placed in a FIFO (First-In, First-Out) queue.
3. **Replacement & Transition Behavior**:
   - When a loading dialog finishes successfully, it must transition smoothly to the success/confirmation dialog.
   - **Transition Rule**: The active dialog must execute its exit animation (`duration-150`), resolve its promise context, clean up DOM states, and trigger the entry transition of the next queued dialog without flashing the background page.
4. **Cancellation Behavior**: If a parent dialog is cancelled, all pending dialogs in the queue associated with that call stack must be purged.

---

## Promise-based Dialog API

The Dialog Manager must expose a clean, promise-based API to avoid nested callback logic and state variables within pages. The core hooks must return promises that resolve with user actions:

```typescript
// Core API Interface
interface DialogService {
  alert(config: AlertConfig): Promise<void>;
  confirm(config: ConfirmConfig): Promise<boolean>;
  success(config: SuccessConfig): Promise<void>;
  error(config: ErrorConfig): Promise<boolean>; // Resolves true on retry, false on cancel
  loading(config: LoadingConfig): { close: () => void; update: (msg: string) => void };
}
```

### Flow Example for Confirmation:
1. Page calls: `const approved = await dialog.confirm({ title: "Confirm Trade", message: "₦1,000 on Yes?" });`
2. The page execution pauses.
3. Dialog mounts, user interacts.
4. User clicks "Confirm" -> Promise resolves `true`.
5. User clicks "Cancel" -> Promise resolves `false`.
6. Dialog unmounts automatically, page execution resumes based on boolean result.

---

## Financial Lock Rules

Dialogs executing financial operations (e.g., Deposit, Withdraw, Trade Buy/Sell, Market Settlement) must apply strict visual and interaction constraints to preserve trust and prevent double-spending:

1. **Disable Backdrop Clicks**: Outside click handling must be disabled. Clicking the overlay mask must not close the dialog.
2. **Disable Escape Dismiss**: Keyboard Escape key handling must be disabled while processing is active.
3. **Explicit Close Action**: The dialog close button must be hidden or disabled during processing.
4. **Disabled Interactive Inputs**: While processing (in `Disabled` state), all inputs, checkboxes, sliders, and buttons must be set to `disabled`.
5. **No Route Interruption**: If a route change is attempted, route transitions must be blocked or the dialog must warn the user before destroying the session.
6. **Single-Outcome Exposure Enforcement**: In Trade Dialogs (`trade/confirm`, `trade/panel`), if a user currently holds an active position in one outcome (e.g. `NO`), the dialog must strictly block purchasing the opposite outcome (`YES`) until the user has fully exited their existing position. An outcome switch prompt ("Sell All NO Shares") must be displayed to resolve position collisions safely.

---

## Dialog Persistence Rules

Dialog lifecycles on page navigation and rerenders must follow these rules:

1. **Route Change Closing**: Controlled feature dialogs (e.g., Search, Filters) must automatically close on route changes to prevent outdated contexts.
2. **Transaction Persistence**: Financial dialogs (e.g., Deposit, Withdraw) that are actively executing transactions must stay open and complete their transaction lifecycle even if page routes change behind the overlay.
3. **Rerender Stability**: The Dialog Provider state must be decoupled from individual page rerenders. Dialogs must remain mounted and preserve input values during page data updates.

---

## URL Behavior

To maintain a clean user experience, URL routes and dialog states must remain separated:

- **Context Driven**: Reusable infrastructure dialogs, feature dialog inputs, and confirmations must be purely internal state/context driven. They must never push parameters or change URL hashes.
- **Route Driven**: Deep-linked, standalone full views (e.g., specific markets or profiles) must be route-driven.
- **No Mixing**: Feature dialogs must not bind states to URL queries.

---

## Design System & Animation Integration

All dialog layouts must strictly utilize tokens defined in `ui-context.md` and `design-system.md`.

- **Animation Tokens**: The Dialog Framework must consume easing curves (`ease-out`, `ease-in`) and duration values from `ui-context.md`. It must never declare raw millisecond values.
- **Sizing Tokens**: Dialog sizes are restricted to the following layouts:
  - **Small (`sm`)**: Max-width `400px` (alerts, notifications).
  - **Medium (`md`) / Default**: Max-width `640px` (trade panels, options).
  - **Large (`lg`)**: Max-width `768px` (market suggestion forms).
  - **Extra-Large (`xl`)**: Max-width `960px` (detailed admin logs).
  - **Full Screen**: `100vw` / `100dvh` (mobile large workflows).
  - **Bottom Sheet**: Width `100%`, max-height `90dvh` (mobile viewports).
  - **Side Sheet**: Width `320px` on desktop, `100%` on mobile.

---

## Dialog Variants

The Dialog Framework exposes six layout templates. Feature dialogs must select and compose one of these templates, rather than creating custom layout styles:

1. **Small Variant (`sm`)**: Optimized for simple notifications, warnings, and alerts.
2. **Medium Variant (`md`)**: Default template for forms and select options.
3. **Large Variant (`lg`)**: Multi-column layouts or complex detail summaries.
4. **Bottom Sheet Variant**: Pinned to mobile viewport bottom, supporting drag-down dismiss.
5. **Side Sheet Variant**: Slides in from the right edge, optimized for detail inspection.
6. **Full Screen Variant**: Covers the viewport completely, used for intensive mobile inputs.

---

## Dialog Regions Details

The framework is structured into fifteen distinct visual and functional regions:

```
Dialog Root
└── Portal
    └── Overlay (Backdrop)
        └── Container
            ├── Dialog Header
            │   ├── Title
            │   ├── Description
            │   └── Close Button
            ├── Scroll Area
            │   └── Dialog Body
            │       ├── Empty State
            │       ├── Loading State
            │       └── Error State
            └── Dialog Footer
                └── Actions
```

### 1. Dialog Root
- **Purpose**: Declarative parent node tracking active state, context links, and child components.
- **Parent**: `DialogProvider` target DOM node.
- **Children**: `Portal`.
- **Accessibility**: Controls `open` and `onOpenChange` state.
- **Responsive Behavior**: Mounts core handlers across all targets.
- **Ownership**: Reusable Dialog Infrastructure.

### 2. Overlay
- **Purpose**: Backdrop mask blocking interaction with application pages.
- **Parent**: `Portal`.
- **Children**: None.
- **Accessibility**: Aria-hidden layer. Screen readers skip focus.
- **Responsive Behavior**: Full viewport coverage. Blur reduction applied when user prefers reduced motion.
- **Ownership**: Reusable Dialog Infrastructure.

### 3. Portal
- **Purpose**: Mounts dialog elements directly into a dedicated root-level DOM element.
- **Parent**: `Dialog Root`.
- **Children**: `Overlay`, `Container`.
- **Accessibility**: Preserves logical tab ordering despite physical DOM placement.
- **Responsive Behavior**: Absolute coordinate mapping matches active viewport dimensions.
- **Ownership**: Reusable Dialog Infrastructure.

### 4. Container
- **Purpose**: Shell body holding header, scroll areas, and footers.
- **Parent**: `Overlay`.
- **Children**: `Dialog Header`, `Scroll Area` (or `Dialog Body`), `Dialog Footer`.
- **Accessibility**: Focus target. Serves as role="dialog" or role="alertdialog".
- **Responsive Behavior**: Desktop/Tablet: Center centered modal. Mobile: Bottom sheet container.
- **Ownership**: Reusable Dialog Infrastructure.

### 5. Header
- **Purpose**: Displays context-defining text and the close trigger.
- **Parent**: `Container`.
- **Children**: `Title`, `Description`, `Close Button`.
- **Accessibility**: Labeling container. Must not contain interactive buttons other than close triggers.
- **Responsive Behavior**: Fits container width. Padding shifts from 24px (desktop) to 16px (mobile).
- **Ownership**: Reusable Dialog Infrastructure.

### 6. Title
- **Purpose**: Displays the unique header question or summary.
- **Parent**: `Dialog Header`.
- **Children**: Plain text content.
- **Accessibility**: Automatically maps to `aria-labelledby` attributes.
- **Responsive Behavior**: Automatically scales typography size.
- **Ownership**: Reusable Dialog Infrastructure.

### 7. Description
- **Purpose**: Displays secondary supporting details.
- **Parent**: `Dialog Header`.
- **Children**: Plain text content.
- **Accessibility**: Automatically maps to `aria-describedby` attributes.
- **Responsive Behavior**: Truncation controls applied to prevent vertical bloat.
- **Ownership**: Reusable Dialog Infrastructure.

### 8. Body
- **Purpose**: Hosts customizable children containing specific feature components.
- **Parent**: `Scroll Area` or `Container`.
- **Children**: Custom content, `Empty State`, `Loading State`, `Error State`.
- **Accessibility**: Follows keyboard sequence of nested forms or tables.
- **Responsive Behavior**: Dynamically resizes to fill container height.
- **Ownership**: Custom Content Slot (owned by features).

### 9. Footer
- **Purpose**: Horizontal or vertical action strip.
- **Parent**: `Container`.
- **Children**: `Actions`.
- **Accessibility**: Standard layout tab ordering.
- **Responsive Behavior**: Desktop: Horizontal right-aligned buttons. Mobile: Stacks actions vertically, full-width.
- **Ownership**: Reusable Dialog Infrastructure.

### 10. Actions
- **Purpose**: Action execution buttons.
- **Parent**: `Dialog Footer`.
- **Children**: Buttons (Primary, Cancel, Danger, etc.).
- **Accessibility**: Focus indicators and touch targets.
- **Responsive Behavior**: Responsive buttons matching bottom sheet dimensions.
- **Ownership**: Custom Content Slot (composed from primitives).

### 11. Close Button
- **Purpose**: Explicit button for dismissing the dialog.
- **Parent**: `Dialog Header` or absolute positioned in `Container`.
- **Children**: Close Icon.
- **Accessibility**: `aria-label="Close"`. Keyboard focus target. Minimum touch target size 44x44px.
- **Responsive Behavior**: Repositions to top-right on desktop modal, or top-center pull bar on mobile bottom sheet.
- **Ownership**: Reusable Dialog Infrastructure.

### 12. Scroll Area
- **Purpose**: Restricts heights and scrolls overflowing text/forms.
- **Parent**: `Container`.
- **Children**: `Dialog Body`.
- **Accessibility**: Visual keyboard indicators for scroll controls.
- **Responsive Behavior**: Height capped at 60% viewport height on desktop, 50dvh on mobile.
- **Ownership**: Reusable Dialog Infrastructure.

### 13. Loading State
- **Purpose**: Displays skeletons or spinners during asynchronous loads.
- **Parent**: `Dialog Body`.
- **Children**: Skeleton layouts.
- **Accessibility**: `aria-busy="true"`.
- **Responsive Behavior**: Matches body size constraint.
- **Ownership**: Reusable Dialog Infrastructure.

### 14. Error State
- **Purpose**: Displays validation or communication error details.
- **Parent**: `Dialog Body`.
- **Children**: Error text and retry indicators.
- **Accessibility**: Exposes `role="alert"`.
- **Responsive Behavior**: Full-width container notification.
- **Ownership**: Reusable Dialog Infrastructure.

### 15. Empty State
- **Purpose**: Displays generic placeholder layout when lists inside dialogs return empty.
- **Parent**: `Dialog Body`.
- **Children**: Empty illustration and instruction copy.
- **Accessibility**: Read aloud description.
- **Responsive Behavior**: Centered item scaling.
- **Ownership**: Reusable Dialog Infrastructure.

---

## Dialog Lifecycle

The Dialog Framework transitions between nine distinct logical states:

1. **Closed**: State when dialog is unmounted. Zero footprint in DOM.
2. **Opening**: State when trigger open is registered. Overlay backdrop fades in, modal scales up (or bottom sheet slides up). Scroll lock is active. Focus trap is initialized.
3. **Opened**: Dialog is fully visible. Input fields receive primary focus. Escape key listeners are registered.
4. **Loading**: Content body displays skeleton structures. Interactive inputs are marked as read-only or hidden. Backdrop overlay remains interactive unless blocking lock is requested.
5. **Disabled**: Dialog remains fully visible, but all nested controls, action buttons, inputs, and close triggers are blocked. Backdrop clicks are ignored. Prevents interaction during pending transactions.
6. **Error**: Displays details of failed operations. The dialog footer displays retry options or error acknowledgment buttons. Close actions remain enabled.
7. **Success**: Displays visual confirmation. Automatically triggers close timeout, or displays confirmation actions.
8. **Closing**: Transition state when close trigger is fired. Outgoing animations run. Focus is returned to the original launching node.
9. **Destroyed**: Event state immediately preceding DOM removal. Context states reset.

---

## Performance Rules

To ensure fast interactions and lightweight bundle sizes:

1. **Lazy Mount**: Dialog contents must be lazy-mounted. Children within custom content slots must not compile or run effects until their specific dialog is set to `Opening` or `Opened`.
2. **Unmount on Close**: Closing a dialog must completely remove its nodes from the active DOM. Keeping hidden dialog nodes in the DOM is prohibited.
3. **State Preservation**: Dialogs must not preserve internal form state across close/open events unless the registry registration explicitly requests persistence (e.g. multi-step verification).
4. **Rerender Prevention**: Opening or closing a dialog must not trigger rerenders of parent layouts or sibling route pages. Provider states must be optimized with memoized callbacks.

---

## Accessibility Invariants

The framework enforces ten mandatory accessibility invariants:

1. **Focus Trapping**: Keyboard focus (Tab cycle) must remain trapped inside the active container. Users cannot focus elements in background pages.
2. **Restore Focus**: Focus must return to the element that triggered the dialog when the dialog closes.
3. **Keyboard Dismiss**: The Escape key must close the active dialog, unless the dialog state is set to `Disabled` or requires explicit safety confirmations.
4. **Outside Click Dismiss**: Pointer clicks outside the dialog boundary (overlay backdrop) must close the dialog, unless configured as a non-dismissible financial confirmation dialog.
5. **ARlA Labels**: `aria-labelledby` must reference the `Dialog Title` ID. `aria-describedby` must reference the `Dialog Description` ID.
6. **Contrast**: Text contrast ratios must meet WCAG AA standards (minimum 4.5:1 ratio).
7. **Touch Targets**: All interactive elements (close buttons, footers, filters) must provide a minimum touch target size of `44x44px`.
8. **Announcing Updates**: Status notifications (Loading, Error, Success) must utilize `aria-live` regions to notify screen readers dynamically.
9. **Reduced Motion**: If a user has enabled "Reduce Motion" in their operating system preferences, all animation fade, slide, and scale transitions must be replaced with instantaneous state changes.
10. **Background Screen Lock**: The standard screen reader viewport must restrict reading scopes exclusively to the active dialog target (using `aria-modal="true"`).

---

## Acceptance & Testing Criteria

The implementation is verified complete when the following automated and manual criteria are met:

### Automated Compiling
1. **TypeScript Build**: `npm run build` succeeds with zero errors.

### Infrastructure & State Integration
2. **Provider Scope**: Verify that only one `DialogProvider` exists at the root of the React tree.
3. **Registry Compliance**: Direct page imports of feature dialog components are absent. All global dialog components compile through the registry template mapping.
4. **Promise Integration**: Visual verification that calling `dialog.confirm()` successfully pauses logic, mounts the modal, and resolves with a boolean upon interaction.
5. **Queue Order**: Verify that triggering a system-level notification dialog during an active feature dialog forces stack replacement, and that queued dialogs open sequentially.

### Interactive Behaviors (Verification via Tests)
6. **Focus Trapping**: When a dialog is active, tabbing must cycle exclusively through internal focusable elements. Clicking background page items must be blocked.
7. **Restore Focus**: Focus returns to the trigger element.
8. **Escape Dismissal**: Pressing the `Escape` key closes standard dialogs.
9. **Outside Click**: Clicking the overlay mask backdrop closes standard dialogs.
10. **Financial Locks**: Clicking the backdrop or pressing the Escape key fails to dismiss active financial dialogs. All input forms and buttons are visually disabled while loading.
11. **Scroll Lock**: The main document body receives `overflow: hidden` when a dialog is visible, and the scroll attribute is immediately removed when the dialog closes.
12. **Router Dismiss**: Navigating to another route automatically dismisses active controlled dialogs, but preserves active transactional loading dialogs.
