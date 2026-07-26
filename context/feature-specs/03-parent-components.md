# 03‑Parent‑Components Specification

**Location:** `context/feature-specs/03-parent-components.md`
**Owner:** Sheybi Design System
**Build Unit:** Unit 03 — Parent Components

---

## Purpose

This specification defines every reusable parent component that composes the Sheybi interface using previously completed child components and UI primitives.

The visible result when implementation is complete: every reusable parent component required by the application exists, is responsive, follows the visual blueprint defined in `wireframe.md`, and is ready to be assembled into layouts and pages.

---

## Scope

This specification covers only reusable parent components.

The following parent components are included:

1. Hero Banner
2. Market Card
3. Market Feed
4. Wallet Card
5. Portfolio Card
6. Statistic Card
7. Activity Card
8. Category Tabs
9. Section Header
10. Trade Panel
11. Search Result Card
12. Notification Item
13. Profile Summary Card

Each parent component must be composed only from:

- Existing UI primitives (`components/ui/`)
- Existing child components (`components/child/`)
- Existing design tokens (`globals.css`)

### Excluded

- Routed pages → `05-pages.md`
- Layouts → `04-layouts.md`
- Dialogs → `06-dialogs.md`
- Navigation components (Header, Sidebar, Bottom Navigation) → `04-layouts.md`
- Business logic → `prediction-engine.md`
- Authentication → `07-authentication.md`
- API behaviour → `api-contracts.md`
- Prediction logic → `prediction-engine.md`
- Database behaviour → `database-schema.md`
- Server actions → backend specifications
- State management → feature specifications
- Feature implementation → backend specifications

If another specification owns something, this document references it instead of redefining it.

---

## Dependencies

### Completed Build Units

- `01-ui-primitives.md` — shadcn/ui components, theme provider, design tokens.
- `02-child-components.md` — child components in `components/child/`.

### Required Specifications

- `ui-context.md` — visual language, colour tokens, typography, spacing, shadows, accessibility.
- `wireframe.md` — visual blueprint, component hierarchy, responsive behaviour.
- `build-plan.md` — build order and unit dependencies.
- `01-ui-primitives.md` — UI primitive definitions and existing files.
- `02-child-components.md` — child component definitions and existing files.

### Required Packages

All packages required by this specification are already declared in `package.json` by previous build units:

- `next` (App Router)
- `react`
- `tailwindcss`
- `@radix-ui/*`
- `lucide-react`
- shadcn/ui components
- `class-variance-authority`
- `clsx`
- `tailwind-merge`

No new packages will be introduced.

---

## Available Building Blocks

### UI Primitives (`components/ui/`)

| File | Component |
|---|---|
| `avatar.tsx` | Avatar |
| `badge.tsx` | Badge |
| `button.tsx` | Button (Primary, Secondary, Ghost, Icon) |
| `card.tsx` | Card, CardHeader, CardContent, CardFooter |
| `input.tsx` | Input |
| `label.tsx` | Label |
| `scroll-area.tsx` | ScrollArea |
| `separator.tsx` | Separator |
| `skeleton.tsx` | Skeleton |
| `tabs.tsx` | Tabs, TabsList, TabsTrigger, TabsContent |
| `tooltip.tsx` | Tooltip |

### Child Components (`components/child/`)

| File | Component |
|---|---|
| `countdown-timer.tsx` | CountdownTimer |
| `notification-dot.tsx` | NotificationDot |
| `market-outcome-chip.tsx` | MarketOutcomeChip |
| `percentage-indicator.tsx` | PercentageIndicator |
| `statistic-display.tsx` | StatisticDisplay (StatisticValue + StatisticLabel) |
| `empty-illustration.tsx` | EmptyIllustration |
| `error-indicator.tsx` | ErrorIndicator |
| `success-indicator.tsx` | SuccessIndicator |
| `navigation-icon.tsx` | NavigationIcon |
| `card-image.tsx` | CardImage |
| `action-icon.tsx` | ActionIcon (Share, Bookmark, Favorite) |

---

## Design

All visual decisions must follow the tokens, spacing, typography, colour, border-radius, shadow, and animation rules defined in `ui-context.md` and the component layout defined in `wireframe.md`.

Every parent component must:

- Use semantic colour tokens only. Raw hex values are forbidden.
- Respect the base spacing scale (8 px base) defined in `ui-context.md`.
- Apply the card border-radius (`rounded-2xl`) for card-based components.
- Use `--font-sans` for UI text and `--font-mono` for numeric/financial data.
- Follow the mobile-first responsive approach.
- Provide all required visual states (default, hover, focus, loading, empty, disabled where applicable).
- Meet the accessibility rules (44 px minimum touch target, WCAG AA contrast, keyboard navigation, ARIA attributes).
- Use soft shadows only for card elevation.
- Enforce a minimum 24 px gap between adjacent cards.
- Follow the animation rules: maximum 200 ms duration, allowed transitions are fade, slide, opacity, and background.

---

## Structure

All parent components will be placed under `components/parent/`. Each component will have its own file following the kebab-case naming convention.

---

### 1. Hero Banner

#### Purpose

Introduce the current screen or highlight important platform content. Always appears as the first visual element on the Landing page and Dashboard.

#### Parent

- Landing Page
- Dashboard

#### Children

- `Card` (UI primitive — container)
- `Button` (UI primitive — Primary and Secondary variants)
- `CardImage` (child component — promotional image)

#### Reusable Elements

- Card surface for background container
- Primary Button for the primary call-to-action
- Secondary Button for the optional secondary action
- CardImage for the promotional illustration

#### Composition Rules

- The banner occupies full content width.
- Desktop: two-column layout. Text content on the left, image on the right. Both regions vertically centered.
- Tablet: two-column layout with reduced image sizing.
- Mobile: single-column stacked layout. Text content above, image below.
- Text region contains a headline (headline-lg typography), supporting description (body-md typography), and a maximum of two action buttons arranged horizontally.
- Image region must never overlap the text region.
- Maximum one primary action. Maximum one secondary action.
- Internal padding follows card-padding-lg (20 px).
- Background uses `--bg-surface`.

#### Behaviour

- Hover: no interaction on the banner container.
- Buttons follow standard button hover/focus/active states.
- Loading: skeleton placeholder matching banner dimensions.
- Empty: banner must not render when no content is available.

#### Responsive Behaviour

- Desktop: two-column layout, image visible.
- Tablet: two-column layout, image reduced.
- Mobile: single-column stacked, simplified content.

#### Accessibility

- Banner landmark with `role="banner"` or semantic `<section>`.
- Heading hierarchy preserved (single `<h1>` or `<h2>` depending on page context).
- Action buttons keyboard accessible.

---

### 2. Market Card

#### Purpose

Display a single prediction market as a compact, interactive card based on the 3 Figma render variants (`1v1`, `binary`, `multi_option`). The Figma render designs serve as the **sole, singular source of truth** for all Market Cards across the application.

#### Parent

- Market Feed
- Featured Markets section
- Trending Markets section
- Dashboard
- Landing Page

#### Children

- `Card` (UI primitive)
- `RatioBar` (child component — dual color Green/Yellow split progress bar)
- `OddsButton` (child component — outcome display button e.g., `Yes 1k -> 3k`, `No 1k -> 5k`)

#### Variant Structure

1. **1v1 Matchup Card (`1v1`)**:
   - Title: Inter font (`font-bold` / `font-black`, white `#FFFFFF`).
   - Contestants: Left headshot avatar, centered `"VS"` label, right headshot avatar.
   - RatioBar: Green (`#30D878`) left, Yellow (`#FFC91F`) right.
   - OddsButtons: `Yes 1k -> 3k` (green text) and `No 1k -> 5k` (yellow text).

2. **Binary Yes/No Card (`binary`)**:
   - Title: Inter font (`font-bold` / `font-black`, white `#FFFFFF`).
   - RatioBar: Green left, Yellow right.
   - OddsButtons: `Yes 1k -> 3k` and `No 1k -> 5k`.

3. **Multiple Options Card (`multi_option`)**:
   - Title: Inter font (`font-bold` / `font-black`, white `#FFFFFF`).
   - Outcome Rows: Stacked inner rows with contestant avatar, contestant name, and outcome button (`Yes 1k -> 3k`).
   - Footer: `see more ...` expander link.

#### Behaviour & Navigation

- **Unified Navigation**: The entire card acts as a link navigating directly to `/markets/[id]`.
- **Pure UI Focus**: Presentation-only component with typed props and extensive comments (`/** DB INTEGRATION NOTE: ... */`) for future database connection.

#### Responsive Behaviour

- Desktop: fixed width within grid columns.
- Tablet: flexible width within two-column grid.
- Mobile: full content width, single column.

#### Accessibility

- Card is an `<article>` element.
- Card title is a heading element wrapped in a link to Market Details.
- Card image is a link to Market Details.
- Interactive elements (button, action icons, title link, image link) are keyboard focusable.
- Card links use `aria-label` describing the market.
- Financial values use `--font-mono`.

---

### 3. Market Feed

#### Purpose

Display a collection of Market Cards in a responsive grid layout. This is the primary container for browsing markets.

#### Parent

- Landing Page
- Dashboard
- Markets Page

#### Children

- Market Card (parent component — defined above)
- `Skeleton` (UI primitive — for loading state)
- `EmptyIllustration` (child component — for empty state)

#### Reusable Elements

- Market Card instances
- Skeleton placeholders during loading
- EmptyIllustration when no markets exist

#### Composition Rules

- Feed displays Market Cards in a responsive grid.
- Desktop: 3 to 4 columns.
- Tablet: 2 columns.
- Mobile: 1 column.
- Equal spacing between cards: 24 px gap (section-gap).
- Feed occupies full available content width.
- No nested scrolling. Feed participates in the parent page scroll.
- Cards align to the top of each row.

#### Behaviour

- Loading: displays skeleton Market Cards matching the grid layout (minimum 3 skeletons on desktop, 2 on tablet, 1 on mobile).
- Empty: displays EmptyIllustration centered within the feed container with a descriptive message and optional action button.
- Scrolling: vertical scrolling within the parent page scroll container.

#### Responsive Behaviour

- Desktop: multi-column grid (3–4 columns).
- Tablet: two-column grid.
- Mobile: single-column list, cards span full width.

#### Accessibility

- Feed container uses `role="feed"` or a semantic list.
- Each Market Card is an independent article.
- Keyboard navigation between cards is supported.

---

### 4. Wallet Card

#### Purpose

Display wallet balance overview with primary financial metrics. Appears as the primary wallet information component.

#### Parent

- Wallet Page
- Wallet Dialog
- Dashboard (wallet summary region)

#### Children

- `Card`, `CardHeader`, `CardContent`, `CardFooter` (UI primitives)
- `StatisticDisplay` (child component — balance values)
- `Badge` (UI primitive — status indicator)
- `Button` (UI primitive — deposit and withdraw actions)

#### Reusable Elements

- Card container with `rounded-2xl` border radius
- StatisticDisplay for Available Balance (primary, largest), Locked Balance, and Portfolio Value
- Badge for wallet status
- Primary Button for Deposit action
- Secondary Button for Withdraw action

#### Composition Rules

- Card layout is vertical:
  1. CardHeader — "Wallet" title (headline-md) and wallet status Badge
  2. CardContent — primary Available Balance using StatisticDisplay (headline-lg size, `--font-mono`), secondary metrics row showing Locked Balance and Portfolio Value as smaller StatisticDisplays
  3. CardFooter — Deposit Button and Withdraw Button side by side with equal width
- Available Balance must be the visually dominant element.
- All monetary values must use `--font-mono`.
- Background uses `--bg-surface`.
- Internal padding: card-padding-lg (20 px).

#### Behaviour

- Hover: card background elevates to `--bg-hover`.
- Loading: skeleton placeholder matching card dimensions.
- Empty: displays zero balances formatted as ₦0.00.
- Buttons follow standard button states.

#### Responsive Behaviour

- Desktop: fixed width within layout grid.
- Tablet: flexible width.
- Mobile: full content width.

#### Accessibility

- Balance values are announced to screen readers.
- Monetary values include currency symbol.
- Buttons are keyboard accessible.
- `aria-label` on balance regions describing the metric.

---

### 5. Portfolio Card

#### Purpose

Display portfolio performance summary with key metrics. Appears as the primary portfolio overview component.

#### Parent

- Portfolio Page
- Dashboard

#### Children

- `Card`, `CardHeader`, `CardContent` (UI primitives)
- `StatisticDisplay` (child component — portfolio metrics)
- `PercentageIndicator` (child component — performance percentage)
- `Badge` (UI primitive — status indicator)

#### Reusable Elements

- Card container
- StatisticDisplay for total portfolio value, total profit/loss
- PercentageIndicator for percentage change
- Badge for portfolio status

#### Composition Rules

- Card layout is vertical:
  1. CardHeader — "Portfolio" title (headline-md) and optional Badge
  2. CardContent — primary total value using StatisticDisplay (headline-lg, `--font-mono`), profit/loss value with colour coding using `--profit` or `--loss` tokens, PercentageIndicator showing overall change
- Profit values must use `--profit` colour.
- Loss values must use `--loss` colour.
- Background uses `--bg-surface`.
- Internal padding: card-padding-lg (20 px).

#### Behaviour

- Hover: card background elevates to `--bg-hover`.
- Loading: skeleton placeholder.
- Empty: displays placeholder values (₦0.00, 0%).

#### Responsive Behaviour

- Desktop: fixed width within summary row.
- Tablet: flexible width in two-column grid.
- Mobile: full content width.

#### Accessibility

- Financial values use `--font-mono`.
- Percentage changes include directional context ("+5%" or "−3%").
- Screen readers announce value and direction.

---

### 6. Statistic Card

#### Purpose

Display a single key metric with a label and optional trend indicator. Used across the application wherever individual statistics must be presented.

#### Parent

- Dashboard
- Market Details (Market Statistics section)
- Portfolio Page (Performance Statistics)
- Administration Dashboard
- Wallet Page

#### Children

- `Card`, `CardContent` (UI primitives)
- `StatisticDisplay` (child component — value and label)
- `PercentageIndicator` (child component — optional trend)

#### Reusable Elements

- Card container
- StatisticDisplay for the primary metric and label
- PercentageIndicator for optional change indicator

#### Composition Rules

- Card layout is compact vertical:
  1. Label text (body-sm, muted text colour)
  2. Primary value (headline-md or headline-lg depending on context, `--font-mono` for numeric values)
  3. Optional PercentageIndicator below the value
- Cards must have equal dimensions when displayed in a row.
- Background uses `--bg-surface`.
- Internal padding: card-padding (16 px).
- Minimum card height ensures visual consistency across a row.

#### Behaviour

- Hover: card background elevates to `--bg-hover`.
- Loading: skeleton placeholder matching card dimensions.
- Empty: displays "—" as placeholder value.

#### Responsive Behaviour

- Desktop: equal-width cards in a horizontal row.
- Tablet: two-column grid.
- Mobile: vertical stack, full width.

#### Accessibility

- Label is associated with value.
- Numeric values use `--font-mono`.
- Trend indicators include `aria-label` describing the direction.

---

### 7. Activity Card

#### Purpose

Display a single activity event in a chronological feed. Represents trades, deposits, withdrawals, or market events.

#### Parent

- Market Details (Activity Feed section)
- Dashboard (right sidebar activity)
- Wallet Page (transaction history)

#### Children

- `Avatar` (UI primitive — user identity)
- `Badge` (UI primitive — activity type)
- `StatisticDisplay` (child component — transaction amount)

#### Reusable Elements

- Avatar for the user who performed the action
- Badge for activity type label
- StatisticDisplay for monetary or share amount
- Timestamp text

#### Composition Rules

- Card layout is horizontal:
  1. Left region: Avatar (fixed size)
  2. Centre region: activity description (body-sm), username (body-sm, bold), and timestamp (label-xs, muted)
  3. Right region: transaction amount using StatisticDisplay (body-sm, `--font-mono`), activity type Badge
- Items are separated by Separator or consistent vertical spacing (12 px).
- No card container — activity items use transparent background within their parent container.
- Hover: background changes to `--bg-hover`.

#### Behaviour

- Hover: subtle background highlight.
- Focus: visible focus outline.
- Loading: skeleton row with avatar skeleton, text skeletons, and value skeleton.
- Empty: parent container displays EmptyIllustration.
- Activity list supports independent scrolling when inside a fixed-height container.

#### Responsive Behaviour

- Desktop: may appear in a side panel with independent scrolling.
- Tablet: full width within content area.
- Mobile: full width, stacked below Trade Panel.

#### Accessibility

- Each activity item is a list item.
- Timestamps include full date/time in `aria-label`.
- Financial amounts use `--font-mono`.

---

### 8. Category Tabs

#### Purpose

Allow navigation between market categories. Positioned directly above the Market Feed on the Dashboard and Markets pages.

#### Parent

- Dashboard
- Markets Page

#### Children

- `Tabs`, `TabsList`, `TabsTrigger` (UI primitives)
- `Badge` (UI primitive — optional count indicator)

#### Reusable Elements

- Tabs container
- TabsTrigger for each category
- Optional Badge inside TabsTrigger for market count

#### Composition Rules

- Tabs occupy full content width.
- TabsTrigger items are arranged in a single horizontal row.
- Active tab must be clearly identifiable through colour and visual weight.
- Tabs are positioned directly above the Market Feed with no intervening spacing beyond the standard section gap (24 px).
- Tab labels use body-sm typography.

#### Behaviour

- Hover: tab background changes to `--bg-hover`.
- Focus: visible focus outline using `--border-active`.
- Active: tab uses `--accent-primary` background with `--text-inverse` text, or underline indicator.
- Disabled: reduced opacity, no interaction.
- Horizontal scrolling: when tabs overflow on smaller screens, the tab list must scroll horizontally with no visible scrollbar.

#### Responsive Behaviour

- Desktop: full-width tabs, all visible.
- Tablet: scrollable tabs if overflow occurs.
- Mobile: horizontally scrollable tabs.

#### Accessibility

- `role="tablist"` on the container.
- `role="tab"` on each trigger.
- `aria-selected` on the active tab.
- Arrow key navigation between tabs.
- `tabindex` management for keyboard navigation.

---

### 9. Section Header

#### Purpose

Introduce a content section with a title, optional description, and optional action. Used consistently across all pages to label content regions.

#### Parent

- Landing Page
- Dashboard
- Portfolio Page
- Wallet Page
- Market Details Page
- Administration Page
- Notifications Page

#### Children

- `Button` (UI primitive — optional "View All" or action)

#### Reusable Elements

- Heading text
- Optional description text
- Optional action Button (text or ghost variant)

#### Composition Rules

- Layout is horizontal with title on the left and optional action on the right.
- Title uses headline-md typography.
- Optional description below title uses body-sm, muted text colour.
- Action button is right-aligned, uses ghost or text button variant.
- Full content width.
- Bottom margin matches section-gap (24 px).

#### Behaviour

- No interactive state on the header itself.
- Action button follows standard button states.
- Loading: skeleton text for title and description.

#### Responsive Behaviour

- Desktop: horizontal layout, title left, action right.
- Tablet: same horizontal layout.
- Mobile: title and action may stack vertically if horizontal space is insufficient.

#### Accessibility

- Title uses a semantic heading element (`<h2>` or `<h3>` depending on page hierarchy).
- Action button has a descriptive `aria-label`.

---

### 10. Trade Panel

#### Purpose

Provide the trading interface for buying and selling prediction market positions. Appears within Market Details.

#### Parent

- Market Details Page

#### Children

- `Card`, `CardHeader`, `CardContent`, `CardFooter` (UI primitives)
- `Tabs`, `TabsList`, `TabsTrigger` (UI primitives — Buy/Sell toggle)
- `Input` (UI primitive — amount entry)
- `Label` (UI primitive — field labels)
- `Button` (UI primitive — trade execution)
- `MarketOutcomeChip` (child component — option selection)
- `StatisticDisplay` (child component — trade preview values)

#### Reusable Elements

- Card container for the panel surface
- Tabs for Buy/Sell mode switching
- MarketOutcomeChip for outcome selection (Yes/No or multi-option)
- Input for trade amount
- StatisticDisplay for estimated shares, estimated payout, trading fee, total cost
- Primary Button for trade confirmation (Buy Yes = `--market-yes`, Buy No = `--market-no`)

#### Composition Rules

- Panel layout is vertical within a Card container:
  1. CardHeader — Tabs (Buy | Sell) toggle
  2. CardContent — outcome selection row (MarketOutcomeChips), amount Input with Label, trade preview section showing StatisticDisplays for: current probability, estimated shares, trading fee, total cost / net amount
  3. CardFooter — trade execution Button (full width)
- Buy button uses `--market-yes` for "Yes" outcome and `--market-no` for "No" outcome.
- Trade preview values must use `--font-mono`.
- Background uses `--bg-surface`.
- Internal padding: card-padding-lg (20 px).

#### Behaviour

- Hover: standard button hover states.
- Focus: input focus uses `--border-active`.
- Disabled: button disabled when amount is invalid or zero, input disabled when market is closed.
- Loading: button shows loading spinner while trade processes.
- Empty: panel displays when no outcome is selected — outcome chips in default state.
- Trade preview updates as the user types the amount (interface behaviour only — calculation logic belongs to `prediction-engine.md`).

#### Responsive Behaviour

- Desktop: appears alongside the price chart (side-by-side layout managed by the page).
- Tablet: moves below the price chart.
- Mobile: full width, stacked vertically below all market information.

#### Accessibility

- Tabs use `role="tablist"` and `role="tab"`.
- Input has associated Label via `htmlFor`.
- Trade button has descriptive `aria-label` including the outcome direction.
- Financial values use `--font-mono`.
- Minimum 44 px touch target on all interactive elements.

---

### 11. Search Result Card

#### Purpose

Display a single search result matching a market query. Appears within the Search Dialog results list.

#### Parent

- Search Dialog (Search Results section)

#### Children

- `CardImage` (child component — market thumbnail)
- `Badge` (UI primitive — category and status)
- `MarketOutcomeChip` (child component — probability)
- `CountdownTimer` (child component — time remaining)

#### Reusable Elements

- CardImage for market thumbnail (smaller variant)
- Badge for category and status
- MarketOutcomeChip for current probability
- CountdownTimer for closing time

#### Composition Rules

- Layout is horizontal (single row):
  1. Left: CardImage (small, square aspect ratio or 16:9 compact)
  2. Centre: market title (body-md, max 2 lines, truncated), category Badge, status Badge
  3. Right: MarketOutcomeChip, CountdownTimer
- Items are separated by consistent vertical spacing (12 px).
- Background is transparent; hover highlights the entire row with `--bg-hover`.
- No card border — result items live inside the Search Dialog container.

#### Behaviour

- Hover: background changes to `--bg-hover`.
- Focus: visible focus outline.
- Active: background changes to `--bg-active`.
- Loading: skeleton row placeholder.
- Empty: parent displays EmptyIllustration with "No results found" message.
- Clicking a result navigates to Market Details.

#### Responsive Behaviour

- Identical across all devices (results live inside a dialog/sheet).

#### Accessibility

- Each result is a list item.
- Result is keyboard focusable and activatable with Enter.
- `aria-label` describes the market name and status.

---

### 12. Notification Item

#### Purpose

Display a single notification in the notification feed or notification dialog.

#### Parent

- Notifications Page
- Notifications Dialog

#### Children

- `Avatar` (UI primitive — notification source)
- `Badge` (UI primitive — notification type)
- `NotificationDot` (child component — unread indicator)

#### Reusable Elements

- Avatar for the notification source (system or user)
- Badge for notification category
- NotificationDot for unread state
- Timestamp text

#### Composition Rules

- Layout is horizontal:
  1. Left: Avatar with optional NotificationDot overlay (top-right corner)
  2. Centre: notification title (body-sm, bold for unread), notification description (body-sm, muted), timestamp (label-xs, muted)
  3. Right: notification type Badge
- Unread notifications use a slightly elevated background (`--bg-surface-secondary`).
- Read notifications use transparent background.
- Items are separated by Separator or consistent spacing (8 px).

#### Behaviour

- Hover: background changes to `--bg-hover`.
- Focus: visible focus outline.
- Active: background changes to `--bg-active`.
- Unread: bold title text, NotificationDot visible, elevated background.
- Read: normal weight title, no NotificationDot.
- Clicking a notification navigates to the related screen.

#### Responsive Behaviour

- Identical across all devices (notifications display within a list).

#### Accessibility

- Each notification is a list item.
- Unread state announced via `aria-label`.
- Keyboard navigation supported.
- `role="listitem"` on each notification.

---

### 13. Profile Summary Card

#### Purpose

Display user profile overview with avatar, name, and key account statistics.

#### Parent

- Profile Page
- Profile Dialog

#### Children

- `Card`, `CardHeader`, `CardContent` (UI primitives)
- `Avatar` (UI primitive — user photo)
- `StatisticDisplay` (child component — profile metrics)
- `Badge` (UI primitive — verification status)
- `Button` (UI primitive — edit profile action)

#### Reusable Elements

- Card container
- Large Avatar for profile photo
- StatisticDisplay for account metrics (markets traded, win rate, member since)
- Badge for verification status
- Button for edit profile action

#### Composition Rules

- Card layout is vertical:
  1. CardHeader — large Avatar (centered), username below (headline-md, centered), verification Badge below username
  2. CardContent — horizontal row of StatisticDisplays (markets traded, win rate, member since), edit profile Button (full width or right-aligned)
- Avatar must be the visually dominant element.
- Background uses `--bg-surface`.
- Internal padding: card-padding-lg (20 px).

#### Behaviour

- Hover: card background elevates to `--bg-hover`.
- Loading: skeleton avatar, skeleton text, skeleton metrics.
- Empty: avatar shows initials fallback, metrics display "—".
- Button follows standard button states.

#### Responsive Behaviour

- Desktop: fixed width within profile layout.
- Tablet: flexible width.
- Mobile: full content width.

#### Accessibility

- Avatar includes `alt` text with user name.
- Statistics are labelled.
- Edit button has descriptive `aria-label`.

---

## File Placement

All parent components will be created under `components/parent/`:

| File | Component |
|---|---|
| `components/parent/hero-banner.tsx` | HeroBanner |
| `components/parent/market-card.tsx` | MarketCard |
| `components/parent/market-feed.tsx` | MarketFeed |
| `components/parent/wallet-card.tsx` | WalletCard |
| `components/parent/portfolio-card.tsx` | PortfolioCard |
| `components/parent/statistic-card.tsx` | StatisticCard |
| `components/parent/activity-card.tsx` | ActivityCard |
| `components/parent/category-tabs.tsx` | CategoryTabs |
| `components/parent/section-header.tsx` | SectionHeader |
| `components/parent/trade-panel.tsx` | TradePanel |
| `components/parent/market-details/binary-market-view.tsx` | BinaryMarketView |
| `components/parent/market-details/versus-market-view.tsx` | VersusMarketView |
| `components/parent/market-details/multi-option-market-view.tsx` | MultiOptionMarketView |
| `components/parent/search-result-card.tsx` | SearchResultCard |
| `components/parent/notification-item.tsx` | NotificationItem |
| `components/parent/profile-summary-card.tsx` | ProfileSummaryCard |
| `components/parent/index.ts` | Barrel export |

---

## Behaviour Summary

All parent components share these interaction behaviours:

- **Hover** — background or border changes to hover token. No scaling animations.
- **Focus** — visible outline using `--border-active` (2 px).
- **Active/Pressed** — background switches to active token.
- **Disabled** — opacity 0.5, cursor not-allowed, no hover/focus.
- **Loading** — skeleton placeholder matching component dimensions. Size remains constant.
- **Empty** — meaningful empty state when no data is available. EmptyIllustration or placeholder values.
- **Keyboard Interaction** — Enter/Space activates buttons. Tab navigates between interactive elements. Arrow keys navigate within tabs.
- **Touch Interaction** — tap triggers same as click. All touch targets are a minimum of 44 px.
- **Animation** — maximum 200 ms duration. Allowed: fade, slide, opacity, background transition. Prohibited: bounce, elastic, flashing, infinite.

---

## Acceptance Criteria

1. Every parent component listed above exists as a file under `components/parent/`.
2. A barrel export file (`components/parent/index.ts`) exports all parent components.
3. Every parent component is composed only from approved UI primitives and child components. No new primitives are created.
4. Every parent component renders correctly with placeholder data.
5. Responsive behaviour matches `wireframe.md` for Desktop, Tablet, and Mobile breakpoints.
6. Visual hierarchy matches `ui-context.md` — correct colours, typography, spacing, shadows, and border radius.
7. No duplicated child components exist within the parent component directory.
8. Loading states (skeleton placeholders) exist for every parent component that displays data.
9. Empty states exist for Market Feed, Activity Card list, and Notification Item list.
10. All interactive elements meet the 44 px minimum touch target.
11. Keyboard navigation works for all interactive parent components.
12. All financial values use `--font-mono`.
13. All colour references use semantic tokens. No raw hex values.
14. WCAG AA contrast ratios are satisfied.
15. No console errors during rendering.
16. No TypeScript errors (`npm run build` succeeds).
17. `npm run build` succeeds without errors.

---

## Out of Scope

The following are explicitly excluded from this specification and belong to later build units:

- Layout implementation → `04-layouts.md`
- Routed pages → `05-pages.md`
- Dialogs → `06-dialogs.md`
- Navigation components (Header, Sidebar, Bottom Nav) → `04-layouts.md`
- Authentication → `07-authentication.md`
- Market functionality → `08-markets.md`
- Wallet functionality → `09-wallet.md`
- Trading functionality → `10-trading.md`
- Portfolio functionality → `11-portfolio.md`
- Community functionality → `12-community.md`
- Administration → `13-administration.md`
- Background jobs → `14-background-jobs.md`
- Production systems → `15-production.md`
- Business logic → `prediction-engine.md`
- API behaviour → `api-contracts.md`
- Database behaviour → `database-schema.md`
- Server actions → backend specifications
- State management → feature specifications
- Real data integration → backend specifications

---

## Cross-Document Responsibilities

This specification references but never redefines the following:

| Subject | Owning Document |
|---|---|
| Visual language | `ui-context.md` |
| Application layout | `wireframe.md` |
| Build order | `build-plan.md` |
| User journeys | `user-flow.md` |
| Architecture | `architecture.md` |
| Child components | `02-child-components.md` |
| UI primitives | `01-ui-primitives.md` |
| Feature behaviour | Feature specifications |
| API behaviour | `api-contracts.md` |
| Business rules | `prediction-engine.md` |
| Database structure | `database-schema.md` |
| Code standards | `code-standards.md` |

This specification is the single source of truth for reusable parent components in the Sheybi application. Any future changes must be reflected here and synchronized with the implementation.
