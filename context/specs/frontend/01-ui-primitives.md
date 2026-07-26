# 01‑UI‑Primitives Specification

**Location:** `specs/frontend/01-ui-primitives.md`
**Owner:** Sheybi Design System

---

## Purpose

This specification defines the **UI primitives** – the lowest‑level reusable visual components that form the foundation of every page and feature in Sheybi. Once fully implemented, each primitive must render a consistent, accessible, and theme‑aware element that follows the design tokens, spacing, typography, and interaction rules defined in **`ui-context.md`** and **`wireframe.md`**.

Visible result: a library of fully‑styled primitives (e.g., Button, Card, Input, Avatar, Badge, Tooltip, Dialog, Tab, etc.) that can be imported by higher‑level domain components without any additional styling.

---

## Scope

### Included
- Definition and visual specification of every UI primitive listed under **`components/ui/`** (Button, Card, Input, etc.).
- Token usage (color, border, spacing, shadow, typography) for each primitive.
- Interaction states (default, hover, focus, active, disabled, loading).
- Accessibility requirements (ARIA roles/labels, focus management, keyboard navigation).
- Responsiveness rules (mobile‑first sizing, touch‑target minimums).
- Documentation of reusability expectations (when to extend vs. compose).

### Excluded
- Domain‑specific components that compose primitives (e.g., MarketCard, TradePanel, WalletBalance).
- Layout containers, page‑level layouts, and navigation structures.
- Business‑logic handling (validation, API calls, state management).
- Implementation code (the actual React/TSX files).
- Any future primitives not listed in the current component directory.

---

## Dependencies

| Dependency | Reason |
|------------|--------|
| `components/ui/*` (existing source files) | Already contain the concrete implementations of each primitive. |
| **Design tokens** from `ui-context.md` (color, spacing, border‑radius, shadow, typography) | Ensure visual consistency across all primitives. |
| **Wireframe definitions** from `wireframe.md` (component hierarchy, spacing gaps) | Align primitives with the intended layout structure. |
| **Code standards** from `code-standards.md` (naming, TypeScript, linting) | Guarantees that primitives meet project quality thresholds. |
| **Build plan** `build-plan.md` (frontend unit‑test suite) | Provides the test harness that validates each primitive. |
| **Progress tracker** `progress-tracker.md` (current implementation unit) | Confirms that UI primitive work is the active target. |

No new external packages are required; all primitives extend **shadcn/ui** and **Radix UI** which are already declared in `package.json`.

---

## Design

### Component Hierarchy
```
UI Primitives (components/ui)
├─ Avatar
├─ Badge
├─ Button
│   ├─ Primary
│   ├─ Secondary
│   ├─ Success
│   └─ Danger
├─ Card
├─ Dialog
├─ DropdownMenu
├─ Input
├─ Label
├─ ScrollArea
├─ Separator
├─ Sheet
├─ Skeleton
├─ Sonner (toast)
├─ Tabs
├─ Textarea
└─ Tooltip
```
All primitives are **atomic** (no children) except `Button` (variant wrapper) and `Tabs` (container + tab items).

### Visual Hierarchy
- **Surfaces**: Use `--bg-surface` for default background, `--bg-hover` for hover, `--bg-active` for active.
- **Borders**: `--border-default` (rest), `--border-hover`, `--border-active`.
- **Shadows**: Soft card shadow (`shadow-sm` from design tokens) only on `Card`; no shadow on `Button` or `Tooltip`.
- **Border‑Radius**: Follow the **Border Radius Scale** (e.g., `rounded-xl` for Button, `rounded-2xl` for Card).

### Typography Usage
- **Body text**: `--font-sans` (Inter) – default for all primitives.
- **Numeric data** (prices, probabilities, odds): `--font-sans` (Inter SemiBold/Bold) – used in `Badge` (e.g., market odds), wallet balances, and numeric displays.
- Font sizes follow the **Font Sizes** token table (`sm`, `base`, `lg`, etc.) appropriate to the primitive’s hierarchy level.

### Spacing Rules
- Base spacing unit is **`sm` = 8 px**.
- Primitive internal padding follows the **Spacing Scale** (e.g., Button padding `px-4 py-2` → 16 px × 8 px = 128 px total vertical‑horizontal).
- Minimum external gap between adjacent primitives is **`md` = 12 px** (per wireframe component spacing).

### Responsive Behaviour
- All primitives are **mobile‑first**.
- Touch target minimum **44 px** (WCAG) – achieved via padding and min‑height.
- Widths default to **100 %** of container unless a specific size token is applied (e.g., `Button` can be `w-auto` or `w-full`).
- No breakpoint‑specific styling is required for primitives; they inherit layout responsiveness from parent containers.

### States
| Primitive | States (required) |
|-----------|-------------------|
| Button | default, hover, focus, active, disabled, loading |
| Input | default, hover, focus, disabled, error, success |
| Card | default, hover, focus (for keyboard), selected (when used as selectable) |
| Tooltip | visible (on hover/focus), hidden |
| Dialog | open, closed, focus‑trap active |
| Tabs | default, selected, hover, focus |
| Badge | default, hover (optional), focus (optional) |
| Avatar | default, fallback (initials) |
| DropdownMenu | closed, open, item‑hover, item‑selected |
| Separator / Divider | N/A |
| Skeleton | loading, animated placeholder |
| Sonner (toast) | entering, visible, exiting |

All states must be expressed **solely through design tokens** (color, border, background) – no ad‑hoc CSS values.

### Accessibility
- **ARIA roles** mapped to primitive purpose (`button`, `dialog`, `tablist`, `tab`, `tooltip`, `menu`, `menuitem`, `alert` for toast, etc.).
- **Keyboard navigation**: Tab‑order, Arrow‑key navigation for Tabs and DropdownMenu, Escape to close Dialog and Tooltip.
- **Focus indicator**: Visible outline using `--border-active` with at least 2 px width.
- **Contrast**: All foreground/background combinations must meet WCAG AA (≥ 4.5:1). Tokens already satisfy this; verify when combining.
- **Labeling**: `Input` must have an associated `<label>` (via `Label` primitive) and `aria-describedby` for validation messages.

---

## Structure

| Primitive | Purpose | Typical Parent(s) | Children (if any) | Reusability |
|-----------|---------|-------------------|-------------------|-------------|
| **Avatar** | Visual identity (user photo or initials) | Header, Profile card, Comment list | Optional `<img>` or fallback text | Stateless, can be used anywhere |
| **Badge** | Small status or tag (e.g., market outcome, token) | Card header, Button, List item | Text node (optional icon) | Extend via variant props |
| **Button** | Primary UI actions | Forms, Cards, Dialog footers, Nav bars | May contain `Icon` + `Label` | Variants: primary, secondary, success, danger |
| **Card** | Contained surface for grouping content | Pages, Lists, Modals | Header, Body, Footer (any primitives) | Layout‑agnostic, can be selected |
| **Dialog** | Modal overlay for confirmation / detail | Any page | Title, Content, Action buttons | Auto‑focus trap, dismissable |
| **DropdownMenu** | Contextual list of actions | Nav bar, Card actions | Menu items (Label + optional Icon) | Keyboard‑navigable |
| **Input** | Form field entry | Forms, Search bars | `Label`, optional `Icon`, validation message | Supports text, number, email types |
| **Label** | Text label for inputs or groups | Input, Checkbox, Radio | Plain text | Must be linked via `htmlFor` |
| **ScrollArea** | Scrollable container with custom scrollbar | Long lists, modal bodies | Any primitives | Preserve focus within |
| **Separator** | Visual divider | Lists, Card sections | N/A | Horizontal/vertical variants |
| **Sheet** | Persistent side panel (mobile bottom sheet) | Layouts, Settings | Header, Content, Footer | Responsive: slides from side or bottom |
| **Skeleton** | Loading placeholder | Any content awaiting data | N/A | Configurable width/height |
| **Sonner** | Toast / notification | Global app layer | Text, optional action button | Auto‑dismiss with ARIA live region |
| **Tabs** | Tabbed navigation container | Page sections, settings | TabList + TabPanel (each panel contains primitives) | Keyboard Arrow navigation |
| **Textarea** | Multi‑line text input | Forms, comments | `Label`, validation | Same accessibility as Input |
| **Tooltip** | Contextual hover/focus hint | Buttons, icons, badges | Text node (optional rich content) | Appears on hover/focus, dismissed on blur |

---

## Behaviour

- **Hover** – Change background to `--bg-hover` (or accent hover token for buttons). Add subtle elevation where defined (e.g., Card hover adds `box‑shadow‑md`).
- **Focus** – Show `--border-active` outline; for interactive primitives, also set `box‑shadow` to a focus ring (`0 0 0 2px var(--border-active)`).
- **Active/Pressed** – Switch to `--bg-active` (or accent active token).
- **Disabled** – Reduce opacity to 0.5, remove hover/focus interactions, set `cursor: not-allowed`.
- **Loading** – For Button, replace label with `Skeleton` spinner, keep button size unchanged. Input shows `Skeleton` placeholder inside.
- **Keyboard Navigation** –
  - **Button**: `Enter`/`Space` triggers click.
  - **Tabs**: Arrow keys move focus, `Enter` selects.
  - **DropdownMenu**: `Esc` closes, `ArrowDown/Up` traverses items.
  - **Dialog**: `Esc` closes (unless destructive confirmation).
- **Animation** – All state transitions use the **Animation Rules** from `ui-context.md`: max 200 ms, fade or slide. No bounce or elastic effects.
- **Accessibility** –
  - `aria-live="polite"` for toast (`Sonner`).
  - `role="dialog"` with `aria-modal="true"` for Dialog.
  - `aria-controls` and `aria-expanded` for DropdownMenu trigger.
  - `role="tablist"` / `role="tab"` for Tabs, with `aria-selected`.

---

## Acceptance Criteria

- **Visual**: Every primitive renders exactly as defined in the Design section, using only tokens from `ui-context.md`.
- **Responsive**: Primitives respect minimum touch target (≥ 44 px) and adapt fluidly to container width.
- **Accessibility**: All required ARIA attributes are present; keyboard navigation works for focusable primitives; contrast ratios meet WCAG AA.
- **State Coverage**: All listed interaction states are implemented and visibly distinct.
- **No Duplicates**: No primitive is duplicated elsewhere in the component library.
- **Static Analysis**: `npm run lint` reports zero errors/warnings for the `components/ui` directory.
- **Type Checking**: TypeScript compilation succeeds (`npm run build` or `npm run dev` shows no type errors).
- **Testing**: Unit tests for each primitive (snapshot + interaction) pass (`npm test` or the project’s CI test command).
- **Documentation**: The `01-ui-primitives.md` file fully describes each primitive as per this specification; no conflicting information exists in other spec files.

---

## Out of Scope

- **Domain components** such as MarketCard, TradePanel, WalletBalanceCard, Portfolio lists, Admin tables.
- **Page layouts** (Home, Market Details, Wallet, Portfolio, Admin Dashboard) – covered in later specs.
- **Navigation components** (Topbar, BottomNav) – separate specification.
- **Authentication UI**, **Wallet flow**, **Trading interactions**, **Data fetching**, **State management** (Redux, React Query).
- **Animations beyond the simple fade/slide** described in `ui-context.md`.

---

*This document is the single source of truth for UI primitives. Any future changes to primitives must be reflected here and synchronized with the component implementations.*