# Feature Specification: Critical Launch Fixes, Data Optimization, KYC Verification & UX Hardening

> **Spec Number**: 19  
> **File Path**: `context/feature-specs/19-critical-launch-fixes-and-kyc.md`  
> **Status**: ✅ Completed  
> **Depends On**: Spec 01-07 (Frontend Shell & Layouts), Spec 08 (Authentication), Spec 11 (Markets), Spec 15 (Wallet & Portfolio), Spec 16 (Admin Live), Spec 17 (Paystack Integration), Spec 18 (Paystack Live Mode)

---

## 1. Executive Summary

This specification defines the functional, data, identity, and presentation requirements for resolving critical pre-launch audit findings and deploying essential user verification and user experience polish to the Sheybi application.

This specification governs:
1. Server-side data query isolation for market detail pages and user wallet withdrawal history.
2. Package identity standardization.
3. Unauthenticated public guest access for the main markets feed page.
4. Trending markets filtering, indexing, and sorting logic based on cumulative trading volume.
5. A simplified Identity Verification (KYC) flow supporting National Identification Number (NIN) submission or document image upload.
6. Reactive KYC status state management, dynamic wallet status badge rendering, and pre-withdrawal KYC enforcement.
7. Admin KYC review panel with masked NIN display, document image preview, and audit-logged approval/rejection operations.
8. Reusable visual skeleton loaders across market feeds, wallet balances, and portfolio tables.
9. On-brand, Sheybi-voiced SEO metadata across public and authenticated routes.

---

## 2. System Boundaries & Requirements

### 2.1 Critical Data Query Optimization

#### 2.1.1 Market Detail Page Isolation
- The market detail page **must** query InstantDB using a server-side `where` filter targeting the specific market `id` parameter.
- The query **cannot** retrieve un-filtered market arrays to perform client-side array searching.
- If the market `id` parameter represents a routing slug rather than a primary key identifier, the data layer **will** fall back to a filtered query targeting the market `slug` attribute.
- The market detail page **must** render a loading state when data resolution is in progress and an error state when no matching market exists.

#### 2.1.2 Wallet Withdrawal History Scope
- The wallet page query for withdrawal requests **must** pass an explicit `userId` filter matching the current authenticated Clerk user identifier.
- Unfiltered queries requesting all platform withdrawal records **cannot** be executed from the client wallet page.
- Withdrawal request queries **will** execute only when an authenticated user session is active.

### 2.2 Package Identity Configuration
- The `name` field within `package.json` **must** be set to `sheybi`.
- Placeholder package names **cannot** exist in the repository metadata.

### 2.3 Guest Access to Markets Feed
- The `/markets` page **must** use `PublicLayout` to allow unauthenticated guest users to view all prediction markets.
- The `/markets` page **cannot** use `AuthenticatedLayout` or trigger authentication redirects upon navigation.
- Unauthenticated users browsing `/markets` **will** be able to select categories, search, and view market details.
- Attempting to confirm a trade or interact with wallet features from the markets feed **must** trigger authentication via Clerk dialogs.

### 2.4 Trending Markets Logic & Volume Filtering

#### 2.4.1 Schema Indexing
- The `tradingVolume` field on the `markets` entity within `instant.schema.ts` **must** be defined with `.indexed()`.
- Remote database schema configuration **must** be synchronized with the InstantDB cloud application.

#### 2.4.2 Trending Tab Sorting & Filtering
- When the active category tab equals `trending`, the market query **must** order results by `tradingVolume` in descending order.
- Markets with a `tradingVolume` equal to zero (`0`) **must** be excluded from the Trending feed.
- Markets with `tradingVolume` greater than zero **will** display in descending order of cumulative volume.
- The `All Markets` tab **will** continue displaying open markets ordered by creation timestamp.

---

## 3. KYC Collection, Verification & Admin Workflow

### 3.1 Data Schema Requirements
- The `kyc_records` entity in `instant.schema.ts` **must** contain two optional fields:
  - `nin`: string field storing an 11-digit National Identification Number.
  - `documentImageUrl`: string field storing the uploaded document image URL.
- Existing fields (`legalName`, `dateOfBirth`, `documentType`, `verificationStatus`, `submittedAt`, `reviewedAt`, `reviewedBy`) **must** remain preserved.
- Remote database schema configuration **must** be pushed to InstantDB cloud.

### 3.2 User KYC Submission Flow

#### 3.2.1 Submission Modes
- The KYC submission interface **must** support two mutually exclusive submission options:
  1. **NIN Text Entry**: Input field accepting an 11-digit numerical string.
  2. **Document Image Upload**: File uploader accepting image binary files (`image/*`).

#### 3.2.2 NIN Validation Rules
- The NIN text input **must** enforce exact 11-digit numeric validation.
- Non-numeric characters **cannot** be submitted.
- The submission trigger **must** remain disabled until exactly 11 digits are entered.

#### 3.2.3 Document Image Upload Rules
- The file selector **must** accept only valid image mime types (`image/jpeg`, `image/png`, `image/webp`).
- Uploading a document **must** upload the file to InstantDB Storage using the application storage client and retrieve a persistent public URL.
- The user interface **must** display an image thumbnail preview after file selection and show an active loading state during file upload.

#### 3.2.4 Submission Mutation & Duplication Prevention
- KYC submissions **must** execute via a server action (`submitKycAction`).
- The server action **must** verify the authenticated user session via Clerk.
- If a user already possesses a `kyc_records` entity with `verificationStatus` equal to `"pending"` or `"approved"`, duplicate submissions **must** be rejected.
- Successful submission **must** create a `kyc_records` entity with `verificationStatus = "pending"` and `submittedAt = timestamp`.
- An audit log record **must** be generated with `actionType = "KYC_SUBMITTED"`.

### 3.3 Reactive KYC State & Wallet Status Badge Integration

#### 3.3.1 Reactive KYC Hook
- A reactive hook `useKyc` **must** query the user's `kyc_records` entity in real time.
- The hook **must** return the record object, loading state, and derived `kycStatus` enum (`none`, `pending`, `approved`, `rejected`).

#### 3.3.2 Wallet Card Status Badge Visual Mapping
- The `WalletCard` status badge **must** dynamically reflect the user's KYC verification state:
  - **`none` (Not Submitted)**: Badge text **must** display `Unverified` using amber/warning token styling (`bg-warning/10`, `text-warning`).
  - **`pending` (Submitted, Under Review)**: Badge text **must** display `Pending KYC` using muted styling (`bg-text-muted/10`, `text-text-muted`).
  - **`approved` (Verified)**: Badge text **must** display `Active` using green/success token styling (`bg-success/10`, `text-success`).
  - **`rejected` (Verification Failed)**: Badge text **must** display `KYC Rejected` using red/danger token styling (`bg-danger/10`, `text-danger`).

### 3.4 Pre-Withdrawal KYC Enforcement
- The withdrawal server action `requestWithdrawalAction` **must** query the user's `kyc_records` entity before validating balances or creating withdrawal requests.
- If no KYC record exists, or if `verificationStatus` is not equal to `"approved"`, the withdrawal action **must** fail atomically and return error code `KYC_REQUIRED`.
- When `WithdrawDialog` receives error code `KYC_REQUIRED`, it **must** close the withdrawal dialog and immediately launch the `KYCDialog` (`profile/kyc`).
- Users **cannot** submit withdrawal requests without an approved KYC record.
- Trading, depositing, and browsing **will** remain unrestricted regardless of KYC state.

### 3.5 Admin KYC Review Control Panel

#### 3.5.1 Admin Interface Addition
- The Admin Control Center (`app/admin/page.tsx`) **must** contain a dedicated **KYC Requests** tab.
- The table **must** display all submitted KYC records ordered by submission timestamp with pending items prioritized.

#### 3.5.2 Data Display & Values
- For each record, the table **must** display:
  - User identity (Clerk user ID and display name).
  - Submission date and time.
  - Verification method (`NIN` or `Document Image`).
  - **Submitted Value**:
    - For NIN submissions: Display the stored NIN string with partial masking (e.g., `*****32194`).
    - For Document Image submissions: Display an image thumbnail preview with an explicit link to open the full image in a new browser tab.
  - Current verification status chip.

#### 3.5.3 Admin Actions
- Admins **must** be provided with **Approve** and **Reject** action triggers for pending records.
- Approving a record **must** set `verificationStatus = "approved"`, record `reviewedAt`, record `reviewedBy`, and log an `AUDIT_LOG` event (`KYC_APPROVED`).
- Rejecting a record **must** prompt for a mandatory rejection reason, set `verificationStatus = "rejected"`, record `rejectionReason`, record timestamps and reviewer ID, and log an `AUDIT_LOG` event (`KYC_REJECTED`).
- All admin mutations **must** execute server-side using the InstantDB Admin SDK and verify the calling user's admin role.

---

## 4. Skeleton Loader Component Suite

### 4.1 Reusable Skeleton Primitives
- A skeleton component suite **must** be exported from `components/ui/skeletons.tsx` using `animate-pulse` animations and design system surface tokens (`bg-[var(--bg-surface-secondary)]`).
- The suite **must** include:
  - `MarketCardSkeleton`: Mimics the structural layout of prediction market grid cards.
  - `WalletCardSkeleton`: Mimics the elevated wallet balance card container.
  - `ActivityItemSkeleton`: Mimics transaction ledger and activity feed rows.

### 4.2 Page Integration Rules
- `app/page.tsx` (Homepage): **must** display 3 `MarketCardSkeleton` elements while market feed data is loading.
- `app/markets/page.tsx` (Markets Feed): **must** display 6 `MarketCardSkeleton` elements while query resolution is in progress.
- `app/dashboard/page.tsx` (Authenticated Dashboard): **must** display 3 `MarketCardSkeleton` elements while loading.
- `app/wallet/page.tsx` (Wallet Page): **must** display `WalletCardSkeleton` for balance loading and 5 `ActivityItemSkeleton` elements for ledger transaction loading.
- `app/portfolio/page.tsx` (Portfolio Page): **must** display 4 `ActivityItemSkeleton` elements while positions are loading.
- Raw text strings such as `"Loading..."` **cannot** be rendered as primary page loading indicators.

---

## 5. On-Brand SEO Metadata Architecture

### 5.1 Content & Brand Tone Guidelines
- SEO metadata **must** conform strictly to the Sheybi product vision documented in `context/project-overview.md` and `context/design-system.md`.
- Tone **must** be confident, playful, and targeted at Nigerian Gen Z (18+) viewers.
- Terminology **must** highlight prediction markets, BBNaija, dynamic pricing, and outcomes ("Predict. Play. Win.").
- Traditional institutional banking or serious financial terminology **cannot** be used.

### 5.2 Server Route Metadata Exports
- Client-side pages **must** be structured with server-side component wrappers to export static `metadata` objects or dynamic `generateMetadata()` functions.
- The root layout (`app/layout.tsx`) **must** define base site title templates, default meta descriptions, and Open Graph image definitions pointing to `/sheybi-mascot.png`.
- Route-specific metadata **must** be implemented for:
  - Homepage (`/`): Title: `Sheybi — Live Prediction Markets` | Description: Punchy hook for BBNaija predictions.
  - Markets Feed (`/markets`): Title: `Markets — Sheybi` | Description: Category discovery and trading hook.
  - Market Detail (`/markets/[id]`): Dynamic Title: `[Market Title] — Sheybi` | Dynamic Description featuring outcome prediction text.
  - Wallet (`/wallet`): Title: `Wallet — Sheybi` | Description: Wallet deposits and payouts.
  - Portfolio (`/portfolio`): Title: `My Portfolio — Sheybi` | Description: Open positions and trade performance.

---

## 6. Cross-Document Responsibilities

This specification references and depends upon existing system documentation:

- **Product Vision & Goals**: Owned by `context/project-overview.md`.
- **Database Schema**: Schema structures owned by `context/database-schema.md` and `instant.schema.ts`.
- **Application Architecture & Server Boundaries**: Owned by `context/architecture.md`.
- **Visual Design & Token System**: Owned by `context/design-system.md` and `app/globals.css`.
- **Prediction Engine & LMSR Math**: Owned by `context/prediction-engine.md` and `lib/prediction-engine/lmsr.ts`.
- **Paystack Payment Infrastructure**: Owned by `context/feature-specs/17-paystack-integration.md` and `18-paystack-live-and-financial-reset.md`.
- **Admin Dashboard Base System**: Owned by `context/feature-specs/16-cycle-c-admin-live.md`.

This specification **must not** alter or redefine core architectural layers owned by those documents.

---

## 7. Out of Scope

The following items are explicitly out of scope for this specification and are owned by future iterations:

1. **Automated Server Action Rate Limiting via Redis / Upstash**: Deferred to post-launch infrastructure hardening. InstantDB permission-level CEL rules handle database-level safety.
2. **Automated Paystack Payout Transfers**: Withdrawal requests remain manually reviewed and approved by administrators. Automated Paystack Transfer API integration is deferred until corporate merchant account verification.
3. **Admin User Suspension UI Tab**: User account suspension is managed directly via the Clerk Dashboard or InstantDB Admin Explorer; custom UI is deferred.
4. **Live Market Activity Ticker Stream**: Ticker component remains dormant to prevent visual clutter per product decision.
5. **Multi-Category Markets Beyond BBNaija**: Additional market taxonomies (Sports, Politics, Finance) belong to post-MVP specifications.

---

## 8. Measurable Checklist

### 8.1 Automated Invariants & Build Verification
- [ ] `npx tsc --noEmit` completes with zero errors across all modules.
- [ ] `npm run build` succeeds without warnings or compilation failures.
- [ ] Automated LMSR test suite (`npx tsx lib/prediction-engine/run-tests.ts`) passes 100%.

### 8.2 Component Rendering & Visual Quality
- [ ] Every new component renders cleanly without layout shifts or overflow.
- [ ] `MarketCardSkeleton`, `WalletCardSkeleton`, and `ActivityItemSkeleton` match container dimensions and animate smoothly.
- [ ] `KYCDialog` presents clean responsive layouts on mobile viewports (bottom sheet) and desktop viewports (centered modal).
- [ ] Wallet status badge correctly transitions between `Unverified` (amber), `Pending KYC` (muted), `Active` (green), and `KYC Rejected` (red).
- [ ] Admin KYC review table correctly displays masked NIN text strings and image thumbnail previews with external tab links.

### 8.3 Functional & Interaction Requirements
- [ ] Market detail page (`/markets/[id]`) queries InstantDB filtered by market ID/slug without fetching all markets.
- [ ] Wallet page queries withdrawal requests filtered exclusively by the current user's Clerk ID.
- [ ] Unauthenticated guest users can navigate directly to `/markets` and browse all categories without hitting auth redirects.
- [ ] Selecting the "Trending" tab orders markets by volume descending and filters out markets with 0 trading volume.
- [ ] NIN input field accepts exactly 11 numeric digits and blocks non-digit input.
- [ ] Document file input accepts valid images, uploads file to InstantDB Storage, and saves persistent URL.
- [ ] Duplicate KYC submissions for users with `pending` or `approved` status are rejected by server actions.
- [ ] Withdrawal requests made by users without `approved` KYC status fail with error code `KYC_REQUIRED` and trigger the KYC dialog.
- [ ] Admin approval updates KYC status to `approved`, creates audit log, and unblocks withdrawal request creation.
- [ ] Admin rejection prompts for a reason, records rejection status, and allows re-submission by user.
- [ ] Package name in `package.json` reads `"sheybi"`.
- [ ] SEO metadata tags (`<title>`, `<meta description>`, Open Graph tags) are present and readable in page DOM source for `/`, `/markets`, `/markets/[id]`, `/wallet`, and `/portfolio`.

### 8.4 Technical & Operational Hardening
- [ ] No raw `console.error` unhandled rejections during KYC upload or submission flows.
- [ ] All financial and identity server actions enforce strict server-side Clerk authentication checks.
- [ ] Audit log entries are written for every KYC submission, approval, and rejection event.
- [ ] Keyboard navigation and accessibility focus management function correctly across `KYCDialog` and Admin review tables.
