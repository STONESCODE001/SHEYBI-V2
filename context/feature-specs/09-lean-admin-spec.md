# Feature Specification: Lean Admin Module

> **Feature Target**: Lean Admin Module & Operator Control Workspace  
> **Status**: Approved / Draft  
> **Target Version**: 3.5.0  
> **File Location**: `context/feature-specs/09-lean-admin-spec.md`  

---

## 1. Overview & Objectives

The **Lean Admin Module** provides platform operators with a consolidated, clean, and dependency-light workspace for managing prediction markets, user financial withdrawals, community market suggestions, category taxonomies, and system audit logs on Sheybi.

### Core Objectives
1. **Platform Financial Overview**: Real-time KPI summary cards displaying Total House & User Balance (Naira ₦), Active Markets Count, Pending Withdrawal Requests, and Pending User Market Suggestions.
2. **Prediction Market Lifecycle Management**:
   - View, search, and filter all markets across status lifecycle (*Draft*, *Scheduled*, *Open*, *Closed*, *Resolved*, *Cancelled*).
   - **Create Market Dialog**: Modal form supporting both **Binary (Yes/No)** and **Multi-Option** market formats, initial outcome probabilities (validated to sum to 100%), category tagging, resolution rules/links, and closing dates.
   - **Resolve Market Dialog**: Select winning outcome(s) for closed markets to trigger financial payout calculation and ledger settlement.
3. **Market Suggestions Queue**:
   - Review community-submitted market ideas.
   - **Accept Action**: Pre-fills the Create Market Dialog with suggestion title, description, and category.
   - **Reject Action**: Removes/rejects suggestion with feedback reason.
4. **Withdrawal Requests Review**:
   - Display pending user withdrawal requests with verified bank details and amounts in Naira (₦).
   - **Approve / Reject Dialogs**: Process manual payout approvals or rejections with user refund options.
5. **Category Taxonomy Manager**:
   - View and dynamically create market categories (e.g. *BBNaija*, *Sports*, *Entertainment*, *Politics*, *Crypto*).
6. **Immutable Audit Logs**:
   - Record every administrative event (`MARKET_CREATED`, `MARKET_RESOLVED`, `WITHDRAWAL_APPROVED`, `WITHDRAWAL_REJECTED`, `SUGGESTION_ACCEPTED`, `CATEGORY_ADDED`) with operator ID, target resource, description, and exact ISO timestamp.

---

## 2. Component & Layout Architecture

The Admin module runs inside `AdminLayout` (`/admin`), strictly protected by Clerk role middleware (`metadata.role === 'admin'`).

### Component Hierarchy

```
app/admin/page.tsx (Admin Workspace Root)
├── AdminLayout (Shell Variant)
├── AdminSummaryCards (KPI Stat Cards)
└── Tabs Container (Workspace Navigation)
    ├── Tab: Markets -> AdminMarketsTab
    │   ├── Button: "+ Create Market" -> triggers CreateMarketDialog
    │   └── Action: "Resolve" -> triggers ResolveMarketDialog
    ├── Tab: Suggestions -> AdminSuggestionsTab
    │   └── Action: "Accept" -> triggers CreateMarketDialog (Pre-filled)
    ├── Tab: Withdrawals -> AdminWithdrawalsTab
    │   └── Action: "Review" -> triggers WithdrawalActionDialog
    ├── Tab: Categories -> AdminCategoriesTab
    │   └── Inline Form: "Add Category"
    └── Tab: Audit Logs -> AdminAuditLogsTab
        └── Filterable Log Table
```

---

## 3. Data Schemas & Audit Event Contracts

### 3.1 Market Creation Payload Schema

```typescript
// Explanatory Note:
// This interface defines all fields collected by the CreateMarketDialog
// to create a new binary or multi-option market in the Prediction Engine.

export interface CreateMarketInput {
  title: string               // Unique headline for the market (e.g., "Who will win BBNaija Season 9?")
  description: string         // Full background details and trading context
  category: string            // Assigned category ID (e.g., "entertainment")
  resolutionSource: string    // Official URL or source of truth verification rule
  closeDate: string           // ISO datetime string when trading automatically closes
  format: "binary" | "multi"  // Binary (Yes/No) vs Multi-option format
  options: {
    title: string             // Option name (e.g. "Yes", "No", or candidate name)
    initialProbability: number// Initial probability % (Must sum to 100 across all options)
  }[]
  isDraft: boolean            // True = Save as Draft; False = Publish as Open for trading
}
```

### 3.2 Audit Log Event Schema

```typescript
// Explanatory Note:
// Every administrative action creates an immutable log entry.
// This guarantees full traceability for financial and moderation operations.

export interface AuditLogEntry {
  id: string                  // Unique audit log identifier
  action:                     // Type of administrative operation performed
    | "MARKET_CREATED"
    | "MARKET_RESOLVED"
    | "MARKET_CANCELLED"
    | "WITHDRAWAL_APPROVED"
    | "WITHDRAWAL_REJECTED"
    | "SUGGESTION_ACCEPTED"
    | "SUGGESTION_REJECTED"
    | "CATEGORY_ADDED"
  performedBy: string         // Admin email or user ID who performed the action
  targetId: string            // ID of affected entity (Market ID, User ID, Withdrawal ID)
  details: string             // Human-readable summary of what was done
  timestamp: string           // ISO datetime string when the action occurred
}
```

---

## 4. Operational Workflows & Business Rules

### Workflow 1: Create Market from Scratch or Suggestion
1. Admin clicks **"+ Create Market"** or clicks **"Accept"** on a user market suggestion.
2. If triggered from a suggestion, the dialog pre-populates `title`, `description`, and `category`.
3. Admin selects market format (**Binary** vs **Multi-Option**).
4. Admin configures options and initial probabilities. **Validation constraint**: The sum of all option initial probabilities must equal `100%`.
5. Admin sets future closing date/time and resolution rule URL.
6. Submitting creates the market in state and logs a `MARKET_CREATED` audit event.

### Workflow 2: Market Resolution
1. When a market reaches `Closed` status, the **"Resolve Market"** button becomes active.
2. Admin opens **Resolve Market Dialog** and selects the winning option.
3. Submitting triggers Prediction Engine settlement logic: winning positions receive payout, losing positions are settled to ₦0, and ledger entries are written.
4. An immutable `MARKET_RESOLVED` audit entry is created.

### Workflow 3: Withdrawal Processing
1. Admin opens **Withdrawals** tab to view pending payout requests.
2. Admin reviews user name, bank name, account number, and amount in ₦.
3. Clicking **Approve** marks the transaction as processed and logs `WITHDRAWAL_APPROVED`.
4. Clicking **Reject** refunds the locked balance to the user's available balance and logs `WITHDRAWAL_REJECTED`.

---

## 5. Verification Requirements

- Build check (`npm run build`) must complete with 0 errors.
- Admin layout must remain clean and fully responsive across Mobile, Tablet, and Desktop breakpoints.
- All actions must produce immediate visual feedback (Sonner toast notifications) and write to Audit Logs.
