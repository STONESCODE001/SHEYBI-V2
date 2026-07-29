# Feature Specification: Cycle A — Markets Feed & Detail Page Live

> **Feature Target**: Replace all mock market data with live InstantDB real-time data on the markets surfaces  
> **Status**: Ready to Implement  
> **Spec Number**: 14  
> **File**: `context/feature-specs/14-cycle-a-markets-live.md`  
> **Depends On**: Spec 13 infrastructure (DB seeded ✅, schema live ✅, hooks exist ✅)

---

## 1. Goal

Wire the three market surfaces — homepage, markets feed, and market detail page — to read directly from InstantDB using the existing `useMarkets` hook and `adaptMarketToCardProps` adapter. After this cycle, **zero mock market data** will be used on any of these pages.

---

## 2. Surfaces in Scope

| Page | File | Current State | Target State |
|---|---|---|---|
| Homepage | `app/page.tsx` | Partial — uses `useMarkets` but falls back to `MOCK_8_MARKETS` | Live only — no fallback |
| Markets Feed | `app/markets/page.tsx` | 100% mock — `MOCK_8_MARKETS` hardcoded | Live `useMarkets` query |
| Market Detail | `app/markets/[id]/page.tsx` | 100% mock — 3 inline mock objects | Live market by ID from InstantDB |

---

## 3. What Already Exists (Do NOT recreate)

- `lib/hooks/use-markets.ts` — reactive `db.useQuery` hook ✅
- `lib/hooks/use-categories.ts` — reactive categories hook ✅
- `lib/market-adapter.ts` — `adaptMarketToCardProps(market)` ✅
- `lib/mock-markets.ts` — **DELETE after this cycle** ✅ (exists now)
- Seeded DB — 3 live markets, 3 categories, 8 options ✅

---

## 4. Task 1 — Wire `app/markets/page.tsx`

### Current code (WRONG):
```tsx
import { MOCK_8_MARKETS } from "@/lib/mock-markets"
// ...
<MarketFeed markets={MOCK_8_MARKETS} />
```

### Required code:
```tsx
"use client"

import * as React from "react"
import { AuthenticatedLayout } from "@/components/layouts"
import { CategoryTabs, MarketFeed } from "@/components/parent"
import { useMarkets } from "@/lib/hooks/use-markets"
import { adaptMarketToCardProps } from "@/lib/market-adapter"

export default function MarketsPage() {
  const [activeTab, setActiveTab] = React.useState("all")

  const { markets: dbMarkets, isLoading } = useMarkets({
    state: activeTab === "all" ? undefined : "open",
    categorySlug: activeTab,
  })

  const displayedMarkets = React.useMemo(() => {
    if (!dbMarkets || dbMarkets.length === 0) return []
    return dbMarkets.map(adaptMarketToCardProps)
  }, [dbMarkets])

  return (
    <AuthenticatedLayout>
      <div className="flex flex-col gap-6">
        <CategoryTabs
          categories={[
            { value: "all", label: "All Markets" },
            { value: "trending", label: "Trending" },
            { value: "bbnaija", label: "BBNaija" },
            { value: "hoh", label: "Head of House" },
            { value: "evictions", label: "Evictions" },
          ]}
          activeCategory={activeTab}
          onCategoryChange={setActiveTab}
        />
        <MarketFeed markets={displayedMarkets} activeCategory={activeTab} loading={isLoading} />
      </div>
    </AuthenticatedLayout>
  )
}
```

---

## 5. Task 2 — Fix `app/page.tsx` Homepage

### Change:
Remove the fallback to `MOCK_8_MARKETS`. Instead show an empty state or loading skeleton when no markets exist.

```tsx
const displayedMarkets = React.useMemo(() => {
  if (isLoading) return []      // show loading skeleton, NOT mock data
  if (!dbMarkets || dbMarkets.length === 0) return []   // show empty state
  return dbMarkets.map(adaptMarketToCardProps)
}, [dbMarkets, isLoading])
```

Remove the `MOCK_8_MARKETS` import from `app/page.tsx`.

---

## 6. Task 3 — Wire `app/markets/[id]/page.tsx` Market Detail

### What to delete:
- `mockMultiOptionMarket` object (lines 17–44)
- `mockVersusMarket` object (lines 46–80)
- `mockBinaryMarket` object (lines 82–103)
- Hardcoded type detection by numeric ID strings (`marketId === "7"`, etc.)

### What to add:
A live `db.useQuery` call to fetch the real market by its InstantDB ID.

```tsx
"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { AuthenticatedLayout } from "@/components/layouts"
import { db } from "@/lib/instant"
import {
  BinaryMarketView,
  VersusMarketView,
  MultiOptionMarketView,
} from "@/components/parent/market-details"

export default function MarketDetailPage() {
  const params = useParams()
  const marketId = params?.id as string

  // Live query — fetches market + its options in real-time
  const { isLoading, error, data } = db.useQuery({
    markets: {
      options: {},
      category: {},
      $: { where: { id: marketId } },
    },
  })

  if (isLoading) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center min-h-[400px] text-[var(--text-muted)]">
          Loading market...
        </div>
      </AuthenticatedLayout>
    )
  }

  if (error || !data?.markets?.[0]) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center min-h-[400px] text-[var(--text-muted)]">
          Market not found.
        </div>
      </AuthenticatedLayout>
    )
  }

  const market = data.markets[0]
  const options = market.options || []

  // Determine display variant from database field
  const variant = market.displayVariant as "binary" | "1v1" | "standard"

  // Transform raw options to view-compatible shapes
  // (these shapes must match what BinaryMarketView / VersusMarketView / MultiOptionMarketView expect)
  // ... adapter logic here (or extract to market-adapter.ts)

  return (
    <AuthenticatedLayout>
      {variant === "standard" ? (
        <MultiOptionMarketView market={/* transformed data */} />
      ) : variant === "1v1" ? (
        <VersusMarketView market={/* transformed data */} />
      ) : (
        <BinaryMarketView market={/* transformed data */} />
      )}
    </AuthenticatedLayout>
  )
}
```

**Note**: The exact transformation from raw InstantDB market object to `BinaryMarketData`, `VersusMarketData`, `MultiOptionMarketData` view props must match the TypeScript interfaces defined in `components/parent/market-details/`. Extend `adaptMarketToCardProps` or write new adapter functions in `lib/market-adapter.ts`.

---

## 7. Task 4 — Delete Dead Files

After verifying all 3 surfaces show live data:

| File | Action |
|---|---|
| `lib/mock-markets.ts` | `DELETE` |
| `lib/repositories/mock-repository.ts` | `DELETE` |

---

## 8. Verification Checklist

- [ ] Homepage shows the 3 seeded markets (Kellyrae, Wanni vs Anita, Eviction multi-option)
- [ ] Markets feed page shows same 3 markets (no hardcoded mock data)
- [ ] Clicking a market card navigates to `/markets/[id]` and shows the correct view variant (binary → `BinaryMarketView`, 1v1 → `VersusMarketView`, multi-option → `MultiOptionMarketView`)
- [ ] Market detail shows real title, options, probabilities from InstantDB
- [ ] `isLoading` state shows skeleton/spinner — NOT mock data
- [ ] `lib/mock-markets.ts` is deleted
- [ ] `lib/repositories/mock-repository.ts` is deleted
- [ ] `npx tsc --noEmit` passes with zero errors

---

## 9. What Cycle A Completes

After Cycle A is done, the **markets surfaces of the app are fully live**. Users can see real prediction markets from the database. The data is reactive — if an admin creates a new market in InstantDB, it appears on the feed instantly with no page refresh.
