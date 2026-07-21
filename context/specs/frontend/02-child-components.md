# 02‑Child‑Components Specification

**Location:** `specs/frontend/02-child-components.md`
**Owner:** Sheybi Design System

---

## Purpose

This specification defines **reusable child UI components** that will be composed into parent components. The visible result is a complete library of low‑level, theme‑aware building blocks that can be imported by feature modules throughout the application.

---

## Scope

Only **child components** are covered. Examples include but are not limited to:

- Primary Button, Secondary Button, Ghost Button, Icon Button
- Market Status Badge, Probability Badge, Category Badge
- Avatar, User Avatar, Logo, Brand Mark
- Search Input, Search Icon
- Label, Helper Text
- Divider, Separator
- Countdown Timer, Notification Dot
- Market Outcome Chip, Percentage Indicator
- Statistic Value, Statistic Label
- Empty Illustration, Skeleton Block, Skeleton Text, Skeleton Avatar, Skeleton Card
- Loading Indicator (Skeleton only), Error Indicator, Success Indicator
- Navigation Icon, Card Image, Market Thumbnail
- Share Icon, Bookmark Icon, Favorite Icon

Parent components, layouts, pages, dialogs, navigation regions, business logic, authentication, prediction logic, and wallet functionality are **out of scope** and belong to later specifications.

---

## Dependencies

**Completed Build Units** – 01‑UI‑Primitives (`specs/frontend/01-ui-primitives.md`).

**Required Specifications** – `ui-context.md`, `wireframe.md`, `build-plan.md`.

**Required Packages** – All packages required by Unit 01 (shadcn/ui, Radix UI, Tailwind CSS) are already declared in `package.json`. No new packages will be added.

---

## Design

All visual decisions must follow the tokens, spacing, typography, colour, border‑radius, shadow, and animation rules defined in **`ui-context.md`** and the component layout defined in **`wireframe.md`**. Every child component must:

- Use semantic colour tokens only.
- Respect the **base spacing = 8 px** and the spacing scale.
- Apply the appropriate **border‑radius** from the radius scale.
- Use the prescribed **font families** (`--font-sans` for UI text, `--font-mono` for numeric data).
- Follow the **mobile‑first** approach; breakpoints only adjust container width.
- Provide the required interaction **states** (default, hover, focus, active, disabled, loading/selected where applicable).
- Meet the **accessibility** rules (minimum 44 px touch target, WCAG AA contrast, keyboard navigation, ARIA attributes).

No Tailwind utility classes are described; the spec only describes intent.

---

## Structure

Each child component is described using the following sub‑sections.

### Purpose

What visual problem the component solves.

### Used By

Parent components (or layout sections) that will import this child component. References are listed as the specification file name for the parent (e.g., `03-parent-components.md`).

### Variants

If the component has size or style variants (e.g., Primary / Secondary, Small / Medium / Large).

### States

All interactive or visual states required.

### Responsive Behaviour

How the component adapts on **Desktop**, **Tablet**, and **Mobile**.

### Accessibility

Keyboard interaction, required ARIA roles/attributes, focus visibility, and touch‑target sizing.

---

## Behaviour

Only UI interaction behaviour is described (hover, focus, pressed, loading, disabled, keyboard interaction, touch interaction). No business logic or backend behaviour is included.

---

## Acceptance Criteria

- Every child component listed in this document **exists** as a source file under `components/ui/` or `components/child/`.
- Each component implements **all required states** and they are visually distinct.
- Components respect the **responsive rules** defined in `ui-context.md`.
- All components follow the **accessibility rules** (ARIA, focus indicator, contrast, touch target).
- No duplicate child components are present in the codebase.
- `npm run lint` reports zero errors for the child component directories.
- TypeScript compilation succeeds (`npm run dev` shows no type errors).
- Unit tests for each child component (snapshot + interaction) pass.

---

## Out of Scope

- Parent components → `03-parent-components.md`
- Layouts → `04-layouts.md`
- Routed pages → `05-pages.md`
- Dialogs → `06-dialogs.md`
- Authentication, Markets, Wallet, Trading, Portfolio, Community, Administration, any business or prediction logic.

---

## Cross‑Document Responsibilities

- **Visual language** – `ui-context.md`
- **Visual blueprint** – `wireframe.md`
- **Build order** – `build-plan.md`
- **User journeys** – `user-flow.md`
- **Architecture** – `architecture.md`

---

## Existing Work Check

The following child components already exist as UI primitives and will be **re‑used** rather than re‑implemented:

| Existing File | Component | Notes |
|---|---|---|
| `components/ui/avatar.tsx` | Avatar / User Avatar | Provides image fallback and size variants. |
| `components/ui/badge.tsx` | Market Status Badge, Probability Badge, Category Badge | Badge variants will be configured via props. |
| `components/ui/button.tsx` | Primary, Secondary, Ghost, Icon Button | Button variants already defined. |
| `components/ui/input.tsx` | Search Input, generic Input | Supports placeholder, label, validation. |
| `components/ui/label.tsx` | Label, Helper Text | Provides accessible association with inputs. |
| `components/ui/separator.tsx` | Divider / Separator | Horizontal/vertical options. |
| `components/ui/tooltip.tsx` | Tooltip (used for icons, helper). | |
| `components/ui/skeleton.tsx` | Skeleton Block, Text, Avatar, Card | Loading placeholders. |
| `components/ui/dialog.tsx` | Loading Indicator (modal wrapper) – used for error/success dialogs. |
| `components/ui/tabs.tsx` | Navigation Icon (tab‑style) – can serve as icon navigation. |
| `components/ui/textarea.tsx` | Helper Text area (if needed). |

Components that **do not yet exist** and must be added:

- **Countdown Timer** – a visual timer that displays remaining seconds/minutes.
- **Notification Dot** – small circular indicator for unread notifications.
- **Market Outcome Chip** – styled chip showing market result (Yes/No).
- **Percentage Indicator** – shows a numeric percentage with colour coding.
- **Statistic Value / Statistic Label** – paired components for numeric metrics.
- **Empty Illustration** – placeholder illustration for empty states.
- **Error Indicator** – inline error icon with message.
- **Success Indicator** – inline success icon with message.
- **Navigation Icon** – generic icon button for navigation (e.g., back, close).
- **Card Image / Market Thumbnail** – image component with fixed aspect ratio.
- **Share Icon, Bookmark Icon, Favorite Icon** – SVG icon wrappers (stroke‑only).

All new components will be placed under `components/child/` following the folder‑boundary rule (UI primitives stay in `components/ui/`).

---

## Child Component Catalog

### Avatar (Existing)
**Purpose**: Visual identity for users or entities.
**Used By**: Header, Profile Card, Comment List, Market Card.
**Variants**: Small, Medium, Large (size tokens `sm`, `base`, `lg`).
**States**: Default, Fallback (initials), Loading.
**Responsive Behaviour**: Scales with parent container; retains minimum 44 px touch target.
**Accessibility**: `role="img"` with `alt` attribute; focusable when clickable.

### Badge (Existing)
**Purpose**: Small status or tag (e.g., market outcome, category).
**Used By**: Market Card header, Button (status), List items.
**Variants**: Primary, Secondary, Success, Danger, Warning (colour token).
**States**: Default, Hover (optional), Focus.
**Responsive Behaviour**: Inline; width adapts to content.
**Accessibility**: `role="status"` when conveying information; sufficient colour contrast.

### Button (Existing)
**Purpose**: Primary UI actions.
**Used By**: Forms, Card footers, Dialog actions, Navigation.
**Variants**: Primary, Secondary, Ghost, Icon.
**States**: Default, Hover, Focus, Active, Disabled, Loading.
**Responsive Behaviour**: `w-auto` or `w-full` via utility; min‑height 44 px.
**Accessibility**: `role="button"`, accessible label, focus outline using `--border-active`.

### Input (Existing)
**Purpose**: Text, number, or email entry.
**Used By**: Search bar, forms, numeric fields.
**Variants**: Standard, Search (with icon), Disabled, Error, Success.
**States**: Default, Hover, Focus, Disabled, Error, Success.
**Responsive Behaviour**: 100 % width of container; min‑height 44 px.
**Accessibility**: Associated `<label>` via `htmlFor`; `aria-describedby` for validation messages.

### Label (Existing)
**Purpose**: Text label for inputs or groups.
**Used By**: Input, Textarea, Checkbox, Radio.
**Variants**: Small, Medium, Large (font size tokens).
**States**: Default.
**Responsive Behaviour**: Fluid width.
**Accessibility**: Must be linked to control via `htmlFor`.

### Divider / Separator (Existing)
**Purpose**: Visual separation between sections.
**Used By**: Card sections, lists, forms.
**Variants**: Horizontal, Vertical.
**States**: N/A.
**Responsive Behaviour**: Full width horizontally; thickness defined by token.
**Accessibility**: `role="separator"`.

### Tooltip (Existing)
**Purpose**: Contextual hint on hover/focus.
**Used By**: Icons, Buttons, Badges.
**Variants**: Default, Error (red background).
**States**: Visible, Hidden.
**Responsive Behaviour**: Appears on hover/focus; positions adapt to viewport edges.
**Accessibility**: `role="tooltip"`; appears on focus.

### Skeleton (Existing)
**Purpose**: Loading placeholder.
**Used By**: Avatar, Card, Text blocks, Images.
**Variants**: Block, Text, Avatar, Card.
**States**: Loading (animated), Done.
**Responsive Behaviour**: Matches size of replaced component.
**Accessibility**: `aria-hidden="true"`.

### Countdown Timer (New)
**Purpose**: Show remaining time for market closing or offers.
**Used By**: Market Card footer, Trade Panel.
**Variants**: Small, Large.
**States**: Running, Paused, Completed.
**Responsive Behaviour**: Inline text; font scales with parent.
**Accessibility**: `role="timer"`; live region updates (`aria-live="polite"`).

### Notification Dot (New)
**Purpose**: Indicate unread notifications.
**Used By**: Notification Button, Header icons.
**Variants**: Default (primary colour), Alert (error colour).
**States**: Visible, Hidden.
**Responsive Behaviour**: Positioned top‑right of parent icon; size 8 px.
**Accessibility**: `aria-label="unread notifications"` when visible.

### Market Outcome Chip (New)
**Purpose**: Display market result (Yes/No) with colour.
**Used By**: Market Card, Trade Summary.
**Variants**: Yes (green), No (red), Pending (grey).
**States**: Default, Hover.
**Responsive Behaviour**: Inline, auto‑width.
**Accessibility**: `role="status"` with clear text.

### Percentage Indicator (New)
**Purpose**: Show a numeric percentage with colour coding.
**Used By**: Statistics section, Market probability.
**Variants**: Low (red), Medium (orange), High (green).
**States**: Default.
**Responsive Behaviour**: Inline; font size based on token.
**Accessibility**: Text readable; colour is supplemental.

### Statistic Value / Statistic Label (New)
**Purpose**: Paired display of a metric and its description.
**Used By**: Dashboard, Portfolio summary.
**Variants**: Value (large), Label (small).
**States**: Default.
**Responsive Behaviour**: Stack vertically on mobile, side‑by‑side on desktop.
**Accessibility**: Proper heading hierarchy; readable text.

### Empty Illustration (New)
**Purpose**: Visual placeholder when no data is available.
**Used By**: Empty state screens across features.
**Variants**: Light, Dark mode versions.
**States**: Static.
**Responsive Behaviour**: Scales to container width, maintains aspect ratio.
**Accessibility**: `role="img"` with descriptive `alt` text; hidden from screen readers if decorative (`aria-hidden="true"`).

### Error Indicator (New)
**Purpose**: Inline error icon with message.
**Used By**: Form fields, notification area.
**Variants**: Inline, Toast.
**States**: Visible, Hidden.
**Responsive Behaviour**: Aligns with adjacent text.
**Accessibility**: `role="alert"`; `aria-live="assertive"`.

### Success Indicator (New)
**Purpose**: Inline success icon with message.
**Used By**: Form confirmation, toast.
**Variants**: Inline, Toast.
**States**: Visible, Hidden.
**Responsive Behaviour**: Same as error indicator.
**Accessibility**: `role="status"`; `aria-live="polite"`.

### Navigation Icon (New)
**Purpose**: Icon‑only button for navigation actions (back, close, menu).
**Used By**: Header, dialogs, mobile sheets.
**Variants**: Primary (accent colour), Secondary (muted).
**States**: Default, Hover, Focus, Disabled.
**Responsive Behaviour**: Fixed 44 px touch target; scales with icon size tokens.
**Accessibility**: `aria-label` describing action; `role="button"`.

### Card Image / Market Thumbnail (New)
**Purpose**: Display a fixed‑aspect‑ratio image inside cards.
**Used By**: Market Card, Feature Card.
**Variants**: Small, Large.
**States**: Default, Loading (skeleton), Error.
**Responsive Behaviour**: Width 100 %, height auto; maintains 16:9 ratio.
**Accessibility**: `alt` attribute required; `role="img"`.

### Share Icon, Bookmark Icon, Favorite Icon (New)
**Purpose**: Stroke‑only icons for social actions.
**Used By**: Market Card actions, Toolbar.
**Variants**: Default (primary accent), Active (selected state via colour change).
**States**: Default, Hover, Active (selected).
**Responsive Behaviour**: 20 px icon size; clickable area 44 px.
**Accessibility**: `aria-label` describing action; `role="button"`.

---

## Behaviour Summary

- **Hover** – Background or colour changes to hover token; subtle elevation where defined.
- **Focus** – Visible outline using `--border-active` (2 px) and optional focus ring.
- **Active/Pressed** – Background switches to active token.
- **Disabled** – Opacity 0.5, cursor not‑allowed, no hover/focus.
- **Loading** – Spinner or skeleton placeholder replaces content; size remains constant.
- **Keyboard Interaction** – `Enter`/`Space` activates Buttons; Arrow keys navigate Tabs and DropdownMenu; `Esc` closes Dialogs and Tooltips.
- **Touch Interaction** – Tap triggers same as click; target size ≥ 44 px.

---

## Acceptance Criteria (re‑stated)

1. Every child component listed above **exists** in the codebase.
2. All components implement the **states**, **responsive behaviour**, and **accessibility** specifications.
3. No duplicate implementations of the same visual element exist.
4. Linting and TypeScript checks pass without errors.
5. Unit tests for each component (snapshot and interaction) pass.
6. Visual inspection confirms adherence to `ui-context.md` tokens and `wireframe.md` layout.

---

*This document is the single source of truth for reusable child components. Any future changes must be reflected here and synchronized with the implementation.*