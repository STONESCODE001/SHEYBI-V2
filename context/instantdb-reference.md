# InstantDB Reference — Sheybi V2

> **Purpose**: Technical reference for InstantDB SDK usage patterns, query operators, permission syntax, and best practices.  
> **Scope**: This document supplements the project-specific context files. Project architecture decisions take precedence over generic guidelines here.  
> **NOT a feature spec** — this is a SDK reference only.

---

## ⚠️ Project-Specific Overrides (Read First)

The following project decisions **override** generic InstantDB recommendations in this document:

| Generic Recommendation | Sheybi Decision | Why |
|---|---|---|
| "Do not store image URLs as string attributes — use Instant Storage ($files)" | **Overridden** — `markets.imageUrl` and `market_options.imageUrl` are stored as plain strings | Market images come from external sources (BBNaija press assets). Using Instant Storage for them adds no value and increases complexity. |
| Use magic code auth / guest auth | **Overridden** — Sheybi uses Clerk auth exclusively via `signInWithIdToken` | Zero custom auth UI is a locked architecture decision. |
| Use `extraFields` at signup to write $users data | **Not applicable** — Clerk JWT auth does not support `extraFields` | The `extraFields` pattern only works with Instant's own magic code / email auth flows. |

---

## InstantDB SDK Overview

Instant provides two SDKs used in this project:

- `@instantdb/react` — client-side, for hooks (`db.useQuery`, `db.useAuth`) in React components and hooks
- `@instantdb/admin` — server-side only, used in Server Actions via `adminDb` (`lib/instant-admin.ts`)

**Never import `@instantdb/admin` in client components.** It exposes the admin token.

---

## Query Operators — `where` Clause

CRITICAL: These are the ONLY supported filter operators. There is no `$exists`, `$nin`, or `$regex`.

```text
Equality:        { field: value }
Inequality:      { field: { $ne: value } }
Null check:      { field: { $isNull: true | false } }
Comparison:      { field: { $gt | $lt | $gte | $lte: value } }  ← indexed + typed fields only
Sets:            { field: { $in: [v1, v2] } }
Substring:       { field: { $like: 'Get%' } }      ← case-sensitive
                 { field: { $ilike: '%get%' } }    ← case-insensitive
Logic:           and: [ {...}, {...} ]
                 or:  [ {...}, {...} ]
Nested fields:   'relation.field': value
```

---

## Ordering

```text
order: { field: 'asc' | 'desc' }
Example: $: { order: { createdAt: 'desc' } }
```

**CRITICAL**: The field must be indexed AND typed in `instant.schema.ts`. Cannot order by nested relation attributes.

---

## Pagination

```text
limit: N      ← top N results
offset: N     ← skip N results
```

**CRITICAL**: Pagination keys (`limit`, `offset`, `first`, `after`, `last`, `before`) only work on **top-level namespaces**. Do NOT use them on nested relations — this causes a runtime error.

```tsx
// ✅ Correct — pagination on top-level
db.useQuery({
  ledger: {
    $: { where: { userId }, order: { createdAt: 'desc' }, limit: 20 },
  },
})

// ❌ Wrong — pagination on nested relation
db.useQuery({
  markets: {
    options: {
      $: { limit: 3 }  // RUNTIME ERROR
    }
  }
})
```

---

## Indexing Rule

CRITICAL: Any field used in a `where` filter or `order` clause MUST be indexed in `instant.schema.ts`:

```typescript
// In instant.schema.ts
entities: {
  ledger: i.entity({
    userId: i.string().indexed(),   // ✅ Can filter by this
    createdAt: i.number().indexed(), // ✅ Can order by this
    eventType: i.string(),           // ⚠️ Cannot filter/order without .indexed()
  })
}
```

---

## Permission CEL Syntax

### `data.ref`
- Use for traversing data relationships in permission rules
- Always returns a **list** — cannot compare directly to a single value
- Must end with an **attribute**, not an entity

```cel
// ✅ Correct
auth.id in data.ref('post.author.id')
data.ref('owner.id') == []          // no owner exists

// ❌ Wrong — these will error
auth.id == data.ref('owner.id')     // can't compare list to single value
data.ref('owner.id') == null        // use == [] instead
```

### `auth.ref`
- Same as `data.ref` but path must start with `$user`
- Returns a list

```cel
// ✅ Correct — used in instant.perms.ts
'admin' in auth.ref('$user.role')
auth.ref('$user.role.type')[0] == 'admin'

// ❌ Wrong
auth.ref('role.type')               // must start with $user
auth.ref('$user.role') == 'admin'   // can't compare list to string
```

### `$users` Permissions
- Default `view`: `auth.id == data.id`
- Default `update` and `delete`: `false`
- Default `create`: `true` (anyone can sign up)
- **Cannot override `delete`**
- The `create` rule runs during auth signup flows — NOT via `transact`

---

## Transactions — `adminDb.transact`

Used in server actions (`lib/actions/*`) via `adminDb` from `lib/instant-admin.ts`.

```typescript
// Single entity update
await adminDb.transact([
  adminDb.tx.wallets[walletId].update({ availableBalance: newBalance }),
])

// Multi-entity atomic batch (most server actions use this)
await adminDb.transact([
  adminDb.tx.wallets[walletId].update({ availableBalance: newBalance }),
  adminDb.tx.positions[id()].update({ userId, marketId, shares, state: 'open' }),
  adminDb.tx.ledger[id()].update({ userId, eventType: 'TRADE_BUY', amount }),
])
```

**CRITICAL**: `id()` must be imported from `@instantdb/admin` for server-side use, or `@instantdb/react` for client-side use.

---

## `db.useAuth` — Client Auth State

```tsx
// In client components — check if InstantDB session is active
const { isLoading, user, error } = db.useAuth();
```

Note: In Sheybi, the Clerk auth state (`useUser()`, `useAuth()` from `@clerk/nextjs`) is the primary auth check in UI components. `db.useAuth()` reflects the InstantDB session which is synced by `InstantClerkBridge`. They should always be in sync.

---

## Linking Entities

```typescript
// Link two entities (creates the relationship defined in instant.schema.ts links)
adminDb.tx.positions[positionId].link({ market: marketId })
adminDb.tx.positions[positionId].link({ option: optionId })

// Unlink
adminDb.tx.positions[positionId].unlink({ market: marketId })
```

---

## InstantDB CLI Commands

```bash
# Push schema changes to cloud
npx instant-cli push schema --yes

# Push permissions changes to cloud  
npx instant-cli push perms --yes

# Pull current cloud state
npx instant-cli pull --yes

# Query data as admin (useful for debugging)
npx instant-cli query '{ markets: {} }' --admin

# Query as specific user
npx instant-cli query '{ wallets: {} }' --as-email user@example.com

# Add Clerk auth client
npx instant-cli auth client add --type clerk --name clerk --publishable-key pk_live_...
```

---

## Useful Type Utilities

```typescript
import { InstaQLEntity } from '@instantdb/react';
import { AppSchema } from '@/instant.schema';

// Type a single entity
type Market = InstaQLEntity<AppSchema, 'markets'>;

// Type entity with nested relations
type MarketWithOptions = InstaQLEntity<AppSchema, 'markets', { options: {} }>;
type Position = InstaQLEntity<AppSchema, 'positions'>;
```

---

## InstantDB Documentation Links

- [Common mistakes](https://www.instantdb.com/docs/common-mistakes.md)
- [Modeling data](https://www.instantdb.com/docs/modeling-data.md)
- [Writing data (InstaML)](https://www.instantdb.com/docs/instaml.md)
- [Reading data (InstaQL)](https://www.instantdb.com/docs/instaql.md)
- [Backend / Admin SDK](https://www.instantdb.com/docs/backend.md)
- [Auth — Other methods](https://www.instantdb.com/docs/auth.md) ← Clerk integration is here
- [Managing users](https://www.instantdb.com/docs/users.md)
- [Permissions](https://www.instantdb.com/docs/permissions.md)
- [Storage](https://www.instantdb.com/docs/storage.md)
- [Instant CLI](https://www.instantdb.com/docs/cli.md)
