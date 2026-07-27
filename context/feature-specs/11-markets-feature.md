# Markets Feature Specification

> Version: 1.0.0
> Status: Draft
> Owner: Market Management / Prediction Engine
> Depends on: prediction-engine.md, prediction-algorithm (10), database-schema.md, architecture.md, api-contract.md, 08-realtime-authentication-spec.md, 09-lean-admin-spec.md
> Spec Number: 11

---

# Overview

This specification defines the complete implementation of the **Markets feature** — the first real-data feature in Sheybi that replaces all static mock datasets with live, persistent, real-time market data.

The Markets feature connects the existing UI components (Market Cards, Market Feed, Market Details pages, Category Tabs, Admin Market Management) to a live InstantDB backend through Next.js Server Actions. It implements the full market lifecycle from creation through resolution, integrates the LMSR Prediction Algorithm for pricing, and enables real-time synchronization so every connected client reflects the current market state instantly.

## What This Spec Covers

1. **InstantDB Schema Definition** — Graph schema for markets, market options, categories, and market activity
2. **Server Actions** — Validated, authenticated server-side operations for all market CRUD
3. **LMSR Pricing Integration** — Connecting the prediction algorithm to live market data
4. **Real-Time Data Binding** — Replacing mock data with InstantDB real-time queries
5. **Market Lifecycle Management** — Draft → Scheduled → Open → Closed → Resolved / Cancelled
6. **Admin Market Operations** — Create, publish, close, extend, cancel, resolve
7. **Public Market Browsing** — List, filter, search, view details (guest + authenticated)
8. **Market Suggestion Submission** — User-submitted market ideas

## What This Spec Does NOT Cover

- Trading (Buy/Sell positions) — covered by a future Trading spec
- Wallet mutations — covered by a future Wallet spec
- Settlement & payouts — covered by a future Settlement spec
- Notifications — paused per architecture decision
- Portfolio views — covered by a future Portfolio spec

---

# Prerequisites

The following must be completed or available before implementation begins:

| Prerequisite | Status | Source |
|---|---|---|
| Clerk Authentication | Spec Complete (`08-realtime-authentication-spec.md`) | Must be implemented first |
| InstantDB SDK installed | Not Yet | `@instantdb/react`, `@instantdb/admin` |
| LMSR Algorithm Module | Spec Complete (`10-prediction-algorithm.md`) | Must be implemented as `lib/prediction-engine/` |
| UI Components (Market Card, Feed, Details) | Implemented | `components/parent/`, `components/parent/market-details/` |
| Admin Module UI | Spec Complete (`09-lean-admin-spec.md`) | `app/admin/` |

---

# Part 1 — InstantDB Schema

## 1.1 Schema Overview

InstantDB uses a graph-based schema. Every entity is a node, and relationships are defined as graph links between nodes.

The Markets feature requires the following entities:

```
categories
  ├── markets (has many)
  
markets
  ├── market_options (has many)
  ├── market_activity (has many)
  └── category (belongs to one)

market_options
  └── market (belongs to one)

market_activity
  └── market (belongs to one)

market_suggestions
  (standalone, linked by userId string)
```

## 1.2 Schema Definition File

Create `instant.schema.ts` at the project root (required by InstantDB SDK):

```typescript
// instant.schema.ts

import { i } from "@instantdb/react";

const schema = i.schema({
  entities: {
    // --- PREDICTION DOMAIN ---

    categories: i.entity({
      name: i.string(),
      slug: i.string().unique(),
      description: i.string().optional(),
      icon: i.string().optional(),
      displayOrder: i.number(),
      isActive: i.boolean(),
      createdAt: i.number(), // Unix timestamp ms
    }),

    markets: i.entity({
      title: i.string(),
      description: i.string(),
      marketType: i.string(), // "binary" | "multi_option"
      state: i.string(), // "draft" | "scheduled" | "open" | "paused" | "closed" | "resolved" | "cancelled"
      openingTime: i.number(), // Unix timestamp ms
      closingTime: i.number(), // Unix timestamp ms
      resolutionTime: i.number().optional(),
      liquidity: i.number(), // Admin-assigned Naira amount
      liquidityParam: i.number(), // Computed LMSR `b` parameter
      tradingVolume: i.number(), // Cumulative ₦ traded
      totalTrades: i.number(), // Count of completed trades
      winningOptionId: i.string().optional(),
      createdBy: i.string(), // Clerk userId
      imageUrl: i.string().optional(), // Market thumbnail
      slug: i.string().unique(),
      isFeatured: i.boolean(),
      createdAt: i.number(),
      updatedAt: i.number(),
    }),

    market_options: i.entity({
      name: i.string(),
      displayOrder: i.number(),
      probability: i.number(), // 0-100 (percentage)
      sharePrice: i.number(), // Current ₦ price per share (0 < price < 1)
      sharesOutstanding: i.number(), // Total outstanding shares (LMSR q_i)
      isWinningOption: i.boolean(),
      imageUrl: i.string().optional(), // Contestant avatar
      createdAt: i.number(),
    }),

    market_activity: i.entity({
      activityType: i.string(), // "created" | "opened" | "paused" | "unpaused" | "trade" | "closed" | "reopened" | "resolved" | "cancelled" | "extended"
      description: i.string(),
      relatedUserId: i.string().optional(),
      metadata: i.json().optional(), // Flexible JSON for trade details, etc.
      createdAt: i.number(),
    }),

    market_suggestions: i.entity({
      submittedBy: i.string(), // Clerk userId
      submitterName: i.string(), // Display name snapshot
      title: i.string(),
      description: i.string(),
      categorySlug: i.string().optional(),
      status: i.string(), // "pending" | "approved" | "rejected"
      reviewedBy: i.string().optional(), // Admin Clerk userId
      reviewedAt: i.number().optional(),
      rejectionReason: i.string().optional(),
      convertedMarketId: i.string().optional(), // ID of market created from this suggestion
      createdAt: i.number(),
    }),
  },

  links: {
    // Category has many Markets
    categoryMarkets: {
      forward: { on: "categories", has: "many", label: "markets" },
      reverse: { on: "markets", has: "one", label: "category" },
    },

    // Market has many Options
    marketOptions: {
      forward: { on: "markets", has: "many", label: "options" },
      reverse: { on: "market_options", has: "one", label: "market" },
    },

    // Market has many Activity records
    marketActivityRecords: {
      forward: { on: "markets", has: "many", label: "activity" },
      reverse: { on: "market_activity", has: "one", label: "market" },
    },
  },
});

export default schema;
export type Schema = typeof schema;
```

## 1.3 InstantDB Client Configuration

Create `lib/instant.ts`:

```typescript
// lib/instant.ts

import { init } from "@instantdb/react";
import schema from "@/instant.schema";

const APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID!;

export const db = init({ appId: APP_ID, schema });
export type { Schema } from "@/instant.schema";
```

Create `lib/instant-admin.ts` (server-side only):

```typescript
// lib/instant-admin.ts

import { init } from "@instantdb/admin";
import schema from "@/instant.schema";

const APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID!;
const ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN!;

export const adminDb = init({ appId: APP_ID, adminToken: ADMIN_TOKEN, schema });
```

## 1.4 Environment Variables

```
NEXT_PUBLIC_INSTANT_APP_ID=<InstantDB App ID>
INSTANT_ADMIN_TOKEN=<InstantDB Admin Secret Token>
```

---

# Part 2 — Prediction Engine Module

## 2.1 Module Location

```
lib/prediction-engine/
  ├── index.ts          # Public API barrel
  ├── lmsr.ts           # LMSR core pricing functions
  ├── market-math.ts    # Share calculation, probability, settlement
  ├── validators.ts     # Business rule validation
  ├── types.ts          # Engine-specific TypeScript types
  └── constants.ts      # Fee rates, limits, minimum values
```

## 2.2 LMSR Core Functions (`lmsr.ts`)

Implement every formula from `10-prediction-algorithm.md`. The critical functions are:

```typescript
// Compute LMSR b parameter from admin liquidity
function computeLiquidityParam(liquidity: number, numOptions: number): number;

// Cost function C(q) = b * ln(Σ e^(q_i / b))
function costFunction(quantities: number[], b: number): number;

// Cost to buy `amount` shares of option `i`
function calculateBuyCost(quantities: number[], optionIndex: number, amount: number, b: number): number;

// Revenue from selling `amount` shares of option `i`
function calculateSellRevenue(quantities: number[], optionIndex: number, amount: number, b: number): number;

// Current probability for option `i`
function calculateProbability(quantities: number[], optionIndex: number, b: number): number;

// All probabilities (must sum to 1.0)
function calculateAllProbabilities(quantities: number[], b: number): number[];

// Current share price for option `i` (= probability for LMSR)
function calculateSharePrice(quantities: number[], optionIndex: number, b: number): number;

// Number of shares purchasable for a given Naira amount (after fees)
function calculateSharesForAmount(quantities: number[], optionIndex: number, nairaAmount: number, b: number, feeRate: number): number;

// Settlement payout per share for winning option
function calculateSettlementPayout(quantities: number[], winningIndex: number, b: number): number;
```

## 2.3 Validators (`validators.ts`)

```typescript
// Validates that a market can accept trades
function validateMarketTradeable(market: MarketEntity): ValidationResult;

// Validates that a buy order is permissible
function validateBuyOrder(params: BuyOrderParams): ValidationResult;

// Validates that a sell order is permissible
function validateSellOrder(params: SellOrderParams): ValidationResult;

// Validates market creation inputs
function validateMarketCreation(params: CreateMarketParams): ValidationResult;

// Validates market state transition
function validateStateTransition(currentState: MarketState, targetState: MarketState): ValidationResult;
```

## 2.4 Constants (`constants.ts`)

```typescript
export const TRADING_FEE_RATE = 0.025; // 2.5%
export const MIN_TRADE_AMOUNT = 100;   // ₦100 minimum trade
export const MAX_TRADE_AMOUNT = 500_000; // ₦500,000 maximum trade
export const MIN_LIQUIDITY = 10_000;   // ₦10,000 minimum liquidity
export const MAX_LIQUIDITY = 1_000_000; // ₦1,000,000 maximum liquidity
export const MIN_OPTIONS = 2;          // Minimum 2 options per market
export const MAX_OPTIONS = 20;         // Maximum 20 options per market
export const SHARE_PRICE_MIN = 0.001;  // Floor price
export const SHARE_PRICE_MAX = 0.999;  // Ceiling price
```

---

# Part 3 — Server Actions

All market mutations execute as Next.js Server Actions. They follow the request lifecycle defined in `api-contract.md`:

```
Request → Authentication → Authorization → Validation → Business Preconditions → Execution → Persistence → Audit → Realtime → Response
```

## 3.1 Server Action Files

```
app/actions/
  ├── market-actions.ts        # Admin CRUD operations
  ├── market-query-actions.ts  # Public read operations
  └── suggestion-actions.ts    # User suggestion submissions
```

## 3.2 Admin Market Actions (`market-actions.ts`)

### `createMarket`

**Purpose:** Create a new prediction market in Draft state.

**Actor:** Administrator

**Authentication:** Required (Clerk `auth()`)

**Authorization:** Admin role verified via Clerk `publicMetadata.role === "admin"`

**Inputs:**

| Input | Type | Required | Validation |
|---|---|---|---|
| title | string | Yes | 5-200 chars, unique among active markets |
| description | string | Yes | 10-2000 chars |
| categoryId | string | Yes | Must reference existing active category |
| marketType | "binary" \| "multi_option" | Yes | Enum validation |
| options | { name: string, imageUrl?: string }[] | Yes | Min 2, max 20. Binary must have exactly 2 |
| openingTime | number | Yes | Must be in the future |
| closingTime | number | Yes | Must be after openingTime, min 1 hour gap |
| liquidity | number | Yes | MIN_LIQUIDITY ≤ value ≤ MAX_LIQUIDITY |
| imageUrl | string | No | Valid URL if provided |
| isFeatured | boolean | No | Defaults to false |

**Execution:**

1. Authenticate via Clerk `auth()`. Reject if unauthenticated.
2. Verify admin role from Clerk session metadata. Reject if not admin.
3. Validate all inputs against validation rules.
4. Verify category exists and is active.
5. Verify title uniqueness among non-cancelled markets.
6. Compute LMSR `b` parameter: `b = liquidity / (N * ln(N))`.
7. Compute initial equal probabilities: `100 / N` per option.
8. Compute initial share prices (= initial probabilities as decimals).
9. Generate URL-safe slug from title.
10. Create market entity in InstantDB with `state: "draft"`.
11. Create N `market_options` entities linked to the market.
12. Create `market_activity` record: `{ activityType: "created", description: "Market created by admin" }`.
13. Return success with created market ID.

**Side Effects:**
- Creates 1 market record
- Creates N market_option records
- Creates 1 market_activity record

**Failure Result:**
- `UNAUTHORIZED` — Not authenticated or not admin
- `VALIDATION_ERROR` — Input validation failure
- `CONFLICT` — Title already exists
- `NOT_FOUND` — Category does not exist

---

### `publishMarket`

**Purpose:** Move a Draft market to Scheduled state, making it visible to users.

**Actor:** Administrator

**Inputs:**

| Input | Type | Required |
|---|---|---|
| marketId | string | Yes |

**Execution:**

1. Authenticate + authorize admin.
2. Fetch market. Reject if not found.
3. Validate state transition: `draft → scheduled`. Reject if current state is not `draft`.
4. Update `state` to `"scheduled"`, `updatedAt` to now.
5. Create `market_activity` record: `"Market scheduled for publication"`.

---

### `openMarket`

**Purpose:** Move a Scheduled market to Open state, enabling trading.

**Actor:** Administrator OR Background Job (at `openingTime`)

**Execution:**

1. Validate state transition: `scheduled → open`.
2. Verify `openingTime` has arrived (if triggered by background job).
3. Update `state` to `"open"`, `updatedAt` to now.
4. Create `market_activity` record: `"Market opened for trading"`.

---

### `closeMarket`

**Purpose:** Close trading on a market.

**Actor:** Administrator OR Background Job (at `closingTime`)

**Execution:**

1. Validate state transition: `open → closed`.
2. Update `state` to `"closed"`, `updatedAt` to now.
3. Create `market_activity` record: `"Trading closed"`.

---

### `extendMarket`

**Purpose:** Reopen a closed market with a new closing time.

**Actor:** Administrator

**Inputs:**

| Input | Type | Required |
|---|---|---|
| marketId | string | Yes |
| newClosingTime | number | Yes — Must be in the future |

**Execution:**

1. Validate state transition: `closed → open`.
2. Verify `newClosingTime > now`.
3. Update `state` to `"open"`, `closingTime` to new value, `updatedAt` to now.
4. Create `market_activity` record: `"Market extended, trading reopened"`.

---

### `cancelMarket`

**Purpose:** Permanently cancel a market. No winner. Refunds triggered separately.

**Actor:** Administrator

**Execution:**

1. Validate state transition: `draft | scheduled | open | closed → cancelled`.
2. Update `state` to `"cancelled"`, `updatedAt` to now.
3. Create `market_activity` record: `"Market cancelled by admin"`.

**Note:** Refund logic (wallet credits, ledger entries) belongs to the future Trading/Wallet spec. This action only changes the market state.

---

### `resolveMarket`

**Purpose:** Declare the winning option and lock the market permanently.

**Actor:** Administrator

**Inputs:**

| Input | Type | Required |
|---|---|---|
| marketId | string | Yes |
| winningOptionId | string | Yes — Must be a valid option ID for this market |
| confirmationTitle | string | Yes — Must exactly match market title (safety check) |

**Execution:**

1. Validate state transition: `closed → resolved`.
2. Verify `winningOptionId` belongs to this market.
3. Verify `confirmationTitle === market.title` (admin safety confirmation).
4. Update market: `state: "resolved"`, `winningOptionId`, `resolutionTime: now`, `updatedAt: now`.
5. Update winning option: `isWinningOption: true`.
6. Create `market_activity` record: `"Market resolved. Winner: {optionName}"`.

**Note:** Settlement (payout calculation and wallet credits) belongs to the future Trading/Settlement spec.

---

### `createCategory`

**Purpose:** Create a new market category.

**Actor:** Administrator

**Inputs:**

| Input | Type | Required | Validation |
|---|---|---|---|
| name | string | Yes | 2-50 chars, unique |
| description | string | No | Max 200 chars |
| icon | string | No | Emoji or icon identifier |
| displayOrder | number | No | Defaults to 0 |

---

### `updateCategory`

**Purpose:** Rename or reorder a category.

**Actor:** Administrator

---

### `toggleCategoryActive`

**Purpose:** Enable or disable a category.

**Actor:** Administrator

---

## 3.3 Public Market Query Actions (`market-query-actions.ts`)

These are **read-only** operations. They do NOT require authentication for public markets (guests can browse). They use InstantDB client-side queries via `useQuery` hooks, not server actions. Documented here for completeness.

### `listPublicMarkets`

**Purpose:** Retrieve all markets visible to the public.

**Filter:** `state IN ("scheduled", "open", "closed", "resolved")`

**Sorting Options:**
- `trending` — Highest `tradingVolume` in last 24 hours
- `newest` — Most recent `createdAt`
- `closing_soon` — Nearest `closingTime` where `state === "open"`
- `highest_volume` — Highest `tradingVolume`
- `featured` — `isFeatured === true`

**Category Filter:** Optional `categoryId` or `categorySlug`

**Pagination:** Cursor-based via InstantDB

---

### `getMarketDetails`

**Purpose:** Retrieve full market data including options, activity, and computed pricing.

**Inputs:** `marketId` or `slug`

**Returns:**
- Market entity with all fields
- All market options with current probabilities and prices
- Recent activity feed (last 20 entries)
- Category name

---

### `searchMarkets`

**Purpose:** Full-text search across market titles and descriptions.

**Inputs:** `query: string`

**Returns:** Matching markets with relevance ranking.

---

## 3.4 Suggestion Actions (`suggestion-actions.ts`)

### `submitSuggestion`

**Purpose:** Allow authenticated users to suggest new markets.

**Actor:** Authenticated User

**Inputs:**

| Input | Type | Required | Validation |
|---|---|---|---|
| title | string | Yes | 5-200 chars |
| description | string | Yes | 10-500 chars |
| categorySlug | string | No | Must match existing category |

**Execution:**

1. Authenticate via Clerk. Reject if unauthenticated.
2. Validate inputs.
3. Create `market_suggestions` entity with `status: "pending"`.
4. Return success.

---

### `reviewSuggestion` (Admin)

**Purpose:** Approve or reject a user suggestion.

**Actor:** Administrator

**Inputs:**

| Input | Type | Required |
|---|---|---|
| suggestionId | string | Yes |
| action | "approve" \| "reject" | Yes |
| rejectionReason | string | Required if action is "reject" |

**Execution (Approve):**
1. Update suggestion: `status: "approved"`, `reviewedBy`, `reviewedAt`.
2. Do NOT auto-create a market. Admin manually creates from the approved suggestion.

**Execution (Reject):**
1. Update suggestion: `status: "rejected"`, `reviewedBy`, `reviewedAt`, `rejectionReason`.

---

# Part 4 — Real-Time Data Binding

## 4.1 Custom Hooks

Replace all mock data imports with real-time InstantDB hooks.

### `hooks/use-markets.ts`

```typescript
import { db } from "@/lib/instant";

// Fetches all publicly visible markets with category and options
export function useMarkets(filters?: {
  categorySlug?: string;
  state?: string[];
  featured?: boolean;
  limit?: number;
}) {
  return db.useQuery({
    markets: {
      category: {},
      options: {},
      $: {
        where: buildMarketWhereClause(filters),
        order: { serverCreatedAt: "desc" },
        limit: filters?.limit,
      },
    },
  });
}
```

### `hooks/use-market-detail.ts`

```typescript
export function useMarketDetail(marketId: string) {
  return db.useQuery({
    markets: {
      category: {},
      options: {},
      activity: {
        $: { order: { serverCreatedAt: "desc" }, limit: 20 },
      },
      $: { where: { id: marketId } },
    },
  });
}
```

### `hooks/use-categories.ts`

```typescript
export function useCategories() {
  return db.useQuery({
    categories: {
      $: {
        where: { isActive: true },
        order: { displayOrder: "asc" },
      },
    },
  });
}
```

### `hooks/use-market-suggestions.ts`

```typescript
// For admin: all suggestions
export function useMarketSuggestions(status?: string) {
  return db.useQuery({
    market_suggestions: {
      $: {
        where: status ? { status } : undefined,
        order: { serverCreatedAt: "desc" },
      },
    },
  });
}

// For user: their own suggestions
export function useUserSuggestions(userId: string) {
  return db.useQuery({
    market_suggestions: {
      $: { where: { submittedBy: userId } },
    },
  });
}
```

## 4.2 Data Transformation Layer

Create `lib/market-transforms.ts` to convert InstantDB entities into the prop shapes expected by existing UI components:

```typescript
// Converts InstantDB market entity → MarketCardProps
export function toMarketCardProps(market: MarketEntity): MarketCardProps;

// Converts InstantDB market + options → BinaryMarketData
export function toBinaryMarketData(market: MarketEntity, options: OptionEntity[]): BinaryMarketData;

// Converts InstantDB market + options → VersusMarketData
export function toVersusMarketData(market: MarketEntity, options: OptionEntity[]): VersusMarketData;

// Converts InstantDB market + options → MultiOptionMarketData
export function toMultiOptionMarketData(market: MarketEntity, options: OptionEntity[]): MultiOptionMarketData;
```

This transformation layer ensures the UI components remain untouched — only their data source changes from mock imports to real-time hooks.

---

# Part 5 — Page Integration

## 5.1 Homepage (`app/page.tsx`)

**Before:** Imports `MOCK_8_MARKETS` from `lib/mock-markets.ts`.

**After:**
1. Uses `useMarkets({ featured: true, limit: 4 })` for Featured Markets section.
2. Uses `useMarkets({ limit: 8 })` for Trending Markets section.
3. Transforms results via `toMarketCardProps()`.
4. Shows loading skeleton while `isLoading`.
5. Shows empty state if no markets exist.

## 5.2 Markets Page (`app/markets/page.tsx`)

**Before:** Static `MOCK_8_MARKETS` with client-side category tabs.

**After:**
1. Uses `useCategories()` to populate `CategoryTabs` dynamically.
2. Uses `useMarkets({ categorySlug: activeTab })` filtered by selected category.
3. Implements "All Markets" default tab (no category filter).
4. Adds search input that triggers `useMarkets({ search: query })`.
5. Adds sort selector: Trending, Newest, Closing Soon, Highest Volume.
6. Preserves "see more..." expander button linking to paginated view.
7. Shows loading skeletons during data fetch.
8. Shows empty state when no markets match filters.

## 5.3 Market Details Page (`app/markets/[id]/page.tsx`)

**Before:** Hardcoded mock data objects with ID-based type switching.

**After:**
1. Uses `useMarketDetail(marketId)` to fetch full market data with options and activity.
2. Determines view type from `market.marketType`:
   - `"binary"` with 2 options → `BinaryMarketView` (if generic yes/no) or `VersusMarketView` (if contestants have avatars)
   - `"multi_option"` → `MultiOptionMarketView`
3. Transforms data via `toBinaryMarketData()`, `toVersusMarketData()`, or `toMultiOptionMarketData()`.
4. Real-time: Probabilities, prices, and activity feed update live as trades occur.
5. Shows loading skeleton during initial fetch.
6. Shows 404 error if market not found.

## 5.4 Dashboard Page (`app/dashboard/page.tsx`)

**Before:** Mock markets.

**After:**
1. Uses `useMarkets({ featured: true, limit: 4 })` for featured section.
2. Uses `useMarkets({ state: ["open"], limit: 8 })` for active markets.
3. Category tabs populated from `useCategories()`.

## 5.5 Admin Market Management (`app/admin/page.tsx`)

**Before:** Static admin table with mock data.

**After:**
1. Uses `useMarkets({})` (no state filter — admin sees all states).
2. Admin table columns: Title, Type, State, Volume, Trades, Created, Actions.
3. `CreateMarketDialog` calls `createMarket` server action on submit.
4. `ResolveMarketDialog` calls `resolveMarket` server action.
5. State transition buttons (Publish, Open, Close, Extend, Cancel) call respective server actions.
6. `useMarketSuggestions()` populates the Suggestions Queue.
7. Suggestion approve/reject calls `reviewSuggestion` server action.

---

# Part 6 — Market State Machine

## 6.1 Valid State Transitions

```
draft → scheduled       (publishMarket)
draft → cancelled       (cancelMarket)

scheduled → open        (openMarket / auto at openingTime)
scheduled → cancelled   (cancelMarket)

open → closed           (closeMarket / auto at closingTime)
open → cancelled        (cancelMarket)

closed → open           (extendMarket)
closed → resolved       (resolveMarket)
closed → cancelled      (cancelMarket)

resolved → (terminal)
cancelled → (terminal)
```

## 6.2 State Visibility Rules

| State | Guests See? | Users See? | Admin Sees? |
|---|---|---|---|
| draft | No | No | Yes |
| scheduled | Yes (read-only) | Yes (read-only) | Yes |
| open | Yes (read-only) | Yes (can trade) | Yes |
| closed | Yes (read-only) | Yes (read-only) | Yes |
| resolved | Yes (read-only) | Yes (read-only) | Yes |
| cancelled | No | No | Yes |

## 6.3 Automatic State Transitions (Background Jobs)

Two background jobs handle time-based state transitions:

### `openScheduledMarkets`

- **Trigger:** Runs every 60 seconds (cron or Vercel Cron)
- **Logic:** Find all markets where `state === "scheduled"` AND `openingTime <= now`
- **Action:** Transition each to `state: "open"`

### `closeExpiredMarkets`

- **Trigger:** Runs every 60 seconds
- **Logic:** Find all markets where `state === "open"` AND `closingTime <= now`
- **Action:** Transition each to `state: "closed"`

These jobs execute as **API route handlers** (`app/api/cron/market-transitions/route.ts`) protected by a secret cron token.

---

# Part 7 — File Inventory

### New Files

| File | Purpose |
|---|---|
| `instant.schema.ts` | InstantDB graph schema definition |
| `lib/instant.ts` | Client-side InstantDB init |
| `lib/instant-admin.ts` | Server-side InstantDB admin init |
| `lib/prediction-engine/index.ts` | Barrel export |
| `lib/prediction-engine/lmsr.ts` | LMSR pricing algorithm |
| `lib/prediction-engine/market-math.ts` | Share/probability calculations |
| `lib/prediction-engine/validators.ts` | Business rule validators |
| `lib/prediction-engine/types.ts` | Engine TypeScript types |
| `lib/prediction-engine/constants.ts` | Fee rates and limits |
| `lib/market-transforms.ts` | InstantDB → UI prop transforms |
| `hooks/use-markets.ts` | Real-time market list hook |
| `hooks/use-market-detail.ts` | Real-time market detail hook |
| `hooks/use-categories.ts` | Real-time categories hook |
| `hooks/use-market-suggestions.ts` | Real-time suggestions hook |
| `app/actions/market-actions.ts` | Admin market server actions |
| `app/actions/suggestion-actions.ts` | Suggestion server actions |
| `app/api/cron/market-transitions/route.ts` | Background cron for state transitions |

### Modified Files

| File | Change |
|---|---|
| `app/page.tsx` | Replace mock data with `useMarkets` hook |
| `app/markets/page.tsx` | Replace mock data, add real categories/search/sort |
| `app/markets/[id]/page.tsx` | Replace mock data with `useMarketDetail` hook |
| `app/dashboard/page.tsx` | Replace mock data with `useMarkets` hook |
| `app/admin/page.tsx` | Wire admin table + dialogs to server actions |
| `app/layout.tsx` | Potentially wrap with InstantDB provider if needed |
| `package.json` | Add `@instantdb/react`, `@instantdb/admin` |
| `.env.local` | Add InstantDB credentials |

### Removed Files

| File | Reason |
|---|---|
| `lib/mock-markets.ts` | Replaced by real-time data (can be kept temporarily for fallback) |

---

# Part 8 — Error Handling

## 8.1 Server Action Error Format

All server actions return a consistent result type:

```typescript
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string; field?: string } };
```

## 8.2 Error Codes

| Code | HTTP Equivalent | Meaning |
|---|---|---|
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | Not admin / insufficient permissions |
| `VALIDATION_ERROR` | 400 | Input validation failure |
| `NOT_FOUND` | 404 | Market or entity not found |
| `CONFLICT` | 409 | Duplicate title or invalid state transition |
| `INVALID_STATE_TRANSITION` | 422 | State machine violation |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

## 8.3 Client Error Handling

- Server action errors display as toast notifications.
- Validation errors highlight specific form fields.
- Network errors show retry prompts.
- 404 on market detail shows "Market Not Found" error layout.

---

# Part 9 — Verification Checklist

## Unit Tests

- [ ] LMSR `computeLiquidityParam` returns correct `b` for binary and multi-option markets
- [ ] LMSR `calculateBuyCost` matches hand-calculated values from `10-prediction-algorithm.md`
- [ ] LMSR `calculateAllProbabilities` always sums to 1.0 (within ε = 0.0001)
- [ ] LMSR share prices remain within `(0, 1)` bounds
- [ ] State machine rejects all invalid transitions
- [ ] State machine accepts all valid transitions
- [ ] Market creation validates minimum/maximum options
- [ ] Binary market creation enforces exactly 2 options
- [ ] `resolveMarket` requires exact title match
- [ ] Category slug generation produces unique URL-safe strings

## Integration Tests

- [ ] `createMarket` server action creates market + options + activity in InstantDB
- [ ] `publishMarket` transitions draft → scheduled
- [ ] `resolveMarket` sets winning option and terminal state
- [ ] `cancelMarket` works from every non-terminal state
- [ ] `extendMarket` only works from closed state
- [ ] `submitSuggestion` creates pending suggestion
- [ ] `reviewSuggestion` updates status correctly

## UI Tests

- [ ] Markets page loads real data and displays market cards
- [ ] Category tabs filter markets by category
- [ ] Market detail page shows correct view for binary/versus/multi-option
- [ ] Real-time updates reflect on all connected clients
- [ ] Loading skeletons display during data fetch
- [ ] Empty states display when no markets match
- [ ] Admin table shows all market states
- [ ] Create Market dialog submits successfully
- [ ] Resolve Market dialog requires title confirmation

## Build Verification

- [ ] `npm run build` completes with zero errors
- [ ] `npx tsc --noEmit` passes with zero type errors
- [ ] All existing routes continue to compile

---

# Part 10 — Implementation Order

Execute in this sequence to minimize integration risk:

1. **Install Dependencies** — `@instantdb/react`, `@instantdb/admin`
2. **Create InstantDB Schema** — `instant.schema.ts`
3. **Create InstantDB Clients** — `lib/instant.ts`, `lib/instant-admin.ts`
4. **Implement Prediction Engine** — `lib/prediction-engine/*` (pure math, no DB dependency)
5. **Implement Server Actions** — `app/actions/market-actions.ts` (admin CRUD)
6. **Implement Suggestion Actions** — `app/actions/suggestion-actions.ts`
7. **Implement Custom Hooks** — `hooks/use-markets.ts`, `hooks/use-market-detail.ts`, `hooks/use-categories.ts`
8. **Implement Data Transforms** — `lib/market-transforms.ts`
9. **Wire Homepage** — `app/page.tsx` (replace mock with real data)
10. **Wire Markets Page** — `app/markets/page.tsx`
11. **Wire Market Details** — `app/markets/[id]/page.tsx`
12. **Wire Dashboard** — `app/dashboard/page.tsx`
13. **Wire Admin Module** — `app/admin/page.tsx`
14. **Implement Cron Jobs** — `app/api/cron/market-transitions/route.ts`
15. **Seed Initial Data** — Create categories and sample markets via admin UI
16. **End-to-End Verification** — Run full verification checklist

---

# Part 11 — Constraints & Invariants

These invariants MUST hold at all times:

1. **Probability Sum Invariant:** All option probabilities in a market MUST sum to 100% (±0.01% tolerance for floating point).
2. **Share Price Bounds:** Share prices MUST remain in the open interval (0, 1).
3. **Liquidity Immutability:** Once a market enters `open` state, `liquidityParam` (b) MUST NOT change.
4. **State Machine Integrity:** Only documented state transitions are permitted. Invalid transitions MUST be atomically rejected.
5. **Title Uniqueness:** No two non-cancelled markets may share the same title.
6. **Option Immutability:** Market options MUST NOT be added, removed, or renamed after the market leaves `draft` state.
7. **Resolution Finality:** A resolved market MUST NOT transition to any other state.
8. **Cancellation Finality:** A cancelled market MUST NOT transition to any other state.
9. **Admin-Only Mutations:** Only administrators may create, publish, close, extend, cancel, or resolve markets.
10. **Deterministic Pricing:** Given identical market state and trade parameters, the LMSR engine MUST always produce identical results.

---

# Part 12 — Glossary

| Term | Definition |
|---|---|
| LMSR | Logarithmic Market Scoring Rule — automated market maker algorithm |
| `b` parameter | LMSR liquidity parameter controlling price sensitivity |
| `q_i` | Outstanding shares for option `i` (LMSR quantity vector) |
| Share price | Current ₦ cost per share of an option (equals probability in LMSR) |
| Probability | Market's current belief that an option will win (0-100%) |
| Draft | Market exists but is invisible and unready |
| Scheduled | Market is visible but trading has not started |
| Open | Market is actively accepting trades |
| Closed | Market has stopped accepting trades, awaiting resolution |
| Resolved | Winning option declared, market is permanently locked |
| Cancelled | Market ended without a winner, refunds may apply |
| Server Action | Next.js server-side function invoked from client components |
| InstantDB | Real-time graph database used for persistence |

---

# Document Compliance

This specification was created in compliance with:

- `prediction-engine.md` — Market lifecycle, trading rules, financial invariants
- `10-prediction-algorithm.md` — LMSR formulas, `b` parameter calculation
- `database-schema.md` — Entity structure, field definitions, relationships
- `architecture.md` — Server-first execution, InstantDB, Clerk auth, dependency direction
- `api-contract.md` — Request lifecycle, contract structure, error handling
- `wireframe.md` — Page structure, component composition, responsive behavior
- `user-flow.md` — Market discovery flow, market details flow, suggestion flow
- `code-standards.md` — TypeScript standards, folder organization, component patterns
- `design-system.md` — Loading states, empty states, error states
- `ui-context.md` — Color tokens, typography, spacing
