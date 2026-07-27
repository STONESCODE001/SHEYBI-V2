import { init } from "@instantdb/admin";
import schema from "@/instant.schema";

const APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID || "00000000-0000-0000-0000-000000000000";
const ADMIN_TOKEN = process.env.INSTANT_APP_ADMIN_TOKEN || "demo-admin-token";

export const adminDb = init({
  appId: APP_ID,
  adminToken: ADMIN_TOKEN,
  schema,
});
