# Feature Specification: Influencer & Promoter Referral Tracking System

> **Spec Number**: 21  
> **File Path**: `context/feature-specs/21-promoter-referral-tracking.md`  
> **Status**: 🟢 In Planning  
> **Depends On**: Spec 08 (Clerk Real-Time Authentication), Spec 09 (Lean Admin Spec), Spec 16 (Cycle C Admin Live), Spec 17 (Paystack Integration), Spec 19 (Critical Launch Fixes)

---

## 1. Executive Summary & Product Objectives

This specification defines the functional, architectural, data, and user interface requirements for delivering an Influencer & Promoter Referral Tracking System on Sheybi V2.

### Core Objectives:
1. **Short, Clean Referral Links**: Enable clean, memorable promoter links using the short format `sheybi.app/f/[promoter]` (e.g. `sheybi.app/f/mrfaithman`) as well as URL parameter fallbacks (`sheybi.app/?ref=mrfaithman`).
2. **Next.js Middleware Interception & Rewrite**: Intercept requests to `/f/[promoter]`, save a 30-day `HTTP-only` cookie (`sheybi_ref`), and execute a `NextResponse.rewrite('/')` so Vercel client-side analytics logs the exact path `/f/mrfaithman` while rendering the home page cleanly without redirect delays.
3. **Automatic User Conversion Sync**: Automatically associate brand-new user sign-ups with their referrer in InstantDB (`$users.referredBy`, `$users.referredAt`) upon first login via `ensureUserWalletAction()`.
4. **Full Conversion Metrics**: Track both front-of-funnel clicks (via path analytics) and deep business conversions: Total Registered Users, Active Bettors, and Total Deposited Volume (₦) per promoter.
5. **Multi-Promoter Admin Workspace**: Provide a dedicated **"Promoters"** tab inside the existing Admin Control Center (`/admin`) to create unlimited promoter links, copy share links with 1 click, toggle status (`active` / `paused`), and monitor live referral metrics.

---

## 2. System Architecture & Routing Mechanics

```
  [Influencer Shares Link] 
          │
          ▼
   sheybi.app/f/mrfaithman
          │
          ▼
   Next.js Middleware (middleware.ts)
   ├── Sets HTTP Cookie: sheybi_ref = "mrfaithman" (30 days)
   └── NextResponse.rewrite('/')  ──► Browser Renders Homepage
                                  └── Vercel Analytics logs "/f/mrfaithman"
          │
          ▼
   [User Clicks "Sign Up" & Creates Clerk Account]
          │
          ▼
   ensureUserWalletAction() (wallet-provisioning.ts)
   ├── Reads "sheybi_ref" cookie
   ├── Stores referredBy: "mrfaithman" on InstantDB $users entity
   └── Increments promoter's totalSignups count
          │
          ▼
   Admin Dashboard (/admin -> Promoters Tab)
   └── Real-time visibility into Clicks, Signups, and Total Referred Deposit Volume (₦)
```

### 2.1 Middleware Interception (`middleware.ts`)
- Path pattern: `/f/:promoter`
- Extract `:promoter` (normalized to lowercase, alphanumeric & dashes only).
- Set `sheybi_ref` HTTP cookie: `maxAge: 30 * 24 * 60 * 60` (30 days), `path: '/'`, `sameSite: 'lax'`.
- Perform `NextResponse.rewrite(new URL('/', req.url))` so the user browser renders `/` instantly while retaining the path in Vercel analytics.
- Query Parameter Fallback: If `req.nextUrl.searchParams.has('ref')`, read the value, set the `sheybi_ref` cookie, and proceed normally.

### 2.2 User Referral Sync (`lib/actions/wallet-provisioning.ts`)
- When a user signs up via Clerk and logs in for the first time, `ensureUserWalletAction()` executes.
- Reads `sheybi_ref` cookie from request headers/cookies.
- If a valid promoter slug is present and the promoter exists in InstantDB (`promoters` entity):
  - Sets `referredBy: promoterSlug` on the user's `$users` record.
  - Sets `referredAt: Date.now()` on the user's `$users` record.
  - Atomically increments the promoter's `totalSignups` counter.

---

## 3. Database Schema Requirements (`instant.schema.ts`)

### 3.1 `$users` Entity Extensions
Extend `$users` entity in `instant.schema.ts`:
- `referredBy`: `i.string().optional().indexed()` — Referral promoter slug (e.g. `"mrfaithman"`)
- `referredAt`: `i.number().optional()` — Unix timestamp (ms) when user registered via referral link

### 3.2 `promoters` Entity Definition
Add `promoters` entity to `instant.schema.ts`:
```typescript
promoters: i.entity({
  name: i.string(),                         // Human-readable name (e.g. "Mr Faithman")
  slug: i.string().unique().indexed(),     // URL identifier slug (e.g. "mrfaithman")
  status: i.string().indexed(),             // "active" | "paused"
  notes: i.string().optional(),             // Contact info / campaign notes
  totalSignups: i.number().indexed(),      // User registration conversion count
  totalDepositedVolume: i.number(),        // Sum of all deposits (₦) by referred users
  createdBy: i.string().indexed(),         // Admin Clerk userId
  createdAt: i.number().indexed(),
  updatedAt: i.number(),
})
```

---

## 4. Admin Workspace Requirements (`app/admin/page.tsx`)

### 4.1 Admin Promoters Tab Component (`components/admin/admin-promoters-tab.tsx`)
Mount a new tab **"Promoters"** inside `app/admin/page.tsx` alongside *Markets*, *Withdrawals*, *KYC*, *Suggestions*, and *Audit Logs*.

#### A. KPI Summary Header Cards:
1. **Total Promoters**: Active vs total promoter count.
2. **Total Referral Signups**: Cumulative count of users registered via promoter links.
3. **Total Referred Deposit Volume**: Total Naira (₦) deposited by all referred users.

#### B. Action Header:
- **`+ Add Promoter` Button**: Launches `CreatePromoterDialog`.

#### C. Promoter Management Table:
- **Columns**:
  - `Promoter Name` (e.g., "Mr Faithman")
  - `Referral Link` (e.g., `sheybi.app/f/mrfaithman` with 1-click **Copy Link** button)
  - `Status` (Badge: `Active` [green] / `Paused` [amber])
  - `Signups` (Count of converted users)
  - `Referred Deposits (₦)` (Aggregated total deposits from referred users)
  - `Actions` (**Copy Link**, **Pause/Unpause**, **Delete/Deactivate**)

#### D. Create Promoter Dialog (`components/admin/create-promoter-dialog.tsx`):
- Modal form collecting:
  - `Name`: string (e.g. "BBNaija Updates Page")
  - `Slug`: string (auto-generated from name e.g. "bbnaija-updates", editable)
  - `Notes`: string optional (e.g. "Instagram Influencer @bbnaijadaily")
- Auto-validates uniqueness of the slug against existing promoter records.
- Creates `promoters` record in InstantDB and writes an immutable audit log (`CREATE_PROMOTER`).

---

## 5. Server Actions API Contract (`lib/actions/promoter-actions.ts`)

### `createPromoterAction(input)`
- **Auth**: Requires Admin role (`metadata.role === 'admin'`).
- **Validation**: Ensures `name` and `slug` are non-empty and `slug` is unique.
- **Mutation**: Inserts `promoters` entity with `status: 'active'`, `totalSignups: 0`, `totalDepositedVolume: 0`.
- **Audit**: Writes `CREATE_PROMOTER` entry to `audit_logs`.

### `togglePromoterStatusAction(promoterId, newStatus)`
- **Auth**: Requires Admin role.
- **Mutation**: Updates `promoters.status` to `'active'` or `'paused'`.
- **Audit**: Writes `TOGGLE_PROMOTER_STATUS` entry to `audit_logs`.

---

## 6. Measurable Verification Criteria

- [ ] `npx tsc --noEmit` passes with 0 errors.
- [ ] `npm run build` succeeds cleanly without build breakages.
- [ ] Navigating to `/f/mrfaithman` sets `sheybi_ref` cookie, rewrites to `/`, and renders homepage instantly.
- [ ] New Clerk sign-up attached to `sheybi_ref` cookie automatically receives `referredBy: "mrfaithman"` on `$users` entity in InstantDB.
- [ ] Admin panel `/admin` displays **Promoters** tab with KPI summary, promoter table, and `CreatePromoterDialog`.
- [ ] 1-click **Copy Link** button copies clean URL `sheybi.app/f/[slug]` to clipboard with Sonner toast feedback.
- [ ] Toggle status (Pause/Unpause) immediately updates state and logs to `audit_logs`.
