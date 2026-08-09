# Feature Specification: Real-Time Market Discovery & Search Bar Integration

> **Spec Number**: 20  
> **File Path**: `context/feature-specs/20-market-search-and-discovery.md`  
> **Status**: 🟢 In Planning  
> **Depends On**: Spec 01-07 (Frontend Shell & Layouts), Spec 11 (Markets), Spec 14 (Cycle A Markets Live), Spec 19 (Critical Launch Fixes)

---

## 1. Executive Summary

This specification defines the functional, data, and user interface requirements for delivering a real-time prediction market discovery and search engine across Sheybi V2.

This specification governs:
1. Connecting `SearchDialog` (`components/dialog/features/search/search-dialog.tsx`) to live InstantDB database queries.
2. Real-time client-side substring matching across market titles, descriptions, category names, and option names.
3. Quick search pill tags (#BBNaija, #Eviction, #HeadOfHouse, #Winner) when the query is empty.
4. Seamless routing to market detail pages (`/markets/[id]`) upon result selection.
5. Integration of skeleton loading states using `SearchResultCardSkeleton`.
6. Accessibility focus trapping and keyboard navigation across desktop and mobile shell search regions.

---

## 2. System Boundaries & Data Requirements

### 2.1 InstantDB Query Integration
- `SearchDialog` **must** query InstantDB using `db.useQuery` for the `markets` entity namespace, fetching linked `category` and `options`.
- Mock database objects (`MOCK_DB`) **must** be permanently removed from `components/dialog/features/search/search-dialog.tsx`.
- The search query **must** execute reactively as the user types without requiring manual form submission buttons.

### 2.2 Substring Filter Algorithm
- Filtering **must** be case-insensitive.
- A market **must** match if the query string is a substring of any of the following fields:
  1. `market.title`
  2. `market.description`
  3. `market.category?.name`
  4. `option.name` (for any option linked to the market)
- Filtered results **must** be ordered with `open` state markets first, followed by `closed` or `resolved` markets.

### 2.3 Result Card Data Transformation
- Each result item rendered via `SearchResultCard` **must** map live database fields:
  - `title`: `market.title`
  - `imageUrl`: `market.imageUrl`
  - `category`: `market.category?.name` || `"General"`
  - `status`: `market.state.toUpperCase()`
  - `yesProbability`: `market.options[0]?.probability`
  - `closingDate`: `new Date(market.closingTime)`

---

## 3. Interaction & UI Requirements

### 3.1 Empty Query State & Quick Search Tags
- When the search input field is empty (`""`), the dialog **must** display:
  - Quick Search Tag Pills: `#BBNaija`, `#Eviction`, `#HeadOfHouse`, `#Winner`.
  - Clicking any quick search tag pill **must** populate the input value with the tag keyword and immediately filter markets.

### 3.2 Loading & Empty Search Results
- While InstantDB data is loading, `SearchDialog` **must** display 3 `SearchResultCardSkeleton` elements.
- When a search query produces zero matching markets, `SearchDialog` **must** display `DialogEmptyState` with a helpful message: *"No markets found matching '[query]'."*

### 3.3 Navigation & Dialog Lifecycle
- Clicking a `SearchResultCard` **must**:
  1. Close the `SearchDialog`.
  2. Navigate the router to `/markets/[id]` (using `market.id` or `market.slug`).
- Pressing `Esc` **must** close the search dialog cleanly.

---

## 4. Measurable Verification Criteria

- [x] `npx tsc --noEmit` passes with 0 errors.
- [x] No `MOCK_DB` references remain in `search-dialog.tsx`.
- [x] Search input in `DesktopHeader` and search button in `MobileHeader` both launch `SearchDialog`.
- [x] Typing a market title (e.g. "Eviction") filters matching markets in real-time.
- [x] Quick tag pills (#BBNaija, #Eviction) populate search input on click.
- [x] Clicking a search result item navigates to `/markets/[id]`.
- [x] Clean keyboard accessibility (Esc to close, Enter on result).
