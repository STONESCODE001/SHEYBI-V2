/**
 * Server InstantDB Admin SDK Instance
 * ====================================
 * Initializes `@instantdb/admin` (`adminDb`) using `INSTANT_APP_ADMIN_TOKEN`.
 * Used strictly on the server inside Server Actions and backend services.
 *
 * SECURITY & PRIVILEGE BOUNDARY:
 * - Bypasses client-side security rules (`instant.perms.ts`).
 * - Allows atomic multi-entity transaction batches (e.g. updating buyer wallet + seller wallet + positions + ledger entries).
 * - MUST NEVER be imported in client components or browser code to prevent token exposure.
 */

import { init } from "@instantdb/admin";
import schema from "@/instant.schema";
import fs from "fs";
import path from "path";

// Ensure environment variables are loaded if running standalone scripts
if (!process.env.INSTANT_APP_ADMIN_TOKEN) {
  try {
    const envLocalPath = path.join(process.cwd(), ".env.local");
    if (fs.existsSync(envLocalPath)) {
      const envContent = fs.readFileSync(envLocalPath, "utf-8");
      for (const line of envContent.split("\n")) {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          let value = (match[2] || "").trim();
          if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
          if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      }
    }
  } catch {
    // Ignore error
  }
}

const APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID || "00000000-0000-0000-0000-000000000000";
const ADMIN_TOKEN = process.env.INSTANT_APP_ADMIN_TOKEN || "demo-admin-token";

export const adminDb = init({
  appId: APP_ID,
  adminToken: ADMIN_TOKEN,
  schema,
});


