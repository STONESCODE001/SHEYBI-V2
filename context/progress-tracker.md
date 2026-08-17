# Progress Tracker

Update this document immediately after every completed implementation unit. This file records the current development state of Sheybi and provides the minimum context required to resume development without reviewing the entire project.

---

## Current Phase: Phase 4: Core Engine & Algorithm Implementation

### Current Implementation Target
- **Spec 21 — Influencer & Promoter Referral Tracking System** (`context/feature-specs/21-promoter-referral-tracking.md`) — **Completed**

---
   
# Current Goal

Influencer & Promoter Referral Tracking System completed 100%. Supports short links (`/f/[promoter]`), 30-day `sheybi_ref` cookies, InstantDB `promoters` and `$users.referredBy` schema, Clerk signup conversion sync, Admin Promoters Tab & `CreatePromoterDialog`, 1-click **Copy Link**, and server actions with audit logging. Verified with zero TypeScript errors and successful production build pass (`npm run build`).

---

# Completed

* **Spec 21 — Influencer & Promoter Referral Tracking System** (`context/feature-specs/21-promoter-referral-tracking.md`, `middleware.ts`, `instant.schema.ts`, `instant.perms.ts`, `lib/actions/promoter-actions.ts`, `lib/actions/wallet-provisioning.ts`, `components/admin/admin-promoters-tab.tsx`, `components/admin/create-promoter-dialog.tsx`, `app/admin/page.tsx`) — Completed 100%. (1) Next.js Middleware interception for `/f/[promoter]` short links and `?ref=` query parameters with 30-day `sheybi_ref` cookie setting and `NextResponse.rewrite('/')` so Vercel client analytics logs page hits; (2) InstantDB `$users` entity extension with `referredBy` and `referredAt` fields and `promoters` entity definition (`name`, `slug`, `status`, `notes`, `totalSignups`, `totalDepositedVolume`, `createdBy`); (3) Remote schema and permissions push to InstantDB Cloud (`npx instant-cli push schema` / `perms`); (4) Clerk signup conversion sync in `ensureUserWalletAction()` attaching `referredBy` to InstantDB `$users` records and incrementing `totalSignups` on `promoters`; (5) Server Actions (`createPromoterAction`, `togglePromoterStatusAction`, `deletePromoterAction`) with audit logging; (6) Admin Control Center Promoters tab with KPI stat cards, promoter table, 1-click **Copy Link** button (`sheybi.app/f/[slug]`), and `CreatePromoterDialog`. Verified with zero TypeScript errors (`npx tsc --noEmit`) and successful production build pass (`npm run build`).

* **Platform Revenue Ledger Filter Fix (`app/admin/page.tsx`)** — Completed 100%. Added `TRADING_FEE` to the ledger event filter in `app/admin/page.tsx` so trade fees (e.g. 2.5% fee entries) are included in the **Platform Revenue** KPI card alongside withdrawal fees.
* **InstantDB `$users` Auto-Creation Fix** (`lib/actions/wallet-provisioning.ts`) — Completed 100%. Updated `ensureUserWalletAction()` to upsert `$users` entity using `id()` from `@instantdb/admin` if an existing `$users` record is not found by email or `clerkUserId`. Guarantees 100% of brand new Clerk sign-ups are automatically inserted into InstantDB `$users` table.
* **InstantDB & Clerk User ID Sync, Permission Rules, and Real-time Trades/Wallet Fix** (`instant.schema.ts`, `instant.perms.ts`, `lib/actions/wallet-provisioning.ts`, `components/shell/constants.ts`) — Completed 100%. (1) Added indexed `clerkUserId` attribute to `$users` entity in `instant.schema.ts`; (2) Updated `instant.perms.ts` CEL permission rules for `positions`, `wallets`, `wallet_transactions`, `ledger`, `deposits`, `withdrawal_requests`, `market_suggestions`, `notifications`, and `kyc_records` to validate `data.userId in auth.ref('$user.clerkUserId')`; (3) Updated `ensureUserWalletAction()` in `lib/actions/wallet-provisioning.ts` to sync `clerkUserId: userId` onto InstantDB `$users` entity during authentication; (4) Updated `PLACEHOLDER_BALANCE` to `₦0.00` in `components/shell/constants.ts`; (5) Pushed updated schema (`npx instant-cli push schema`) and security permissions (`npx instant-cli push perms`) to InstantDB Cloud.
* **Standardized 1v1 Probability Normalization** (`lib/market-adapter.ts`, `components/parent/market-details/versus-market-view.tsx`) — Completed 100%. (1) Updated `adaptMarketToCardProps` and `adaptToVersusMarketData` in `lib/market-adapter.ts` to calculate contestant probabilities relative to their pair sum ($P_{\text{P1 YES}} / (P_{\text{P1 YES}} + P_{\text{P2 YES}})$); (2) Ensured un-traded markets consistently render **50% vs 50%** badges, **50% Green / 50% Yellow** ratio bars, and **₦1k → ₦2k** odds; (3) Updated `versus-market-view.tsx` to read adapter normalized probabilities directly without forcing a `100 - p1Prob` override.
* **1v1 Market UX & Clarity Enhancements** (`components/child/odds-button.tsx`, `components/parent/market-card.tsx`, `components/parent/market-details/versus-market-view.tsx`) — Completed 100%. 
  1. **`OddsButton` Component Refinement (`odds-button.tsx`)**: Maintained clean, uncluttered action buttons (`YES  ₦1k → ₦3k` / `NO  ₦1k → ₦5k`), omitting inline subtext in favor of dedicated micro info banners directly below each button pair.
  2. **1v1 Grid Cards Redesign (`market-card.tsx`)**: 
     - **Clean Uniform Avatar Borders**: Applied clean, uniform subtle borders (`border border-white/10`) across contestant headshot containers, removing asymmetrical top-only borders.
     - **Unambiguous Ratio Bar Labels**: Formatted top ratio bar labels to explicit outcome win probabilities: `${Math.round(yesProbability)}% Win Chance` on the green left side and `${Math.round(noProbability)}% Win Chance` on the yellow right side.
     - **Accent Yellow CTA Button**: Replaced confusing bottom `YES / NO` buttons with a single full-width CTA button **`Predict Matchup →`** styled in Sheybi Accent Yellow (`#FFC91F`) with dark font-black text (`#0B101D`) and active hover scale effects.
  3. **1v1 Market Detail Page Enhancements (`versus-market-view.tsx`)**: 
     - **Borderless Master Hint Banner**: Replaced heavy gold-bordered alert box with a sleek, borderless dark hint card (`bg-[#141E33] border-none`) featuring Lucide `HelpCircle` icon in Info Blue (`#0EA5E9`): `How 1v1 Predictions Work: Pick YES if you think that candidate will win, or NO if you think they will lose.`
     - **Mobile View Simplification**: Omitted redundant `% Chance` pill badges below contestant headshots on mobile to streamline vertical space and reduce scrolling distance.
     - **Dual Micro Info Banners**: Added dedicated micro hint banners directly under **both** Contestant 1 and Contestant 2 action blocks featuring Lucide `HelpCircle` icon in Info Blue (`#0EA5E9`): `<HelpCircle /> YES = [Name] wins | NO = [Name] loses`.
     - **Clean Uniform Avatar Borders**: Enforced uniform subtle borders (`border border-white/10`) across all contestant avatar frames in both mobile stacked and desktop dual-column layouts.
* **1v1 Matchup Card Classification & Detail View Parsing Fix** (`lib/market-adapter.ts`, `components/parent/market-details/versus-market-view.tsx`) — (1) Updated `adaptMarketToCardProps` to prioritize `displayVariant === '1v1'` over `marketType === 'multi_option'` so feed cards render as 1v1 headshot cards; (2) Parsed 4-option 1v1 DB structures (`[A YES, A NO, B YES, B NO]`) into clean Contestant 1 (*A Male*) vs Contestant 2 (*A Female*) data; (3) Added `yesOptionId` and `noOptionId` to `PlayerData` in `versus-market-view.tsx` so clicking YES or NO under a contestant targets their exact option ID.
* **Spec 20 — Real-Time Market Discovery & Search Bar Integration** (`context/feature-specs/20-market-search-and-discovery.md`) — Completed 100%. (1) Replaced `MOCK_DB` in `SearchDialog` with live InstantDB `db.useQuery` for `markets` fetching linked `category` and `options`; (2) Case-insensitive substring matching algorithm across market titles, descriptions, category names, and option names with fallback normalized matching; (3) Priority sorting rendering `open` state markets first; (4) Quick search tag pills (`#BBNaija`, `#Eviction`, `#HeadOfHouse`, `#Winner`) populating search query on click; (5) Skeleton loaders (`SearchResultCardSkeleton`) during query loading; (6) `DialogEmptyState` rendering `"No markets found matching '[query]'."`; (7) Routing to `/markets/[id]` upon selecting a search result card; (8) Keyboard navigation (`Esc` to close, `Enter` / `Space` selection).

* Product vision established.
* Project scope defined.
* Core application architecture documented.
* Prediction Engine specification completed.
* Database schema documented.
* UI context documented.
* Design system documented.
* Code standards documented.
* API contract structure documented.
* AI workflow rules documented.
* Design System Foundation (`context/feature-specs/01-design-system.md`)
* UI Primitives (`context/specs/frontend/01-ui-primitives.md`)
* Child Components (`context/specs/frontend/02-child-components.md`)
* Parent Components (`context/feature-specs/03-parent-components.md`)
* Layouts (`context/feature-specs/05-layouts.md`)
* Application Shell (`context/feature-specs/04-application-shell.md`)
* Pages (`context/feature-specs/06-pages.md`)
* Dialog Framework (`context/feature-specs/07-dialog.md`)
* Real-Time User Authentication Specification (`context/feature-specs/08-realtime-authentication-spec.md`)
* Design System Foundation & `globals.css` rewrite in v2 (`app/globals.css`).
* Shell Background & Sidebar Card Layout Alignment (`components/shell/*`).
* Notification Pause, Yellow Wallet Chip & Desktop Sidebar Figma Alignment (`components/shell/*`).
* Desktop Sidebar 3-Tier Elevated Parent Container Architecture Alignment (`components/shell/desktop-sidebar.tsx`).
* Authenticated Sidebar Navigation Buttons Alignment (`components/shell/constants.ts`).
* Live Market Ticker Implementation Pause & Documentation Recording (`components/shell/application-shell.tsx`).
* Borderless Shell Headers & Desktop Sidebar Alignment (`components/shell/*`).
* Homepage Figma Design Alignment documentation (`ui-context.md`, `wireframe.md`, `design-system.md`, `progress-tracker.md`) detailing 3D Mascot graphic (`/sheybi-mascot.png`), "Predict The Outcome. Win Bigger." Hero Banner typography, Category Filter tabs (`Trending`, `Weekly`, `HOH`), Market Grid layout, and Footer Region.
* Homepage Hero Header UI & Category Tabs Implementation (`components/parent/hero-banner.tsx`, `components/parent/category-tabs.tsx`, `app/page.tsx`, `app/dashboard/page.tsx`) rendering 3-line stacked typography ("Predict", "The Outcome.", "Win Bigger.") with bold font-black styling, left-aligned mobile text, mascot graphic hidden on mobile and enlarged on desktop (`/sheybi-mascot.png`), consistent wording across auth/guest states, and category filter pills (`Trending`, `Weekly`, `HOH`).
* MarketFeed Expander Button (`components/parent/market-feed.tsx`) adding a full-width `see more ...` dark pill button below market grids for mobile/desktop and auth/unauth users linking directly to `/markets`.
* Real-Time User Authentication (`context/feature-specs/08-realtime-authentication-spec.md`) integrating Clerk (`@clerk/nextjs`, `@clerk/themes`), `ClerkProvider` inside `<body>` in `app/layout.tsx`, `middleware.ts` route protection & admin metadata role guard (`await auth()`), catch-all auth pages (`/auth/sign-in/[[...sign-in]]`, `/auth/sign-up/[[...sign-up]]`), `<UserButton />` in `UserProfileRegion`, and embedded `<UserProfile />` in `app/profile/page.tsx`.
* Real-Time User Authentication Specification & Verification (`context/feature-specs/08-realtime-authentication-spec.md`) — Verification of Clerk authentication, route guards, admin metadata role protection, and UI shell profile components completed 100%.
* Lean Admin Module Feature Specification & Control Workspace (`context/feature-specs/09-lean-admin-spec.md`, `app/admin/page.tsx`, `components/admin/*`) featuring Platform Financial Summary KPI cards, Market Management Table with `CreateMarketDialog` (Binary & Multi-option probability checksums) and `ResolveMarketDialog`, User Market Suggestions Queue with pre-fill trigger, Withdrawal Requests Review with `WithdrawalActionDialog`, Category Taxonomy Manager, and Immutable System Audit Logs.
* Prediction Engine Algorithm Specification & Implementation (`context/feature-specs/10-prediction-algorithm.md`, `lib/prediction-engine/lmsr.ts`, `lib/prediction-engine/types.ts`, `lib/prediction-engine/run-tests.ts`) implementing Logarithmic Market Scoring Rule (LMSR) softmax pricing, $b$ parameter calculation from Naira liquidity, closed-form buy/sell share calculation, probability normalization to 100%, single-outcome exposure invariant, withdrawal fee 3.0%, and automated invariant test suite passing 100%.
* InstantDB Graph Schema Definition (`instant.schema.ts`) supporting `categories`, `markets` (`state`: `"draft" | "scheduled" | "open" | "paused" | "closed" | "resolved" | "cancelled"`), `market_options`, `positions`, `wallets`, `ledger`, `market_activity`, `market_suggestions`, and `audit_logs`.
* Market Action Validation & Dialog Components (`lib/actions/market-actions.ts`, `components/dialog/features/market/*`, `components/dialog/register-dialogs.ts`) implementing `ResolveMarketDialog` (with ALL CAPS market title match safeguard), `ReopenMarketDialog` (reopening `closed` markets), and `PauseMarketDialog` (emergency situational pausing).
* Prediction Algorithm Specification & Implementation (`context/feature-specs/10-prediction-algorithm.md`, `lib/prediction-engine/lmsr.ts`, `lib/prediction-engine/types.ts`, `lib/prediction-engine/lmsr.test.ts`, `lib/prediction-engine/run-tests.ts`) — Verified LMSR mathematical pricing engine, $b$ parameter calculation, closed-form buy/sell share formulas, probability normalization to 100%, single-outcome exposure invariant, numerical log-sum-exp stabilization, and automated test suite passing 100%.
* Markets Feature Real-Time Specification & Implementation (`context/feature-specs/11-markets-feature.md`, `lib/instant.ts`, `lib/instant-admin.ts`, `lib/hooks/use-markets.ts`, `lib/hooks/use-categories.ts`, `lib/market-adapter.ts`, `app/page.tsx`, `app/dashboard/page.tsx`) — InstantDB graph schema initialization, client and server admin configuration, real-time reactive query hooks (`useMarkets`, `useCategories`), data adapter (`adaptMarketToCardProps`), and real-time feed integration across guest and authenticated pages.
* InstantDB Full System Integration (`lib/repositories/index.ts`, `lib/repositories/instantdb-repository.ts`, `components/auth/instant-clerk-bridge.tsx`, `lib/storage.ts`, `app/layout.tsx`, `context/instantDBagentfile.md`) — Swapped primary repository export to `instantDbRepository` for live server action mutations, implemented Instant Storage helper `lib/storage.ts` using `db.storage.uploadFile`, mounted `<InstantClerkBridge />` in `app/layout.tsx` for automatic Clerk session token sync via `db.auth.signInWithIdToken`, and verified 100% architectural and API contract compliance.
* InstantDB Remote Schema & CEL Permissions Cloud Deployment (`npx instant-cli push schema`, `npx instant-cli push perms`) — Pushed 15 graph entity namespaces (`$users`, `markets`, `market_options`, `wallets`, `positions`, `ledger`, `deposits`, `withdrawal_requests`, etc.) and CEL permission rules to InstantDB cloud app `5979c681-39cb-4421-9181-05786260e9bd`.
* InstantDB Live Database Seed Script (`lib/seed/seed-instantdb.ts`) — Created and executed `seed-instantdb.ts` populating 3 categories (*BBNaija Season 9*, *Head of House*, *Eviction Predictions*) and 3 live prediction markets (Binary, 1v1, Multi-option) with initial probabilities and LMSR liquidity parameters ($L=₦50,000$, $b=36067$).
* Clerk Auth & InstantDB User Profile / Wallet Auto-Sync (`lib/actions/wallet-provisioning.ts`, `components/auth/instant-clerk-bridge.tsx`) — Auto-syncs Clerk user profile metadata (`email`, `displayName`, `avatarUrl`) into InstantDB `$users` entity and provisions linked `wallets` entity upon login/signup.
* Full InstantDB & Prediction Engine Integration Specification (`context/feature-specs/13-full-instantdb-prediction-engine-integration.md`).
* Cycle A — Markets Feed & Detail Page Live (`context/feature-specs/14-cycle-a-markets-live.md`) — Removed all mock market data from homepage (`app/page.tsx`), markets feed (`app/markets/page.tsx`), dashboard (`app/dashboard/page.tsx`), and market details (`app/markets/[id]/page.tsx`). Wired live InstantDB reactive queries (`useMarkets`, `db.useQuery`), expanded `lib/market-adapter.ts` with detail view adapters (`adaptToBinaryMarketData`, `adaptToVersusMarketData`, `adaptToMultiOptionMarketData`), and permanently deleted `lib/mock-markets.ts` and `lib/repositories/mock-repository.ts`.
* Cycle B — Trading, Wallet & Portfolio Live (`context/feature-specs/15-cycle-b-trading-wallet-portfolio-live.md`, `context/feature-specs/15a-payment-state-and-wallet-seeding.md`) — Created real-time reactive hooks (`useWallet`, `useLedger`, `usePositions`), auto-seeded ₦50,000 demo funds for new wallets in `ensureUserWalletAction()`, wired `app/wallet/page.tsx` and `app/portfolio/page.tsx` directly to InstantDB live query hooks, connected `TradeDialog` to `buyPositionAction` (LMSR engine recalculation & InstantDB probability sync), connected `sellPositionAction` to portfolio cards, and wired `DepositDialog` and `WithdrawDialog` to server actions.
* Cycle C — Admin Panel Live Wiring & Operational Refinements (`context/feature-specs/16-cycle-c-admin-live.md`) — Fixed market creation publishing to `state: 'open'`, added 1v1 contestant self-hosted image URL fields, persisted live `withdrawal_requests` with bank details to InstantDB, wired admin approval flow (`approveWithdrawalAction`) with audit logging (`APPROVE_WITHDRAWAL` / `REJECT_WITHDRAWAL`), converted `WithdrawalActionDialog` to canonical dark theme (`#0F1727` container, `#0B0E14` cards), calculated app-wide Platform Revenue (summing all withdrawal & trade fees across all users), and formatted transaction history reductions with a minus sign (`-₦X`).
* Trade History Sync, Wallet DB Sync & Odds Precision — Fixed trade history update by querying InstantDB market activity and extracting live trade items; scaled LMSR probabilities to 0-100 percentage scale in database and adapters (`45.69% Chance` / `45% Chance`); applied compact odds precision digit limits (`1.7k`, `20k`, `123k`, `178k`); wired `useWallet()` to header `ApplicationShell` for live database balance updates; and integrated `Upward ↑` (Green) / `Downward ↓` (Red) bet trend indicators in `TradeDialog`.
* Admin Control Center Dark Theme Conversion via Design System Tokens — Enforced `.dark` theme scope on `ApplicationShell` (for `variant="admin"`) and `app/admin/page.tsx`; updated all admin cards, tables, inputs, tab bars, and modals (`CreateMarketDialog`, `WithdrawalActionDialog`, `ResolveMarketDialog`, `PauseMarketDialog`) to use official `app/globals.css` design system semantic tokens (`bg-bg-base` `#0B0E14`, `bg-bg-surface` `#0F1727`, `bg-bg-surface-secondary` `#141E30`, `border-border` `#1E2A3F`, `text-text-primary` `#FFFFFF`).
* Admin Market Resolution Button & Backend Wiring — Added explicit **Resolve** market action button alongside Pause/Unpause in `AdminMarketsTab` for all active, open, paused, and closed markets; updated `resolveMarketAction` in `lib/actions/market-actions.ts` to allow resolving open, paused, closed, or draft markets; and verified full InstantDB backend payout calculation and balance distribution upon resolution.
* **Spec 17 — Paystack Full Integration (`@paystack/inline-js`) & Verification Lifecycle** (`context/feature-specs/17-paystack-integration.md`) — Complete audit verified: (1) `lib/actions/paystack-actions.ts` with 4 server actions (`initializePaystackTransaction`, `verifyAndCreditDeposit`, `fetchNigerianBanks` with 24h cache & priority commercial bank sorting, `resolveBankAccount` with exact API error extraction); (2) `app/api/webhooks/paystack/route.ts` webhook handler with HMAC-SHA512 `timingSafeEqual` signature verification & idempotency guards; (3) `@paystack/inline-js` package integration in `DepositDialog` with dynamic client import.
  * **Critical Architecture Fix (Payment Lifecycle):** Resolved a silent verification failure where calling `onClose()` before opening the Paystack popup caused Next.js to unmount the `DepositDialog`, aborting the `onSuccess` server action fetch. Fixed by introducing a `waiting` state, ensuring the component stays mounted until verification completes, and explicitly overriding `callback_url: ''` to prevent aggressive browser redirects from Paystack dashboard settings. Handled fallback external redirects gracefully in `app/wallet/page.tsx` using a `<Suspense>` bounded `useSearchParams` URL parser that silently credits orphaned transactions upon user return.

* **Spec 19 — Critical Launch Fixes, Data Optimization, KYC Verification & UX Hardening** (`context/feature-specs/19-critical-launch-fixes-and-kyc.md`) — Completed 100%. (1) Server-side isolated InstantDB queries for market details (`/markets/[id]`) and user-scoped withdrawal requests (`/wallet`); (2) Package identity standardized to `"sheybi"`; (3) Unauthenticated guest access to `/markets` feed via `PublicLayout`; (4) Trending markets filtering (`tradingVolume > 0`) & descending volume ordering; (5) Simplified Identity Verification (KYC) flow supporting 11-digit NIN validation or document image upload; (6) Reactive `useKyc` hook, dynamic wallet status badge mapping (`Unverified`, `Pending KYC`, `Active`, `KYC Rejected`), and pre-withdrawal KYC enforcement (`KYC_REQUIRED`); (7) Admin KYC control panel with masked NIN display (`*****32194`), thumbnail previews, external image tab links, and audit-logged approval/rejection actions; (8) Reusable skeleton suite (`MarketCardSkeleton`, `WalletCardSkeleton`, `ActivityItemSkeleton`); (9) Server route SEO metadata exports across `/`, `/markets`, `/markets/[id]`, `/wallet`, and `/portfolio`.

* **Individual Candidate Option Pausing (Multi-Option Markets)** — Completed 100%. (1) Updated `instant.schema.ts` with `isPaused: i.boolean().optional()` attribute on `market_options` entity; (2) Pushed schema definition and indexes to InstantDB cloud (`npx instant-cli push schema --yes`); (3) Added `toggleOptionPauseAction` server action in `lib/actions/market-actions.ts` with activity log and audit trail records (`PAUSE_MARKET_OPTION` / `UNPAUSE_MARKET_OPTION`); (4) Guarded `buyPositionAction` and `sellPositionAction` in `lib/actions/trade-actions.ts` to reject trades targeting paused options (`"Trading for this option is currently paused."`); (5) Mapped `isPaused` in `lib/market-adapter.ts` (`adaptToMultiOptionMarketData`); (6) Updated `MultiOptionMarketView` in `components/parent/market-details/multi-option-market-view.tsx` to hide YES and NO odds buttons for paused candidates and display an amber `TRADING PAUSED` status badge; (7) Created `ManageOptionsDialog` (`components/admin/manage-options-dialog.tsx`) and added `Options` control button in `AdminMarketsTab` (`components/admin/admin-markets-tab.tsx`) wired to `/admin` dashboard.

* **Seed Volume Registration, Equal Candidate Seed Distribution & Admin Featured Toggle** — Completed 100%. (1) Updated `prepareMarketCreationData` in `lib/actions/market-validation.ts` to initialize `tradingVolume: liquidity` on creation; (2) Updated `adaptToMultiOptionMarketData` in `lib/market-adapter.ts` to split seed volume equally across candidate rows (`candidateSeedVolume = liquidity / N`); (3) Implemented `toggleMarketFeaturedAction` in `lib/actions/market-actions.ts` to star/unstar featured markets; (4) Added 1-click **Featured / Trending** star toggle button in `AdminMarketsTab` table and checkbox in `CreateMarketDialog`; (5) Ensured continuous real-time volume updates across Market Cards, Market Details Headers, and Candidate Row Cards.

* **Trade Dialog Header Redesign & Action Confirmation** — Completed 100%. (1) Replaced static `"Place Prediction"` top title in `TradeDialog` with prominent, bold market question header; (2) Added high-contrast prediction pill badge (`PREDICTING YES FOR ABI` / `PREDICTING NO FOR ABI` / `SELLING POSITION`); (3) Removed redundant `"Upward ↑"` and `"Downward ↓"` helper labels for clean YES/NO selection buttons; (4) Updated bottom action button to state explicit prediction confirmations (`Confirm YES for Abi — ₦1,000` / `Confirm YES — ₦1,000`); (5) Verified across Binary, Versus, and Multi-Option market views with 100% clean production build pass (`npm run build`).

---

# In Progress

- None.

# Next Up

Implementation will continue in the following order:

1. **Cycle E: Real-time Notification Feed & Platform Activity Ticker** (`useNotificationFeed`, header bell dropdown, live trade activity stream)
2. **Phase 10: Production Deployment & Domain Setup**

---

# Open Questions

Record unresolved product, technical, or architectural decisions here.

Current status:

* None.

---

# Architecture Decisions

Record only decisions that permanently affect the architecture of the platform.

| Decision                                         | Reason                                                             |
| ------------------------------------------------ | ------------------------------------------------------------------ |
| Specification-first development                  | Prevent implementation drift and inconsistent system behaviour.    |
| Prediction Engine owns all market logic          | Centralizes business rules and prevents duplicate implementations. |
| Documentation acts as the single source of truth | Eliminates conflicting documentation and undocumented behaviour.   |
| Feature specifications are created individually  | Keeps implementation scoped, reviewable, and independent.          |
| Tailwind CSS and shadcn/ui for components        | Rapid, consistent UI development based on `base-nova` style.       |
| Notifications & Settings Paused                  | Streamline MVP scope by omitting Notifications & Settings pages.   |
| Topbar Wallet Chip Direct Route Navigation       | Wallet balance chip navigates directly to `/wallet` page.         |
| Market Suggestion FAB Trigger                    | Center `+` FAB opens Market Suggestion dialog/bottom-sheet.        |
| Permanent Dark Theme Aesthetic (`#0B0E14`)        | Enforce dark theme (#0B0E14 base, #0F1727 surface) project-wide.   |
| Canonical Design System (`globals.css`)          | Use `app/globals.css` as single source of truth for design tokens. |
| Permanent Removal of CategoryNavigationRegion    | Omit desktop sidebar categories section per Figma layout.          |
| Simulated Auth & Transient UI Mock Phase         | Retain mock auth state and static datasets until Phase 4 Real DB.  |
| InstantDB Realtime Database Architecture         | Use InstantDB graph schema for instant real-time sync & optimistic updates. |

---

# Session Notes

Current project status:

* Documentation phase is complete.
* Design System Foundation implementation is complete (Tailwind v4, Shadcn UI setup).
* UI Primitives implementation is complete.
* Child Components implementation is complete (11 components in `components/child/`).
* Parent Components implementation is complete (13 components in `components/parent/`).
* Layouts implementation is complete (8 layouts in `components/layouts/`).
* Application Shell implementation is complete (`components/shell/`).
* No database has been implemented.
* No backend services have been implemented.
* No external integrations have been implemented.

---

# Change Log

Make sure you update this section after every meaningful implementation unit.

* **2026-07-20**
  * **Feature Completed:** Design System Foundation (`01-design-system.md`).
  * **Files Modified:** `app/globals.css`, `app/layout.tsx`, `package.json`, `components.json`, `lib/utils.ts`, `components/ui/*`.
  * **Decisions:** Used Next.js app router, Tailwind CSS v4, and shadcn/ui base-nova style.
  * **Follow-up:** Start working on the Authentication System feature spec.

* **2026-07-21**
  * **Feature Completed:** Child Components (`02-child-components.md`).
  * **Files Created:** `components/child/countdown-timer.tsx`, `notification-dot.tsx`, `market-outcome-chip.tsx`, `percentage-indicator.tsx`, `statistic-display.tsx`, `empty-illustration.tsx`, `error-indicator.tsx`, `success-indicator.tsx`, `navigation-icon.tsx`, `card-image.tsx`, `action-icon.tsx`, `index.ts`.
  * **Decisions:** Combined Share/Bookmark/Favorite into generic `ActionIcon`; paired `StatisticValue`/`StatisticLabel` in single file; used key-based remounting for `CardImage` to avoid effect-based setState.
  * **Follow-up:** Begin Parent Components specification (`03-parent-components.md`).

* **2026-07-21**
  * **Feature Completed:** Parent Components (`03-parent-components.md`).
  * **Files Created:** 13 parent components in `components/parent/` including `hero-banner.tsx`, `market-card.tsx`, `market-feed.tsx`, `wallet-card.tsx`, `portfolio-card.tsx`, `statistic-card.tsx`, `activity-card.tsx`, `category-tabs.tsx`, `section-header.tsx`, `trade-panel.tsx`, `search-result-card.tsx`, `notification-item.tsx`, `profile-summary-card.tsx`, and `index.ts`.
  * **Decisions:** Implemented responsive cards and interactive components matching the design tokens without adding new dependencies.
  * **Follow-up:** Begin Layouts specification (`04-layouts.md`).

* **2026-07-21**
  * **Bug Fixes & Refinements:** Component Accessibility, Layout & Spec Adjustments.
  * **Files Modified (Intentionally scoped to UI components & specs):** `components/child/action-icon.tsx`, `components/child/card-image.tsx`, `components/child/countdown-timer.tsx`, `components/child/empty-illustration.tsx`, `components/child/index.ts`, `components/parent/category-tabs.tsx`, `components/parent/notification-item.tsx`, `components/parent/profile-summary-card.tsx`, `components/parent/search-result-card.tsx`, `components/parent/trade-panel.tsx`, `context/feature-specs/03-parent-components.md`, `context/specs/frontend/03-parent-components.md`.
  * **Decisions:** Resolved accessibility semantics, aria attributes, tabIndex focus rules, size variant cleanups, and specification location metadata.
  * **Follow-up:** Proceed with Layouts implementation.

* **2026-07-21**
  * **Feature Completed:** Layouts (`04-layouts.md` / renumbered `05-layouts.md`).
  * **Files Created:** 8 layout components in `components/layouts/` including `public-layout.tsx`, `authenticated-layout.tsx`, `admin-layout.tsx`, `centered-layout.tsx`, `blank-layout.tsx`, `error-layout.tsx`, `loading-layout.tsx`, `maintenance-layout.tsx`, and `index.ts`.
  * **Decisions:** Followed strict compositional architecture by keeping feature-specific UI out of layouts, ensuring they only act as structural foundations and accept regions as props. Verified responsive design rules per documentation.
  * **Follow-up:** Begin Application Shell specification (`04-application-shell.md`).

* **2026-07-22**
  * **Feature Completed:** Application Shell (`04-application-shell.md`).
  * **Files Created:** `components/shell/*` including `application-shell.tsx`, region components (sidebar, headers, drawer, bottom nav, ticker, wallet/profile/nav/search/notification regions, overlay layers), `constants.ts`, `types.ts`, `index.ts`; host route `app/page.tsx`.
  * **Files Modified:** `app/globals.css` (ticker animation), `app/error.tsx` (ErrorLayout prop alignment for build), `context/progress-tracker.md`.
  * **Decisions:** Shell owns all persistent UI regions; Guest / Authenticated / Admin variants via `variant` prop; responsive behaviour via CSS breakpoints (mobile / md tablet / lg desktop); Clerk and wallet values use placeholders (auth & wallet logic out of scope); overlay z-index stack matches spec (drawer 30 → dialog 40 → toast 50 → loading 100).
  * **Verification:** `npm run build` succeeds with zero errors. All acceptance criteria and verification checklist items verified successfully. No missing requirements found.
* **2026-07-22**
  * **Feature Completed:** Layouts composition alignment with Application Shell (`05-layouts.md`).
  * **Files Modified:** `components/layouts/authenticated-layout.tsx`, `components/layouts/public-layout.tsx`, `components/layouts/admin-layout.tsx`.
  * **Decisions:** Refactored shell-composing layouts to act purely as structural containers. Replaced duplicated shell markup with `<ApplicationShell variant="...">` imports. Verified that container layouts (`centered-layout`, `error-layout`, etc.) already conformed to the architecture.
  * **Verification:** `npm run build` succeeds with zero errors, validating the structural integrity of the composed components.
  * **Follow-up:** Begin Pages implementation (`06-pages.md`).

* **2026-07-22**
  * **Feature Completed:** Dialogs Specification (`07-dialog.md`).
  * **Files Modified:** `context/feature-specs/07-dialog.md`, `context/progress-tracker.md`.
  * **Decisions:** Structured the reusable Dialog Framework addressing all 16 user review items (ownership rules, registry, promise-based API, queue behavior, dimensions, variants, z-index overlays, performance rules, testing invariants).
  * **Verification:** `npm run build` succeeds with zero errors, validating the frontend architecture.
  * **Follow-up:** Begin Markets specification.

* **2026-07-24**
  * **Feature Completed:** Reusable Dialog Framework (`07-dialog.md`).
  * **Files Created/Modified:** `components/dialog/*` including `dialog-context.tsx`, `dialog-registry.ts`, `dialog-viewport.tsx`, `index.ts`, `primitives.tsx`, `register-dialogs.ts`, `responsive-wrapper.tsx`, `types.ts`, `use-media-query.ts`, `infrastructure/*` (14 infrastructure dialogs), `features/*` (Market, Wallet, Profile, Search, Settings, Notification feature dialogs).
  * **Decisions:** Built complete Radix UI & React Context dialog infrastructure supporting promise-based modal calls (`confirm`, `alert`, `error`, `loading`), responsive drawer sheets/modals, financial lock safety rules, focus trapping, scroll locking, and accessible ARIA dialog regions.
  * **Verification:** Implementation fully completed and verified.

* **2026-07-24**
  * **Refinement Completed:** MarketCard Navigation to Market Details (`/markets/[id]`).
  * **Files Modified:** `components/parent/market-card.tsx`, `app/page.tsx`, `app/markets/page.tsx`, `app/dashboard/page.tsx`.
  * **Decisions:** Imported Next.js `Link`, extended `MarketCardProps` with `id?: string`, wrapped thumbnail image and title in `<Link href={`/markets/${id}`}>` per `03-parent-components.md` spec while preserving isolated button event propagation for Trade and Action icons. Added stable `id` fields to mock datasets across pages.
  * **Verification:** `npm run build` succeeds with zero errors. All 27 application routes compiled cleanly.

* **2026-07-24**
  * **Feature Completed:** 80/20/10 Design System Refactoring & Token Standardization.
  * **Files Modified:** `components/parent/hero-banner.tsx`, `components/ui/button.tsx`, `components/parent/setting-card.tsx`, `components/parent/placeholder-feedback-card.tsx`, `components/parent/admin-table.tsx`, `app/profile/page.tsx`, `app/loading.tsx`, `app/admin/settings/page.tsx`.
  * **Decisions:** Refactored HeroBanner container background to 80% `--bg-surface` neutral surface with `--border-default` border and `--text-primary` typography, reserving `--accent-primary` for the 10% CTA button focal point. Removed hardcoded `#080B14` hex color in button primitive. Standardized all non-standard tokens (`--surface`, `--surface-subtle`, `--surface-variant`) to standard 80/20/10 CSS variables (`--bg-surface`, `--bg-surface-secondary`).
  * **Verification:** `npm run build` completed successfully in 32.1s with zero errors across all 27 routed pages.

* **2026-07-26**
  * **Feature Completed:** Unauthenticated (Guest) Shell & Footer Alignment.
  * **Files Modified/Created:** `public/logo.png`, `components/shell/shell-logo.tsx`, `components/shell/footer-region.tsx` [NEW], `components/shell/constants.ts`, `components/shell/types.ts`, `components/shell/user-profile-region.tsx`, `components/shell/desktop-header.tsx`, `components/shell/mobile-header.tsx`, `components/shell/bottom-navigation.tsx`, `components/shell/application-shell.tsx`, `components/shell/index.ts`, `context/progress-tracker.md`.
  * **Decisions:** Integrated Sheybi logo asset `/logo.png` with tagline `PREDICT. PLAY. WIN.`; added `<FooterRegion />` with legal financial disclaimers and quick links; aligned guest sidebar & bottom nav to 5 items with yellow active tabs and yellow `+` card button; added dual **Log In** & **Sign up** buttons in guest mobile header and sidebar.
  * **Verification:** `npm run build` completed successfully with zero errors across all application routes.

* **2026-07-26**
  * **Refinement & Policy Enforcement Completed:** Desktop Sidebar Categories Removal & Scrollbar Hiding.
  * **Files Modified:** `components/shell/desktop-sidebar.tsx`, `context/feature-specs/04-application-shell.md`, `context/ui-context.md`, `context/design-system.md`, `context/progress-tracker.md`.
  * **Decisions:** Removed `<CategoryNavigationRegion />` from Desktop Sidebar; enforced policy that desktop sidebar contains no categories section; added custom scrollbar hiding utility (`[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden`); updated core architecture and design system invariants to strictly enforce this rule across all future iterations.
  * **Verification:** `npm run build` completed successfully with zero errors across all 27 application routes.

* **2026-07-26**
  * **Feature Completed:** Shell Background & Sidebar Card Layout Alignment (Figma Alignment).
  * **Files Modified:** `components/shell/mobile-header.tsx`, `components/shell/desktop-header.tsx`, `components/shell/primary-navigation.tsx`, `components/shell/user-profile-region.tsx`, `components/shell/application-shell.tsx`, `context/ui-context.md`, `context/design-system.md`, `context/progress-tracker.md`.
  * **Decisions:** Removed mobile hamburger drawer menu icon from `MobileHeader` per Figma screens; updated `DesktopHeader` and `MobileHeader` container backgrounds from elevated surface color (`#0F1727`) to main base background color (`bg-[var(--bg-base)]` `#0B0E14`); styled inactive sidebar navigation items (`Market`, `Trades`, `Wallet`), `+` box, and bottom profile box as rounded card containers using `bg-[var(--bg-base)]` (`#0B0E14`) inside elevated sidebar; active item (`Home`) renders as filled yellow (`#FFC107`) card box with dark text (`#0B0E14`).
  * **Verification:** `npm run build` completed successfully in 62s with zero errors across all 27 application routes.

* **2026-07-26**
  * **Feature Completed:** Notification Pause, Yellow Wallet Chip & Desktop Sidebar Figma Alignment.
  * **Files Modified:** `components/shell/desktop-header.tsx`, `components/shell/wallet-chip.tsx`, `components/shell/primary-navigation.tsx`, `components/shell/user-profile-region.tsx`, `context/ui-context.md`, `context/design-system.md`, `context/progress-tracker.md`.
  * **Decisions:** Paused notification implementation and removed `<NotificationRegion />` from `DesktopHeader`; updated `WalletChip` to render as a solid bright yellow pill (`bg-[var(--accent-yellow)]` `#FFC107`) with bold dark text (`#0B0E14`) without internal dot indicator matching Figma renders (`image_1.png` and `image.png`); pixel-aligned desktop sidebar cards (`Market`, `Trades`, `Wallet`, `+` box, user profile card) with `bg-[var(--bg-base)]` (`#0B0E14`) containers inside elevated sidebar (`#0F1727`).
  * **Verification:** `npm run build` completed successfully in 2.0min with zero errors across all 27 routed pages.

* **2026-07-26**
  * **Feature Completed:** Desktop Sidebar 3-Tier Elevated Parent Container Architecture Alignment.
  * **Files Modified:** `components/shell/desktop-sidebar.tsx`, `components/shell/primary-navigation.tsx`, `components/shell/user-profile-region.tsx`, `context/ui-context.md`, `context/design-system.md`, `context/progress-tracker.md`.
  * **Decisions:** Restructured `DesktopSidebar` into a 3-tier container architecture: Outer column uses main base background (`bg-[var(--bg-base)]` `#0B0E14`) with padding; inner parent container card uses floating elevated dark surface (`bg-[var(--bg-surface)]` `#0F1727`) with `rounded-2xl` and `border border-[#1E2A3F]`; nested navigation cards (`Market`, `Trades`, `Wallet`), `+` box, and bottom profile box use main base background (`#0B0E14`) rounded cards while `Home` uses solid filled yellow (`#FFC107`) card, perfectly matching Figma `image_1.png`.
  * **Verification:** `npm run build` completed successfully in 72s with zero errors across all 27 routed pages.

* **2026-07-26**
  * **Feature Completed:** Borderless Shell Headers & Desktop Sidebar Alignment.
  * **Files Modified:** `components/shell/desktop-header.tsx`, `components/shell/mobile-header.tsx`, `components/shell/desktop-sidebar.tsx`, `context/ui-context.md`, `context/design-system.md`, `context/progress-tracker.md`.
  * **Decisions:** Removed bottom borders from `DesktopHeader` and `MobileHeader`, and removed outer right border and inner container border from `DesktopSidebar` to establish a seamless, borderless dark surface aesthetic matching Figma design.
  * **Verification:** `npm run build` completed successfully in 70s with zero errors across all 27 routed pages.

* **2026-07-26**
  * **Quality Audit & Fixes Completed:** Code Base & Context Documentation Verification (15 Findings Resolved).
  * **Files Modified/Created:** `components/parent/market-card.tsx`, `components/shell/primary-navigation.tsx`, `components/shell/bottom-navigation.tsx`, `app/contact/page.tsx` [NEW], `context/design-system.md`, `context/user-flow.md`, `context/wireframe.md`, `context/progress-tracker.md`.
  * **Decisions:** Guarded `detailHref` with `disabled` check in `MarketCard` and added `target.closest("a, button")` check in `onClick` and `onKeyDown` handlers; updated React keys in `PrimaryNavigationRegion` and `BottomNavigation` to use stable `item.label || item.href` identifiers; created functional `/contact` route in `app/contact/page.tsx`; replaced hardcoded hex colors in `design-system.md` with canonical CSS tokens; added `text` language specifiers to markdown code blocks; reconciled Market Suggestion flow across `user-flow.md`; updated `wireframe.md` to reflect borderless headers, modal dialog visual description, and removed duplicated section 10.
  * **Verification:** `npm run build` completed successfully in 65s with zero errors across all 28 routed pages.

* **2026-07-26**
  * **Feature Completed:** Multi-Option Market Details Page Redesign & Expander Button Differentiation (`/markets/[id]`) (Figma Single Source of Truth).
  * **Files Modified/Created:** `components/parent/market-details/multi-option-market-view.tsx` [NEW], `components/parent/market-details/versus-market-view.tsx`, `components/parent/market-details/binary-market-view.tsx`, `components/parent/market-details/index.ts`, `app/markets/[id]/page.tsx`, `context/ui-context.md`, `context/wireframe.md`, `context/feature-specs/06-pages.md`, `context/feature-specs/03-parent-components.md`, `context/progress-tracker.md`.
  * **Decisions:** Built `MultiOptionMarketView` component strictly aligned with Figma renders (*"Who would be Evicted First ??"*); differentiated expander buttons with distinct names and visual hierarchy: 1) `show more housemates...` (green outline pill button for candidates list expander), 2) `show full trade history...` (slate card pill button for trade log expander), 3) `see more ...` (prominent gold-accented elevated CTA button linking to `/markets` feed page); integrated with responsive `TradeDialog` sheet; updated context specs via targeted line-by-line diffs.

* **2026-07-27**
  * **Feature Specification Completed:** Real-Time User Authentication (`context/feature-specs/08-realtime-authentication-spec.md`).
  * **Files Created/Modified:** `context/feature-specs/08-realtime-authentication-spec.md` [NEW], `context/progress-tracker.md`.
  * **Decisions:** Documented goal, auth-state route protection design, 7-step implementation workflow, detailed comparison of top 2 admin authorization approaches (Clerk public metadata vs DB-backed webhook sync), local npm dependency requirements (`@clerk/nextjs`), and comprehensive verification checklist.
  * **Verification:** Specification complete and cross-referenced with Next.js App Router & Sheybi frontend shell components.

* **2026-07-27**
  * **Audit & Alignment Completed:** Project-Wide Context & Codebase Conflict Resolution & Phase 4 DB Plan.
  * **Files Modified:** `AGENTS.md`, `context/progress-tracker.md`, `implementation_plan.md`.
  * **Decisions:** Confirmed permanent Dark theme (`#0B0E14` base background, `#0F1727` surface); set `app/globals.css` as canonical design system source of truth; confirmed Notifications & Settings as strictly PAUSED project-wide; confirmed permanent removal of `<CategoryNavigationRegion />`; confirmed dummy auth and mock dataset UI status until Phase 4 Real Database & Prediction Engine build; structured Phase 4 Database Build blueprint.
  * **Verification:** `npx tsc --noEmit` and documentation links verified with zero errors across all modules.

* **2026-07-28**
  * **Feature Completed:** InstantDB & Clerk Auth Integration & Architectural Standardization.
  * **Files Created/Modified:** `lib/actions/wallet-provisioning.ts` [NEW], `components/auth/instant-clerk-bridge.tsx`, `lib/instant.ts`, `lib/instant-admin.ts`, `lib/market-adapter.ts`, `context/progress-tracker.md`.
  * **Decisions:** Enforced strict zero-custom-auth-UI policy per `context/feature-specs/clerk-instantdbauth.md` (Clerk handles 100% of auth UI via `<SignIn />`, `<SignUp />`, `<UserButton />`, `<UserProfile />`); InstantDB receives Clerk session JWT via `db.auth.signInWithIdToken` background sync in `InstantClerkBridge`; added auto-provisioning Server Action (`ensureUserWalletAction()`) creating `$wallets` entity upon user login/signup; added explicit architectural headers clarifying client React SDK (`lib/instant.ts`), server Admin SDK (`lib/instant-admin.ts`), and Data Mapper (`lib/market-adapter.ts`).
  * **Verification:** `npx tsc --noEmit` and prediction engine invariant test suite (`run-tests.ts`) verified 100% green.

* **2026-07-28**
  * **Feature Completed:** Remote InstantDB Cloud Schema, Perms Push & Database Seed Script Execution.
  * **Files Created/Modified:** `.env`, `.env.local`, `lib/seed/seed-instantdb.ts` [NEW], `context/feature-specs/13-full-instantdb-prediction-engine-integration.md` [NEW], `context/progress-tracker.md`.
  * **Decisions:** Registered Clerk OAuth client (`SHEYBI`) on InstantDB App ID `5979c681-39cb-4421-9181-05786260e9bd`; pushed 15 schema namespaces and relational links via `npx instant-cli push schema`; pushed CEL access rules via `npx instant-cli push perms`; executed seed script `seed-instantdb.ts` using `@instantdb/admin` populating 3 categories (*BBNaija Season 9*, *Head of House*, *Eviction Predictions*) and 3 live prediction markets (Binary, 1v1, Multi-option) with initial probabilities and LMSR liquidity parameters ($L=₦50,000$, $b=36067$).
  * **Verification:** `npx tsx lib/seed/seed-instantdb.ts` executed cleanly (3 categories, 3 markets, 8 options created); `npx instant-cli push schema` and `push perms` output `✓ Done`; prediction engine tests passed 100%.

* **2026-08-09 / 2026-08-10**
  * **Feature Completed:** Individual Candidate Option Pausing & Seed Volume Baseline with Admin Featured Toggle.
  * **Files Created/Modified:** `instant.schema.ts`, `lib/actions/market-validation.ts`, `lib/actions/market-actions.ts`, `lib/actions/trade-actions.ts`, `lib/market-adapter.ts`, `components/parent/market-details/multi-option-market-view.tsx`, `components/admin/manage-options-dialog.tsx` [NEW], `components/admin/admin-markets-tab.tsx`, `components/admin/create-market-dialog.tsx`, `app/admin/page.tsx`, `context/prediction-engine.md`, `context/progress-tracker.md`.
  * **Decisions & Implementation:** Initialized `tradingVolume` with admin seed liquidity ($L$) at creation in `market-validation.ts`; updated `adaptToMultiOptionMarketData` to split seed volume equally across candidates ($\frac{L}{N}$ per housemate row); added `toggleMarketFeaturedAction` server action; added Star toggle button in `AdminMarketsTab` and Featured checkbox in `CreateMarketDialog`; verified continuous real-time reactive volume updates via InstantDB query subscriptions.
  * **Verification:** `npx tsc --noEmit` verified clean compile with 0 errors across all modules; InstantDB Cloud schema & permissions push confirmed `✓ Done`.

* **2026-08-10**
  * **Asset & Metadata Completed:** Favicon & App Icon Generation from `sheybi head.png`.
  * **Files Created/Modified:** `scripts/generate-favicons.js` [NEW], `app/favicon.ico`, `app/icon.png`, `app/apple-icon.png`, `public/favicon.ico`, `public/apple-touch-icon.png`, `public/icon-192.png`, `public/icon-512.png`, `app/layout.tsx`.
  * **Decisions & Implementation:** Processed `public/sheybi head.png` (333x333 transparent PNG) with Sharp to generate multi-resolution ICO (16x16, 32x32, 48x48), Next.js App Router icons (`app/icon.png`, `app/apple-icon.png`), and web manifest icons (`icon-192.png`, `icon-512.png`). Configured explicit `icons` field in `app/layout.tsx` metadata.
















