/**
 * Client InstantDB SDK Instance
 * =============================
 * Initializes `@instantdb/react` (`db`) for client-side usage in React components,
 * custom hooks (`useMarkets`, `useCategories`), and browser interactions.
 *
 * SECURITY BOUNDARY:
 * - Runs in the browser using `NEXT_PUBLIC_INSTANT_APP_ID`.
 * - All queries and transactions executed via `db` are subject to CEL security rules defined in `instant.perms.ts`.
 * - Never import `@instantdb/admin` in client files.
 */

import { init } from "@instantdb/react";
import schema, { Schema } from "@/instant.schema";

const APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID || "00000000-0000-0000-0000-000000000000";

export const db = init({ appId: APP_ID, schema });
export type { Schema } from "@/instant.schema";

